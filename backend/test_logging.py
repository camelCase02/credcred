"""
Test script to demonstrate the comprehensive logging functionality.
"""

import json
import time
from services.credentialing_service import CredentialingService
from services.provider_service import ProviderService
from utils.logger import audit_logger


def test_comprehensive_logging():
    """Test comprehensive logging functionality"""
    
    print("🔍 Testing Comprehensive Logging Functionality")
    print("=" * 60)
    
    # Initialize services
    credentialing_service = CredentialingService()
    provider_service = ProviderService()
    
    # Get all providers
    providers = provider_service.get_all_providers()
    print(f"\n📋 Found {len(providers)} providers to test")
    
    # Test credentialing with logging for each provider
    for i, provider in enumerate(providers, 1):
        print(f"\n🔍 Test {i}: Credentialing {provider.PersonalInfo.name} ({provider.provider_id})")
        print("-" * 50)
        
        # Perform credentialing (this will generate comprehensive logs)
        result = credentialing_service.credential_provider(provider.provider_id)
        
        print(f"✅ Credentialing completed:")
        print(f"   Compliance Status: {result.compliance_status.value}")
        print(f"   Score: {result.score}/5")
        print(f"   Processing Time: {result.processing_time:.2f}s")
        print(f"   LLM Requests: {result.llm_usage['total_requests']}")
        print(f"   LLM Tokens: {result.llm_usage['total_tokens']}")
        print(f"   LLM Cost: ${result.llm_usage['total_cost']:.6f}")
    
    # Test logging retrieval functions
    print(f"\n📊 Testing Logging Retrieval Functions")
    print("=" * 50)
    
    # Get credentialing history
    history = credentialing_service.get_credentialing_history()
    print(f"📋 Total credentialing sessions: {len(history)}")
    
    for session in history[:3]:  # Show first 3 sessions
        print(f"   Session: {session['session_id']}")
        print(f"     Provider: {session['provider_id']}")
        print(f"     Steps: {session['total_steps']}")
        print(f"     LLM Interactions: {session['total_llm_interactions']}")
        print(f"     Decisions: {session['total_decisions']}")
        print(f"     Duration: {session['start_time']} to {session['end_time']}")
    
    # Test decision reasoning retrieval
    if providers:
        provider_id = providers[0].provider_id
        print(f"\n🧠 Testing Decision Reasoning for {provider_id}")
        
        decision_types = ["hard_regulations_summary", "soft_regulations_summary", "final_compliance_decision"]
        
        for decision_type in decision_types:
            reasoning = credentialing_service.get_decision_reasoning(provider_id, decision_type)
            print(f"   {decision_type}: {len(reasoning)} reasoning records")
            
            if reasoning:
                latest_reasoning = reasoning[0]
                print(f"     Latest: {latest_reasoning['decision']}")
                print(f"     Confidence: {latest_reasoning['confidence']}")
    
    # Test session log retrieval
    print(f"\n📄 Testing Session Log Retrieval")
    print("=" * 40)
    
    if history:
        session_id = history[0]['session_id']
        print(f"Retrieving detailed log for session: {session_id}")
        
        # This would normally be done via API, but we can access the file directly
        import os
        from pathlib import Path
        from config.settings import settings
        
        logs_dir = Path(settings.LOGS_DIR)
        session_file = logs_dir / f"credentialing_{session_id}.json"
        
        if session_file.exists():
            with open(session_file, 'r') as f:
                session_log = json.load(f)
            
            print(f"   Session ID: {session_log['session_id']}")
            print(f"   Provider ID: {session_log['provider_id']}")
            print(f"   Total Steps: {len(session_log['steps'])}")
            print(f"   LLM Interactions: {len(session_log['llm_reasoning'])}")
            print(f"   Decisions: {len(session_log['decisions'])}")
            print(f"   Data Points: {len(session_log['data_points'])}")
            
            # Show some sample steps
            print(f"\n   Sample Steps:")
            for step in session_log['steps'][:3]:
                print(f"     - {step['step_name']}: {step.get('llm_reasoning', 'No reasoning')[:100]}...")
            
            # Show some sample LLM reasoning
            print(f"\n   Sample LLM Reasoning:")
            for reasoning in session_log['llm_reasoning'][:2]:
                print(f"     - {reasoning['type']}: {reasoning['reasoning'][:100]}...")
            
            # Show some sample decisions
            print(f"\n   Sample Decisions:")
            for decision in session_log['decisions'][:3]:
                print(f"     - {decision['type']}: {decision['decision']}")
                print(f"       Confidence: {decision['confidence']}")
    
    print(f"\n✅ Comprehensive logging test completed!")


