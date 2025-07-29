"""
Provider model for healthcare providers.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import date


class PersonalInfo(BaseModel):
    """Personal information of the provider"""
    name: str
    date_of_birth: str
    ssn: str
    email: str
    phone: str


class ProfessionalIds(BaseModel):
    """Professional identification numbers"""
    license_number: str
    dea_number: str
    npi: str
    state_license: str
    federal_tax_id: str


class Educations(BaseModel):
    """Educational background"""
    medical_school: str
    graduation_year: int
    residency: str
    fellowship: Optional[str] = None
    undergraduate: str


class Specialties(BaseModel):
    """Medical specialties"""
    primary_specialty: str
    subspecialties: List[str]
    certifications: List[str]


class HospitalAffiliations(BaseModel):
    """Hospital affiliations and privileges"""
    hospitals: List[str]
    privileges: List[str]
    admitting_privileges: bool


class WorkHistory(BaseModel):
    """Employment history"""
    employment_history: List[Dict[str, Any]]
    years_experience: int


class PLIs(BaseModel):
    """Professional Liability Insurance"""
    malpractice_insurance: str
    coverage_amount: int
    insurance_provider: str
    policy_number: str
    expiration_date: str


class PracticeInformation(BaseModel):
    """Practice details"""
    practice_name: str
    practice_address: str
    practice_phone: str
    practice_website: str


class MalpracticeHistory(BaseModel):
    """Malpractice history"""
    malpractice_claims: int
    settlements: int
    pending_claims: int
    last_claim_date: Optional[str] = None


class Disclosure(BaseModel):
    """Disciplinary actions and disclosures"""
    disciplinary_actions: List[str]
    criminal_record: str
    license_suspensions: int
    voluntary_surrender: bool


class BoardCertifications(BaseModel):
    """Board certifications"""
    board_certifications: List[str]
    certification_dates: List[str]
    expiration_dates: List[str]
    recertification_status: str


class ContinuingEducation(BaseModel):
    """Continuing medical education"""
    cme_credits: int
    education_history: List[Dict[str, Any]]
    required_credits: int
    compliance_status: str


class PeerReferences(BaseModel):
    """Peer references and evaluations"""
    references: List[Dict[str, str]]
    peer_evaluations: str


class FinancialDisclosure(BaseModel):
    """Financial disclosures"""
    financial_interests: List[str]
    conflicts: str
    pharmaceutical_relationships: str
    device_company_relationships: str


class QualityMetrics(BaseModel):
    """Quality and performance metrics"""
    patient_satisfaction: float
    outcome_metrics: float
    readmission_rate: float
    mortality_rate: float
    quality_score: float


class Provider(BaseModel):
    """Complete provider model with all 15 data fields"""
    provider_id: str
    PersonalInfo: PersonalInfo
    ProfessionalIds: ProfessionalIds
    Educations: Educations
    Specialties: Specialties
    HospitalAffiliations: HospitalAffiliations
    WorkHistory: WorkHistory
    PLIs: PLIs
    PracticeInformation: PracticeInformation
    MalpracticeHistory: MalpracticeHistory
    Disclosure: Disclosure
    BoardCertifications: BoardCertifications
    ContinuingEducation: ContinuingEducation
    PeerReferences: PeerReferences
    FinancialDisclosure: FinancialDisclosure
    QualityMetrics: QualityMetrics

    def get_field_data(self, field_name: str) -> Dict[str, Any]:
        """Get data for a specific field"""
        if hasattr(self, field_name):
            return getattr(self, field_name).dict()
        return {}

    def get_all_data(self) -> Dict[str, Any]:
        """Get all provider data as a dictionary"""
        return self.dict() 