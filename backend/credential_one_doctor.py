#!/usr/bin/env python3
"""
Simple script to credential one doctor with comprehensive logging.
"""

import json
import time
from services.credentialing_service import CredentialingService
from services.provider_service import ProviderService


def credential_one_doctor(provider_id: str = "dr_smith_001"):
    """
    Credential a single doctor and display results with logging information.
    
    Args:
        provider_id (str): The ID of the provider to credential
    """
    
    print("🏥 Healthcare Provider Credentialing")
    print("=" * 50)
    print(f"Credentialing provider: {provider_id}")
    print()
    
    # Initialize services
    credentialing_service = CredentialingService()
    provider_service = ProviderService()
    
    # Get provider info
    provider = provider_service.get_provider(provider_id)
    if not provider:
        print(f"❌ Error: Provider {provider_id} not found!")
        return
    
    print(f"👨‍⚕️ Provider: {provider.PersonalInfo.name}")
    print(f"🏥 Specialty: {provider.Specialties.primary_specialty}")
    print(f"📅 Experience: {provider.WorkHistory.years_experience} years")
    print(f"🎓 Education: {provider.Educations.medical_school}")
    print()
    
    # Start credentialing process
    print("🔄 Starting credentialing process...")
    print("   This will generate comprehensive logs in the 'logs' folder")
    print()
    
    start_time = time.time()
    
    try:
        # Perform credentialing (this generates all the logs)
        result = credentialing_service.credential_provider(provider_id)
        
        processing_time = time.time() - start_time
        
        # Display results
        print("✅ Credentialing completed successfully!")
        print("=" * 50)
        print(f"📊 Results for {provider.PersonalInfo.name}:")
        print(f"   Compliance Status: {result.compliance_status.value}")
        print(f"   Overall Score: {result.score}/5")
        print(f"   Processing Time: {processing_time:.2f} seconds")
        print()
        
        # Display hard regulation results
        print("🔒 Hard Regulations:")
        for reg_id, passed in result.hard_regulations.items():
            status = "✅ PASSED" if passed else "❌ FAILED"
            print(f"   {reg_id}: {status}")
        print()
        
        # Display soft regulation scores
        print("📈 Soft Regulation Scores:")
        for reg_id, score in result.soft_regulations.items():
            print(f"   {reg_id}: {score}/5")
        print()
        
        # Display LLM usage
        print("🤖 LLM Usage Statistics:")
        print(f"   Total Requests: {result.llm_usage['total_requests']}")
        print(f"   Total Tokens: {result.llm_usage['total_tokens']}")
        print(f"   Total Cost: ${result.llm_usage['total_cost']:.6f}")
        print()
        
        # Display logging information
        print("📋 Logging Information:")
        print(f"   Logs generated in: logs/")
        print(f"   Session log: credentialing_{provider_id}_*.json")
        print(f"   Standard log: credentialing_{provider_id}_*.log")
        print(f"   Audit trail: audit_trail.jsonl")
        print(f"   Chatbot training data: chatbot_training_data.jsonl")
        print()
        
        # Show some mapped data
        print("🗂️ Sample Mapped Data:")
        for reg_id, data in list(result.mapped_data.items())[:3]:
            print(f"   {reg_id}: {len(data.get('extracted_values', {}))} data points")
        print()
        
        # Final summary
        if result.compliance_status.value == "COMPLIANT":
            print("🎉 Provider is COMPLIANT and ready for credentialing!")
        else:
            print("⚠️ Provider is NOT COMPLIANT - review required.")
        
        print()
        print("💡 Check the 'logs' folder for detailed information about:")
        print("   - Every step of the credentialing process")
        print("   - LLM reasoning for all decisions")
        print("   - Data points used at each step")
        print("   - Decision confidence levels")
        print("   - Chatbot training data")
        
    except Exception as e:
        print(f"❌ Error during credentialing: {e}")
        print("Check the logs for detailed error information.")


def main():
    """Main function"""
    
    # You can change this to any provider ID from the data
    provider_id = "dr_smith_001"  # Default provider
    
    # Available provider IDs:
    # - dr_smith_001 (Dr. John Smith - Internal Medicine)
    # - dr_johnson_002 (Dr. Sarah Johnson - Cardiology)
    # - dr_williams_003 (Dr. Michael Williams - Pediatrics)
    
    print("Available providers:")
    print("  - dr_smith_001 (Dr. John Smith - Internal Medicine)")
    print("  - dr_johnson_002 (Dr. Sarah Johnson - Cardiology)")
    print("  - dr_williams_003 (Dr. Michael Williams - Pediatrics)")
    print()
    
    # Uncomment the line below to credential a different provider
    # provider_id = "dr_johnson_002"
    
    credential_one_doctor(provider_id)


if __name__ == "__main__":
    main() 