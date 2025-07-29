#!/bin/bash

# Healthcare Provider Credentialing Service - CURL Examples
# This script contains curl commands for testing all endpoints

BASE_URL="http://localhost:8000"

echo "🏥 Healthcare Provider Credentialing Service - CURL Examples"
echo "=========================================================="
echo "Base URL: $BASE_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_section() {
    echo -e "${BLUE}$1${NC}"
    echo "=========================================="
}

print_command() {
    echo -e "${YELLOW}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Health Check
print_section "1. Health Check"
print_command "curl -X GET $BASE_URL/health"
echo ""
curl -X GET $BASE_URL/health
echo ""

# 2. Credential a Provider
print_section "2. Credential a Provider"
print_command "curl -X POST $BASE_URL/credential/dr_smith_001"
echo ""
curl -X POST $BASE_URL/credential/dr_smith_001
echo ""

# 3. Get Processed Doctors List
print_section "3. Get Processed Doctors List"
print_command "curl -X GET $BASE_URL/processed-doctors"
echo ""
curl -X GET $BASE_URL/processed-doctors
echo ""

# 4. Chat with Credentialing Data - Basic Questions
print_section "4. Chat with Credentialing Data - Basic Questions"

# Question 1: Compliance Status
print_command "curl -X POST $BASE_URL/chat \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"provider_id\": \"dr_smith_001\", \"question\": \"What is the compliance status for this provider?\"}'"
echo ""
curl -X POST $BASE_URL/chat \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "dr_smith_001", "question": "What is the compliance status for this provider?"}'
echo ""

# Question 2: Score Explanation
print_command "curl -X POST $BASE_URL/chat \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"provider_id\": \"dr_smith_001\", \"question\": \"Why did this provider receive their score?\"}'"
echo ""
curl -X POST $BASE_URL/chat \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "dr_smith_001", "question": "Why did this provider receive their score?"}'
echo ""

# Question 3: Hard Regulations
print_command "curl -X POST $BASE_URL/chat \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"provider_id\": \"dr_smith_001\", \"question\": \"Which hard regulations did this provider pass?\"}'"
echo ""
curl -X POST $BASE_URL/chat \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "dr_smith_001", "question": "Which hard regulations did this provider pass?"}'
echo ""

# 5. Chat with Specific Session
print_section "5. Chat with Specific Session"

# First, get sessions for the provider
print_command "curl -X GET \"$BASE_URL/logs/sessions?provider_id=dr_smith_001\""
echo ""
SESSIONS_RESPONSE=$(curl -s -X GET "$BASE_URL/logs/sessions?provider_id=dr_smith_001")
echo "$SESSIONS_RESPONSE"
echo ""

# Extract session ID (you'll need to replace this with actual session ID from above response)
SESSION_ID="dr_smith_001_20241201_143022"  # Replace with actual session ID

print_command "curl -X POST $BASE_URL/chat \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"provider_id\": \"dr_smith_001\", \"session_id\": \"$SESSION_ID\", \"question\": \"What specific steps were taken in this credentialing session?\"}'"
echo ""
curl -X POST $BASE_URL/chat \
  -H "Content-Type: application/json" \
  -d "{\"provider_id\": \"dr_smith_001\", \"session_id\": \"$SESSION_ID\", \"question\": \"What specific steps were taken in this credentialing session?\"}"
echo ""

# 6. Advanced Chat Questions
print_section "6. Advanced Chat Questions"

# Question about LLM usage
print_command "curl -X POST $BASE_URL/chat \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"provider_id\": \"dr_smith_001\", \"question\": \"How many LLM interactions were used in the credentialing process?\"}'"
echo ""
curl -X POST $BASE_URL/chat \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "dr_smith_001", "question": "How many LLM interactions were used in the credentialing process?"}'
echo ""

# Question about data mapping
print_command "curl -X POST $BASE_URL/chat \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"provider_id\": \"dr_smith_001\", \"question\": \"What data points were mapped to regulation HR001?\"}'"
echo ""
curl -X POST $BASE_URL/chat \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "dr_smith_001", "question": "What data points were mapped to regulation HR001?"}'
echo ""

# Question about reasoning
print_command "curl -X POST $BASE_URL/chat \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"provider_id\": \"dr_smith_001\", \"question\": \"What was the reasoning for the final compliance decision?\"}'"
echo ""
curl -X POST $BASE_URL/chat \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "dr_smith_001", "question": "What was the reasoning for the final compliance decision?"}'
echo ""

