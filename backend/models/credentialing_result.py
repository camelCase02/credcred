"""
Credentialing result model for storing credentialing outcomes.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime


class ComplianceStatus(str, Enum):
    """Compliance status enumeration"""
    COMPLIANT = "COMPLIANT"
    NON_COMPLIANT = "NON_COMPLIANT"
    PENDING = "PENDING"
    FAILED = "FAILED"


class HardRegulationResult(BaseModel):
    """Result for a hard regulation check"""
    regulation_id: str
    regulation_name: str
    passed: bool
    details: Dict[str, Any]
    failure_reason: Optional[str] = None


class SoftRegulationResult(BaseModel):
    """Result for a soft regulation scoring"""
    regulation_id: str
    regulation_name: str
    score: int
    max_score: int = 5
    weight: float
    weighted_score: float
    details: Dict[str, Any]


class CredentialingResult(BaseModel):
    """Complete credentialing result"""
    provider_id: str
    timestamp: datetime = Field(default_factory=datetime.now)
    score: int = Field(ge=1, le=5)
    compliance_status: ComplianceStatus
    hard_regulations: Dict[str, bool]
    soft_regulations: Dict[str, int]
    mapped_data: Dict[str, Any]
    verification_details: Dict[str, Any]
    hard_regulation_results: List[HardRegulationResult]
    soft_regulation_results: List[SoftRegulationResult]
    llm_usage: Dict[str, Any]
    processing_time: float
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)

    def is_compliant(self) -> bool:
        """Check if provider is compliant with all hard regulations"""
        return all(self.hard_regulations.values())

    def get_overall_score(self) -> float:
        """Get weighted overall score"""
        if not self.soft_regulation_results:
            return 0.0
        
        total_weighted_score = sum(result.weighted_score for result in self.soft_regulation_results)
        total_weight = sum(result.weight for result in self.soft_regulation_results)
        
        if total_weight == 0:
            return 0.0
        
        return round(total_weighted_score / total_weight, 2)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary format"""
        return {
            "provider_id": self.provider_id,
            "timestamp": self.timestamp.isoformat(),
            "score": self.score,
            "compliance_status": self.compliance_status.value,
            "hard_regulations": self.hard_regulations,
            "soft_regulations": self.soft_regulations,
            "mapped_data": self.mapped_data,
            "verification_details": self.verification_details,
            "overall_score": self.get_overall_score(),
            "is_compliant": self.is_compliant(),
            "processing_time": self.processing_time,
            "errors": self.errors,
            "warnings": self.warnings
        } 