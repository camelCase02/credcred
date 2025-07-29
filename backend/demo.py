"""
Demo script showing how to use the credentialing service.
"""

from services.credentialing_service import CredentialingService
from services.provider_service import ProviderService


def main():
    """Main demo function"""
    
    print("🏥 Healthcare Provider Credentialing Service Demo")
    print("=" * 60)
    
    # Initialize services
    credentialing_service = CredentialingService()
    provider_service = ProviderService()
    
    # Get available providers
    providers = provider_service.get_all_providers()
    print(f"\n📋 Available providers: {len(providers)}")
    for provider in providers:
        print(f"   - {provider.PersonalInfo.name} ({provider.provider_id})")
    
    # Demo 1: Credential a specific provider
    print(f"\n🔍 Demo 1: Credentialing a specific provider")
    print("-" * 50)
    
    if providers:
        provider_id = providers[0].provider_id
        provider_name = providers[0].PersonalInfo.name
        
        print(f"Credentialing: {provider_name}")
        result = credentialing_service.credential_provider(provider_id)
        
        print(f"✅ Result:")
        print(f"   Compliance Status: {result.compliance_status.value}")
        print(f"   Score: {result.score}/5")
        print(f"   Processing Time: {result.processing_time:.2f}s")
        
        # Show detailed results
        print(f"\n📋 Hard Regulation Results:")
        for reg_result in result.hard_regulation_results:
            status = "✅ PASS" if reg_result.passed else "❌ FAIL"
            print(f"   {reg_result.regulation_name}: {status}")
        
        print(f"\n📈 Soft Regulation Scores:")
        for reg_result in result.soft_regulation_results:
            print(f"   {reg_result.regulation_name}: {reg_result.score}/5")
    
    # Demo 2: Search providers
    print(f"\n🔍 Demo 2: Searching providers")
    print("-" * 50)
    
    # Search by specialty
    cardiologists = provider_service.get_providers_by_specialty("Cardiology")
    print(f"Cardiologists: {len(cardiologists)} found")
    for provider in cardiologists:
        print(f"   - {provider.PersonalInfo.name}")
    
    # Search by experience
    experienced = provider_service.get_providers_by_experience(10)
    print(f"Providers with 10+ years experience: {len(experienced)} found")
    for provider in experienced:
        print(f"   - {provider.PersonalInfo.name} ({provider.WorkHistory.years_experience} years)")
    
    # Demo 3: Get provider details
    print(f"\n📋 Demo 3: Provider details")
    print("-" * 50)
    
    if providers:
        provider = providers[0]
        print(f"Provider: {provider.PersonalInfo.name}")
        print(f"   Specialty: {provider.Specialties.primary_specialty}")
        print(f"   License: {provider.ProfessionalIds.license_number}")
        print(f"   Medical School: {provider.Educations.medical_school}")
        print(f"   Years Experience: {provider.WorkHistory.years_experience}")
        print(f"   Malpractice Insurance: {provider.PLIs.malpractice_insurance}")
        print(f"   Board Certifications: {', '.join(provider.BoardCertifications.board_certifications)}")
        print(f"   CME Credits: {provider.ContinuingEducation.cme_credits}")
        print(f"   Quality Score: {provider.QualityMetrics.quality_score}")
    
    # Demo 4: Get statistics
    print(f"\n📊 Demo 4: Service statistics")
    print("-" * 50)
    
    # Credential all providers to get statistics
    for provider in providers:
        credentialing_service.credential_provider(provider.provider_id)
    
    all_results = credentialing_service.get_all_results()
    compliant_count = len([r for r in all_results.values() if r.compliance_status.value == "COMPLIANT"])
    total_count = len(all_results)
    
    print(f"Total Providers Credentialed: {total_count}")
    print(f"Compliant Providers: {compliant_count}")
    print(f"Compliance Rate: {(compliant_count/total_count)*100:.1f}%")
    
    # Score distribution
    score_dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for result in all_results.values():
        score_dist[result.score] += 1
    
    print(f"\nScore Distribution:")
    for score, count in score_dist.items():
        if count > 0:
            print(f"   Score {score}: {count} providers")
    
    # LLM usage
    llm_stats = credentialing_service.get_llm_usage_stats()
    print(f"\nLLM Usage:")
    print(f"   Total Requests: {llm_stats['total_requests']}")
    print(f"   Total Tokens: {llm_stats['total_tokens']}")
    print(f"   Total Cost: ${llm_stats['total_cost']:.6f}")
    
    print(f"\n✅ Demo completed successfully!")
    print(f"\n💡 To run the full API server, use: python main.py")
    print(f"💡 To run tests, use: python test_credentialing.py")


if __name__ == "__main__":
    main() 