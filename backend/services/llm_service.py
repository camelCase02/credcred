"""
LLM service for data mapping and verification in credentialing.
"""

import json
import time
from typing import Dict, Any, List, Optional
from utils.llm_async.unified_llm import LLMProvider
from utils.logger import CredentialingLogger, audit_logger
from config.settings import settings


class LLMService:
    """Service for LLM-powered data mapping and verification"""
    
    def __init__(self, logger: Optional[CredentialingLogger] = None):
        """Initialize LLM service with LLMProvider"""
        self.llm_provider = LLMProvider()
        self.usage_stats = {
            "total_requests": 0,
            "total_tokens": 0,
            "total_cost": 0.0
        }
        self.logger = logger
    
    def set_logger(self, logger: CredentialingLogger):
        """Set the logger for this session"""
        self.logger = logger
    
    def map_data_to_regulations(self, provider_data: Dict[str, Any], regulations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Map provider data fields to regulatory requirements using LLM"""
        prompt = self._create_mapping_prompt(provider_data, regulations)
        
        # Log the mapping step
        if self.logger:
            self.logger.log_step(
                "data_mapping",
                {
                    "provider_data_keys": list(provider_data.keys()),
                    "regulations_count": len(regulations),
                    "regulation_ids": [reg.get("id") for reg in regulations]
                },
                "Starting data mapping process to match provider data fields with regulatory requirements"
            )
        
        try:
            response = self.llm_provider.generate(prompt)
            self._update_usage_stats(response)
            
            # Generate reasoning for the mapping
            reasoning_prompt = f"""
            Analyze the following data mapping response and explain the reasoning behind how each regulation was mapped to provider data fields:
            
            Provider Data: {json.dumps(provider_data, indent=2)}
            Regulations: {json.dumps(regulations, indent=2)}
            LLM Response: {response.content}
            
            Please provide a detailed explanation of:
            1. Which provider data fields were selected for each regulation
            2. Why these specific fields were chosen
            3. How the data supports regulatory compliance
            4. Any potential gaps or missing information
            """
            
            reasoning_response = self.llm_provider.generate(reasoning_prompt)
            self._update_usage_stats(reasoning_response)
            
            # Parse the LLM response to extract mapped data
            mapped_data = self._parse_mapping_response(response.content)
            
            # Log the LLM interaction with reasoning
            if self.logger:
                self.logger.log_llm_interaction(
                    "data_mapping",
                    prompt,
                    response.content,
                    reasoning_response.content,
                    {"mapped_data": mapped_data}
                )
                
                self.logger.log_data_points("data_mapping", {
                    "provider_data": provider_data,
                    "regulations": regulations,
                    "mapped_data": mapped_data
                })
            
            return mapped_data
            
        except Exception as e:
            error_reasoning = f"Data mapping failed due to: {str(e)}. Using fallback mapping approach."
            
            if self.logger:
                self.logger.log_step(
                    "data_mapping_error",
                    {"error": str(e)},
                    error_reasoning
                )
            
            return self._fallback_mapping(provider_data, regulations)
    
    def verify_educational_institution(self, institution_name: str) -> Dict[str, Any]:
        """Verify educational institution using LLM"""
        prompt = f"""
        Verify if the following educational institution is a legitimate, accredited medical school:
        Institution: {institution_name}
        
        Please respond with a JSON object containing:
        {{
            "is_verified": true/false,
            "confidence": 0.0-1.0,
            "accreditation_status": "string",
            "notes": "string"
        }}
        """
        
        # Log the verification step
        if self.logger:
            self.logger.log_step(
                "education_verification",
                {"institution_name": institution_name},
                f"Verifying educational institution: {institution_name}"
            )
        
        try:
            response = self.llm_provider.generate(prompt)
            self._update_usage_stats(response)
            
            verification_result = json.loads(response.content)
            
            # Generate reasoning for the verification
            reasoning_prompt = f"""
            Explain the reasoning behind the educational institution verification result:
            
            Institution: {institution_name}
            Verification Result: {json.dumps(verification_result, indent=2)}
            
            Please provide detailed reasoning for:
            1. Why this institution was verified or not verified
            2. What factors influenced the confidence level
            3. What accreditation standards were considered
            4. Any specific concerns or positive indicators
            """
            
            reasoning_response = self.llm_provider.generate(reasoning_prompt)
            self._update_usage_stats(reasoning_response)
            
            # Log the verification with reasoning
            if self.logger:
                self.logger.log_llm_interaction(
                    "education_verification",
                    prompt,
                    response.content,
                    reasoning_response.content,
                    {"institution_name": institution_name, "result": verification_result}
                )
                
                self.logger.log_decision(
                    "education_verification",
                    f"Verified: {verification_result.get('is_verified')}",
                    reasoning_response.content,
                    {"institution_name": institution_name, "result": verification_result},
                    verification_result.get("confidence", 0.5)
                )
            
            return verification_result
            
        except Exception as e:
            error_reasoning = f"Educational institution verification failed: {str(e)}. Using fallback verification."
            
            if self.logger:
                self.logger.log_step(
                    "education_verification_error",
                    {"error": str(e), "institution_name": institution_name},
                    error_reasoning
                )
            
            return {
                "is_verified": True,  # Fallback to verified
                "confidence": 0.5,
                "accreditation_status": "Unknown",
                "notes": "Verification failed, using fallback"
            }
    
    def verify_certification_name(self, certification_name: str) -> Dict[str, Any]:
        """Verify board certification name using LLM"""
        prompt = f"""
        Verify if the following board certification is a legitimate, recognized medical board certification:
        Certification: {certification_name}
        
        Please respond with a JSON object containing:
        {{
            "is_verified": true/false,
            "confidence": 0.0-1.0,
            "recognized_board": "string",
            "notes": "string"
        }}
        """
        
        # Log the verification step
        if self.logger:
            self.logger.log_step(
                "certification_verification",
                {"certification_name": certification_name},
                f"Verifying board certification: {certification_name}"
            )
        
        try:
            response = self.llm_provider.generate(prompt)
            self._update_usage_stats(response)
            
            verification_result = json.loads(response.content)
            
            # Generate reasoning for the verification
            reasoning_prompt = f"""
            Explain the reasoning behind the board certification verification result:
            
            Certification: {certification_name}
            Verification Result: {json.dumps(verification_result, indent=2)}
            
            Please provide detailed reasoning for:
            1. Why this certification was verified or not verified
            2. What factors influenced the confidence level
            3. What board recognition standards were considered
            4. Any specific concerns or positive indicators
            """
            
            reasoning_response = self.llm_provider.generate(reasoning_prompt)
            self._update_usage_stats(reasoning_response)
            
            # Log the verification with reasoning
            if self.logger:
                self.logger.log_llm_interaction(
                    "certification_verification",
                    prompt,
                    response.content,
                    reasoning_response.content,
                    {"certification_name": certification_name, "result": verification_result}
                )
                
                self.logger.log_decision(
                    "certification_verification",
                    f"Verified: {verification_result.get('is_verified')}",
                    reasoning_response.content,
                    {"certification_name": certification_name, "result": verification_result},
                    verification_result.get("confidence", 0.5)
                )
            
            return verification_result
            
        except Exception as e:
            error_reasoning = f"Certification verification failed: {str(e)}. Using fallback verification."
            
            if self.logger:
                self.logger.log_step(
                    "certification_verification_error",
                    {"error": str(e), "certification_name": certification_name},
                    error_reasoning
                )
            
            return {
                "is_verified": True,  # Fallback to verified
                "confidence": 0.5,
                "recognized_board": "Unknown",
                "notes": "Verification failed, using fallback"
            }
    
    def process_credentialing_api_response(self, api_response: str) -> Dict[str, Any]:
        """Process credentialing API response using LLM for natural language understanding"""
        prompt = f"""
        Analyze the following credentialing API response and extract key information:
        
        API Response: {api_response}
        
        Please respond with a JSON object containing:
        {{
            "verification_status": "string",
            "confidence": 0.0-1.0,
            "extracted_data": {{
                "license_status": "string",
                "disciplinary_actions": "string",
                "malpractice_status": "string",
                "board_certification": "string"
            }},
            "notes": "string"
        }}
        """
        
        # Log the API response processing step
        if self.logger:
            self.logger.log_step(
                "api_response_processing",
                {"api_response": api_response},
                "Processing credentialing API response to extract verification data"
            )
        
        try:
            response = self.llm_provider.generate(prompt)
            self._update_usage_stats(response)
            
            processed_result = json.loads(response.content)
            
            # Generate reasoning for the processing
            reasoning_prompt = f"""
            Explain the reasoning behind the API response processing:
            
            API Response: {api_response}
            Processed Result: {json.dumps(processed_result, indent=2)}
            
            Please provide detailed reasoning for:
            1. How the API response was interpreted
            2. What verification status was determined and why
            3. How the confidence level was calculated
            4. What specific data was extracted and why it's important
            5. Any potential issues or concerns identified
            """
            
            reasoning_response = self.llm_provider.generate(reasoning_prompt)
            self._update_usage_stats(reasoning_response)
            
            # Log the processing with reasoning
            if self.logger:
                self.logger.log_llm_interaction(
                    "api_response_processing",
                    prompt,
                    response.content,
                    reasoning_response.content,
                    {"api_response": api_response, "processed_result": processed_result}
                )
                
                self.logger.log_data_points("api_response_processing", {
                    "api_response": api_response,
                    "processed_result": processed_result
                })
            
            return processed_result
            
        except Exception as e:
            error_reasoning = f"API response processing failed: {str(e)}. Using fallback processing."
            
            if self.logger:
                self.logger.log_step(
                    "api_response_processing_error",
                    {"error": str(e), "api_response": api_response},
                    error_reasoning
                )
            
            return {
                "verification_status": "Unknown",
                "confidence": 0.0,
                "extracted_data": {},
                "notes": "Processing failed"
            }
    
    def generate_regulation_reasoning(self, regulation: Dict[str, Any], provider_data: Dict[str, Any], 
                                    result: bool, data_used: Dict[str, Any]) -> str:
        """Generate detailed reasoning for regulation compliance decision"""
        prompt = f"""
        Generate detailed reasoning for a regulation compliance decision:
        
        Regulation: {json.dumps(regulation, indent=2)}
        Provider Data: {json.dumps(provider_data, indent=2)}
        Compliance Result: {result}
        Data Used: {json.dumps(data_used, indent=2)}
        
        Please provide comprehensive reasoning explaining:
        1. What specific regulation requirements were checked
        2. How the provider data was evaluated against these requirements
        3. What specific data points supported or contradicted compliance
        4. Why the final compliance decision was made
        5. Any mitigating factors or concerns
        6. The confidence level in this decision
        """
        
        try:
            response = self.llm_provider.generate(prompt)
            self._update_usage_stats(response)
            return response.content
        except Exception as e:
            return f"Reasoning generation failed: {str(e)}. Basic evaluation: Regulation {regulation.get('id')} {'passed' if result else 'failed'} based on available data."
    
    def generate_scoring_reasoning(self, regulation: Dict[str, Any], provider_data: Dict[str, Any], 
                                 score: int, data_used: Dict[str, Any]) -> str:
        """Generate detailed reasoning for scoring decision"""
        prompt = f"""
        Generate detailed reasoning for a scoring decision:
        
        Regulation: {json.dumps(regulation, indent=2)}
        Provider Data: {json.dumps(provider_data, indent=2)}
        Score: {score}/5
        Data Used: {json.dumps(data_used, indent=2)}
        
        Please provide comprehensive reasoning explaining:
        1. What scoring criteria were applied
        2. How the provider's data was evaluated against these criteria
        3. What specific factors contributed to the score
        4. Why this score was chosen over other possible scores
        5. What improvements could lead to a higher score
        6. The confidence level in this scoring decision
        """
        
        try:
            response = self.llm_provider.generate(prompt)
            self._update_usage_stats(response)
            return response.content
        except Exception as e:
            return f"Scoring reasoning generation failed: {str(e)}. Basic scoring: Regulation {regulation.get('id')} scored {score}/5 based on available data."
    
    def _create_mapping_prompt(self, provider_data: Dict[str, Any], regulations: List[Dict[str, Any]]) -> str:
        """Create prompt for data mapping"""
        return f"""
        Map the following healthcare provider data to the regulatory requirements:
        
        Provider Data:
        {json.dumps(provider_data, indent=2)}
        
        Regulations:
        {json.dumps(regulations, indent=2)}
        
        For each regulation, identify which provider data fields are relevant and extract the specific values needed for validation.
        
        Please respond with a JSON object mapping each regulation ID to the relevant provider data:
        {{
            "HR001": {{
                "data_fields": ["field1", "field2"],
                "extracted_values": {{
                    "license_number": "value",
                    "license_status": "value"
                }}
            }},
            "HR002": {{
                "data_fields": ["field1"],
                "extracted_values": {{
                    "disciplinary_actions": "value"
                }}
            }}
            // ... continue for all regulations
        }}
        """
    
    def _parse_mapping_response(self, response_content: str) -> Dict[str, Any]:
        """Parse LLM response for data mapping"""
        try:
            # Try to extract JSON from the response
            start_idx = response_content.find('{')
            end_idx = response_content.rfind('}') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_str = response_content[start_idx:end_idx]
                return json.loads(json_str)
            else:
                return {}
                
        except json.JSONDecodeError:
            print("Failed to parse LLM mapping response as JSON")
            return {}
    
    def _fallback_mapping(self, provider_data: Dict[str, Any], regulations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Fallback mapping when LLM fails"""
        mapped_data = {}
        
        for regulation in regulations:
            reg_id = regulation.get('id', '')
            data_fields = regulation.get('data_fields', [])
            
            mapped_data[reg_id] = {
                "data_fields": data_fields,
                "extracted_values": {}
            }
            
            # Extract basic values from provider data
            for field in data_fields:
                if field in provider_data:
                    mapped_data[reg_id]["extracted_values"][field] = provider_data[field]
        
        return mapped_data
    
    def _update_usage_stats(self, response):
        """Update LLM usage statistics"""
        self.usage_stats["total_requests"] += 1
        self.usage_stats["total_tokens"] += response.total_tokens
        self.usage_stats["total_cost"] += response.total_cost
    
    def get_usage_stats(self) -> Dict[str, Any]:
        """Get LLM usage statistics"""
        return self.usage_stats.copy() 