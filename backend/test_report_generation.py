"""
Test script for credentialing report generation functionality.
"""

import asyncio
import requests
import json
from pathlib import Path

# Base URL for the API
BASE_URL = "http://localhost:8000"


def test_credentialing_with_report():
    """Test the credentialing process and report generation"""

    print("Testing Credentialing with Report Generation")
    print("=" * 50)

    # Step 1: Test credentialing a provider
    provider_id = "dr_johnson_002"
    print(f"\n1. Starting credentialing for provider: {provider_id}")

    try:
        response = requests.post(f"{BASE_URL}/credential/{provider_id}")
        if response.status_code == 200:
            result = response.json()
            print("✓ Credentialing completed successfully")
            print(f"  - Compliance Status: {result['result']['compliance_status']}")
            print(f"  - Score: {result['result']['score']}/5")
            print(f"  - Processing Time: {result['result']['processing_time']:.2f}s")

            # Get session ID from logs
            session_id = None
            logs_dir = Path("logs")
            if logs_dir.exists():
                for log_file in logs_dir.glob(f"credentialing_{provider_id}_*.json"):
                    session_id = log_file.stem.replace("credentialing_", "")
                    break

            if session_id:
                print(f"  - Session ID: {session_id}")

                # Step 2: Check if report was generated automatically
                print(f"\n2. Checking for auto-generated report...")
                report_response = requests.get(f"{BASE_URL}/reports/{session_id}")

                if report_response.status_code == 200:
                    report = report_response.json()["report"]
                    print("✓ Report was automatically generated")
                    print(f"  - Report ID: {report['report_metadata']['report_id']}")
                    print(
                        f"  - Generated At: {report['report_metadata']['generated_at']}"
                    )
                    print(
                        f"  - Executive Summary Length: {len(report['executive_summary'])} characters"
                    )
                    print(
                        f"  - Recommendations Count: {len(report['recommendations'])}"
                    )

                    # Step 3: Test manual report generation
                    print(f"\n3. Testing manual report generation...")
                    manual_response = requests.post(
                        f"{BASE_URL}/reports/generate/{session_id}"
                    )

                    if manual_response.status_code == 200:
                        print("✓ Manual report generation successful")
                    else:
                        print(
                            f"✗ Manual report generation failed: {manual_response.status_code}"
                        )

                    # Step 4: Test report listing
                    print(f"\n4. Testing report listing...")
                    list_response = requests.get(f"{BASE_URL}/reports")

                    if list_response.status_code == 200:
                        reports_data = list_response.json()
                        print(f"✓ Found {reports_data['count']} reports")

                        # Show first report summary
                        if reports_data["reports"]:
                            first_report = reports_data["reports"][0]
                            print(f"  - Latest Report: {first_report['report_id']}")
                            print(f"  - Provider: {first_report['provider_id']}")
                            print(f"  - Status: {first_report['compliance_status']}")

                    # Step 5: Test provider-specific reports
                    print(f"\n5. Testing provider-specific reports...")
                    provider_reports_response = requests.get(
                        f"{BASE_URL}/reports/provider/{provider_id}"
                    )

                    if provider_reports_response.status_code == 200:
                        provider_reports = provider_reports_response.json()
                        print(
                            f"✓ Found {provider_reports['count']} reports for {provider_id}"
                        )

                    # Step 6: Test reports summary
                    print(f"\n6. Testing reports summary...")
                    summary_response = requests.get(f"{BASE_URL}/reports/summary")

                    if summary_response.status_code == 200:
                        summary = summary_response.json()["summary"]
                        print(f"✓ Reports summary generated")
                        print(f"  - Total Reports: {summary['total_reports']}")
                        print(
                            f"  - Compliance Stats: {summary['compliance_statistics']}"
                        )
                        print(
                            f"  - Score Distribution: {summary['score_distribution']}"
                        )

                    # Step 7: Display sample report content
                    print(f"\n7. Sample Report Content:")
                    print("-" * 30)
                    print(f"Executive Summary (first 200 chars):")
                    print(f"{report['executive_summary'][:200]}...")

                    if report.get("recommendations"):
                        print(f"\nFirst Recommendation:")
                        first_rec = report["recommendations"][0]
                        if isinstance(first_rec, dict):
                            print(f"  - Category: {first_rec.get('category', 'N/A')}")
                            print(f"  - Priority: {first_rec.get('priority', 'N/A')}")
                            print(f"  - Action: {str(first_rec)[:100]}...")

                    print(f"\nCompliance Assessment:")
                    compliance = report.get("compliance_assessment", {})
                    if isinstance(compliance, dict):
                        print(f"  - Risk Level: {compliance.get('risk_level', 'N/A')}")
                        print(
                            f"  - Overall Status: {compliance.get('overall_compliance_status', 'N/A')}"
                        )

                else:
                    print(
                        f"✗ Report not found or not generated: {report_response.status_code}"
                    )

                    # Try manual generation
                    print(f"\n2b. Trying manual report generation...")
                    manual_response = requests.post(
                        f"{BASE_URL}/reports/generate/{session_id}"
                    )

                    if manual_response.status_code == 200:
                        print("✓ Manual report generation successful")
                        report = manual_response.json()["report"]
                        print(
                            f"  - Report ID: {report['report_metadata']['report_id']}"
                        )
                    else:
                        print(
                            f"✗ Manual report generation failed: {manual_response.status_code}"
                        )
                        print(f"Error: {manual_response.text}")
            else:
                print("✗ Could not find session ID in logs")
        else:
            print(f"✗ Credentialing failed: {response.status_code}")
            print(f"Error: {response.text}")

    except requests.exceptions.ConnectionError:
        print(
            "✗ Could not connect to the API. Make sure the server is running on http://localhost:8000"
        )
    except Exception as e:
        print(f"✗ Test failed with error: {str(e)}")


def test_report_features():
    """Test additional report features"""

    print("\n\nTesting Additional Report Features")
    print("=" * 40)

    try:
        # Test health check
        health_response = requests.get(f"{BASE_URL}/health")
        if health_response.status_code == 200:
            print("✓ API is healthy")

        # Test providers endpoint
        providers_response = requests.get(f"{BASE_URL}/providers")
        if providers_response.status_code == 200:
            providers_data = providers_response.json()
            print(f"✓ Found {providers_data['count']} providers")

        # Test getting reports list
        reports_response = requests.get(f"{BASE_URL}/reports")
        if reports_response.status_code == 200:
            reports_data = reports_response.json()
            print(
                f"✓ Reports endpoint working - {reports_data['count']} reports available"
            )

            # Show file structure
            print(f"\n8. Checking logs directory structure...")
            logs_dir = Path("logs")
            if logs_dir.exists():
                print(f"✓ Logs directory exists")

                # Check for JSON logs
                json_files = list(logs_dir.glob("credentialing_*.json"))
                print(f"  - JSON log files: {len(json_files)}")

                # Check for reports directory
                reports_dir = logs_dir / "reports"
                if reports_dir.exists():
                    report_files = list(reports_dir.glob("credentialing_report_*.json"))
                    print(f"  - Generated report files: {len(report_files)}")

                    if report_files:
                        print(f"  - Latest report file: {report_files[-1].name}")
                else:
                    print("  - Reports directory not found")
            else:
                print("✗ Logs directory not found")

    except Exception as e:
        print(f"✗ Additional tests failed: {str(e)}")


if __name__ == "__main__":
    test_credentialing_with_report()
    test_report_features()

    print("\n\nTest completed!")
    print("Check the 'logs/reports/' directory for generated report files.")
