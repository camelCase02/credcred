# Healthcare Provider Credentialing Service - CURL Commands

## Base URL
```
http://localhost:8000
```

## 1. Health Check
```bash
curl -X GET http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "credentialing-service",
  "version": "1.0.0"
}
```

## 2. Credential a Provider
```bash
curl -X POST http://localhost:8000/credential/dr_smith_001
```

**Response:**
```json
{
  "success": true,
  "provider_id": "dr_smith_001",
  "result": {
    "provider_id": "dr_smith_001",
    "score": 4,
    "compliance_status": "COMPLIANT",
    "hard_regulations": {
      "HR001": true,
      "HR002": true,
      "HR003": true,
      "HR004": true,
      "HR005": true
    },
    "soft_regulations": {
      "SR001": 5,
      "SR002": 4,
      "SR003": 3
    },
    "mapped_data": {
      "HR001": {
        "data_fields": ["license_number", "license_status"],
        "extracted_values": {
          "license_number": "MD123456",
          "license_status": "Active"
        }
      }
    },
    "verification_details": {
      "api_response": {
        "license_verification": "Verified",
        "disciplinary_check": "Clean"
      },
      "processed_response": {
        "verification_status": "Verified",
        "confidence": 0.95
      }
    },
    "llm_usage": {
      "total_requests": 15,
      "total_tokens": 2500,
      "total_cost": 0.045
    },
    "processing_time": 2.34
  }
}
```

## 3. Get Processed Doctors List
```bash
curl -X GET http://localhost:8000/processed-doctors
```

**Response:**
```json
[
  {
    "provider_id": "dr_smith_001",
    "name": "Dr. John Smith",
    "specialty": "Internal Medicine",
    "experience_years": 15,
    "compliance_status": "COMPLIANT",
    "score": 4,
    "last_credentialed": "2024-12-01T14:30:22",
    "processing_time": 2.34,
    "llm_requests": 15,
    "llm_cost": 0.045,
    "session_id": "dr_smith_001_20241201_143022"
  },
  {
    "provider_id": "dr_johnson_002",
    "name": "Dr. Sarah Johnson",
    "specialty": "Cardiology",
    "experience_years": 12,
    "compliance_status": "COMPLIANT",
    "score": 5,
    "last_credentialed": "2024-12-01T14:35:15",
    "processing_time": 2.12,
    "llm_requests": 14,
    "llm_cost": 0.042,
    "session_id": "dr_johnson_002_20241201_143515"
  }
]
```

## 4. Chat Endpoint - Basic Questions

### Compliance Status
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "dr_smith_001", "question": "What is the compliance status for this provider?"}'
```

**Response:**
```json
{
  "answer": "Dr. John Smith has a compliance status of COMPLIANT with a score of 4/5. The provider passed all 5 hard regulations and achieved good scores on soft regulations including years of experience (5/5), continuing education (4/5), and quality metrics (3/5).",
  "confidence": 0.92,
  "sources": [
    {
      "type": "decision",
      "name": "final_compliance_decision",
      "decision": "Compliance Status: COMPLIANT, Score: 4/5",
      "confidence": 1.0
    },
    {
      "type": "step",
      "name": "hard_regulation_check_initiation",
      "timestamp": "2024-12-01T14:30:25",
      "data": {
        "hard_regulations_count": 5
      }
    }
  ],
  "provider_id": "dr_smith_001",
  "session_id": "dr_smith_001_20241201_143022"
}
```

### Score Explanation
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "dr_smith_001", "question": "Why did this provider receive their score?"}'
```

**Response:**
```json
{
  "answer": "The provider received a score of 4/5 based on their performance across soft regulations. They achieved maximum points (5/5) for years of experience due to 15 years of practice, 4/5 for continuing education compliance with 85 CME credits, and 3/5 for quality metrics with a quality score of 3.8. The weighted average of these scores resulted in the final score of 4/5.",
  "confidence": 0.89,
  "sources": [
    {
      "type": "decision",
      "name": "soft_regulations_summary",
      "decision": "Average soft regulation score: 4.00/5",
      "confidence": 0.8
    },
    {
      "type": "step",
      "name": "scoring_SR001",
      "timestamp": "2024-12-01T14:30:28",
      "data": {
        "score": 5,
        "max_score": 5,
        "reasoning": "Provider has 15 years of experience, exceeding the 16+ year threshold for maximum score"
      }
    }
  ],
  "provider_id": "dr_smith_001",
  "session_id": "dr_smith_001_20241201_143022"
}
```

