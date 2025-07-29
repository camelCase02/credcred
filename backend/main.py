"""
Main FastAPI application for the credentialing service.
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import uvicorn
import json

from services.credentialing_service import CredentialingService
from services.provider_service import ProviderService
from models.credentialing_result import CredentialingResult, ComplianceStatus
from utils.logger import audit_logger
from config.settings import settings
from config.concurrency import ConcurrencyConfig, llm_semaphore, file_semaphore

# Initialize FastAPI app
app = FastAPI(
    title="Healthcare Provider Credentialing Service",
    description="A comprehensive credentialing service that validates healthcare providers against regulatory requirements using LLM-powered data mapping and verification.",
    version="1.0.0",
    # Performance optimizations
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting middleware for better concurrent handling
from fastapi import Request
from fastapi.responses import JSONResponse
import time
from collections import defaultdict
import asyncio

# Simple in-memory rate limiter (consider Redis for production)
class RateLimiter:
    def __init__(self, requests_per_minute: int = 100):
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)
        self.lock = asyncio.Lock()
    
    async def is_allowed(self, client_id: str) -> bool:
        async with self.lock:
            now = time.time()
            # Clean old requests
            self.requests[client_id] = [
                req_time for req_time in self.requests[client_id] 
                if now - req_time < 60
            ]
            
            if len(self.requests[client_id]) >= self.requests_per_minute:
                return False
            
            self.requests[client_id].append(now)
            return True

rate_limiter = RateLimiter(requests_per_minute=ConcurrencyConfig.RATE_LIMIT_REQUESTS_PER_MINUTE)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Get client IP
    client_ip = request.client.host if request.client else "unknown"
    
    # Check rate limit
    if not await rate_limiter.is_allowed(client_ip):
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please try again later."}
        )
    
    # Add request timing
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # Add timing header
    response.headers["X-Process-Time"] = str(process_time)
    
    return response

# Initialize services
credentialing_service = CredentialingService()
provider_service = ProviderService()


# Pydantic models for new endpoints
class ChatRequest(BaseModel):
    provider_id: str
    question: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    confidence: float
    sources: List[Dict[str, Any]]
    provider_id: str
    session_id: Optional[str] = None


class ProcessedDoctor(BaseModel):
    provider_id: str
    name: str
    specialty: str
    experience_years: int
    status: str  # "COMPLETED", "IN_PROGRESS", "NOT_STARTED"
    compliance_status: Optional[str] = None  # Only for completed processes
    score: Optional[int] = None  # Only for completed processes
    current_step: Optional[str] = None  # Only for in-progress processes
    last_credentialed: str
    processing_time: float
    llm_requests: int
    llm_cost: float
    session_id: str
    steps_completed: Optional[int] = None  # Only for in-progress processes
    total_steps_estimated: Optional[int] = None  # Only for in-progress processes


class ReportRequest(BaseModel):
    provider_name: Optional[str] = None  # Can be full name or partial name
    provider_id: Optional[str] = None  # Optional specific provider ID


class ReportResponse(BaseModel):
    report_content: str
    provider_id: str
    provider_name: str
    session_id: str
    report_generated_at: str
    message: str


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Healthcare Provider Credentialing Service",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "credentialing-service", "version": "1.0.0"}


@app.get("/health/concurrency")
async def concurrency_health_check():
    """Concurrency health check endpoint"""
    import asyncio
    
    # Get asyncio metrics
    loop = asyncio.get_event_loop()
    tasks = len(asyncio.all_tasks(loop))
    
    # Get semaphore metrics
    llm_available = llm_semaphore._value
    llm_total = llm_semaphore._value + (ConcurrencyConfig.MAX_CONCURRENT_LLM_REQUESTS - llm_semaphore._value)
    file_available = file_semaphore._value
    file_total = file_semaphore._value + (ConcurrencyConfig.MAX_CONCURRENT_FILE_OPERATIONS - file_semaphore._value)
    
    # Get system metrics (with fallback if psutil not available)
    try:
        import psutil
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        system_metrics = {
            "cpu_percent": cpu_percent,
            "memory_percent": memory.percent,
            "memory_available_gb": round(memory.available / (1024**3), 2)
        }
    except ImportError:
        system_metrics = {
            "cpu_percent": "N/A (psutil not available)",
            "memory_percent": "N/A (psutil not available)",
            "memory_available_gb": "N/A (psutil not available)"
        }
    
    return {
        "status": "healthy",
        "concurrency": {
            "active_tasks": tasks,
            "llm_semaphore": {
                "available": llm_available,
                "total": llm_total,
                "utilization": f"{((llm_total - llm_available) / llm_total * 100):.1f}%"
            },
            "file_semaphore": {
                "available": file_available,
                "total": file_total,
                "utilization": f"{((file_total - file_available) / file_total * 100):.1f}%"
            }
        },
        "system": system_metrics,
        "config": {
            "workers": ConcurrencyConfig.WORKERS,
            "max_concurrent_connections": ConcurrencyConfig.MAX_CONCURRENT_CONNECTIONS,
            "rate_limit_per_minute": ConcurrencyConfig.RATE_LIMIT_REQUESTS_PER_MINUTE
        }
    }


@app.post("/credential/{provider_id}")
async def credential_provider(
    provider_id: str, background_tasks: BackgroundTasks = None
):
    """Credential a specific provider"""
    try:
        # Use asyncio.create_task for non-blocking provider check
        provider_check_task = asyncio.create_task(
            asyncio.to_thread(provider_service.get_provider, provider_id)
        )
        
        # Check if provider exists
        provider = await provider_check_task
        if not provider:
            raise HTTPException(
                status_code=404, detail=f"Provider {provider_id} not found"
            )

        # Perform credentialing (already async)
        result = await credentialing_service.credential_provider(provider_id)

        return {"success": True, "provider_id": provider_id, "result": result.to_dict()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/providers")
async def get_providers():
    """Get all providers"""
    try:
        providers = provider_service.get_all_providers()
        provider_summaries = []

        for provider in providers:
            summary = provider_service.get_provider_summary(provider.provider_id)
            if summary:
                provider_summaries.append(summary)

        return {
            "success": True,
            "providers": provider_summaries,
            "count": len(provider_summaries),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/providers/{provider_id}")
async def get_provider(provider_id: str):
    """Get specific provider details"""
    try:
        provider = provider_service.get_provider(provider_id)
        if not provider:
            raise HTTPException(
                status_code=404, detail=f"Provider {provider_id} not found"
            )

        return {"success": True, "provider": provider.get_all_data()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/regulations")
async def get_regulations():
    """Get regulatory requirements"""
    try:
        with open("data/regulations.json", "r") as f:
            regulations = json.load(f)

        return {"success": True, "regulations": regulations}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/results/{provider_id}")
async def get_credentialing_result(provider_id: str):
    """Get credentialing result for a provider"""
    try:
        result = credentialing_service.get_credentialing_result(provider_id)
        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"No credentialing result found for provider {provider_id}",
            )

        return {"success": True, "result": result.to_dict()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/results")
async def get_all_results():
    """Get all credentialing results"""
    try:
        results = credentialing_service.get_all_results()
        results_dict = {}

        for provider_id, result in results.items():
            results_dict[provider_id] = result.to_dict()

        return {"success": True, "results": results_dict, "count": len(results_dict)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/compliant-providers")
async def get_compliant_providers():
    """Get list of compliant providers"""
    try:
        compliant_ids = credentialing_service.get_compliant_providers()
        compliant_providers = []

        for provider_id in compliant_ids:
            summary = provider_service.get_provider_summary(provider_id)
            if summary:
                summary["score"] = credentialing_service.get_provider_score(provider_id)
                compliant_providers.append(summary)

        return {
            "success": True,
            "compliant_providers": compliant_providers,
            "count": len(compliant_providers),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/providers/search")
async def search_providers(
    specialty: Optional[str] = None,
    min_experience: Optional[int] = None,
    location: Optional[str] = None,
):
    """Search providers by criteria"""
    try:
        results = []

        if specialty:
            results = provider_service.get_providers_by_specialty(specialty)
        elif min_experience:
            results = provider_service.get_providers_by_experience(min_experience)
        elif location:
            results = provider_service.get_providers_by_location(location)
        else:
            results = provider_service.get_all_providers()

        provider_summaries = []
        for provider in results:
            summary = provider_service.get_provider_summary(provider.provider_id)
            if summary:
                provider_summaries.append(summary)

        return {
            "success": True,
            "providers": provider_summaries,
            "count": len(provider_summaries),
            "search_criteria": {
                "specialty": specialty,
                "min_experience": min_experience,
                "location": location,
            },
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats/llm-usage")
async def get_llm_usage_stats():
    """Get LLM usage statistics"""
    try:
        stats = credentialing_service.get_llm_usage_stats()

        return {"success": True, "llm_usage": stats}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats/credentialing")
async def get_credentialing_stats():
    """Get credentialing statistics"""
    try:
        all_results = credentialing_service.get_all_results()

        total_providers = len(all_results)
        compliant_providers = len(
            [
                r
                for r in all_results.values()
                if r.compliance_status == ComplianceStatus.COMPLIANT
            ]
        )
        non_compliant_providers = len(
            [
                r
                for r in all_results.values()
                if r.compliance_status == ComplianceStatus.NON_COMPLIANT
            ]
        )

        avg_score = 0
        if total_providers > 0:
            avg_score = sum(r.score for r in all_results.values()) / total_providers

        score_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for result in all_results.values():
            score_distribution[result.score] += 1

        return {
            "success": True,
            "stats": {
                "total_providers": total_providers,
                "compliant_providers": compliant_providers,
                "non_compliant_providers": non_compliant_providers,
                "compliance_rate": compliant_providers / max(total_providers, 1),
                "average_score": round(avg_score, 2),
                "score_distribution": score_distribution,
            },
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/batch-credential")
async def batch_credential_providers(provider_ids: List[str]):
    """Credential multiple providers in batch"""
    try:
        # Limit concurrent processing to avoid overwhelming the system
        max_concurrent = min(ConcurrencyConfig.MAX_CONCURRENT_BATCH_REQUESTS, len(provider_ids))
        
        async def process_provider(provider_id: str):
            try:
                result = await credentialing_service.credential_provider(provider_id)
                return provider_id, {"success": True, "result": result.to_dict()}
            except Exception as e:
                return provider_id, {"success": False, "error": str(e)}
        
        # Process in chunks to control concurrency
        results = {}
        for i in range(0, len(provider_ids), max_concurrent):
            chunk = provider_ids[i:i + max_concurrent]
            tasks = [process_provider(provider_id) for provider_id in chunk]
            
            # Execute chunk concurrently
            chunk_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            for provider_id, result in chunk_results:
                if isinstance(result, Exception):
                    results[provider_id] = {"success": False, "error": str(result)}
                else:
                    results[provider_id] = result

        return {
            "success": True,
            "batch_results": results,
            "total_processed": len(provider_ids),
            "concurrent_limit": max_concurrent,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# New endpoints for processed doctors list and chat functionality


@app.get("/processed-doctors", response_model=List[ProcessedDoctor])
async def get_processed_doctors():
    """Get a list of all processed doctors with their credentialing details"""
    try:
        import os
        from pathlib import Path
        from datetime import datetime
        
        # Read all session logs to get both completed and in-progress processes
        logs_dir = Path(settings.LOGS_DIR)
        processed_doctors = []
        processed_provider_ids = set()
        
        if logs_dir.exists():
            # First, find all completed sessions (have .json files)
            completed_sessions = {}
            for json_file in logs_dir.glob("credentialing_*.json"):
                try:
                    with open(json_file, "r") as f:
                        session_log = json.load(f)
                    
                    provider_id = session_log.get("provider_id")
                    session_id = session_log.get("session_id")
                    final_result = session_log.get("final_result", {})
                    
                    if final_result:
                        result_data = final_result.get("result", {})
                        completed_sessions[provider_id] = {
                            "session_log": session_log,
                            "result_data": result_data,
                            "session_id": session_id
                        }
                        
                except Exception as e:
                    continue
            
            # Now find in-progress sessions (have .log files)
            in_progress_sessions = {}
            for log_file in logs_dir.glob("credentialing_*.log"):
                try:
                    # Extract session info from log filename
                    # Format: credentialing_{provider_id}_{timestamp}.log
                    filename = log_file.stem  # Remove .log extension
                    parts = filename.split('_')
                    
                    if len(parts) >= 3:
                        # Reconstruct provider_id (could have underscores)
                        provider_id = '_'.join(parts[1:-2])  # Everything between 'credentialing' and timestamp
                        session_id = '_'.join(parts[1:])  # Everything after 'credentialing'
                        
                        # Extract timestamp from session_id for comparison
                        timestamp_str = '_'.join(parts[-2:])  # Last two parts are date and time
                        try:
                            log_timestamp = datetime.strptime(timestamp_str, "%Y%m%d_%H%M%S")
                        except:
                            continue
                        
                        # Check if this provider has a completed session with a newer timestamp
                        if provider_id in completed_sessions:
                            # Check if the completed session is newer than this log file
                            completed_session_id = completed_sessions[provider_id]["session_id"]
                            completed_parts = completed_session_id.split('_')
                            if len(completed_parts) >= 2:
                                completed_timestamp_str = '_'.join(completed_parts[-2:])
                                try:
                                    completed_timestamp = datetime.strptime(completed_timestamp_str, "%Y%m%d_%H%M%S")
                                    if completed_timestamp > log_timestamp:
                                        # Completed session is newer, skip this in-progress session
                                        continue
                                except:
                                    pass
                        
                        # This is an in-progress session (either no completed session or this log is newer)
                        in_progress_sessions[provider_id] = {
                            "session_id": session_id,
                            "log_file": log_file,
                            "timestamp": log_timestamp
                        }
                            
                except Exception as e:
                    continue
            
            # Process completed sessions
            for provider_id, completion_data in completed_sessions.items():
                # Get provider details
                provider = provider_service.get_provider(provider_id)
                if not provider:
                    continue
                
                session_log = completion_data["session_log"]
                result_data = completion_data["result_data"]
                
                processed_doctor = ProcessedDoctor(
                    provider_id=provider_id,
                    name=provider.PersonalInfo.name,
                    specialty=provider.Specialties.primary_specialty,
                    experience_years=provider.WorkHistory.years_experience,
                    status="COMPLETED",
                    compliance_status=result_data.get("compliance_status", "UNKNOWN"),
                    score=result_data.get("score", 0),
                    current_step=None,
                    last_credentialed=session_log.get("start_time", "Unknown"),
                    processing_time=result_data.get("processing_time", 0.0),
                    llm_requests=result_data.get("llm_usage", {}).get("total_requests", 0),
                    llm_cost=result_data.get("llm_usage", {}).get("total_cost", 0.0),
                    session_id=completion_data["session_id"],
                    steps_completed=None,
                    total_steps_estimated=None,
                )
                
                processed_doctors.append(processed_doctor)
                processed_provider_ids.add(provider_id)
            
            # Process in-progress sessions
            for provider_id, progress_data in in_progress_sessions.items():
                # Get provider details
                provider = provider_service.get_provider(provider_id)
                if not provider:
                    continue
                
                # Read the log file to get current progress
                log_file = progress_data["log_file"]
                try:
                    with open(log_file, "r") as f:
                        log_content = f.read()
                    
                    # Extract session start time from log filename or content
                    session_id = progress_data["session_id"]
                    parts = session_id.split('_')
                    if len(parts) >= 2:
                        # Extract timestamp from session_id
                        timestamp_str = '_'.join(parts[-2:])  # Last two parts are date and time
                        try:
                            # Parse timestamp (format: YYYYMMDD_HHMMSS)
                            start_dt = datetime.strptime(timestamp_str, "%Y%m%d_%H%M%S")
                            current_time = datetime.now()
                            processing_time = (current_time - start_dt).total_seconds()
                        except:
                            processing_time = 0.0
                    else:
                        processing_time = 0.0
                    
                    # Count lines in log file to estimate progress
                    log_lines = log_content.split('\n')
                    steps_completed = len([line for line in log_lines if 'Step:' in line])
                    
                    # Estimate current step based on log content
                    current_step = "Processing"
                    if "data_mapping" in log_content.lower():
                        current_step = "Data Mapping"
                    elif "api_verification" in log_content.lower():
                        current_step = "API Verification"
                    elif "regulation_check" in log_content.lower():
                        current_step = "Regulation Checks"
                    elif "scoring" in log_content.lower():
                        current_step = "Scoring"
                    elif "final_result" in log_content.lower():
                        current_step = "Finalizing"
                    
                    processed_doctor = ProcessedDoctor(
                        provider_id=provider_id,
                        name=provider.PersonalInfo.name,
                        specialty=provider.Specialties.primary_specialty,
                        experience_years=provider.WorkHistory.years_experience,
                        status="IN_PROGRESS",
                        compliance_status=None,
                        score=None,
                        current_step=current_step,
                        last_credentialed=start_dt.isoformat() if 'start_dt' in locals() else "Unknown",
                        processing_time=processing_time,
                        llm_requests=0,  # Can't easily extract from log file
                        llm_cost=0.0,
                        session_id=session_id,
                        steps_completed=steps_completed,
                        total_steps_estimated=10,
                    )
                    
                    processed_doctors.append(processed_doctor)
                    processed_provider_ids.add(provider_id)
                    
                except Exception as e:
                    continue

        # Now add providers that haven't started credentialing yet
        all_providers = provider_service.get_all_providers()
        processed_provider_ids = {doc.provider_id for doc in processed_doctors}
        
        for provider in all_providers:
            if provider.provider_id not in processed_provider_ids:
                # Provider hasn't been credentialed yet
                processed_doctor = ProcessedDoctor(
                    provider_id=provider.provider_id,
                    name=provider.PersonalInfo.name,
                    specialty=provider.Specialties.primary_specialty,
                    experience_years=provider.WorkHistory.years_experience,
                    status="NOT_STARTED",
                    compliance_status=None,
                    score=None,
                    current_step=None,
                    last_credentialed="Never",
                    processing_time=0.0,
                    llm_requests=0,
                    llm_cost=0.0,
                    session_id="None",
                    steps_completed=None,
                    total_steps_estimated=None,
                )
                processed_doctors.append(processed_doctor)

        # Sort by status priority (IN_PROGRESS first, then COMPLETED, then NOT_STARTED)
        # Within each status, sort by last_credentialed (newest first)
        def sort_key(doc):
            status_priority = {"IN_PROGRESS": 0, "COMPLETED": 1, "NOT_STARTED": 2}
            return (status_priority.get(doc.status, 3), doc.last_credentialed)

        processed_doctors.sort(key=sort_key, reverse=True)

        return processed_doctors

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))





@app.post("/chat", response_model=ChatResponse)
async def chat_with_credentialing_data(request: ChatRequest):
    """Chat interface that answers questions based on credentialing logs"""
    try:
        # Get the credentialing history for the provider
        history = credentialing_service.get_credentialing_history(request.provider_id)

        if not history:
            raise HTTPException(
                status_code=404,
                detail=f"No credentialing history found for provider {request.provider_id}",
            )

        # If session_id is provided, use that specific session, otherwise use the latest
        target_session = None
        if request.session_id:
            target_session = next(
                (
                    session
                    for session in history
                    if session.get("session_id") == request.session_id
                ),
                None,
            )
            if not target_session:
                raise HTTPException(
                    status_code=404,
                    detail=f"Session {request.session_id} not found for provider {request.provider_id}",
                )
        else:
            target_session = history[0]  # Latest session

        # Get provider details
        provider = provider_service.get_provider(request.provider_id)
        if not provider:
            raise HTTPException(
                status_code=404, detail=f"Provider {request.provider_id} not found"
            )

        # Use LLM to answer the question based on the session data
        answer, confidence, sources = await _generate_chat_response(
            request.question, target_session, provider, request.provider_id
        )

        return ChatResponse(
            answer=answer,
            confidence=confidence,
            sources=sources,
            provider_id=request.provider_id,
            session_id=target_session.get("session_id"),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def _generate_chat_response(
    question: str, session_data: Dict[str, Any], provider: Any, provider_id: str
) -> tuple[str, float, List[Dict[str, Any]]]:
    """Generate a chat response using LLM based on session data"""

    # Create context from session data
    context = {
        "provider_info": {
            "name": provider.PersonalInfo.name,
            "specialty": provider.Specialties.primary_specialty,
            "experience": provider.WorkHistory.years_experience,
            "education": provider.Educations.medical_school,
        },
        "credentialing_result": session_data.get("final_result", {}),
        "steps": session_data.get("steps", []),
        "llm_reasoning": session_data.get("llm_reasoning", []),
        "decisions": session_data.get("decisions", []),
        "data_points": session_data.get("data_points", {}),
    }

    # Create prompt for LLM
    prompt = f"""
    You are a credentialing assistant. Answer the following question based on the credentialing session data for provider {provider_id}.
    
    Provider Information:
    - Name: {context['provider_info']['name']}
    - Specialty: {context['provider_info']['specialty']}
    - Experience: {context['provider_info']['experience']} years
    - Education: {context['provider_info']['education']}
    
    Credentialing Session Data:
    - Session ID: {session_data.get('session_id', 'Unknown')}
    - Start Time: {session_data.get('start_time', 'Unknown')}
    - Total Steps: {len(context['steps'])}
    - Total LLM Interactions: {len(context['llm_reasoning'])}
    - Total Decisions: {len(context['decisions'])}
    
    Final Result: {json.dumps(context['credentialing_result'], indent=2)}
    
    Steps Taken: {json.dumps(context['steps'], indent=2)}
    
    LLM Reasoning: {json.dumps(context['llm_reasoning'], indent=2)}
    
    Decisions Made: {json.dumps(context['decisions'], indent=2)}
    
    Question: {question}
    
    Please provide a comprehensive answer based on the credentialing session data. Include specific details from the logs when relevant.
    """

    try:
        # Use the LLM provider to generate response
        from utils.llm_async.unified_llm import LLMProvider

        llm_provider = LLMProvider()

        # Create a simple response generation method
        response = llm_provider.generate(prompt)

        # Extract answer from response
        answer = response.content

        # Calculate confidence based on data availability
        confidence = min(
            0.95,
            0.5
            + (len(context["steps"]) * 0.05)
            + (len(context["llm_reasoning"]) * 0.02),
        )

        # Identify sources from the session data
        sources = []

        # Add relevant steps as sources
        for step in context["steps"][:3]:  # Top 3 most relevant steps
            sources.append(
                {
                    "type": "step",
                    "name": step.get("step_name", "Unknown"),
                    "timestamp": step.get("timestamp", "Unknown"),
                    "data": step.get("data", {}),
                }
            )

        # Add relevant decisions as sources
        for decision in context["decisions"][:2]:  # Top 2 most relevant decisions
            sources.append(
                {
                    "type": "decision",
                    "name": decision.get("type", "Unknown"),
                    "decision": decision.get("decision", "Unknown"),
                    "confidence": decision.get("confidence", 0.0),
                }
            )

        return answer, confidence, sources

    except Exception as e:
        # Fallback response if LLM fails
        fallback_answer = f"I apologize, but I encountered an error while processing your question about {provider.PersonalInfo.name}. The credentialing session data is available, but I couldn't generate a specific answer. Please try rephrasing your question or contact support."

        return fallback_answer, 0.3, []


@app.post("/report", response_model=ReportResponse)
async def get_latest_report(request: ReportRequest):
    """Get the latest credentialing report for a provider by name or ID"""
    try:
        from services.report_service import ReportService
        from pathlib import Path
        import os

        # Determine the provider ID
        target_provider_id = None
        
        if request.provider_id:
            # If provider_id is provided, use it directly
            target_provider_id = request.provider_id
        elif request.provider_name:
            # Search for provider by name
            providers = provider_service.get_all_providers()
            for provider in providers:
                if request.provider_name.lower() in provider.PersonalInfo.name.lower():
                    target_provider_id = provider.provider_id
                    break
            
            if not target_provider_id:
                raise HTTPException(
                    status_code=404, 
                    detail=f"No provider found matching name: {request.provider_name}"
                )
        else:
            raise HTTPException(
                status_code=400, 
                detail="Either provider_id or provider_name must be provided"
            )

        # Get the provider details
        provider = provider_service.get_provider(target_provider_id)
        if not provider:
            raise HTTPException(
                status_code=404, 
                detail=f"Provider {target_provider_id} not found"
            )

        # Get credentialing history to find the latest session
        history = credentialing_service.get_credentialing_history(target_provider_id)
        if not history:
            raise HTTPException(
                status_code=404,
                detail=f"No credentialing history found for provider {target_provider_id}"
            )

        # Get the latest session
        latest_session = history[0]  # History is sorted by timestamp, newest first
        session_id = latest_session.get("session_id")
        
        if not session_id:
            raise HTTPException(
                status_code=404,
                detail=f"No session ID found in credentialing history for provider {target_provider_id}"
            )

        # Check if report already exists
        logs_dir = Path(settings.LOGS_DIR)
        reports_dir = logs_dir / "reports"
        report_filename = f"comprehensive_credentialing_report_{session_id}.md"
        report_file = reports_dir / report_filename

        # If report doesn't exist, generate it
        if not report_file.exists():
            report_service = ReportService()
            report_result = report_service.generate_credentialing_report(target_provider_id, session_id)
            report_file = Path(report_result["report_file"])

        # Read the report content
        with open(report_file, "r") as f:
            report_content = f.read()

        return ReportResponse(
            report_content=report_content,
            provider_id=target_provider_id,
            provider_name=provider.PersonalInfo.name,
            session_id=session_id,
            report_generated_at=latest_session.get("timestamp", "Unknown"),
            message=f"Latest credentialing report for {provider.PersonalInfo.name}"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Logging and audit trail endpoints


@app.get("/logs/credentialing-history")
async def get_credentialing_history(provider_id: Optional[str] = None):
    """Get credentialing history for a provider or all providers"""
    try:
        history = credentialing_service.get_credentialing_history(provider_id)

        return {
            "success": True,
            "history": history,
            "count": len(history),
            "provider_id": provider_id,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/logs/decision-reasoning/{provider_id}")
async def get_decision_reasoning(provider_id: str, decision_type: str):
    """Get reasoning for specific decision types for a provider"""
    try:
        reasoning = credentialing_service.get_decision_reasoning(
            provider_id, decision_type
        )

        return {
            "success": True,
            "reasoning": reasoning,
            "count": len(reasoning),
            "provider_id": provider_id,
            "decision_type": decision_type,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/logs/audit-trail")
async def get_audit_trail(event_type: Optional[str] = None, limit: int = 100):
    """Get audit trail events"""
    try:
        # This would read from the audit trail file
        # For now, return a placeholder
        audit_events = []

        return {
            "success": True,
            "audit_events": audit_events,
            "count": len(audit_events),
            "event_type": event_type,
            "limit": limit,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/logs/chatbot-training-data")
async def get_chatbot_training_data(limit: int = 100):
    """Get chatbot training data"""
    try:
        # This would read from the chatbot training data file
        # For now, return a placeholder
        training_data = []

        return {
            "success": True,
            "training_data": training_data,
            "count": len(training_data),
            "limit": limit,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/logs/session/{session_id}")
async def get_session_log(session_id: str):
    """Get detailed session log for a specific credentialing session"""
    try:
        import os
        from pathlib import Path

        logs_dir = Path(settings.LOGS_DIR)
        session_file = logs_dir / f"credentialing_{session_id}.json"

        if not session_file.exists():
            raise HTTPException(
                status_code=404, detail=f"Session {session_id} not found"
            )

        with open(session_file, "r") as f:
            session_log = json.load(f)

        return {"success": True, "session_log": session_log}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/logs/sessions")
async def get_all_sessions(provider_id: Optional[str] = None, limit: int = 50):
    """Get all credentialing sessions"""
    try:
        import os
        from pathlib import Path

        logs_dir = Path(settings.LOGS_DIR)
        sessions = []

        for log_file in logs_dir.glob("credentialing_*.json"):
            try:
                with open(log_file, "r") as f:
                    session_log = json.load(f)

                if provider_id is None or session_log.get("provider_id") == provider_id:
                    sessions.append(
                        {
                            "session_id": session_log.get("session_id"),
                            "provider_id": session_log.get("provider_id"),
                            "start_time": session_log.get("start_time"),
                            "end_time": session_log.get("end_time"),
                            "total_steps": len(session_log.get("steps", [])),
                            "total_llm_interactions": len(
                                session_log.get("llm_reasoning", [])
                            ),
                            "final_result": session_log.get("final_result"),
                        }
                    )
            except Exception as e:
                continue

        # Sort by start time (newest first)
        sessions.sort(key=lambda x: x.get("start_time", ""), reverse=True)
        sessions = sessions[:limit]

        return {
            "success": True,
            "sessions": sessions,
            "count": len(sessions),
            "provider_id": provider_id,
            "limit": limit,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/logs/llm-reasoning/{provider_id}")
async def get_llm_reasoning(provider_id: str, session_id: Optional[str] = None):
    """Get LLM reasoning for a specific provider or session"""
    try:
        if session_id:
            # Get reasoning for specific session
            import os
            from pathlib import Path

            logs_dir = Path(settings.LOGS_DIR)
            session_file = logs_dir / f"credentialing_{session_id}.json"

            if not session_file.exists():
                raise HTTPException(
                    status_code=404, detail=f"Session {session_id} not found"
                )

            with open(session_file, "r") as f:
                session_log = json.load(f)

            return {
                "success": True,
                "llm_reasoning": session_log.get("llm_reasoning", []),
                "count": len(session_log.get("llm_reasoning", [])),
                "session_id": session_id,
                "provider_id": provider_id,
            }
        else:
            # Get reasoning for all sessions of the provider
            history = credentialing_service.get_credentialing_history(provider_id)
            all_reasoning = []

            for session in history:
                all_reasoning.extend(session.get("llm_reasoning", []))

            return {
                "success": True,
                "llm_reasoning": all_reasoning,
                "count": len(all_reasoning),
                "provider_id": provider_id,
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Report management endpoints


@app.get("/reports/{session_id}")
async def get_report(session_id: str):
    """Get detailed credentialing report for a session"""
    try:
        from services.report_service import ReportService

        report_service = ReportService()

        report = report_service.get_report(session_id)
        if not report:
            raise HTTPException(
                status_code=404, detail=f"Report not found for session {session_id}"
            )

        return {"success": True, "report": report}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/reports")
async def list_reports(provider_id: Optional[str] = None, limit: int = 50):
    """List all generated reports, optionally filtered by provider"""
    try:
        from services.report_service import ReportService

        report_service = ReportService()

        reports = report_service.list_reports(provider_id)
        reports = reports[:limit]

        return {
            "success": True,
            "reports": reports,
            "count": len(reports),
            "provider_id": provider_id,
            "limit": limit,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/reports/generate/{session_id}")
async def generate_report_manually(session_id: str):
    """Manually generate a report for a specific session"""
    try:
        from services.report_service import ReportService
        from pathlib import Path

        # Extract provider_id from session_id
        # Session ID format: provider_id_timestamp, so we need to get everything before the last underscore
        if "_" in session_id:
            parts = session_id.split("_")
            # Remove the timestamp part (last two parts: date and time)
            provider_id = "_".join(parts[:-2])
        else:
            provider_id = session_id

        report_service = ReportService()
        report = report_service.generate_credentialing_report(provider_id, session_id)

        return {
            "success": True,
            "report": report,
            "message": f"Report generated successfully for session {session_id}",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/reports/provider/{provider_id}")
async def get_provider_reports(provider_id: str, limit: int = 10):
    """Get all reports for a specific provider"""
    try:
        from services.report_service import ReportService

        report_service = ReportService()

        reports = report_service.list_reports(provider_id)
        reports = reports[:limit]

        return {
            "success": True,
            "reports": reports,
            "count": len(reports),
            "provider_id": provider_id,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/reports/summary")
async def get_reports_summary():
    """Get summary statistics of all generated reports"""
    try:
        from services.report_service import ReportService

        report_service = ReportService()

        all_reports = report_service.list_reports()

        # Calculate summary statistics
        total_reports = len(all_reports)
        compliance_stats = {}
        score_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}

        for report in all_reports:
            status = report.get("compliance_status", "unknown")
            compliance_stats[status] = compliance_stats.get(status, 0) + 1

            score = report.get("overall_score", 0)
            if score in score_distribution:
                score_distribution[score] += 1

        return {
            "success": True,
            "summary": {
                "total_reports": total_reports,
                "compliance_statistics": compliance_stats,
                "score_distribution": score_distribution,
                "recent_reports": all_reports[:5],  # Last 5 reports
            },
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn_config = ConcurrencyConfig.get_uvicorn_config()
    
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=False,  # Disable reload in production for better performance
        log_level="info",
        access_log=True,
        **uvicorn_config
    )
