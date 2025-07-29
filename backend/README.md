# Healthcare Provider Credentialing Service

A comprehensive credentialing service that validates healthcare providers against regulatory requirements using LLM-powered data mapping and verification, with detailed logging and audit trails for chatbot training. **Now with full concurrent request processing capabilities and real-time status tracking.**

## Overview

This service automates the credentialing process for healthcare providers by:
- Mapping provider data to regulatory requirements using LLM
- Validating provider information through external credentialing APIs
- Scoring providers based on hard and soft regulatory compliance
- Providing detailed compliance reports
- **Comprehensive logging of all decisions, reasoning, and data points**
- **LLM-generated summaries for every step and decision**
- **Audit trail for compliance and chatbot training**
- **🔄 Concurrent Request Processing**: Handle multiple simultaneous credentialing requests
- **📊 Real-time Status Tracking**: Monitor in-progress, completed, and pending credentialing processes
- **⚡ Performance Optimized**: Configured for high-throughput production environments

## Features

- **LLM-Powered Data Mapping**: Uses AI to map provider data fields to regulatory requirements
- **Regulatory Compliance Checking**: Validates against hard and soft regulations
- **Provider Scoring**: Scores providers (1-5) based on soft regulation compliance
- **Data Verification**: Uses LLM to verify and validate provider information
- **Comprehensive Provider Database**: Sample database with 15 data fields per provider
- **🔍 Detailed Logging**: Tracks every step, decision, and data point
- **🧠 LLM Reasoning**: Generates explanations for all decisions and mappings
- **📋 Audit Trail**: Complete audit trail for compliance and transparency
- **🤖 Chatbot Training Data**: Automatically generates Q&A pairs for chatbot training
- **🔄 Concurrent Processing**: Handle multiple credentialing requests simultaneously
- **📊 Real-time Monitoring**: Track credentialing status (COMPLETED, IN_PROGRESS, NOT_STARTED)
- **⚡ Performance Monitoring**: Built-in concurrency health checks and metrics
- **🛡️ Rate Limiting**: Configurable rate limiting to prevent system overload

## Project Structure

```
credentialing-service/
├── README.md
├── requirements.txt
├── requirements_concurrency.txt    # Additional dependencies for concurrency
├── main.py                         # FastAPI application with concurrency support
├── demo.py
├── test_credentialing.py
├── test_logging.py
├── test_concurrency.py             # Concurrency testing script
├── start.sh
├── config/
│   ├── settings.py                 # Main application settings
│   └── concurrency.py              # Concurrency configuration
├── data/
│   ├── providers.json
│   └── regulations.json
├── services/
│   ├── __init__.py
│   ├── credentialing_service.py
│   ├── llm_service.py
│   └── provider_service.py
├── models/
│   ├── __init__.py
│   ├── provider.py
│   ├── regulation.py
│   └── credentialing_result.py
├── utils/
│   ├── __init__.py
│   ├── data_mapper.py
│   └── logger.py
└── logs/                          # Generated during runtime
    ├── credentialing_*.json       # Session logs (completed processes)
    ├── credentialing_*.log        # Standard logs (in-progress processes)
    ├── audit_trail.jsonl          # Audit events
    ├── chatbot_training_data.jsonl # Training data
    └── reports/                   # Generated reports
```

## Installation

1. Clone the repository
2. Install dependencies:
```bash
pip install -r requirements.txt
pip install -r requirements_concurrency.txt  # For concurrency features
```

3. Configure AWS credentials for Bedrock LLM (if using AWS Bedrock)

## Concurrent Request Processing

### Architecture

The service now supports concurrent request processing with the following features:

- **Multi-worker Uvicorn**: Automatically scales based on CPU cores
- **Asynchronous Endpoints**: All endpoints use `async/await` for non-blocking I/O
- **Semaphore Control**: Limits concurrent LLM requests and file operations
- **Rate Limiting**: Prevents system overload with configurable limits
- **Background Processing**: Long-running credentialing tasks run in background
- **Real-time Status Tracking**: Monitor credentialing progress in real-time

### Configuration

Concurrency settings are centralized in `config/concurrency.py`:

