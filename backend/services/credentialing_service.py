"""
Main credentialing service that orchestrates the credentialing process.
"""

import json
import time
from typing import Dict, Any, List, Optional
from models.provider import Provider
from models.credentialing_result import (
    CredentialingResult,
    ComplianceStatus,
    HardRegulationResult,
    SoftRegulationResult,
)
from utils.llm_async.unified_llm import LLMProvider
from services.provider_service import ProviderService
from utils.logger import CredentialingLogger, audit_logger
from config.settings import settings


class CredentialingService:
    """Main service for credentialing healthcare providers"""

    def __init__(self):
        """Initialize credentialing service"""
        self.llm_provider = LLMProvider()
        self.provider_service = ProviderService()
        self.regulations = self._load_regulations()
        self.credentialing_results = {}

    def _load_regulations(self) -> Dict[str, Any]:
        """Load regulations from JSON file"""
        try:
            with open("data/regulations.json", "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading regulations: {e}")
            return {"regulations": {"hard_regulations": [], "soft_regulations": []}}

    async def credential_provider(self, provider_id: str) -> CredentialingResult:
        """Main method to credential a provider"""
        start_time = time.time()

        # Initialize logger for this credentialing session
        logger = CredentialingLogger(provider_id)

        # Log audit event
        audit_logger.log_audit_event(
            "credentialing_started",
            {"provider_id": provider_id, "timestamp": time.time()},
        )

        try:
            # Step 0: Get provider data
            logger.log_step(
                "provider_data_retrieval",
                {"provider_id": provider_id},
                f"Retrieving provider data for {provider_id}",
            )

            provider = self.provider_service.get_provider(provider_id)
            if not provider:
                raise ValueError(f"Provider {provider_id} not found")

            provider_data = provider.get_all_data()

            logger.log_data_points(
                "provider_data_retrieval",
                {
                    "provider_name": provider.PersonalInfo.name,
                    "provider_specialty": provider.Specialties.primary_specialty,
                    "provider_experience": provider.WorkHistory.years_experience,
                    "data_fields_available": list(provider_data.keys()),
                },
            )

            # Step 1: Map data to regulations using LLM
            logger.log_step(
                "data_mapping_initiation",
                {
                    "regulations_count": len(
                        self.regulations["regulations"]["hard_regulations"]
                    )
                    + len(self.regulations["regulations"]["soft_regulations"])
                },
                "Starting LLM-powered data mapping to match provider data with regulatory requirements",
            )

            # Map data to regulations using LLM
            mapped_data = self._map_data_to_regulations(
                provider_data,
                self.regulations["regulations"]["hard_regulations"]
                + self.regulations["regulations"]["soft_regulations"],
            )

            logger.log_data_points(
                "data_mapping_complete",
                {
                    "mapped_regulations": list(mapped_data.keys()),
                    "mapping_quality": len(mapped_data)
                    / (
                        len(self.regulations["regulations"]["hard_regulations"])
                        + len(self.regulations["regulations"]["soft_regulations"])
                    ),
                },
            )

            # Step 2: Send data to credentialing API for verification
            logger.log_step(
                "api_verification_initiation",
                {"mapped_data_keys": list(mapped_data.keys())},
                "Initiating external credentialing API verification for mapped data",
            )

            verification_details = self._verify_with_credentialing_api(mapped_data)

            logger.log_data_points(
                "api_verification_complete",
                {
                    "verification_status": verification_details.get(
                        "processed_response", {}
                    ).get("verification_status"),
                    "confidence": verification_details.get(
                        "processed_response", {}
                    ).get("confidence", 0),
                },
            )

            # Step 3: Check hard regulations
            logger.log_step(
                "hard_regulation_check_initiation",
                {
                    "hard_regulations_count": len(
                        self.regulations["regulations"]["hard_regulations"]
                    )
                },
                "Starting hard regulation compliance checks",
            )

            hard_regulation_results = await self._check_hard_regulations(
                provider_data, verification_details, logger
            )

            # Log hard regulation summary
            passed_hard_regs = sum(
                1 for result in hard_regulation_results if result.passed
            )
            total_hard_regs = len(hard_regulation_results)

            logger.log_decision(
                "hard_regulations_summary",
                f"{passed_hard_regs}/{total_hard_regs} hard regulations passed",
                f"Provider passed {passed_hard_regs} out of {total_hard_regs} hard regulations. All hard regulations must pass for compliance.",
                {"passed_count": passed_hard_regs, "total_count": total_hard_regs},
                passed_hard_regs / total_hard_regs if total_hard_regs > 0 else 0,
            )

            # Step 4: Score soft regulations
            logger.log_step(
                "soft_regulation_scoring_initiation",
                {
                    "soft_regulations_count": len(
                        self.regulations["regulations"]["soft_regulations"]
                    )
                },
                "Starting soft regulation scoring",
            )

            soft_regulation_results = await self._score_soft_regulations(
                provider_data, logger
            )

            # Log soft regulation summary
            avg_soft_score = (
                sum(result.score for result in soft_regulation_results)
                / len(soft_regulation_results)
                if soft_regulation_results
                else 0
            )

            logger.log_decision(
                "soft_regulations_summary",
                f"Average soft regulation score: {avg_soft_score:.2f}/5",
                f"Provider achieved an average score of {avg_soft_score:.2f} across {len(soft_regulation_results)} soft regulations.",
                {
                    "average_score": avg_soft_score,
                    "total_regulations": len(soft_regulation_results),
                },
                avg_soft_score / 5,
            )

            # Step 5: Calculate overall score and compliance status
            overall_score = self._calculate_overall_score(soft_regulation_results)
            compliance_status = self._determine_compliance_status(
                hard_regulation_results
            )

            logger.log_decision(
                "final_compliance_decision",
                f"Compliance Status: {compliance_status.value}, Score: {overall_score}/5",
                f"Provider is {compliance_status.value.lower()} with a score of {overall_score}/5. Compliance based on {passed_hard_regs}/{total_hard_regs} hard regulations passed.",
                {
                    "compliance_status": compliance_status.value,
                    "overall_score": overall_score,
                    "hard_regulations_passed": passed_hard_regs,
                    "hard_regulations_total": total_hard_regs,
                },
                1.0 if compliance_status == ComplianceStatus.COMPLIANT else 0.0,
            )

            # Step 6: Create result
            processing_time = time.time() - start_time

            result = CredentialingResult(
                provider_id=provider_id,
                score=overall_score,
                compliance_status=compliance_status,
                hard_regulations={
                    result.regulation_id: result.passed
                    for result in hard_regulation_results
                },
                soft_regulations={
                    result.regulation_id: result.score
                    for result in soft_regulation_results
                },
                mapped_data=mapped_data,
                verification_details=verification_details,
                hard_regulation_results=hard_regulation_results,
                soft_regulation_results=soft_regulation_results,
                llm_usage={"total_requests": 0, "total_tokens": 0, "total_cost": 0.0},
                processing_time=processing_time,
            )

            # Log final result
            logger.log_final_result(result.to_dict())

            # Store result
            self.credentialing_results[provider_id] = result

            # Log audit event
            audit_logger.log_audit_event(
                "credentialing_completed",
                {
                    "provider_id": provider_id,
                    "compliance_status": compliance_status.value,
                    "score": overall_score,
                    "processing_time": processing_time,
                    "session_id": logger.session_id,
                },
            )

            # Generate chatbot training data
            # self._generate_chatbot_training_data(provider_id, result, logger)

            # Save session log before generating report
            logger.save_session_log()

            # Generate detailed report using LLM analysis
            try:
                from services.report_service import ReportService

                report_service = ReportService()
                report = report_service.generate_credentialing_report(
                    provider_id, logger.session_id
                )

                audit_logger.log_audit_event(
                    "comprehensive_report_generated",
                    {
                        "provider_id": provider_id,
                        "session_id": logger.session_id,
                        "report_id": report.get("report_metadata", {}).get("report_id"),
                        "report_file": report.get("report_file"),
                        "json_summary": report.get("json_summary"),
                        "timestamp": time.time(),
                    },
                )
            except Exception as e:
                # Log error but don't fail the credentialing process
                audit_logger.log_audit_event(
                    "comprehensive_report_generation_failed",
                    {
                        "provider_id": provider_id,
                        "session_id": logger.session_id,
                        "error": str(e),
                        "timestamp": time.time(),
                    },
                )

            return result

        except Exception as e:
            processing_time = time.time() - start_time
            error_reasoning = f"Credentialing process failed: {str(e)}"

            logger.log_step(
                "credentialing_error",
                {"error": str(e), "processing_time": processing_time},
                error_reasoning,
            )

            # Log audit event
            audit_logger.log_audit_event(
                "credentialing_failed",
                {
                    "provider_id": provider_id,
                    "error": str(e),
                    "processing_time": processing_time,
                    "session_id": logger.session_id,
                },
            )

            # Return error result
            error_result = CredentialingResult(
                provider_id=provider_id,
                score=1,
                compliance_status=ComplianceStatus.FAILED,
                hard_regulations={},
                soft_regulations={},
                mapped_data={},
                verification_details={},
                hard_regulation_results=[],
                soft_regulation_results=[],
                llm_usage={"total_requests": 0, "total_tokens": 0, "total_cost": 0.0},
                processing_time=processing_time,
                errors=[str(e)],
            )

            logger.log_final_result(error_result.to_dict())
            return error_result

    def _verify_with_credentialing_api(
        self, mapped_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Send data to credentialing API for verification"""
        # This is a dummy implementation - in real scenario, this would call external APIs

        # Simulate API call
        api_response = {
            "license_verification": "Verified",
            "disciplinary_check": "Clean",
            "malpractice_verification": "Active",
            "board_certification": "Verified",
            "background_check": "Passed",
            "education_verification": "Verified",
            "hospital_privileges": "Confirmed",
            "insurance_verification": "Active",
        }

        # Use LLM to process the API response
        processed_response = self._process_credentialing_api_response(
            json.dumps(api_response)
        )

        return {
            "api_response": api_response,
            "processed_response": processed_response,
            "verification_timestamp": time.time(),
        }

    async def _check_hard_regulations(
        self,
        provider_data: Dict[str, Any],
        verification_details: Dict[str, Any],
        logger: CredentialingLogger,
    ) -> List[HardRegulationResult]:
        """Check provider against hard regulations using parallel processing"""
        results = []
        hard_regulations = self.regulations["regulations"]["hard_regulations"]
        
        # Prepare prompts for all hard regulations
        regulation_prompts = []
        regulation_data = []
        
        for regulation in hard_regulations:
            reg_id = regulation["id"]
            reg_name = regulation["name"]
            
            # Extract relevant data for this regulation
            relevant_data = self._extract_regulation_data(
                regulation, provider_data, verification_details
            )
            
            # Create prompt for this regulation
            prompt = self._create_hard_regulation_prompt(regulation, provider_data, relevant_data)
            regulation_prompts.append(prompt)
            regulation_data.append({
                "regulation": regulation,
                "relevant_data": relevant_data,
                "reg_id": reg_id,
                "reg_name": reg_name
            })
        
        # Process all hard regulations in parallel
        try:
            llm_responses = await self.llm_provider.generate_batch_async(regulation_prompts)
            
            # Process responses
            for i, response in enumerate(llm_responses):
                regulation_info = regulation_data[i]
                regulation = regulation_info["regulation"]
                relevant_data = regulation_info["relevant_data"]
                reg_id = regulation_info["reg_id"]
                reg_name = regulation_info["reg_name"]
                
                # Parse the response to determine if regulation passed
                passed = self._parse_hard_regulation_response(response.content, regulation)
                
                # Generate detailed reasoning using LLM
                reasoning = self._generate_regulation_reasoning(
                    regulation, provider_data, passed, relevant_data
                )
                
                # Log the regulation check
                logger.log_regulation_check(
                    reg_id, reg_name, passed, relevant_data, reasoning
                )
                
                result = HardRegulationResult(
                    regulation_id=reg_id,
                    regulation_name=reg_name,
                    passed=passed,
                    details=relevant_data,
                    failure_reason=(
                        None if passed else f"Failed to meet {reg_name} requirements"
                    ),
                )
                
                results.append(result)
                
        except Exception as e:
            # Fallback to sequential processing if batch processing fails
            logger.log_step(
                "hard_regulations_batch_failed",
                {"error": str(e)},
                f"Batch processing failed, falling back to sequential processing: {str(e)}"
            )
            
            # Process regulations sequentially as fallback
            for regulation in hard_regulations:
                reg_id = regulation["id"]
                reg_name = regulation["name"]
                
                # Extract relevant data for this regulation
                relevant_data = self._extract_regulation_data(
                    regulation, provider_data, verification_details
                )
                
                # Check if regulation is satisfied
                passed = self._validate_hard_regulation(regulation, relevant_data)
                
                # Generate detailed reasoning using LLM
                reasoning = self._generate_regulation_reasoning(
                    regulation, provider_data, passed, relevant_data
                )
                
                # Log the regulation check
                logger.log_regulation_check(
                    reg_id, reg_name, passed, relevant_data, reasoning
                )
                
                result = HardRegulationResult(
                    regulation_id=reg_id,
                    regulation_name=reg_name,
                    passed=passed,
                    details=relevant_data,
                    failure_reason=(
                        None if passed else f"Failed to meet {reg_name} requirements"
                    ),
                )
                
                results.append(result)

        return results

    async def _score_soft_regulations(
        self, provider_data: Dict[str, Any], logger: CredentialingLogger
    ) -> List[SoftRegulationResult]:
        """Score provider against soft regulations using parallel processing"""
        results = []
        soft_regulations = self.regulations["regulations"]["soft_regulations"]
        
        # Prepare prompts for all soft regulations
        regulation_prompts = []
        regulation_data = []
        
        for regulation in soft_regulations:
            reg_id = regulation["id"]
            reg_name = regulation["name"]
            weight = regulation["weight"]
            
            # Extract relevant data for this regulation
            relevant_data = self._extract_regulation_data(regulation, provider_data, {})
            
            # Create prompt for this regulation
            prompt = self._create_soft_regulation_prompt(regulation, provider_data, relevant_data)
            regulation_prompts.append(prompt)
            regulation_data.append({
                "regulation": regulation,
                "relevant_data": relevant_data,
                "reg_id": reg_id,
                "reg_name": reg_name,
                "weight": weight
            })
        
        # Process all soft regulations in parallel
        try:
            llm_responses = await self.llm_provider.generate_batch_async(regulation_prompts)
            
            # Process responses
            for i, response in enumerate(llm_responses):
                regulation_info = regulation_data[i]
                regulation = regulation_info["regulation"]
                relevant_data = regulation_info["relevant_data"]
                reg_id = regulation_info["reg_id"]
                reg_name = regulation_info["reg_name"]
                weight = regulation_info["weight"]
                
                # Parse the response to determine score
                score = self._parse_soft_regulation_response(response.content, regulation)
                weighted_score = score * weight
                
                # Generate detailed reasoning using LLM
                reasoning = self._generate_scoring_reasoning(
                    regulation, provider_data, score, relevant_data
                )
                
                # Log the scoring
                logger.log_scoring(reg_id, reg_name, score, 5, reasoning, relevant_data)
                
                result = SoftRegulationResult(
                    regulation_id=reg_id,
                    regulation_name=reg_name,
                    score=score,
                    weight=weight,
                    weighted_score=weighted_score,
                    details=relevant_data,
                )
                
                results.append(result)
                
        except Exception as e:
            # Fallback to sequential processing if batch processing fails
            logger.log_step(
                "soft_regulations_batch_failed",
                {"error": str(e)},
                f"Batch processing failed, falling back to sequential processing: {str(e)}"
            )
            
            # Process regulations sequentially as fallback
            for regulation in soft_regulations:
                reg_id = regulation["id"]
                reg_name = regulation["name"]
                weight = regulation["weight"]
                
                # Extract relevant data for this regulation
                relevant_data = self._extract_regulation_data(regulation, provider_data, {})
                
                # Score the regulation
                score = self._score_soft_regulation(regulation, relevant_data)
                weighted_score = score * weight
                
                # Generate detailed reasoning using LLM
                reasoning = self._generate_scoring_reasoning(
                    regulation, provider_data, score, relevant_data
                )
                
                # Log the scoring
                logger.log_scoring(reg_id, reg_name, score, 5, reasoning, relevant_data)
                
                result = SoftRegulationResult(
                    regulation_id=reg_id,
                    regulation_name=reg_name,
                    score=score,
                    weight=weight,
                    weighted_score=weighted_score,
                    details=relevant_data,
                )
                
                results.append(result)

        return results

    def _extract_regulation_data(
        self,
        regulation: Dict[str, Any],
        provider_data: Dict[str, Any],
        verification_details: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Extract relevant data for a regulation"""
        data_fields = regulation.get("data_fields", [])
        relevant_data = {}

        for field in data_fields:
            if field in provider_data:
                relevant_data[field] = provider_data[field]

        # Add verification details if available
        if verification_details:
            relevant_data["verification"] = verification_details

        return relevant_data

    def _validate_hard_regulation(
        self, regulation: Dict[str, Any], data: Dict[str, Any]
    ) -> bool:
        """Validate a hard regulation"""
        validation_criteria = regulation.get("validation_criteria", {})

        # Check license status
        if "license_status" in validation_criteria:
            if "ProfessionalIds" in data:
                # This would be more sophisticated in real implementation
                return True

        # Check disciplinary actions
        if "disciplinary_actions" in validation_criteria:
            if "Disclosure" in data:
                disciplinary_actions = data["Disclosure"].get(
                    "disciplinary_actions", []
                )
                if len(disciplinary_actions) > 0:
                    return False

        # Check malpractice insurance
        if "malpractice_insurance" in validation_criteria:
            if "PLIs" in data:
                insurance_status = data["PLIs"].get("malpractice_insurance", "")
                if insurance_status != "Active":
                    return False

        # Check board certification
        if "board_certification" in validation_criteria:
            if "BoardCertifications" in data:
                certifications = data["BoardCertifications"].get(
                    "board_certifications", []
                )
                if len(certifications) == 0:
                    return False

        # Check criminal background
        if "criminal_record" in validation_criteria:
            if "Disclosure" in data:
                criminal_record = data["Disclosure"].get("criminal_record", "")
                if criminal_record != "Clean":
                    return False

        return True

    def _score_soft_regulation(
        self, regulation: Dict[str, Any], data: Dict[str, Any]
    ) -> int:
        """Score a soft regulation"""
        scoring_criteria = regulation.get("scoring_criteria", {})

        # Score based on years of experience
        if regulation["id"] == "SR001":  # Years of Experience
            if "WorkHistory" in data:
                years = data["WorkHistory"].get("years_experience", 0)
                if years >= 16:
                    return 5
                elif years >= 11:
                    return 4
                elif years >= 6:
                    return 3
                elif years >= 3:
                    return 2
                else:
                    return 1

        # Score based on continuing education
        elif regulation["id"] == "SR002":  # Continuing Education
            if "ContinuingEducation" in data:
                credits = data["ContinuingEducation"].get("cme_credits", 0)
                if credits >= 100:
                    return 5
                elif credits >= 76:
                    return 4
                elif credits >= 51:
                    return 3
                elif credits >= 26:
                    return 2
                else:
                    return 1

        # Score based on quality metrics
        elif regulation["id"] == "SR003":  # Quality Metrics
            if "QualityMetrics" in data:
                quality_score = data["QualityMetrics"].get("quality_score", 0)
                if quality_score >= 4.1:
                    return 5
                elif quality_score >= 3.1:
                    return 4
                elif quality_score >= 2.1:
                    return 3
                elif quality_score >= 1.1:
                    return 2
                else:
                    return 1

        return 3  # Default score

    def _calculate_overall_score(
        self, soft_regulation_results: List[SoftRegulationResult]
    ) -> int:
        """Calculate overall score from soft regulation results"""
        if not soft_regulation_results:
            return 1

        total_weighted_score = sum(
            result.weighted_score for result in soft_regulation_results
        )
        total_weight = sum(result.weight for result in soft_regulation_results)

        if total_weight == 0:
            return 1

        overall_score = total_weighted_score / total_weight
        return max(1, min(5, round(overall_score)))

    def _determine_compliance_status(
        self, hard_regulation_results: List[HardRegulationResult]
    ) -> ComplianceStatus:
        """Determine compliance status based on hard regulation results"""
        if not hard_regulation_results:
            return ComplianceStatus.FAILED

        all_passed = all(result.passed for result in hard_regulation_results)

        if all_passed:
            return ComplianceStatus.COMPLIANT
        else:
            return ComplianceStatus.NON_COMPLIANT

    def _generate_chatbot_training_data(
        self, provider_id: str, result: CredentialingResult, logger: CredentialingLogger
    ):
        """Generate training data for chatbot from credentialing results"""

        # Generate Q&A pairs for common questions
        qa_pairs = [
            {
                "question": f"What is the compliance status for provider {provider_id}?",
                "answer": f"Provider {provider_id} has a compliance status of {result.compliance_status.value} with a score of {result.score}/5.",
                "context": {
                    "provider_id": provider_id,
                    "compliance_status": result.compliance_status.value,
                    "score": result.score,
                },
            },
            {
                "question": f"Why did provider {provider_id} receive a score of {result.score}/5?",
                "answer": f"The provider received a score of {result.score}/5 based on their performance across soft regulations including years of experience, continuing education compliance, and quality metrics.",
                "context": {
                    "provider_id": provider_id,
                    "score": result.score,
                    "soft_regulations": result.soft_regulations,
                },
            },
            {
                "question": f"Which hard regulations did provider {provider_id} pass?",
                "answer": f"Provider {provider_id} passed {sum(result.hard_regulations.values())} out of {len(result.hard_regulations)} hard regulations.",
                "context": {
                    "provider_id": provider_id,
                    "hard_regulations": result.hard_regulations,
                },
            },
        ]

        # Log each Q&A pair for chatbot training
        for qa in qa_pairs:
            audit_logger.log_chatbot_training_data(
                qa["question"], qa["answer"], qa["context"]
            )

    def get_credentialing_result(
        self, provider_id: str
    ) -> Optional[CredentialingResult]:
        """Get stored credentialing result for a provider"""
        return self.credentialing_results.get(provider_id)

    def get_all_results(self) -> Dict[str, CredentialingResult]:
        """Get all credentialing results"""
        return self.credentialing_results.copy()

    def get_compliant_providers(self) -> List[str]:
        """Get list of compliant provider IDs"""
        compliant_providers = []
        for provider_id, result in self.credentialing_results.items():
            if result.compliance_status == ComplianceStatus.COMPLIANT:
                compliant_providers.append(provider_id)
        return compliant_providers

    def get_provider_score(self, provider_id: str) -> Optional[int]:
        """Get score for a specific provider"""
        result = self.get_credentialing_result(provider_id)
        return result.score if result else None

    def get_llm_usage_stats(self) -> Dict[str, Any]:
        """Get LLM usage statistics"""
        return {"total_requests": 0, "total_tokens": 0, "total_cost": 0.0}

    def get_credentialing_history(
        self, provider_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get credentialing history for a provider or all providers"""
        return audit_logger.get_credentialing_history(provider_id)

    def get_decision_reasoning(
        self, provider_id: str, decision_type: str
    ) -> List[Dict[str, Any]]:
        """Get decision reasoning for a provider"""
        return audit_logger.get_decision_reasoning(provider_id, decision_type)

    def _create_hard_regulation_prompt(
        self, regulation: Dict[str, Any], provider_data: Dict[str, Any], relevant_data: Dict[str, Any]
    ) -> str:
        """Create a prompt for hard regulation validation"""
        reg_id = regulation["id"]
        reg_name = regulation["name"]
        requirements = regulation.get("requirements", [])
        
        prompt = f"""
You are a healthcare credentialing specialist. Analyze the following regulation and provider data to determine if the provider meets the requirements.

REGULATION: {reg_id} - {reg_name}
Requirements: {json.dumps(requirements, indent=2)}

PROVIDER DATA:
{json.dumps(provider_data, indent=2)}

RELEVANT DATA FOR THIS REGULATION:
{json.dumps(relevant_data, indent=2)}

Based on the regulation requirements and the provider data, determine if the provider PASSES or FAILS this regulation.

Respond with ONLY:
- "PASS" if the provider meets all requirements
- "FAIL" if the provider does not meet one or more requirements

Provide a brief explanation of your reasoning after the PASS/FAIL response.
"""
        return prompt

    def _create_soft_regulation_prompt(
        self, regulation: Dict[str, Any], provider_data: Dict[str, Any], relevant_data: Dict[str, Any]
    ) -> str:
        """Create a prompt for soft regulation scoring"""
        reg_id = regulation["id"]
        reg_name = regulation["name"]
        scoring_criteria = regulation.get("scoring_criteria", {})
        
        prompt = f"""
You are a healthcare credentialing specialist. Analyze the following regulation and provider data to score the provider on a scale of 1-5.

REGULATION: {reg_id} - {reg_name}
Scoring Criteria: {json.dumps(scoring_criteria, indent=2)}

PROVIDER DATA:
{json.dumps(provider_data, indent=2)}

RELEVANT DATA FOR THIS REGULATION:
{json.dumps(relevant_data, indent=2)}

Based on the scoring criteria and the provider data, assign a score from 1 to 5:
- 1: Poor performance/does not meet basic requirements
- 2: Below average performance
- 3: Average performance/meets basic requirements
- 4: Above average performance
- 5: Excellent performance/exceeds requirements

Respond with ONLY the number (1, 2, 3, 4, or 5) followed by a brief explanation of your reasoning.
"""
        return prompt

    def _parse_hard_regulation_response(self, response_content: str, regulation: Dict[str, Any]) -> bool:
        """Parse LLM response to determine if hard regulation passed"""
        response_lower = response_content.lower().strip()
        
        # Look for explicit PASS/FAIL indicators
        if "pass" in response_lower and "fail" not in response_lower:
            return True
        elif "fail" in response_lower:
            return False
        
        # Fallback to original validation logic
        return self._validate_hard_regulation(regulation, {})

    def _parse_soft_regulation_response(self, response_content: str, regulation: Dict[str, Any]) -> int:
        """Parse LLM response to determine soft regulation score"""
        response_lower = response_content.lower().strip()
        
        # Look for numeric score
        import re
        score_match = re.search(r'\b([1-5])\b', response_content)
        if score_match:
            return int(score_match.group(1))
        
        # Fallback to original scoring logic
        return self._score_soft_regulation(regulation, {})

    def _map_data_to_regulations(self, provider_data: Dict[str, Any], regulations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Map provider data fields to regulatory requirements using LLM"""
        prompt = self._create_mapping_prompt(provider_data, regulations)
        
        try:
            response = self.llm_provider.generate(prompt)
            
            # Parse the LLM response to extract mapped data
            mapped_data = self._parse_mapping_response(response.content)
            
            return mapped_data
            
        except Exception as e:
            # Fallback to basic mapping if LLM fails
            return self._fallback_mapping(provider_data, regulations)

    def _create_mapping_prompt(self, provider_data: Dict[str, Any], regulations: List[Dict[str, Any]]) -> str:
        """Create a prompt for data mapping"""
        prompt = f"""
You are a healthcare credentialing specialist. Map the provider data fields to the regulatory requirements.

PROVIDER DATA:
{json.dumps(provider_data, indent=2)}

REGULATIONS:
{json.dumps(regulations, indent=2)}

For each regulation, identify which provider data fields are relevant and how they map to the regulation requirements.

Respond with a JSON object where:
- Keys are regulation IDs
- Values are objects with:
  - "data_fields": list of relevant provider data field names
  - "mapping_confidence": confidence score (0-1)
  - "reasoning": brief explanation of the mapping

Example format:
{{
  "HR001": {{
    "data_fields": ["ProfessionalIds.license_number", "ProfessionalIds.license_status"],
    "mapping_confidence": 0.95,
    "reasoning": "License number and status directly map to medical license requirement"
  }}
}}
"""
        return prompt

    def _parse_mapping_response(self, response_content: str) -> Dict[str, Any]:
        """Parse LLM response to extract mapped data"""
        try:
            # Try to extract JSON from the response
            import re
            json_match = re.search(r'\{.*\}', response_content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except:
            pass
        
        # Fallback to empty mapping
        return {}

    def _fallback_mapping(self, provider_data: Dict[str, Any], regulations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Fallback mapping when LLM fails"""
        mapped_data = {}
        
        for regulation in regulations:
            reg_id = regulation["id"]
            data_fields = regulation.get("data_fields", [])
            
            mapped_data[reg_id] = {
                "data_fields": data_fields,
                "mapping_confidence": 0.5,
                "reasoning": "Fallback mapping based on regulation data_fields"
            }
        
        return mapped_data

    def _generate_regulation_reasoning(self, regulation: Dict[str, Any], provider_data: Dict[str, Any], 
                                    result: bool, data_used: Dict[str, Any]) -> str:
        """Generate detailed reasoning for regulation compliance"""
        reg_id = regulation["id"]
        reg_name = regulation["name"]
        
        prompt = f"""
You are a healthcare credentialing specialist. Provide detailed reasoning for the compliance decision.

REGULATION: {reg_id} - {reg_name}
COMPLIANCE RESULT: {'PASS' if result else 'FAIL'}
PROVIDER DATA: {json.dumps(provider_data, indent=2)}
DATA USED: {json.dumps(data_used, indent=2)}

Provide a comprehensive explanation of:
1. How the regulation requirements were evaluated
2. Which specific data points were considered
3. Why the provider passed or failed
4. Any relevant context or considerations

Write in a professional, detailed manner suitable for credentialing documentation.
"""
        
        try:
            response = self.llm_provider.generate(prompt)
            return response.content
        except Exception as e:
            return f"Reasoning generation failed: {str(e)}"

    def _generate_scoring_reasoning(self, regulation: Dict[str, Any], provider_data: Dict[str, Any], 
                                 score: int, data_used: Dict[str, Any]) -> str:
        """Generate detailed reasoning for regulation scoring"""
        reg_id = regulation["id"]
        reg_name = regulation["name"]
        
        prompt = f"""
You are a healthcare credentialing specialist. Provide detailed reasoning for the scoring decision.

REGULATION: {reg_id} - {reg_name}
SCORE: {score}/5
PROVIDER DATA: {json.dumps(provider_data, indent=2)}
DATA USED: {json.dumps(data_used, indent=2)}

Provide a comprehensive explanation of:
1. How the regulation was scored
2. Which specific criteria were evaluated
3. Why this score was assigned
4. What factors contributed to the score
5. Any areas for improvement

Write in a professional, detailed manner suitable for credentialing documentation.
"""
        
        try:
            response = self.llm_provider.generate(prompt)
            return response.content
        except Exception as e:
            return f"Scoring reasoning generation failed: {str(e)}"

    def _process_credentialing_api_response(self, api_response: str) -> Dict[str, Any]:
        """Process response from credentialing API"""
        prompt = f"""
You are a healthcare credentialing specialist. Analyze the following API response and extract relevant verification information.

API RESPONSE:
{api_response}

Extract and structure the following information:
1. Verification status for each field
2. Confidence scores
3. Any discrepancies or issues
4. Additional verification details

Respond with a JSON object containing the structured verification data.
"""
        
        try:
            response = self.llm_provider.generate(prompt)
            
            # Try to parse JSON from response
            import re
            json_match = re.search(r'\{.*\}', response.content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except:
            pass
        
        # Fallback to basic processing
        return {
            "verification_status": "processed",
            "confidence": 0.5,
            "raw_response": api_response
        }
