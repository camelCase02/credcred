"""
Data mapper utility for credentialing service.
"""

from typing import Dict, Any, List, Optional
import re


class DataMapper:
    """Utility class for data mapping and transformation"""
    
    @staticmethod
    def extract_license_info(professional_ids: Dict[str, Any]) -> Dict[str, Any]:
        """Extract and standardize license information"""
        return {
            "license_number": professional_ids.get("license_number", ""),
            "state_license": professional_ids.get("state_license", ""),
            "dea_number": professional_ids.get("dea_number", ""),
            "npi": professional_ids.get("npi", ""),
            "is_valid": True  # This would be validated by external API
        }
    
    @staticmethod
    def extract_education_info(educations: Dict[str, Any]) -> Dict[str, Any]:
        """Extract and standardize education information"""
        return {
            "medical_school": educations.get("medical_school", ""),
            "graduation_year": educations.get("graduation_year", 0),
            "residency": educations.get("residency", ""),
            "fellowship": educations.get("fellowship", ""),
            "years_since_graduation": DataMapper._calculate_years_since_graduation(
                educations.get("graduation_year", 0)
            )
        }
    
    @staticmethod
    def extract_specialty_info(specialties: Dict[str, Any]) -> Dict[str, Any]:
        """Extract and standardize specialty information"""
        return {
            "primary_specialty": specialties.get("primary_specialty", ""),
            "subspecialties": specialties.get("subspecialties", []),
            "certifications": specialties.get("certifications", []),
            "specialty_count": len(specialties.get("subspecialties", []))
        }
    
    @staticmethod
    def extract_insurance_info(plis: Dict[str, Any]) -> Dict[str, Any]:
        """Extract and standardize insurance information"""
        return {
            "malpractice_insurance": plis.get("malpractice_insurance", ""),
            "coverage_amount": plis.get("coverage_amount", 0),
            "insurance_provider": plis.get("insurance_provider", ""),
            "policy_number": plis.get("policy_number", ""),
            "expiration_date": plis.get("expiration_date", ""),
            "is_active": plis.get("malpractice_insurance", "") == "Active"
        }
    
    @staticmethod
    def extract_board_certification_info(board_certs: Dict[str, Any]) -> Dict[str, Any]:
        """Extract and standardize board certification information"""
        return {
            "board_certifications": board_certs.get("board_certifications", []),
            "certification_count": len(board_certs.get("board_certifications", [])),
            "recertification_status": board_certs.get("recertification_status", ""),
            "is_current": board_certs.get("recertification_status", "") == "Current"
        }
    
    @staticmethod
    def extract_disclosure_info(disclosure: Dict[str, Any]) -> Dict[str, Any]:
        """Extract and standardize disclosure information"""
        return {
            "disciplinary_actions": disclosure.get("disciplinary_actions", []),
            "criminal_record": disclosure.get("criminal_record", ""),
            "license_suspensions": disclosure.get("license_suspensions", 0),
            "voluntary_surrender": disclosure.get("voluntary_surrender", False),
            "has_disciplinary_actions": len(disclosure.get("disciplinary_actions", [])) > 0,
            "is_clean": disclosure.get("criminal_record", "") == "Clean"
        }
    
    @staticmethod
    def extract_quality_metrics(quality_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Extract and standardize quality metrics"""
        return {
            "patient_satisfaction": quality_metrics.get("patient_satisfaction", 0.0),
            "outcome_metrics": quality_metrics.get("outcome_metrics", 0.0),
            "readmission_rate": quality_metrics.get("readmission_rate", 0.0),
            "mortality_rate": quality_metrics.get("mortality_rate", 0.0),
            "quality_score": quality_metrics.get("quality_score", 0.0),
            "is_high_quality": quality_metrics.get("quality_score", 0.0) >= 4.0
        }
    
    @staticmethod
    def extract_continuing_education(continuing_ed: Dict[str, Any]) -> Dict[str, Any]:
        """Extract and standardize continuing education information"""
        return {
            "cme_credits": continuing_ed.get("cme_credits", 0),
            "required_credits": continuing_ed.get("required_credits", 0),
            "compliance_status": continuing_ed.get("compliance_status", ""),
            "is_compliant": continuing_ed.get("compliance_status", "") == "Compliant",
            "credits_ratio": continuing_ed.get("cme_credits", 0) / max(continuing_ed.get("required_credits", 1), 1)
        }
    
    @staticmethod
    def extract_work_history(work_history: Dict[str, Any]) -> Dict[str, Any]:
        """Extract and standardize work history information"""
        return {
            "years_experience": work_history.get("years_experience", 0),
            "employment_history": work_history.get("employment_history", []),
            "current_position": DataMapper._get_current_position(work_history.get("employment_history", [])),
            "experience_level": DataMapper._categorize_experience(work_history.get("years_experience", 0))
        }
    
    @staticmethod
    def standardize_provider_data(provider_data: Dict[str, Any]) -> Dict[str, Any]:
        """Standardize all provider data fields"""
        standardized = {}
        
        if "ProfessionalIds" in provider_data:
            standardized["license_info"] = DataMapper.extract_license_info(provider_data["ProfessionalIds"])
        
        if "Educations" in provider_data:
            standardized["education_info"] = DataMapper.extract_education_info(provider_data["Educations"])
        
        if "Specialties" in provider_data:
            standardized["specialty_info"] = DataMapper.extract_specialty_info(provider_data["Specialties"])
        
        if "PLIs" in provider_data:
            standardized["insurance_info"] = DataMapper.extract_insurance_info(provider_data["PLIs"])
        
        if "BoardCertifications" in provider_data:
            standardized["board_certification_info"] = DataMapper.extract_board_certification_info(provider_data["BoardCertifications"])
        
        if "Disclosure" in provider_data:
            standardized["disclosure_info"] = DataMapper.extract_disclosure_info(provider_data["Disclosure"])
        
        if "QualityMetrics" in provider_data:
            standardized["quality_metrics"] = DataMapper.extract_quality_metrics(provider_data["QualityMetrics"])
        
        if "ContinuingEducation" in provider_data:
            standardized["continuing_education"] = DataMapper.extract_continuing_education(provider_data["ContinuingEducation"])
        
        if "WorkHistory" in provider_data:
            standardized["work_history"] = DataMapper.extract_work_history(provider_data["WorkHistory"])
        
        return standardized
    
    @staticmethod
    def _calculate_years_since_graduation(graduation_year: int) -> int:
        """Calculate years since graduation"""
        from datetime import datetime
        current_year = datetime.now().year
        return max(0, current_year - graduation_year)
    
    @staticmethod
    def _get_current_position(employment_history: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Get current position from employment history"""
        for position in employment_history:
            if position.get("current", False):
                return position
        return None
    
    @staticmethod
    def _categorize_experience(years: int) -> str:
        """Categorize experience level"""
        if years >= 20:
            return "Expert"
        elif years >= 10:
            return "Senior"
        elif years >= 5:
            return "Mid-level"
        elif years >= 2:
            return "Junior"
        else:
            return "New"
    
    @staticmethod
    def validate_data_completeness(provider_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate data completeness and quality"""
        required_fields = [
            "PersonalInfo", "ProfessionalIds", "Educations", "Specialties",
            "HospitalAffiliations", "WorkHistory", "PLIs", "PracticeInformation",
            "MalpracticeHistory", "Disclosure", "BoardCertifications",
            "ContinuingEducation", "PeerReferences", "FinancialDisclosure", "QualityMetrics"
        ]
        
        missing_fields = []
        empty_fields = []
        present_fields = 0
        
        for field in required_fields:
            if field not in provider_data:
                missing_fields.append(field)
            elif not provider_data[field]:
                empty_fields.append(field)
            else:
                present_fields += 1
        
        completeness_score = present_fields / len(required_fields)
        
        return {
            "completeness_score": completeness_score,
            "missing_fields": missing_fields,
            "empty_fields": empty_fields,
            "present_fields": present_fields,
            "total_fields": len(required_fields),
            "is_complete": len(missing_fields) == 0 and len(empty_fields) == 0
        } 