```python
# Environment variables for configuration
WORKERS = int(os.getenv("WORKERS", os.cpu_count() or 1))
MAX_CONCURRENT_CONNECTIONS = int(os.getenv("MAX_CONCURRENT_CONNECTIONS", 1000))
RATE_LIMIT_REQUESTS_PER_MINUTE = int(os.getenv("RATE_LIMIT_REQUESTS_PER_MINUTE", 100))
MAX_CONCURRENT_BATCH_REQUESTS = int(os.getenv("MAX_CONCURRENT_BATCH_REQUESTS", 5))
MAX_CONCURRENT_LLM_REQUESTS = int(os.getenv("MAX_CONCURRENT_LLM_REQUESTS", 10))
MAX_CONCURRENT_FILE_OPERATIONS = int(os.getenv("MAX_CONCURRENT_FILE_OPERATIONS", 20))
```

### Running in Production

```bash
# Production mode with concurrency optimizations
python main.py

# Or with custom settings
WORKERS=8 MAX_CONCURRENT_CONNECTIONS=2000 python main.py
```

### Performance Monitoring

Monitor system performance with the concurrency health endpoint:

```bash
curl http://localhost:8000/health/concurrency
```

Response includes:
- Active tasks count
- Semaphore utilization
- CPU and memory usage
- Rate limiting status

## Real-time Status Tracking

### `/processed-doctors` Endpoint

The enhanced `/processed-doctors` endpoint provides real-time status of all credentialing processes:

```bash
curl http://localhost:8000/processed-doctors
```

**Response Format:**
```json
[
  {
    "provider_id": "dr_johnson_002",
    "name": "Dr. Robert Johnson",
    "specialty": "Surgical Oncology",
    "experience_years": 20,
    "status": "IN_PROGRESS",
    "compliance_status": null,
    "score": null,
    "current_step": "Data Mapping",
    "last_credentialed": "2025-07-28T22:08:00",
    "processing_time": 45.67,
    "llm_requests": 0,
    "llm_cost": 0.0,
    "session_id": "dr_johnson_002_20250728_220800",
    "steps_completed": 4,
    "total_steps_estimated": 10
  },
  {
    "provider_id": "dr_smith_001",
    "name": "Dr. Sarah Smith",
    "specialty": "Cardiology",
    "experience_years": 15,
    "status": "COMPLETED",
    "compliance_status": "COMPLIANT",
    "score": 4,
    "current_step": null,
    "last_credentialed": "2025-07-28T22:05:15.624016",
    "processing_time": 116.84,
    "llm_requests": 15,
    "llm_cost": 0.045,
    "session_id": "dr_smith_001_20250728_220515",
    "steps_completed": null,
    "total_steps_estimated": null
  }
]
```

**Status Types:**
- **COMPLETED**: Process finished with final results
- **IN_PROGRESS**: Currently running (detected via `.log` files)
- **NOT_STARTED**: No credentialing process initiated

### Status Detection Logic

The endpoint intelligently detects process status:

1. **Completed Processes**: Found via `.json` files with `final_result` data
2. **In-Progress Processes**: Found via `.log` files without corresponding `.json` files
3. **Timestamp Comparison**: Prioritizes most recent sessions when multiple exist
4. **Progress Estimation**: Analyzes log content to estimate current step and completion

## Usage

### Basic Usage

```python
from services.credentialing_service import CredentialingService

# Initialize the service
cred_service = CredentialingService()

# Credential a provider (this will generate comprehensive logs)
result = cred_service.credential_provider("dr_smith_001")
print(f"Provider Score: {result.score}/5")
print(f"Compliance Status: {result.compliance_status}")
```

### Concurrent Processing

```python
import asyncio
import aiohttp

async def credential_multiple_providers(provider_ids):
    async with aiohttp.ClientSession() as session:
        tasks = []
        for provider_id in provider_ids:
            task = session.post(f"http://localhost:8000/credential/{provider_id}")
            tasks.append(task)
        
        results = await asyncio.gather(*tasks)
        return results

# Run concurrent credentialing
provider_ids = ["dr_smith_001", "dr_johnson_002", "dr_williams_003"]
results = await credential_multiple_providers(provider_ids)
```