### Hard Regulations
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "dr_smith_001", "question": "Which hard regulations did this provider pass?"}'
```

**Response:**
```json
{
  "answer": "Dr. John Smith passed all 5 hard regulations: HR001 (Valid medical license - PASSED), HR002 (No active disciplinary actions - PASSED), HR003 (Current malpractice insurance - PASSED), HR004 (Board certification in specialty - PASSED), and HR005 (Clean criminal background - PASSED). All hard regulations must pass for compliance, and this provider met all requirements.",
  "confidence": 0.95,
  "sources": [
    {
      "type": "decision",
      "name": "hard_regulations_summary",
      "decision": "5/5 hard regulations passed",
      "confidence": 1.0
    },
    {
      "type": "step",
      "name": "regulation_check_HR001",
      "timestamp": "2024-12-01T14:30:26",
      "data": {
        "regulation_id": "HR001",
        "regulation_name": "Valid Medical License",
        "passed": true,
        "data_used": {
          "license_number": "MD123456",
          "license_status": "Active"
        }
      }
    }
  ],
  "provider_id": "dr_smith_001",
  "session_id": "dr_smith_001_20241201_143022"
}
```

### LLM Usage
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "dr_smith_001", "question": "How many LLM interactions were used in the credentialing process?"}'
```

**Response:**
```json
{
  "answer": "The credentialing process for Dr. John Smith used 15 LLM interactions across various steps including data mapping, educational institution verification, certification verification, API response processing, and reasoning generation for regulation checks and scoring decisions. The total cost was $0.045 and 2,500 tokens were consumed.",
  "confidence": 0.87,
  "sources": [
    {
      "type": "step",
      "name": "data_mapping",
      "timestamp": "2024-12-01T14:30:23",
      "data": {
        "provider_data_keys": ["PersonalInfo", "ProfessionalIds", "Educations"],
        "regulations_count": 8
      }
    },
    {
      "type": "llm_reasoning",
      "name": "data_mapping",
      "timestamp": "2024-12-01T14:30:24",
      "data": {
        "type": "data_mapping",
        "prompt": "...",
        "response": "...",
        "reasoning": "Detailed explanation of data mapping process"
      }
    }
  ],
  "provider_id": "dr_smith_001",
  "session_id": "dr_smith_001_20241201_143022"
}
```

### Data Mapping
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "dr_smith_001", "question": "What data points were mapped to regulation HR001?"}'
```

**Response:**
```json
{
  "answer": "For regulation HR001 (Valid Medical License), the following data points were mapped: license_number (MD123456) and license_status (Active) from the ProfessionalIds data field. The LLM identified these as the most relevant fields for validating medical license requirements. The mapping process involved analyzing the regulation requirements and matching them to available provider data fields.",
  "confidence": 0.91,
  "sources": [
    {
      "type": "step",
      "name": "data_mapping",
      "timestamp": "2024-12-01T14:30:23",
      "data": {
        "mapped_regulations": ["HR001", "HR002", "HR003"],
        "mapping_quality": 1.0
      }
    },
    {
      "type": "llm_reasoning",
      "name": "data_mapping",
      "timestamp": "2024-12-01T14:30:24",
      "data": {
        "type": "data_mapping",
        "reasoning": "HR001 requires license validation, mapped to ProfessionalIds.license_number and ProfessionalIds.license_status for verification"
      }
    }
  ],
  "provider_id": "dr_smith_001",
  "session_id": "dr_smith_001_20241201_143022"
}
```

### Final Decision Reasoning
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "dr_smith_001", "question": "What was the reasoning for the final compliance decision?"}'
```

**Response:**
```json
{
  "answer": "The final compliance decision was COMPLIANT based on the following reasoning: 1) All 5 hard regulations were passed (100% pass rate), which is mandatory for compliance; 2) The provider achieved a weighted average score of 4/5 on soft regulations, indicating strong performance; 3) LLM analysis confirmed all verification checks were successful; 4) No red flags or concerns were identified in the credentialing process. The decision had 100% confidence due to complete data availability and clear regulatory compliance.",
  "confidence": 0.94,
  "sources": [
    {
      "type": "decision",
      "name": "final_compliance_decision",
      "decision": "Compliance Status: COMPLIANT, Score: 4/5",
      "confidence": 1.0,
      "supporting_data": {
        "compliance_status": "COMPLIANT",
        "overall_score": 4,
        "hard_regulations_passed": 5,
        "hard_regulations_total": 5
      }
    },
    {
      "type": "decision",
      "name": "hard_regulations_summary",
      "decision": "5/5 hard regulations passed",
      "confidence": 1.0
    }
  ],
  "provider_id": "dr_smith_001",
  "session_id": "dr_smith_001_20241201_143022"
}
```

