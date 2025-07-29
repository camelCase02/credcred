"""
Test script to demonstrate the credentialing service functionality.
"""

import json
from services.credentialing_service import CredentialingService
from services.provider_service import ProviderService
from utils.data_mapper import DataMapper


def test_credentialing_service():
    """Test the credentialing service with sample providers"""
    
    print("🏥 Healthcare Provider Credentialing Service Test")
    print("=" * 60)
    
    # Initialize services
    credentialing_service = CredentialingService()
    provider_service = ProviderService()
    
    # Get all providers
    providers = provider_service.get_all_providers()
    print(f"\n📋 Found {len(providers)} providers in database")
    
    # Test credentialing for each provider
    for provider in providers:
        print(f"\n🔍 Credentialing provider: {provider.PersonalInfo.name} ({provider.provider_id})")
        print(f"   Specialty: {provider.Specialties.primary_specialty}")
        print(f"   Experience: {provider.WorkHistory.years_experience} years")
        
        # Perform credentialing
        result = credentialing_service.credential_provider(provider.provider_id)
        
        # Display results
        print(f"   ✅ Compliance Status: {result.compliance_status.value}")
        print(f"   📊 Score: {result.score}/5")
        print(f"   ⏱️  Processing Time: {result.processing_time:.2f}s")
        
        # Show hard regulation results
        print("   📋 Hard Regulations:")
        for reg_result in result.hard_regulation_results:
            status = "✅ PASS" if reg_result.passed else "❌ FAIL"
            print(f"      {reg_result.regulation_name}: {status}")
        
        # Show soft regulation scores
        print("   📈 Soft Regulation Scores:")
        for reg_result in result.soft_regulation_results:
            print(f"      {reg_result.regulation_name}: {reg_result.score}/5 (weight: {reg_result.weight})")
    
    # Get statistics
    print(f"\n📊 Credentialing Statistics:")
    all_results = credentialing_service.get_all_results()
    compliant_count = len([r for r in all_results.values() if r.compliance_status.value == "COMPLIANT"])
    total_count = len(all_results)
    
    print(f"   Total Providers: {total_count}")
    print(f"   Compliant Providers: {compliant_count}")
    print(f"   Compliance Rate: {(compliant_count/total_count)*100:.1f}%")
    
    # Get LLM usage stats
    llm_stats = credentialing_service.get_llm_usage_stats()
    print(f"\n🤖 LLM Usage Statistics:")
    print(f"   Total Requests: {llm_stats['total_requests']}")
    print(f"   Total Tokens: {llm_stats['total_tokens']}")
    print(f"   Total Cost: ${llm_stats['total_cost']:.6f}")
    
    # Test data mapping
    print(f"\n🗂️  Testing Data Mapping:")
    if providers:
        provider_data = providers[0].get_all_data()
        standardized_data = DataMapper.standardize_provider_data(provider_data)
        print(f"   Standardized {len(standardized_data)} data fields")
        
        # Test data completeness validation
        completeness = DataMapper.validate_data_completeness(provider_data)
        print(f"   Data Completeness: {completeness['completeness_score']*100:.1f}%")
        print(f"   Missing Fields: {len(completeness['missing_fields'])}")
        print(f"   Empty Fields: {len(completeness['empty_fields'])}")
    
    print(f"\n✅ Test completed successfully!")


def test_provider_search():
    """Test provider search functionality"""
    
    print(f"\n🔍 Testing Provider Search Functionality")
    print("=" * 50)
    
    provider_service = ProviderService()
    
    # Search by specialty
    cardiologists = provider_service.get_providers_by_specialty("Cardiology")
    print(f"📋 Cardiologists found: {len(cardiologists)}")
    for provider in cardiologists:
        print(f"   - {provider.PersonalInfo.name}")
    
    # Search by experience
    experienced_providers = provider_service.get_providers_by_experience(10)
    print(f"📋 Providers with 10+ years experience: {len(experienced_providers)}")
    for provider in experienced_providers:
        print(f"   - {provider.PersonalInfo.name} ({provider.WorkHistory.years_experience} years)")
    
    # Search by location
    ca_providers = provider_service.get_providers_by_location("California")
    print(f"📋 Providers in California: {len(ca_providers)}")
    for provider in ca_providers:
        print(f"   - {provider.PersonalInfo.name}")


def test_regulations():
    """Test regulations loading and structure"""
    
    print(f"\n📜 Testing Regulations")
    print("=" * 30)
    
    try:
        with open("data/regulations.json", 'r') as f:
            regulations = json.load(f)
        
        hard_regs = regulations["regulations"]["hard_regulations"]
        soft_regs = regulations["regulations"]["soft_regulations"]
        
        print(f"📋 Hard Regulations: {len(hard_regs)}")
        for reg in hard_regs:
            print(f"   - {reg['name']} ({reg['id']})")
        
        print(f"📈 Soft Regulations: {len(soft_regs)}")
        for reg in soft_regs:
            print(f"   - {reg['name']} ({reg['id']}) - Weight: {reg['weight']}")
        
    except Exception as e:
        print(f"❌ Error loading regulations: {e}")


if __name__ == "__main__":
    # Run all tests
    test_credentialing_service()
    test_provider_search()
    test_regulations() 