"""
Configuration settings for the credentialing service.
"""

import os
from typing import Dict, Any

class Settings:
    """Application settings"""
    
    # LLM Configuration
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "bedrock")
    LLM_MODEL = os.getenv("LLM_MODEL", "anthropic.claude-3-5-sonnet-20240620-v1:0")
    AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
    
    # Credentialing API Configuration
    CREDENTIALING_API_BASE_URL = os.getenv("CREDENTIALING_API_BASE_URL", "https://api.credentialing-service.com")
    CREDENTIALING_API_KEY = os.getenv("CREDENTIALING_API_KEY", "dummy-api-key")
    
    # Logging Configuration
    LOGS_DIR = os.getenv("LOGS_DIR", "logs")
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    ENABLE_DETAILED_LOGGING = os.getenv("ENABLE_DETAILED_LOGGING", "true").lower() == "true"
    LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Application Configuration
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    ENVIRONMENT = os.getenv("ENVIRONMENT", "production")
    
    # Scoring Configuration
    SOFT_REGULATION_WEIGHTS = {
        "experience_years": 0.4,
        "education_compliance": 0.3,
        "quality_metrics": 0.3
    }
    
    # Regulatory Thresholds
    MIN_EXPERIENCE_YEARS = 2
    MIN_CME_CREDITS = 50
    MIN_QUALITY_SCORE = 3.0
    
    # Data Mapping Configuration
    DATA_FIELD_MAPPINGS = {
        "PersonalInfo": ["name", "date_of_birth", "ssn"],
        "ProfessionalIds": ["license_number", "dea_number", "npi"],
        "Educations": ["medical_school", "graduation_year", "residency"],
        "Specialties": ["primary_specialty", "subspecialties"],
        "HospitalAffiliations": ["hospitals", "privileges"],
        "WorkHistory": ["employment_history", "years_experience"],
        "PLIs": ["malpractice_insurance", "coverage_amount"],
        "PracticeInformation": ["practice_name", "practice_address"],
        "MalpracticeHistory": ["malpractice_claims", "settlements"],
        "Disclosure": ["disciplinary_actions", "criminal_record"],
        "BoardCertifications": ["board_certifications", "certification_dates"],
        "ContinuingEducation": ["cme_credits", "education_history"],
        "PeerReferences": ["references", "peer_evaluations"],
        "FinancialDisclosure": ["financial_interests", "conflicts"],
        "QualityMetrics": ["patient_satisfaction", "outcome_metrics"]
    }

# Global settings instance
settings = Settings() 