## 5. Chat with Specific Session

### Get Sessions First
```bash
curl -X GET "http://localhost:8000/logs/sessions?provider_id=dr_smith_001"
```

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "session_id": "dr_smith_001_20241201_143022",
      "provider_id": "dr_smith_001",
      "start_time": "2024-12-01T14:30:22",
      "end_time": "2024-12-01T14:30:25",
      "total_steps": 12,
      "total_llm_interactions": 15,
      "final_result": {
        "compliance_status": "COMPLIANT",
        "score": 4
      }
    }
  ],
  "count": 1,
  "provider_id": "dr_smith_001",
  "limit": 50
}
```

### Chat with Session ID
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "dr_smith_001", "session_id": "dr_smith_001_20241201_143022", "question": "What specific steps were taken in this credentialing session?"}'
```

**Response:**
```json
{
  "answer": "In this specific credentialing session (dr_smith_001_20241201_143022), the following 12 steps were taken: 1) Provider data retrieval - gathered all 15 data fields; 2) Data mapping initiation - mapped provider data to 8 regulations; 3) Data mapping completion - successfully mapped all required fields; 4) API verification initiation - sent mapped data to credentialing API; 5) API verification completion - received verification results; 6) Hard regulation check initiation - started compliance checks; 7) Regulation checks for HR001-HR005 - each regulation was evaluated; 8) Soft regulation scoring initiation - started scoring process; 9) Scoring for SR001-SR003 - each soft regulation was scored; 10) Final compliance decision - determined overall status; 11) Result creation - compiled final result; 12) Logging completion - saved all session data.",
  "confidence": 0.93,
  "sources": [
    {
      "type": "step",
      "name": "provider_data_retrieval",
      "timestamp": "2024-12-01T14:30:22",
      "data": {
        "provider_id": "dr_smith_001",
        "provider_name": "Dr. John Smith",
        "data_fields_available": 15
      }
    },
    {
      "type": "step",
      "name": "data_mapping_initiation",
      "timestamp": "2024-12-01T14:30:23",
      "data": {
        "regulations_count": 8
      }
    }
  ],
  "provider_id": "dr_smith_001",
  "session_id": "dr_smith_001_20241201_143022"
}
```

## 6. Multiple Providers

### Credential Another Provider
```bash
curl -X POST http://localhost:8000/credential/dr_johnson_002
```

**Response:**
```json
{
  "success": true,
  "provider_id": "dr_johnson_002",
  "result": {
    "provider_id": "dr_johnson_002",
    "score": 5,
    "compliance_status": "COMPLIANT",
    "hard_regulations": {
      "HR001": true,
      "HR002": true,
      "HR003": true,
      "HR004": true,
      "HR005": true
    },
    "soft_regulations": {
      "SR001": 5,
      "SR002": 5,
      "SR003": 5
    },
    "llm_usage": {
      "total_requests": 14,
      "total_tokens": 2400,
      "total_cost": 0.042
    },
    "processing_time": 2.12
  }
}
```

### Chat with Second Provider
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "dr_johnson_002", "question": "What is the compliance status for this provider?"}'
```

**Response:**
```json
{
  "answer": "Dr. Sarah Johnson has a compliance status of COMPLIANT with a perfect score of 5/5. The provider passed all 5 hard regulations and achieved maximum scores on all soft regulations including years of experience (5/5), continuing education (5/5), and quality metrics (5/5). This represents exceptional performance across all credentialing criteria.",
  "confidence": 0.96,
  "sources": [
    {
      "type": "decision",
      "name": "final_compliance_decision",
      "decision": "Compliance Status: COMPLIANT, Score: 5/5",
      "confidence": 1.0
    }
  ],
  "provider_id": "dr_johnson_002",
  "session_id": "dr_johnson_002_20241201_143515"
}
```

## 7. Error Handling Examples

### Non-existent Provider
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "non_existent_provider", "question": "What is the compliance status?"}'
```

