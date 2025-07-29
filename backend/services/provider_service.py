"""
Provider service for managing healthcare provider data.
"""

import json
from typing import Dict, Any, List, Optional
from models.provider import Provider
from config.settings import settings


class ProviderService:
    """Service for managing provider data"""
    
    def __init__(self, data_file_path: str = "data/providers.json"):
        """Initialize provider service with data file"""
        self.data_file_path = data_file_path
        self.providers = self._load_providers()
    
    def _load_providers(self) -> Dict[str, Provider]:
        """Load providers from JSON file"""
        try:
            with open(self.data_file_path, 'r') as f:
                data = json.load(f)
            
            providers = {}
            for provider_data in data.get('providers', []):
                provider = Provider(**provider_data)
                providers[provider.provider_id] = provider
            
            return providers
            
        except Exception as e:
            print(f"Error loading providers: {e}")
            return {}
    
    def get_provider(self, provider_id: str) -> Optional[Provider]:
        """Get provider by ID"""
        return self.providers.get(provider_id)
    
    def get_all_providers(self) -> List[Provider]:
        """Get all providers"""
        return list(self.providers.values())
    
    def get_provider_ids(self) -> List[str]:
        """Get all provider IDs"""
        return list(self.providers.keys())
    
    def get_provider_data(self, provider_id: str) -> Optional[Dict[str, Any]]:
        """Get provider data as dictionary"""
        provider = self.get_provider(provider_id)
        if provider:
            return provider.get_all_data()
        return None
    
    def get_field_data(self, provider_id: str, field_name: str) -> Optional[Dict[str, Any]]:
        """Get specific field data for a provider"""
        provider = self.get_provider(provider_id)
        if provider:
            return provider.get_field_data(field_name)
        return None
    
    def search_providers(self, criteria: Dict[str, Any]) -> List[Provider]:
        """Search providers based on criteria"""
        results = []
        
        for provider in self.providers.values():
            if self._matches_criteria(provider, criteria):
                results.append(provider)
        
        return results
    
    def _matches_criteria(self, provider: Provider, criteria: Dict[str, Any]) -> bool:
        """Check if provider matches search criteria"""
        for field, value in criteria.items():
            if hasattr(provider, field):
                provider_value = getattr(provider, field)
                if isinstance(provider_value, dict) and isinstance(value, dict):
                    # For nested objects, check if all criteria match
                    for sub_field, sub_value in value.items():
                        if sub_field not in provider_value or provider_value[sub_field] != sub_value:
                            return False
                elif provider_value != value:
                    return False
            else:
                # Check in nested fields
                for field_name in dir(provider):
                    if not field_name.startswith('_'):
                        field_obj = getattr(provider, field_name)
                        if hasattr(field_obj, field):
                            if getattr(field_obj, field) != value:
                                return False
                            break
                else:
                    return False
        
        return True
    
    def get_providers_by_specialty(self, specialty: str) -> List[Provider]:
        """Get providers by specialty"""
        return self.search_providers({"Specialties": {"primary_specialty": specialty}})
    
    def get_providers_by_experience(self, min_years: int) -> List[Provider]:
        """Get providers with minimum years of experience"""
        results = []
        for provider in self.providers.values():
            if provider.WorkHistory.years_experience >= min_years:
                results.append(provider)
        return results
    
    def get_providers_by_location(self, location: str) -> List[Provider]:
        """Get providers by practice location"""
        results = []
        for provider in self.providers.values():
            if location.lower() in provider.PracticeInformation.practice_address.lower():
                results.append(provider)
        return results
    
    def validate_provider_data(self, provider_id: str) -> Dict[str, Any]:
        """Validate provider data completeness"""
        provider = self.get_provider(provider_id)
        if not provider:
            return {"valid": False, "errors": ["Provider not found"]}
        
        validation_result = {
            "valid": True,
            "errors": [],
            "warnings": [],
            "completeness_score": 0
        }
        
        # Check required fields
        required_fields = [
            "PersonalInfo", "ProfessionalIds", "Educations", "Specialties",
            "HospitalAffiliations", "WorkHistory", "PLIs", "PracticeInformation",
            "MalpracticeHistory", "Disclosure", "BoardCertifications",
            "ContinuingEducation", "PeerReferences", "FinancialDisclosure", "QualityMetrics"
        ]
        
        present_fields = 0
        for field in required_fields:
            if hasattr(provider, field):
                field_data = getattr(provider, field)
                if field_data:
                    present_fields += 1
                else:
                    validation_result["warnings"].append(f"Field {field} is empty")
            else:
                validation_result["errors"].append(f"Required field {field} is missing")
        
        validation_result["completeness_score"] = present_fields / len(required_fields)
        
        if validation_result["errors"]:
            validation_result["valid"] = False
        
        return validation_result
    
    def get_provider_summary(self, provider_id: str) -> Optional[Dict[str, Any]]:
        """Get provider summary information"""
        provider = self.get_provider(provider_id)
        if not provider:
            return None
        
        return {
            "provider_id": provider.provider_id,
            "name": provider.PersonalInfo.name,
            "specialty": provider.Specialties.primary_specialty,
            "years_experience": provider.WorkHistory.years_experience,
            "practice_name": provider.PracticeInformation.practice_name,
            "license_number": provider.ProfessionalIds.license_number,
            "board_certifications": provider.BoardCertifications.board_certifications,
            "malpractice_insurance": provider.PLIs.malpractice_insurance,
            "cme_credits": provider.ContinuingEducation.cme_credits,
            "quality_score": provider.QualityMetrics.quality_score
        } 
 