# 7. Multiple Providers Chat
print_section "7. Multiple Providers Chat"

# Credential another provider first
print_command "curl -X POST $BASE_URL/credential/dr_johnson_002"
echo ""
curl -X POST $BASE_URL/credential/dr_johnson_002
echo ""

# Chat with the second provider
print_command "curl -X POST $BASE_URL/chat \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"provider_id\": \"dr_johnson_002\", \"question\": \"What is the compliance status for this provider?\"}'"
echo ""
curl -X POST $BASE_URL/chat \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "dr_johnson_002", "question": "What is the compliance status for this provider?"}'
echo ""

# 8. Error Handling Examples
print_section "8. Error Handling Examples"

# Non-existent provider
print_command "curl -X POST $BASE_URL/chat \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"provider_id\": \"non_existent_provider\", \"question\": \"What is the compliance status?\"}'"
echo ""
curl -X POST $BASE_URL/chat \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "non_existent_provider", "question": "What is the compliance status?"}'
echo ""

# Non-existent session
print_command "curl -X POST $BASE_URL/chat \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"provider_id\": \"dr_smith_001\", \"session_id\": \"non_existent_session\", \"question\": \"What is the compliance status?\"}'"
echo ""
curl -X POST $BASE_URL/chat \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "dr_smith_001", "session_id": "non_existent_session", "question": "What is the compliance status?"}'
echo ""

# 9. Additional Endpoints
print_section "9. Additional Endpoints"

# Get all providers
print_command "curl -X GET $BASE_URL/providers"
echo ""
curl -X GET $BASE_URL/providers
echo ""

# Get credentialing results
print_command "curl -X GET $BASE_URL/results/dr_smith_001"
echo ""
curl -X GET $BASE_URL/results/dr_smith_001
echo ""

# Get credentialing history
print_command "curl -X GET \"$BASE_URL/logs/credentialing-history?provider_id=dr_smith_001\""
echo ""
curl -X GET "$BASE_URL/logs/credentialing-history?provider_id=dr_smith_001"
echo ""

# Get LLM reasoning
print_command "curl -X GET \"$BASE_URL/logs/llm-reasoning/dr_smith_001\""
echo ""
curl -X GET "$BASE_URL/logs/llm-reasoning/dr_smith_001"
echo ""

# Get statistics
print_command "curl -X GET $BASE_URL/stats/credentialing"
echo ""
curl -X GET $BASE_URL/stats/credentialing
echo ""

# Report Generation Examples
print_section "12. Report Generation"

print_command "Get credentialing report for dr_smith_001:"
curl -s -X GET "$BASE_URL/get-report/dr_smith_001" | jq '.'
echo ""

print_command "Get report with specific session ID:"
curl -s -X GET "$BASE_URL/get-report/dr_smith_001?session_id=dr_smith_001_20250728_174920" | jq '.'
echo ""

print_command "Generate new report for dr_johnson_002:"
curl -s -X POST "$BASE_URL/generate-report" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_id": "dr_johnson_002",
    "session_id": null
  }' | jq '.'
echo ""

print_command "Complete workflow: Credential provider and get report:"
echo "Step 1: Credential provider (this now automatically generates a report)"
curl -s -X POST "$BASE_URL/credential/dr_williams_003" | jq '.'
echo ""
echo "Step 2: Get the generated report"
curl -s -X GET "$BASE_URL/get-report/dr_williams_003" | jq '.'
echo ""

print_section "Summary"
echo "All curl commands have been executed!"
echo ""
echo "Key endpoints tested:"
echo "✅ Health check"
echo "✅ Provider credentialing"
echo "✅ Processed doctors list"
echo "✅ Chat interface (multiple questions)"
echo "✅ Chat with specific sessions"
echo "✅ Report generation and retrieval"
echo "✅ Error handling"
echo "✅ Additional endpoints"
echo ""
echo "💡 Tips:"
echo "- Replace SESSION_ID with actual session ID from logs/sessions response"
echo "- Modify provider_id and questions as needed"
echo "- Check the response format for integration with your frontend"
echo "- Reports are automatically generated after credentialing"
echo "- Use /get-report/{provider_id} to retrieve existing reports"
echo "- Use /generate-report to create new reports with specific sessions"
echo ""
echo "🚀 Ready to integrate with your frontend application!" 