**Response:**
```json
{
  "detail": "No credentialing history found for provider non_existent_provider"
}
```

### Non-existent Session
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "dr_smith_001", "session_id": "non_existent_session", "question": "What is the compliance status?"}'
```

**Response:**
```json
{
  "detail": "Session non_existent_session not found for provider dr_smith_001"
}
```

## 8. Additional Endpoints

### Get All Providers
```bash
curl -X GET http://localhost:8000/providers
```

**Response:**
```json
{
  "success": true,
  "providers": [
    {
      "provider_id": "dr_smith_001",
      "name": "Dr. John Smith",
      "specialty": "Internal Medicine",
      "experience_years": 15,
      "education": "Harvard Medical School",
      "license_number": "MD123456"
    },
    {
      "provider_id": "dr_johnson_002",
      "name": "Dr. Sarah Johnson",
      "specialty": "Cardiology",
      "experience_years": 12,
      "education": "Stanford Medical School",
      "license_number": "MD789012"
    }
  ],
  "count": 2
}
```

### Get Credentialing Results
```bash
curl -X GET http://localhost:8000/results/dr_smith_001
```

**Response:**
```json
{
  "success": true,
  "result": {
    "provider_id": "dr_smith_001",
    "score": 4,
    "compliance_status": "COMPLIANT",
    "hard_regulations": {
      "HR001": true,
      "HR002": true,
      "HR003": true,
      "HR004": true,
      "HR005": true
    },
    "soft_regulations": {
      "SR001": 5,
      "SR002": 4,
      "SR003": 3
    },
    "llm_usage": {
      "total_requests": 15,
      "total_tokens": 2500,
      "total_cost": 0.045
    },
    "processing_time": 2.34
  }
}
```

### Get Credentialing History
```bash
curl -X GET "http://localhost:8000/logs/credentialing-history?provider_id=dr_smith_001"
```

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "session_id": "dr_smith_001_20241201_143022",
      "provider_id": "dr_smith_001",
      "total_steps": 12,
      "total_llm_interactions": 15,
      "total_decisions": 8,
      "start_time": "2024-12-01T14:30:22",
      "end_time": "2024-12-01T14:30:25",
      "final_result": {
        "compliance_status": "COMPLIANT",
        "score": 4
      }
    }
  ],
  "count": 1,
  "provider_id": "dr_smith_001"
}
```

### Get LLM Reasoning
```bash
curl -X GET "http://localhost:8000/logs/llm-reasoning/dr_smith_001"
```

**Response:**
```json
{
  "success": true,
  "llm_reasoning": [
    {
      "type": "data_mapping",
      "timestamp": "2024-12-01T14:30:24",
      "prompt": "Map the following healthcare provider data to the regulatory requirements...",
      "response": "{\"HR001\": {\"data_fields\": [\"license_number\", \"license_status\"], \"extracted_values\": {\"license_number\": \"MD123456\", \"license_status\": \"Active\"}}}",
      "reasoning": "Detailed explanation of how each regulation was mapped to provider data fields...",
      "data_points": {
        "mapped_data": {
          "HR001": {
            "data_fields": ["license_number", "license_status"],
            "extracted_values": {
              "license_number": "MD123456",
              "license_status": "Active"
            }
          }
        }
      }
    }
  ],
  "count": 15,
  "provider_id": "dr_smith_001"
}
```

### Get Statistics
```bash
curl -X GET http://localhost:8000/stats/credentialing
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_providers": 2,
    "compliant_providers": 2,
    "non_compliant_providers": 0,
    "compliance_rate": 1.0,
    "average_score": 4.5,
    "score_distribution": {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 1,
      "5": 1
    }
  }
}
```

### Get LLM Usage Stats
```bash
curl -X GET http://localhost:8000/stats/llm-usage
```

**Response:**
```json
{
  "success": true,
  "llm_usage": {
    "total_requests": 29,
    "total_tokens": 4900,
    "total_cost": 0.087
  }
}
```

## 9. Batch Operations

### Batch Credentialing
```bash
curl -X POST http://localhost:8000/batch-credential \
  -H "Content-Type: application/json" \
  -d '["dr_smith_001", "dr_johnson_002", "dr_williams_003"]'
```

