#!/usr/bin/env python3
"""
Test script for the new processed doctors list and chat endpoints.
"""

import requests
import json
import time


def test_processed_doctors_endpoint():
    """Test the processed doctors list endpoint"""
    
    print("🏥 Testing Processed Doctors List Endpoint")
    print("=" * 50)
    
    try:
        # First, let's credential a few doctors to have data
        print("📋 Credentialing doctors to generate data...")
        
        doctors_to_credential = ["dr_smith_001", "dr_johnson_002", "dr_williams_003"]
        
        for doctor_id in doctors_to_credential:
            print(f"   Credentialing {doctor_id}...")
            response = requests.post(f"http://localhost:8000/credential/{doctor_id}")
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ {doctor_id}: {result['result']['compliance_status']} - Score: {result['result']['score']}/5")
            else:
                print(f"   ❌ {doctor_id}: Error - {response.text}")
        
        print()
        
        # Now test the processed doctors endpoint
        print("📊 Getting processed doctors list...")
        response = requests.get("http://localhost:8000/processed-doctors")
        
        if response.status_code == 200:
            processed_doctors = response.json()
            
            print(f"✅ Found {len(processed_doctors)} processed doctors:")
            print()
            
            for i, doctor in enumerate(processed_doctors, 1):
                print(f"{i}. {doctor['name']} ({doctor['provider_id']})")
                print(f"   Specialty: {doctor['specialty']}")
                print(f"   Experience: {doctor['experience_years']} years")
                print(f"   Compliance: {doctor['compliance_status']}")
                print(f"   Score: {doctor['score']}/5")
                print(f"   Last Credentialed: {doctor['last_credentialed']}")
                print(f"   Processing Time: {doctor['processing_time']:.2f}s")
                print(f"   LLM Requests: {doctor['llm_requests']}")
                print(f"   LLM Cost: ${doctor['llm_cost']:.6f}")
                print(f"   Session ID: {doctor['session_id']}")
                print()
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the API server.")
        print("   Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")


def test_chat_endpoint():
    """Test the chat endpoint"""
    
    print("💬 Testing Chat Endpoint")
    print("=" * 40)
    
    try:
        # Test questions for different doctors
        test_questions = [
            {
                "provider_id": "dr_smith_001",
                "question": "What is the compliance status for this provider?"
            },
            {
                "provider_id": "dr_smith_001",
                "question": "Why did this provider receive their score?"
            },
            {
                "provider_id": "dr_smith_001",
                "question": "Which hard regulations did this provider pass?"
            },
            {
                "provider_id": "dr_johnson_002",
                "question": "What was the reasoning for the final compliance decision?"
            },
            {
                "provider_id": "dr_williams_003",
                "question": "How many LLM interactions were used in the credentialing process?"
            }
        ]
        
        for i, test_case in enumerate(test_questions, 1):
            print(f"Question {i}: {test_case['question']}")
            print(f"Provider: {test_case['provider_id']}")
            print("-" * 50)
            
            # Send chat request
            chat_request = {
                "provider_id": test_case["provider_id"],
                "question": test_case["question"]
            }
            
            response = requests.post(
                "http://localhost:8000/chat",
                json=chat_request,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                chat_response = response.json()
                
                print(f"✅ Answer: {chat_response['answer']}")
                print(f"   Confidence: {chat_response['confidence']:.2f}")
                print(f"   Sources: {len(chat_response['sources'])} sources")
                print(f"   Session ID: {chat_response['session_id']}")
                
                # Show some source details
                if chat_response['sources']:
                    print("   Sources:")
                    for j, source in enumerate(chat_response['sources'][:2], 1):
                        print(f"     {j}. {source['type']}: {source.get('name', 'Unknown')}")
                
            else:
                print(f"❌ Error: {response.status_code} - {response.text}")
            
            print()
            time.sleep(1)  # Small delay between requests
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the API server.")
        print("   Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")


def test_chat_with_specific_session():
    """Test chat with a specific session ID"""
    
    print("🎯 Testing Chat with Specific Session")
    print("=" * 45)
    
    try:
        # First get the sessions for a provider
        provider_id = "dr_smith_001"
        print(f"Getting sessions for {provider_id}...")
        
        response = requests.get(f"http://localhost:8000/logs/sessions?provider_id={provider_id}")
        
        if response.status_code == 200:
            sessions_data = response.json()
            sessions = sessions_data.get("sessions", [])
            
            if sessions:
                # Use the first session
                session_id = sessions[0]["session_id"]
                print(f"Using session: {session_id}")
                
                # Test chat with specific session
                chat_request = {
                    "provider_id": provider_id,
                    "session_id": session_id,
                    "question": "What specific steps were taken in this credentialing session?"
                }
                
                response = requests.post(
                    "http://localhost:8000/chat",
                    json=chat_request,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    chat_response = response.json()
                    
                    print(f"✅ Answer: {chat_response['answer']}")
                    print(f"   Confidence: {chat_response['confidence']:.2f}")
                    print(f"   Session ID: {chat_response['session_id']}")
                    
                else:
                    print(f"❌ Error: {response.status_code} - {response.text}")
            else:
                print("No sessions found for this provider")
        else:
            print(f"❌ Error getting sessions: {response.status_code} - {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the API server.")
        print("   Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")


def main():
    """Main test function"""
    
    print("🧪 Testing New Endpoints")
    print("=" * 60)
    print()
    
    # Test processed doctors endpoint
    test_processed_doctors_endpoint()
    
    print()
    print("=" * 60)
    print()
    
    # Test chat endpoint
    test_chat_endpoint()
    
    print()
    print("=" * 60)
    print()
    
    # Test chat with specific session
    test_chat_with_specific_session()
    
    print()
    print("🎉 All tests completed!")
    print()
    print("💡 API Endpoints tested:")
    print("   - GET /processed-doctors - List of all processed doctors")
    print("   - POST /chat - Chat interface for credentialing questions")
    print("   - GET /logs/sessions - Get credentialing sessions")
    print()
    print("🚀 You can now use these endpoints to build a frontend application!")


if __name__ == "__main__":
    main() 