### Testing Concurrency

```bash
# Test concurrent request handling
python test_concurrency.py

# Test basic functionality
python test_credentialing.py

# Test comprehensive logging
python test_logging.py

# Run demo
python demo.py
```

### API Endpoints

The service provides REST API endpoints:

#### Core Endpoints
- `POST /credential/{provider_id}` - Credential a specific provider (now includes automatic report generation)
- `GET /providers` - List all providers
- `GET /regulations` - Get regulatory requirements
- `GET /results/{provider_id}` - Get credentialing results

#### Status and Monitoring Endpoints
- `GET /processed-doctors` - **NEW**: Get real-time status of all credentialing processes
- `GET /health/concurrency` - **NEW**: Monitor system performance and concurrency metrics
- `GET /health` - Basic health check

#### Report Generation Endpoints
- `GET /get-report/{provider_id}` - Get detailed credentialing report for a provider
- `GET /get-report/{provider_id}?session_id={session_id}` - Get report for specific session
- `POST /generate-report` - Generate new detailed report (with request body)

#### Chat Interface
- `POST /chat` - Chat interface for asking questions about credentialing data

#### Logging and Audit Endpoints
- `GET /logs/credentialing-history` - Get credentialing history
- `GET /logs/decision-reasoning/{provider_id}` - Get decision reasoning
- `GET /logs/sessions` - Get all credentialing sessions
- `GET /logs/session/{session_id}` - Get detailed session log
- `GET /logs/llm-reasoning/{provider_id}` - Get LLM reasoning
- `GET /logs/audit-trail` - Get audit trail events
- `GET /logs/chatbot-training-data` - Get chatbot training data

#### Batch Processing Endpoints
- `POST /batch-credential` - **ENHANCED**: Credential multiple providers with concurrency control

## Report Generation Feature

The service now automatically generates comprehensive reports after each credentialing process. Reports include:

### Executive Summary
- Compliance status and overall score
- Key findings and recommendations
- Risk assessment and priority level

### Detailed Analysis
- **Process Overview**: Step-by-step breakdown, timing, and efficiency metrics
- **Hard Regulations Analysis**: Pass/fail status with detailed reasoning
- **Soft Regulations Scoring**: Score justification and improvement areas
- **Data Quality Assessment**: Completeness, accuracy, and verification results
- **LLM Performance Review**: Decision quality and reasoning effectiveness
- **Actionable Recommendations**: Immediate actions and long-term strategies

### Usage Examples

```bash
# Credential a provider (automatically generates report)
curl -X POST http://localhost:8000/credential/dr_smith_001

# Get the generated report
curl -X GET http://localhost:8000/get-report/dr_smith_001

# Generate a new report for specific session
curl -X POST http://localhost:8000/generate-report \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "dr_smith_001", "session_id": "specific_session_id"}'
```

## Data Fields

Each provider has 15 data fields:
1. **PersonalInfo** - Basic personal information
2. **ProfessionalIds** - License numbers, certifications
3. **Educations** - Educational background
4. **Specialties** - Medical specialties
5. **HospitalAffiliations** - Hospital associations
6. **WorkHistory** - Employment history
7. **PLIs** - Professional Liability Insurance
8. **PracticeInformation** - Practice details
9. **MalpracticeHistory** - Malpractice records
10. **Disclosure** - Disciplinary actions
11. **BoardCertifications** - Board certifications
12. **ContinuingEducation** - CME credits
13. **PeerReferences** - Professional references
14. **FinancialDisclosure** - Financial interests
15. **QualityMetrics** - Performance metrics

## Regulations

The system uses two types of regulations:

### Hard Regulations (Must Pass)
- Valid medical license
- No active disciplinary actions
- Current malpractice insurance
- Board certification in specialty
- Clean criminal background

### Soft Regulations (Scored 1-5)
- Years of experience (5+ years = 5 points)
- Continuing education compliance
- Quality metrics performance

## LLM Integration