def test_audit_trail():
    """Test audit trail functionality"""
    
    print(f"\n📋 Testing Audit Trail Functionality")
    print("=" * 50)
    
    # Log some audit events
    audit_logger.log_audit_event("test_event", {
        "message": "This is a test audit event",
        "timestamp": time.time(),
        "test_data": {"key": "value"}
    })
    
    audit_logger.log_audit_event("user_action", {
        "user_id": "test_user",
        "action": "view_provider",
        "provider_id": "dr_smith_001",
        "timestamp": time.time()
    })
    
    print("✅ Audit events logged")
    
    # Test chatbot training data generation
    print(f"\n🤖 Testing Chatbot Training Data Generation")
    print("=" * 55)
    
    audit_logger.log_chatbot_training_data(
        "What is the compliance status for dr_smith_001?",
        "Provider dr_smith_001 has a compliance status of COMPLIANT with a score of 4/5.",
        {"provider_id": "dr_smith_001", "compliance_status": "COMPLIANT", "score": 4}
    )
    
    audit_logger.log_chatbot_training_data(
        "Why did dr_smith_001 receive a score of 4/5?",
        "The provider received a score of 4/5 based on their performance across soft regulations including years of experience, continuing education compliance, and quality metrics.",
        {"provider_id": "dr_smith_001", "score": 4, "reasoning": "Based on soft regulation performance"}
    )
    
    print("✅ Chatbot training data logged")
    
    # Check if log files were created
    import os
    from pathlib import Path
    from config.settings import settings
    
    logs_dir = Path(settings.LOGS_DIR)
    
    print(f"\n📁 Checking Log Files")
    print("=" * 30)
    
    if logs_dir.exists():
        log_files = list(logs_dir.glob("*"))
        print(f"Log directory: {logs_dir}")
        print(f"Total log files: {len(log_files)}")
        
        for log_file in log_files:
            file_size = log_file.stat().st_size
            print(f"   {log_file.name}: {file_size} bytes")
    else:
        print(f"Log directory {logs_dir} does not exist")


def test_logging_analysis():
    """Test logging analysis and insights"""
    
    print(f"\n📊 Testing Logging Analysis and Insights")
    print("=" * 55)
    
    credentialing_service = CredentialingService()
    
    # Get all credentialing history
    history = credentialing_service.get_credentialing_history()
    
    if not history:
        print("No credentialing history found")
        return
    
    # Analyze the logs
    total_sessions = len(history)
    total_steps = sum(session.get('total_steps', 0) for session in history)
    total_llm_interactions = sum(session.get('total_llm_interactions', 0) for session in history)
    total_decisions = sum(session.get('total_decisions', 0) for session in history)
    
    print(f"📈 Logging Statistics:")
    print(f"   Total Sessions: {total_sessions}")
    print(f"   Total Steps: {total_steps}")
    print(f"   Total LLM Interactions: {total_llm_interactions}")
    print(f"   Total Decisions: {total_decisions}")
    print(f"   Average Steps per Session: {total_steps / total_sessions:.1f}")
    print(f"   Average LLM Interactions per Session: {total_llm_interactions / total_sessions:.1f}")
    print(f"   Average Decisions per Session: {total_decisions / total_sessions:.1f}")
    
    # Analyze decision types
    decision_types = {}
    for session in history:
        for decision in session.get('decisions', []):
            decision_type = decision.get('type', 'unknown')
            decision_types[decision_type] = decision_types.get(decision_type, 0) + 1
    
    print(f"\n🎯 Decision Type Analysis:")
    for decision_type, count in decision_types.items():
        print(f"   {decision_type}: {count} decisions")
    
    # Analyze LLM interaction types
    llm_types = {}
    for session in history:
        for interaction in session.get('llm_reasoning', []):
            interaction_type = interaction.get('type', 'unknown')
            llm_types[interaction_type] = llm_types.get(interaction_type, 0) + 1
    
    print(f"\n🤖 LLM Interaction Analysis:")
    for interaction_type, count in llm_types.items():
        print(f"   {interaction_type}: {count} interactions")


def main():
    """Main test function"""
    
    print("🔍 Comprehensive Logging Test Suite")
    print("=" * 60)
    
    # Run all tests
    test_comprehensive_logging()
    test_audit_trail()
    test_logging_analysis()
    
    print(f"\n🎉 All logging tests completed successfully!")
    print(f"\n💡 The logs folder now contains:")
    print(f"   - Individual session logs (credentialing_*.json)")
    print(f"   - Standard logs (credentialing_*.log)")
    print(f"   - Audit trail (audit_trail.jsonl)")
    print(f"   - Chatbot training data (chatbot_training_data.jsonl)")
    print(f"\n🚀 You can now use this data to build a chatbot!")


if __name__ == "__main__":
    main() 