**Response:**
```json
{
  "success": true,
  "batch_results": {
    "dr_smith_001": {
      "success": true,
      "result": {
        "provider_id": "dr_smith_001",
        "score": 4,
        "compliance_status": "COMPLIANT"
      }
    },
    "dr_johnson_002": {
      "success": true,
      "result": {
        "provider_id": "dr_johnson_002",
        "score": 5,
        "compliance_status": "COMPLIANT"
      }
    },
    "dr_williams_003": {
      "success": true,
      "result": {
        "provider_id": "dr_williams_003",
        "score": 3,
        "compliance_status": "COMPLIANT"
      }
    }
  },
  "total_processed": 3
}
```

## 10. Search Providers

### Search by Specialty
```bash
curl -X GET "http://localhost:8000/providers/search?specialty=Internal%20Medicine"
```

**Response:**
```json
{
  "success": true,
  "providers": [
    {
      "provider_id": "dr_smith_001",
      "name": "Dr. John Smith",
      "specialty": "Internal Medicine",
      "experience_years": 15,
      "education": "Harvard Medical School",
      "license_number": "MD123456"
    }
  ],
  "count": 1,
  "search_criteria": {
    "specialty": "Internal Medicine",
    "min_experience": null,
    "location": null
  }
}
```

### Search by Experience
```bash
curl -X GET "http://localhost:8000/providers/search?min_experience=10"
```

**Response:**
```json
{
  "success": true,
  "providers": [
    {
      "provider_id": "dr_smith_001",
      "name": "Dr. John Smith",
      "specialty": "Internal Medicine",
      "experience_years": 15,
      "education": "Harvard Medical School",
      "license_number": "MD123456"
    },
    {
      "provider_id": "dr_johnson_002",
      "name": "Dr. Sarah Johnson",
      "specialty": "Cardiology",
      "experience_years": 12,
      "education": "Stanford Medical School",
      "license_number": "MD789012"
    }
  ],
  "count": 2,
  "search_criteria": {
    "specialty": null,
    "min_experience": 10,
    "location": null
  }
}
```

## 11. Logging Endpoints