The service uses LLM for:
- Data field mapping to regulations
- Verification of educational institutions
- Validation of certification names
- Natural language processing of credentialing API responses
- **Generating detailed reasoning for all decisions**
- **Explaining why specific data points were chosen**
- **Providing confidence levels for decisions**

## Comprehensive Logging

### What Gets Logged

1. **Every Step**: Each step in the credentialing process
2. **Data Points**: All data available at each step
3. **LLM Interactions**: Every LLM prompt and response
4. **LLM Reasoning**: Detailed explanations for all decisions
5. **Decisions**: All decisions with supporting data and confidence
6. **Regulation Checks**: Detailed reasoning for each regulation
7. **Scoring**: Explanations for scoring decisions
8. **Final Results**: Complete result with all supporting information

### Log Files Generated

- **Session Logs** (`credentialing_*.json`): Complete session data (created upon completion)
- **Standard Logs** (`credentialing_*.log`): Human-readable logs (updated during process)
- **Audit Trail** (`audit_trail.jsonl`): System events and actions
- **Chatbot Training Data** (`chatbot_training_data.jsonl`): Q&A pairs

### Log Structure

```json
{
  "session_id": "dr_smith_001_20241201_143022",
  "provider_id": "dr_smith_001",
  "start_time": "2024-12-01T14:30:22",
  "steps": [
    {
      "step_name": "data_mapping",
      "timestamp": "2024-12-01T14:30:23",
      "data": {...},
      "llm_reasoning": "Detailed explanation of data mapping..."
    }
  ],
  "llm_reasoning": [
    {
      "type": "data_mapping",
      "prompt": "...",
      "response": "...",
      "reasoning": "Detailed reasoning for the mapping decision...",
      "data_points": {...}
    }
  ],
  "decisions": [
    {
      "type": "hard_regulations_summary",
      "decision": "5/5 hard regulations passed",
      "reasoning": "Detailed explanation of compliance decision...",
      "supporting_data": {...},
      "confidence": 0.95
    }
  ],
  "final_result": {...}
}
```

## Chatbot Training Data

The service automatically generates training data for chatbots:

### Generated Q&A Pairs
- "What is the compliance status for provider X?"
- "Why did provider X receive a score of Y/5?"
- "Which hard regulations did provider X pass?"
- "What was the reasoning for regulation Z decision?"

### Training Data Format
```json
{
  "timestamp": "2024-12-01T14:30:25",
  "question": "What is the compliance status for dr_smith_001?",
  "answer": "Provider dr_smith_001 has a compliance status of COMPLIANT with a score of 4/5.",
  "context": {
    "provider_id": "dr_smith_001",
    "compliance_status": "COMPLIANT",
    "score": 4
  }
}
```

## Configuration

### Main Settings (`config/settings.py`)
Update to configure:
- LLM provider settings
- Credentialing API endpoints
- Scoring weights
- Regulatory thresholds
- **Logging settings**:
  - `LOGS_DIR`: Directory for log files
  - `LOG_LEVEL`: Logging level (INFO, DEBUG, etc.)
  - `ENABLE_DETAILED_LOGGING`: Enable/disable detailed logging
  - `DEBUG`: Enable debug mode (controls docs URLs)

### Concurrency Settings (`config/concurrency.py`)
Configure performance and concurrency:
- `WORKERS`: Number of Uvicorn worker processes
- `MAX_CONCURRENT_CONNECTIONS`: Maximum concurrent connections
- `RATE_LIMIT_REQUESTS_PER_MINUTE`: Rate limiting threshold
- `MAX_CONCURRENT_BATCH_REQUESTS`: Batch processing concurrency limit
- `MAX_CONCURRENT_LLM_REQUESTS`: LLM API concurrency limit
- `MAX_CONCURRENT_FILE_OPERATIONS`: File I/O concurrency limit

## API Response Format

