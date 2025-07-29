"""
Simple report service that doesn't require LLM dependencies for fallback report generation.
"""

import json
import time
from typing import Dict, Any, Optional
from pathlib import Path


class SimpleReportService:
    """Simple report service for generating basic reports from log data"""

    def __init__(self, logs_dir: str = "logs"):
        """Initialize simple report service"""
        self.logs_dir = Path(logs_dir)
        self.reports_dir = self.logs_dir / "reports"
        self.reports_dir.mkdir(exist_ok=True)
        self.reports = {}  # Store generated reports in memory

    def generate_report_from_logs(
        self, provider_id: str, session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a basic report from log files"""
        try:
            # Find the log file
            log_data = self._get_credentialing_logs(provider_id, session_id)

            if not log_data:
                raise ValueError(
                    f"No credentialing logs found for provider {provider_id}"
                )

            # Create basic report
            report = self._create_basic_report(log_data, provider_id)

            # Save report to file
            report_id = f"{provider_id}_{session_id or 'latest'}_{int(time.time())}"
            report_file = self.reports_dir / f"report_{report_id}.json"

            with open(report_file, "w") as f:
                json.dump(report, f, indent=2)

            # Store in memory for quick access
            self.reports[provider_id] = report

            print(f"✅ Report generated and saved to: {report_file}")
            return report

        except Exception as e:
            print(f"❌ Failed to generate report for provider {provider_id}: {str(e)}")
            return None

    def get_report(self, provider_id: str) -> Optional[Dict[str, Any]]:
        """Get existing report for a provider"""
        return self.reports.get(provider_id)

    def _get_credentialing_logs(
        self, provider_id: str, session_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Get credentialing logs for a provider"""
        if session_id:
            # Look for specific session log
            log_file = self.logs_dir / f"credentialing_{session_id}.json"
            if log_file.exists():
                with open(log_file, "r") as f:
                    return json.load(f)
        else:
            # Find the latest log for this provider
            log_files = list(self.logs_dir.glob(f"credentialing_{provider_id}_*.json"))
            if log_files:
                # Sort by modification time (newest first)
                latest_log = sorted(
                    log_files, key=lambda x: x.stat().st_mtime, reverse=True
                )[0]
                with open(latest_log, "r") as f:
                    return json.load(f)

        return None

    def _create_basic_report(
        self, log_data: Dict[str, Any], provider_id: str
    ) -> Dict[str, Any]:
        """Create a basic report from log data"""
        # Extract final result (handle nested structure)
        final_result_data = log_data.get("final_result", {})
        final_result = (
            final_result_data.get("result", {})
            if "result" in final_result_data
            else final_result_data
        )

        # Get soft regulations data
        soft_regs = final_result.get("soft_regulations", {})
        soft_reg_avg = sum(soft_regs.values()) / len(soft_regs) if soft_regs else 0

        # Get hard regulations data
        hard_regs = final_result.get("hard_regulations", {})

        report = {
            "report_id": f"{provider_id}_basic_{int(time.time())}",
            "provider_id": provider_id,
            "generation_date": time.time(),
            "executive_summary": {
                "compliance_status": final_result.get("compliance_status", "UNKNOWN"),
                "overall_score": final_result.get("score", 0),
                "key_findings": [
                    f"Provider passed {sum(hard_regs.values())}/{len(hard_regs)} hard regulations",
                    f"Average soft regulation score: {soft_reg_avg:.2f}/5",
                    "Report generated from credentialing logs",
                ],
                "recommendation_level": (
                    "LOW"
                    if final_result.get("compliance_status") == "COMPLIANT"
                    else "HIGH"
                ),
            },
            "process_overview": {
                "total_steps": len(log_data.get("steps", [])),
                "processing_time": final_result.get("processing_time", 0),
                "llm_interactions": len(log_data.get("llm_reasoning", [])),
                "data_mapping_quality": (
                    "Successfully processed"
                    if final_result.get("score", 0) > 0
                    else "Processing issues detected"
                ),
            },
            "hard_regulations": {
                "total_regulations": len(hard_regs),
                "passed_regulations": sum(hard_regs.values()),
                "failed_regulations": len(hard_regs) - sum(hard_regs.values()),
                "detailed_analysis": [
                    {
                        "regulation_id": reg_id,
                        "status": "PASS" if passed else "FAIL",
                        "reasoning": f"Regulation {reg_id} {'passed' if passed else 'failed'} based on provider data",
                        "confidence": 0.9 if passed else 0.1,
                    }
                    for reg_id, passed in hard_regs.items()
                ],
            },
            "soft_regulations": {
                "average_score": soft_reg_avg,
                "total_possible_score": len(soft_regs) * 5,
                "detailed_scoring": [
                    {
                        "regulation_id": reg_id,
                        "score": score,
                        "max_score": 5,
                        "reasoning": f"Regulation {reg_id} scored {score}/5 based on provider performance",
                        "improvement_areas": (
                            [] if score >= 4 else ["Consider improvement in this area"]
                        ),
                    }
                    for reg_id, score in soft_regs.items()
                ],
            },
            "recommendations": {
                "immediate_actions": (
                    []
                    if final_result.get("compliance_status") == "COMPLIANT"
                    else ["Address compliance issues"]
                ),
                "improvement_areas": ["Maintain current performance levels"],
                "follow_up_required": ["Annual recredentialing review"],
                "timeline": "Next review due: July 2026",
            },
            "technical_details": {
                "processing_time": final_result.get("processing_time", 0),
                "errors_encountered": len(final_result.get("errors", [])),
            },
            "report_metadata": {
                "generation_timestamp": time.time(),
                "generation_method": "basic_from_logs",
                "log_session_id": log_data.get("session_id"),
                "report_type": "basic",
            },
            "note": "This is a basic report generated from credentialing logs without advanced LLM analysis",
        }

        return report


# Test function
def test_simple_report_generation():
    """Test the simple report generation"""
    service = SimpleReportService()
    report = service.generate_report_from_logs("dr_williams_003")

    if report:
        print(f"✅ Report generated: {report['report_id']}")
        print(f"📊 Compliance: {report['executive_summary']['compliance_status']}")
        print(f"📈 Score: {report['executive_summary']['overall_score']}/5")
    else:
        print("❌ Failed to generate report")


if __name__ == "__main__":
    test_simple_report_generation()