### Get All Sessions
```bash
curl -X GET "http://localhost:8000/logs/sessions"
```

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "session_id": "dr_smith_001_20241201_143022",
      "provider_id": "dr_smith_001",
      "start_time": "2024-12-01T14:30:22",
      "end_time": "2024-12-01T14:30:25",
      "total_steps": 12,
      "total_llm_interactions": 15,
      "final_result": {
        "compliance_status": "COMPLIANT",
        "score": 4
      }
    },
    {
      "session_id": "dr_johnson_002_20241201_143515",
      "provider_id": "dr_johnson_002",
      "start_time": "2024-12-01T14:35:15",
      "end_time": "2024-12-01T14:35:18",
      "total_steps": 12,
      "total_llm_interactions": 14,
      "final_result": {
        "compliance_status": "COMPLIANT",
        "score": 5
      }
    }
  ],
  "count": 2,
  "provider_id": null,
  "limit": 50
}
```

### Get Specific Session Log
```bash
curl -X GET "http://localhost:8000/logs/session/dr_smith_001_20241201_143022"
```

**Response:**
```json
{
  "success": true,
  "session_log": {
    "session_id": "dr_smith_001_20241201_143022",
    "provider_id": "dr_smith_001",
    "start_time": "2024-12-01T14:30:22",
    "steps": [
      {
        "step_name": "provider_data_retrieval",
        "timestamp": "2024-12-01T14:30:22",
        "data": {
          "provider_id": "dr_smith_001",
          "provider_name": "Dr. John Smith",
          "data_fields_available": 15
        },
        "llm_reasoning": "Retrieving provider data for dr_smith_001"
      }
    ],
    "llm_reasoning": [
      {
        "type": "data_mapping",
        "timestamp": "2024-12-01T14:30:24",
        "prompt": "Map the following healthcare provider data...",
        "response": "{\"HR001\": {...}}",
        "reasoning": "Detailed reasoning for data mapping...",
        "data_points": {
          "mapped_data": {
            "HR001": {
              "data_fields": ["license_number", "license_status"],
              "extracted_values": {
                "license_number": "MD123456",
                "license_status": "Active"
              }
            }
          }
        }
      }
    ],
    "decisions": [
      {
        "type": "final_compliance_decision",
        "decision": "Compliance Status: COMPLIANT, Score: 4/5",
        "reasoning": "Provider is compliant with a score of 4/5. Compliance based on 5/5 hard regulations passed.",
        "supporting_data": {
          "compliance_status": "COMPLIANT",
          "overall_score": 4,
          "hard_regulations_passed": 5,
          "hard_regulations_total": 5
        },
        "confidence": 1.0,
        "timestamp": "2024-12-01T14:30:25"
      }
    ],
    "data_points": {
      "provider_data_retrieval": {
        "timestamp": "2024-12-01T14:30:22",
        "data": {
          "provider_name": "Dr. John Smith",
          "provider_specialty": "Internal Medicine",
          "provider_experience": 15,
          "data_fields_available": 15
        }
      }
    },
    "final_result": {
      "timestamp": "2024-12-01T14:30:25",
      "result": {
        "provider_id": "dr_smith_001",
        "score": 4,
        "compliance_status": "COMPLIANT"
      }
    },
    "end_time": "2024-12-01T14:30:25"
  }
}
```

### Get Decision Reasoning
```bash
curl -X GET "http://localhost:8000/logs/decision-reasoning/dr_smith_001?decision_type=final_compliance_decision"
```

**Response:**
```json
{
  "success": true,
  "reasoning": [
    {
      "type": "final_compliance_decision",
      "decision": "Compliance Status: COMPLIANT, Score: 4/5",
      "reasoning": "Provider is compliant with a score of 4/5. Compliance based on 5/5 hard regulations passed.",
      "supporting_data": {
        "compliance_status": "COMPLIANT",
        "overall_score": 4,
        "hard_regulations_passed": 5,
        "hard_regulations_total": 5
      },
      "confidence": 1.0,
      "timestamp": "2024-12-01T14:30:25"
    }
  ],
  "count": 1,
  "provider_id": "dr_smith_001",
  "decision_type": "final_compliance_decision"
}
```

### Get Audit Trail
```bash
curl -X GET "http://localhost:8000/logs/audit-trail"
```

**Response:**
```json
{
  "success": true,
  "audit_events": [
    {
      "timestamp": "2024-12-01T14:30:22",
      "event_type": "credentialing_started",
      "event_data": {
        "provider_id": "dr_smith_001",
        "timestamp": 1701441022.123
      }
    },
    {
      "timestamp": "2024-12-01T14:30:25",
      "event_type": "credentialing_completed",
      "event_data": {
        "provider_id": "dr_smith_001",
        "compliance_status": "COMPLIANT",
        "score": 4,
        "processing_time": 2.34,
        "session_id": "dr_smith_001_20241201_143022"
      }
    }
  ],
  "count": 2,
  "event_type": null,
  "limit": 100
}
```

### Get Chatbot Training Data
```bash
curl -X GET "http://localhost:8000/logs/chatbot-training-data"
```

**Response:**
```json
{
  "success": true,
  "training_data": [
    {
      "timestamp": "2024-12-01T14:30:25",
      "question": "What is the compliance status for dr_smith_001?",
      "answer": "Provider dr_smith_001 has a compliance status of COMPLIANT with a score of 4/5.",
      "context": {
        "provider_id": "dr_smith_001",
        "compliance_status": "COMPLIANT",
        "score": 4
      }
    },
    {
      "timestamp": "2024-12-01T14:30:25",
      "question": "Why did dr_smith_001 receive a score of 4/5?",
      "answer": "The provider received a score of 4/5 based on their performance across soft regulations including years of experience, continuing education compliance, and quality metrics.",
      "context": {
        "provider_id": "dr_smith_001",
        "score": 4,
        "soft_regulations": {
          "SR001": 5,
          "SR002": 4,
          "SR003": 3
        }
      }
    }
  ],
  "count": 2,
  "limit": 100
}
```

## Tips

1. **Replace Session IDs**: Use actual session IDs from the `/logs/sessions` endpoint
2. **Modify Provider IDs**: Change `dr_smith_001` to other provider IDs as needed
3. **Customize Questions**: Modify the questions in the chat endpoint for different queries
4. **Check Status Codes**: Monitor HTTP status codes for error handling
5. **Use Pretty Print**: Add `| jq '.'` to format JSON responses nicely
6. **Handle Errors**: Check for error responses and handle them appropriately in your application

## Quick Test Script

Run the complete test script:
```bash
chmod +x curl_examples.sh
./curl_examples.sh
```

## 12. Report Generation Endpoints

### Get Credentialing Report
```bash
curl -X GET http://localhost:8000/get-report/dr_smith_001
```

**Response:**
```json
{
  "success": true,
  "provider_id": "dr_smith_001",
  "report_id": "dr_smith_001_latest_1706123456",
  "report": {
    "report_id": "dr_smith_001_latest_1706123456",
    "provider_id": "dr_smith_001",
    "generation_date": 1706123456.789,
    "executive_summary": {
      "compliance_status": "COMPLIANT",
      "overall_score": 4,
      "key_findings": [
        "Provider meets all hard regulatory requirements",
        "Strong performance in experience and education metrics",
        "Minor improvement needed in continuing education"
      ],
      "recommendation_level": "LOW"
    },
    "process_overview": {
      "total_steps": 12,
      "processing_time": 2.34,
      "llm_interactions": 15,
      "data_mapping_quality": "Excellent mapping achieved for all regulations"
    },
    "hard_regulations": {
      "total_regulations": 5,
      "passed_regulations": 5,
      "failed_regulations": 0,
      "detailed_analysis": [
        {
          "regulation_id": "HR001",
          "status": "PASS",
          "reasoning": "Valid medical license verified through API",
          "data_used": "License number MD123456, Status: Active",
          "confidence": 0.95
        }
      ]
    },
    "soft_regulations": {
      "average_score": 4.0,
      "total_possible_score": 15,
      "detailed_scoring": [
        {
          "regulation_id": "SR001",
          "score": 5,
          "max_score": 5,
          "reasoning": "15+ years experience exceeds requirement",
          "improvement_areas": []
        }
      ]
    },
    "data_quality": {
      "completeness_score": 0.95,
      "mapping_accuracy": 0.98,
      "verification_success": 0.92,
      "missing_data": [],
      "quality_issues": ["Minor formatting inconsistencies in education data"]
    },
    "llm_analysis": {
      "overall_performance": "Excellent",
      "reasoning_quality": 0.92,
      "decision_confidence": 0.89,
      "areas_of_strength": ["Data mapping", "Regulatory analysis"],
      "areas_for_improvement": ["Edge case handling"]
    },
    "recommendations": {
      "immediate_actions": [],
      "improvement_areas": ["Update continuing education records"],
      "follow_up_required": ["Annual recredentialing in 12 months"],
      "timeline": "Next review due: 2025-12-01"
    },
    "technical_details": {
      "llm_requests": 15,
      "llm_tokens": 2500,
      "llm_cost": 0.045,
      "processing_time": 2.34,
      "errors_encountered": 0
    },
    "report_metadata": {
      "generation_timestamp": 1706123456.789,
      "llm_model": "anthropic.claude-3-sonnet-20240229-v1:0",
      "log_session_id": "dr_smith_001_20250728_174920",
      "llm_tokens_used": 3200,
      "llm_cost": 0.012
    }
  },
  "generation_timestamp": 1706123456.789
}
```

### Get Report with Specific Session
```bash
curl -X GET "http://localhost:8000/get-report/dr_smith_001?session_id=dr_smith_001_20250728_174920"
```

### Generate New Report
```bash
curl -X POST http://localhost:8000/generate-report \
  -H "Content-Type: application/json" \
  -d '{
    "provider_id": "dr_smith_001",
    "session_id": "dr_smith_001_20250728_174920"
  }'
```

### Example: Complete Credentialing with Report
```bash
# 1. Credential a provider (this automatically generates a report)
curl -X POST http://localhost:8000/credential/dr_johnson_002

# 2. Get the detailed report
curl -X GET http://localhost:8000/get-report/dr_johnson_002
```

## Response Format Summary

| Endpoint | Response Type | Key Fields |
|----------|---------------|------------|
| `/health` | Status | status, service, version |
| `/credential/{id}` | Result | success, provider_id, result, report_available |
| `/processed-doctors` | Array | provider_id, name, specialty, compliance_status, score |
| `/chat` | Chat Response | answer, confidence, sources, provider_id, session_id |
| `/get-report/{id}` | Report | success, provider_id, report_id, report, generation_timestamp |
| `/generate-report` | Report | success, provider_id, report_id, report, generation_timestamp |
| `/providers` | Provider List | success, providers, count |
| `/results/{id}` | Result | success, result |
| `/stats/credentialing` | Statistics | success, stats |
| `/logs/sessions` | Session List | success, sessions, count |
| `/logs/session/{id}` | Session Detail | success, session_log | 