### Credentialing Response
```json
{
  "success": true,
  "provider_id": "dr_smith_001",
  "result": {
    "provider_id": "dr_smith_001",
    "score": 4,
    "compliance_status": "COMPLIANT",
    "hard_regulations": {
      "valid_license": true,
      "no_disciplinary_actions": true,
      "malpractice_insurance": true,
      "board_certification": true,
      "clean_background": true
    },
    "soft_regulations": {
      "experience_score": 5,
      "education_compliance": 4,
      "quality_metrics": 3
    },
    "mapped_data": {
      "license_number": "MD123456",
      "board_certification": "American Board of Internal Medicine",
      "malpractice_insurance": "Active"
    },
    "llm_usage": {
      "total_requests": 15,
      "total_tokens": 2500,
      "total_cost": 0.045
    },
    "processing_time": 2.34
  },
  "report_available": true
}
```

### Processed Doctors Response
```json
[
  {
    "provider_id": "dr_johnson_002",
    "name": "Dr. Robert Johnson",
    "specialty": "Surgical Oncology",
    "experience_years": 20,
    "status": "IN_PROGRESS",
    "compliance_status": null,
    "score": null,
    "current_step": "Data Mapping",
    "last_credentialed": "2025-07-28T22:08:00",
    "processing_time": 45.67,
    "llm_requests": 0,
    "llm_cost": 0.0,
    "session_id": "dr_johnson_002_20250728_220800",
    "steps_completed": 4,
    "total_steps_estimated": 10
  }
]
```

### Concurrency Health Response
```json
{
  "status": "healthy",
  "concurrency": {
    "active_tasks": 3,
    "llm_semaphore": {
      "available": 8,
      "total": 10,
      "utilization": "20.0%"
    },
    "file_semaphore": {
      "available": 15,
      "total": 20,
      "utilization": "25.0%"
    }
  },
  "system": {
    "cpu_percent": 45.2,
    "memory_percent": 67.8,
    "memory_available_gb": 2.1
  },
  "config": {
    "workers": 4,
    "max_concurrent_connections": 1000,
    "rate_limit_per_minute": 100
  }
}
```

### Report Response
```json
{
  "success": true,
  "provider_id": "dr_smith_001",
  "report_id": "dr_smith_001_latest_1706123456",
  "report": {
    "executive_summary": {
      "compliance_status": "COMPLIANT",
      "overall_score": 4,
      "key_findings": [
        "Provider meets all hard regulatory requirements",
        "Strong performance in experience metrics"
      ],
      "recommendation_level": "LOW"
    },
    "process_overview": {
      "total_steps": 12,
      "processing_time": 2.34,
      "llm_interactions": 15,
      "data_mapping_quality": "Excellent"
    },
    "hard_regulations": {
      "total_regulations": 5,
      "passed_regulations": 5,
      "detailed_analysis": [...]
    },
    "soft_regulations": {
      "average_score": 4.0,
      "detailed_scoring": [...]
    },
    "recommendations": {
      "immediate_actions": [],
      "improvement_areas": ["Update continuing education"],
      "timeline": "Next review: 2025-12-01"
    },
    "technical_details": {
      "llm_requests": 15,
      "llm_tokens": 2500,
      "llm_cost": 0.045
    }
  },
  "generation_timestamp": 1706123456.789
}
```

## Building a Chatbot

The comprehensive logging system provides all the data needed to build a chatbot:

### Available Data
1. **Complete Decision History**: Every decision with reasoning
2. **LLM Interactions**: All prompts and responses
3. **Data Points**: All data used in decisions
4. **Training Q&A**: Pre-generated question-answer pairs
5. **Audit Trail**: System events and user actions

### Chatbot Features
- Answer questions about provider compliance
- Explain decision reasoning
- Provide data point details
- Show historical credentialing results
- Explain regulation requirements

## Performance and Scalability

### Production Recommendations

1. **Worker Configuration**: Set `WORKERS` to CPU cores × 2
2. **Connection Limits**: Adjust `MAX_CONCURRENT_CONNECTIONS` based on expected load
3. **Rate Limiting**: Configure `RATE_LIMIT_REQUESTS_PER_MINUTE` to prevent overload
4. **LLM Concurrency**: Set `MAX_CONCURRENT_LLM_REQUESTS` based on API limits
5. **Monitoring**: Use `/health/concurrency` endpoint for real-time monitoring

### Performance Testing

```bash
# Test concurrent request handling
python test_concurrency.py

# Monitor performance
curl http://localhost:8000/health/concurrency
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License 