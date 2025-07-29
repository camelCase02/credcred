"""
Regulation models for credentialing requirements.
"""

from typing import Dict, Any, List, Union, Optional
from pydantic import BaseModel, Field
from enum import Enum


class RegulationType(str, Enum):
    """Types of regulations"""
    HARD = "hard"
    SOFT = "soft"


class ValidationCriteria(BaseModel):
    """Validation criteria for hard regulations"""
    license_status: Optional[str] = None
    license_expiration: Optional[str] = None
    state_verification: Optional[str] = None
    disciplinary_actions: Optional[str] = None
    license_suspensions: Optional[int] = None
    voluntary_surrender: Optional[bool] = None
    malpractice_insurance: Optional[str] = None
    coverage_amount: Optional[str] = None
    expiration_date: Optional[str] = None
    board_certifications: Optional[str] = None
    recertification_status: Optional[str] = None
    expiration_dates: Optional[str] = None
    criminal_record: Optional[str] = None
    felony_convictions: Optional[int] = None
    background_check: Optional[str] = None


class ScoringCriteria(BaseModel):
    """Scoring criteria for soft regulations"""
    criteria: Dict[str, int]
    weight: float = Field(ge=0.0, le=1.0)


class HardRegulation(BaseModel):
    """Hard regulation that must be passed"""
    id: str
    name: str
    description: str
    data_fields: List[str]
    validation_criteria: ValidationCriteria
    failure_consequence: str

    def validate(self, provider_data: Dict[str, Any]) -> bool:
        """Validate provider data against this regulation"""
        # This would contain the actual validation logic
        # For now, return True as placeholder
        return True


class SoftRegulation(BaseModel):
    """Soft regulation that contributes to scoring"""
    id: str
    name: str
    description: str
    data_fields: List[str]
    scoring_criteria: ScoringCriteria
    weight: float = Field(ge=0.0, le=1.0)

    def score(self, provider_data: Dict[str, Any]) -> int:
        """Score provider data against this regulation"""
        # This would contain the actual scoring logic
        # For now, return a default score
        return 3


class Regulation(BaseModel):
    """Base regulation model"""
    id: str
    name: str
    description: str
    data_fields: List[str]
    regulation_type: RegulationType

    def __init__(self, **data):
        super().__init__(**data)
        if isinstance(data.get('validation_criteria'), dict):
            self.regulation_type = RegulationType.HARD
        elif isinstance(data.get('scoring_criteria'), dict):
            self.regulation_type = RegulationType.SOFT 