"""
Report service for generating comprehensive credentialing reports using LLM analysis.
"""

import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
from utils.llm_async.unified_llm import LLMProvider
from services.provider_service import ProviderService
from utils.logger import audit_logger
from config.settings import settings


class ReportService:
    """Service for generating comprehensive credentialing reports"""

    def __init__(self):
        """Initialize report service"""
        self.llm_provider = LLMProvider()
        self.provider_service = ProviderService()
        self.logs_dir = Path(settings.LOGS_DIR)
        self.reports_dir = self.logs_dir / "reports"
        self.reports_dir.mkdir(exist_ok=True)

    def generate_credentialing_report(
        self, provider_id: str, session_id: str
    ) -> Dict[str, Any]:
        """Generate a comprehensive credentialing report for a specific session"""
        try:
            # Load session log with all data
            session_log = self._load_session_log(session_id)
            if not session_log:
                raise ValueError(f"Session log not found for session {session_id}")

            # Get provider information
            provider = self.provider_service.get_provider(provider_id)
            if not provider:
                raise ValueError(f"Provider {provider_id} not found")

            # Get all available data for comprehensive analysis
            comprehensive_data = self._gather_comprehensive_data(session_log, provider)

            # Generate comprehensive report using LLM
            markdown_report = self._generate_comprehensive_report(comprehensive_data)

            # Save report as markdown file
            report_filename = f"comprehensive_credentialing_report_{session_id}.md"
            report_file = self.reports_dir / report_filename

            with open(report_file, "w") as f:
                f.write(markdown_report)

            # Generate JSON summary for programmatic access
            json_summary = self._generate_json_summary(comprehensive_data)
            json_filename = f"credentialing_summary_{session_id}.json"
            json_file = self.reports_dir / json_filename

            with open(json_file, "w") as f:
                json.dump(json_summary, f, indent=2, default=str)

            # Log audit event
            audit_logger.log_audit_event(
                "comprehensive_report_generated",
                {
                    "provider_id": provider_id,
                    "session_id": session_id,
                    "report_file": str(report_file),
                    "json_summary": str(json_file),
                    "timestamp": datetime.now().isoformat(),
                },
            )

            return {
                "report_id": f"RPT_{session_id}",
                "report_file": str(report_file),
                "json_summary": str(json_file),
                "generated_at": datetime.now().isoformat(),
                "session_id": session_id,
                "provider_id": provider_id,
                "report_metadata": json_summary.get("metadata", {}),
            }

        except Exception as e:
            error_msg = f"Failed to generate comprehensive report for session {session_id}: {str(e)}"
            audit_logger.log_audit_event(
                "comprehensive_report_generation_failed",
                {
                    "provider_id": provider_id,
                    "session_id": session_id,
                    "error": str(e),
                    "timestamp": datetime.now().isoformat(),
                },
            )
            raise Exception(error_msg)

    def _load_session_log(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Load session log from file"""
        log_file = self.logs_dir / f"credentialing_{session_id}.json"

        if not log_file.exists():
            return None

        try:
            with open(log_file, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading session log: {e}")
            return None

    def _gather_comprehensive_data(
        self, session_log: Dict[str, Any], provider: Any
    ) -> Dict[str, Any]:
        """Gather all available data for comprehensive analysis"""
        
        # Get provider data
        provider_data = provider.get_all_data()
        
        # Extract all logged information
        steps = session_log.get("steps", [])
        llm_reasoning = session_log.get("llm_reasoning", [])
        data_points = session_log.get("data_points", {})
        decisions = session_log.get("decisions", [])
        final_result = session_log.get("final_result", {})
        
        # Get credentialing history
        credentialing_history = audit_logger.get_credentialing_history(provider.provider_id)
        
        # Get decision reasoning
        decision_reasoning = {}
        for decision in decisions:
            decision_type = decision.get("decision_type", "unknown")
            reasoning = audit_logger.get_decision_reasoning(
                provider.provider_id, decision_type
            )
            decision_reasoning[decision_type] = reasoning

        return {
            "session_metadata": {
                "session_id": session_log.get("session_id"),
                "provider_id": session_log.get("provider_id"),
                "start_time": session_log.get("start_time"),
                "end_time": session_log.get("end_time"),
                "total_steps": len(steps),
                "total_llm_interactions": len(llm_reasoning),
                "total_decisions": len(decisions),
            },
            "provider_info": {
                "name": provider.PersonalInfo.name,
                "specialty": provider.Specialties.primary_specialty,
                "experience_years": provider.WorkHistory.years_experience,
                "education": provider.Educations.medical_school,
                "license_number": provider.ProfessionalIds.license_number,
                "board_certifications": provider.BoardCertifications.board_certifications,
                "malpractice_insurance": provider.PLIs.malpractice_insurance,
                "disciplinary_actions": provider.Disclosure.disciplinary_actions,
                "criminal_record": provider.Disclosure.criminal_record,
                "cme_credits": provider.ContinuingEducation.cme_credits,
                "quality_score": provider.QualityMetrics.quality_score,
            },
            "process_steps": steps,
            "llm_reasoning": llm_reasoning,
            "data_points": data_points,
            "decisions": decisions,
            "decision_reasoning": decision_reasoning,
            "final_result": final_result,
            "credentialing_history": credentialing_history,
            "raw_provider_data": provider_data,
        }

    def _generate_comprehensive_report(self, comprehensive_data: Dict[str, Any]) -> str:
        """Generate a comprehensive report using LLM analysis of all data"""
        
        # Create a detailed prompt for the LLM with all available data
        prompt = self._create_comprehensive_prompt(comprehensive_data)
        
        try:
            # Use LLM to generate comprehensive report
            response = self.llm_provider.generate(prompt)
            markdown_content = response.content
            
            # Add header with metadata
            report_header = self._create_report_header(comprehensive_data)
            
            return report_header + markdown_content
            
        except Exception as e:
            # Fallback to enhanced template if LLM fails
            return self._generate_enhanced_template(comprehensive_data)

    def _create_comprehensive_prompt(self, data: Dict[str, Any]) -> str:
        """Create a comprehensive prompt for LLM analysis"""
        
        session_meta = data["session_metadata"]
        provider_info = data["provider_info"]
        final_result = data["final_result"].get("result", {})
        
        prompt = f"""
You are a senior healthcare credentialing analyst. Generate a comprehensive, professional credentialing report based on the following detailed data.

## SESSION INFORMATION
- Session ID: {session_meta['session_id']}
- Provider ID: {session_meta['provider_id']}
- Process Duration: {len(data['process_steps'])} steps completed
- LLM Interactions: {session_meta['total_llm_interactions']} AI-powered analyses
- Total Decisions: {session_meta['total_decisions']} automated decisions

## PROVIDER PROFILE
- Name: {provider_info['name']}
- Specialty: {provider_info['specialty']}
- Experience: {provider_info['experience_years']} years
- Education: {provider_info['education']}
- License: {provider_info['license_number']}
- Board Certifications: {len(provider_info['board_certifications'])} active certifications
- Malpractice Insurance: {provider_info['malpractice_insurance']}
- CME Credits: {provider_info['cme_credits']} credits
- Quality Score: {provider_info['quality_score']}/5
- Disciplinary Actions: {len(provider_info['disciplinary_actions'])} on record
- Criminal Record: {provider_info['criminal_record']}

## CREDENTIALING RESULTS
- Compliance Status: {final_result.get('compliance_status', 'Unknown')}
- Overall Score: {final_result.get('score', 'Unknown')}/5
- Processing Time: {final_result.get('processing_time', 'Unknown')} seconds

## DETAILED PROCESS ANALYSIS
{json.dumps(data['process_steps'], indent=2, default=str)}

## LLM REASONING AND ANALYSIS
{json.dumps(data['llm_reasoning'], indent=2, default=str)}

## DECISION LOGIC
{json.dumps(data['decisions'], indent=2, default=str)}

## REGULATION COMPLIANCE
Hard Regulations: {json.dumps(final_result.get('hard_regulations', {}), indent=2)}
Soft Regulations: {json.dumps(final_result.get('soft_regulations', {}), indent=2)}

## CREDENTIALING HISTORY
{json.dumps(data['credentialing_history'], indent=2, default=str)}

Please generate a comprehensive, professional markdown report that includes:

1. **Executive Summary** - High-level compliance status and key findings
2. **Provider Assessment** - Detailed analysis of qualifications, experience, and background
3. **Compliance Analysis** - Detailed breakdown of regulation compliance with reasoning
4. **Risk Assessment** - Identification of potential risks and concerns
5. **Process Transparency** - Summary of the credentialing process and AI reasoning
6. **Recommendations** - Specific actions and next steps
7. **Quality Assurance** - Confidence in the assessment and areas for review
8. **Historical Context** - Comparison with previous credentialing cycles

The report should be:
- Professional and suitable for healthcare administration
- Data-driven with specific evidence and reasoning
- Actionable with clear recommendations
- Transparent about the AI-powered analysis process
- Comprehensive yet concise

Format as clean markdown with proper headers, bullet points, tables where appropriate, and professional language.
"""

        return prompt

    def _create_report_header(self, data: Dict[str, Any]) -> str:
        """Create report header with metadata"""
        
        session_meta = data["session_metadata"]
        provider_info = data["provider_info"]
        
        return f"""# Comprehensive Credentialing Report

**Provider:** {provider_info['name']}  
**Session ID:** {session_meta['session_id']}  
**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  
**Report ID:** RPT_{session_meta['session_id']}  
**Process Steps:** {session_meta['total_steps']}  
**AI Analysis:** {session_meta['total_llm_interactions']} interactions  
**Automated Decisions:** {session_meta['total_decisions']}

---

"""

    def _generate_enhanced_template(self, data: Dict[str, Any]) -> str:
        """Generate an enhanced template if LLM fails"""
        
        session_meta = data["session_metadata"]
        provider_info = data["provider_info"]
        final_result = data["final_result"].get("result", {})
        steps = data["process_steps"]
        decisions = data["decisions"]
        
        compliance_status = final_result.get("compliance_status", "Unknown")
        score = final_result.get("score", 0)
        
        # Analyze process steps
        step_summary = self._analyze_process_steps(steps)
        
        # Analyze decisions
        decision_summary = self._analyze_decisions(decisions)
        
        return f"""# Comprehensive Credentialing Report

**Provider:** {provider_info['name']}  
**Session ID:** {session_meta['session_id']}  
**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  
**Report ID:** RPT_{session_meta['session_id']}  
**Process Steps:** {session_meta['total_steps']}  
**AI Analysis:** {session_meta['total_llm_interactions']} interactions  
**Automated Decisions:** {session_meta['total_decisions']}

---

## Executive Summary

{provider_info['name']} has completed the comprehensive credentialing process with a status of **{compliance_status}** and an overall score of **{score}/5**. The process involved {session_meta['total_steps']} automated steps with {session_meta['total_llm_interactions']} AI-powered analyses.

## Provider Assessment

### Basic Information
- **Name:** {provider_info['name']}
- **Specialty:** {provider_info['specialty']}
- **Experience:** {provider_info['experience_years']} years
- **Education:** {provider_info['education']}
- **License Number:** {provider_info['license_number']}

### Professional Qualifications
- **Board Certifications:** {len(provider_info['board_certifications'])} active certifications
- **Malpractice Insurance:** {provider_info['malpractice_insurance']}
- **CME Credits:** {provider_info['cme_credits']} credits (current cycle)
- **Quality Score:** {provider_info['quality_score']}/5 (performance metrics)

### Background Check Results
- **Disciplinary Actions:** {len(provider_info['disciplinary_actions'])} on record
- **Criminal Record:** {provider_info['criminal_record']}

## Compliance Analysis

### Overall Status
- **Compliance Status:** {compliance_status}
- **Overall Score:** {score}/5
- **Processing Time:** {final_result.get('processing_time', 'Unknown')} seconds

### Hard Regulations Compliance
{self._format_regulations_markdown(final_result.get('hard_regulations', {}))}

### Soft Regulations Scoring
{self._format_regulations_markdown(final_result.get('soft_regulations', {}), is_scored=True)}

## Process Transparency

### Credentialing Process Steps
{step_summary}

### Automated Decision Summary
{decision_summary}

### AI Analysis Insights
- **Total LLM Interactions:** {session_meta['total_llm_interactions']}
- **Data Mapping Quality:** {self._calculate_data_mapping_quality(data)}
- **Verification Confidence:** {self._get_verification_confidence(data)}

## Risk Assessment

### Identified Risks
{self._assess_risks(provider_info, final_result)}

### Risk Mitigation Recommendations
{self._generate_risk_mitigation_recommendations(provider_info, final_result)}

## Recommendations

### Immediate Actions
{self._generate_immediate_recommendations(compliance_status, score)}

### Ongoing Monitoring
- Regular review of license and certification status
- Quarterly performance metric assessment
- Annual comprehensive re-credentialing
- Continuous monitoring of disciplinary actions

### Quality Assurance
- Review AI reasoning for transparency
- Validate critical decisions through manual review
- Monitor system performance and accuracy

## Next Steps

1. {'✅ Proceed with onboarding process' if compliance_status == 'COMPLIANT' else '❌ Address compliance issues before proceeding'}
2. Schedule follow-up review in 6 months
3. Monitor upcoming license/certification renewals
4. Establish performance monitoring protocols

---

*Report generated by AI-powered credentialing system with comprehensive data analysis*
"""

    def _analyze_process_steps(self, steps: List[Dict]) -> str:
        """Analyze and summarize process steps"""
        if not steps:
            return "- No process steps recorded"
        
        step_types = {}
        for step in steps:
            step_name = step.get("step_name", "unknown")
            step_types[step_name] = step_types.get(step_name, 0) + 1
        
        summary = []
        for step_name, count in step_types.items():
            summary.append(f"- **{step_name}:** {count} execution(s)")
        
        return "\n".join(summary)

    def _analyze_decisions(self, decisions: List[Dict]) -> str:
        """Analyze and summarize decisions"""
        if not decisions:
            return "- No decisions recorded"
        
        decision_types = {}
        for decision in decisions:
            decision_type = decision.get("decision_type", "unknown")
            decision_types[decision_type] = decision_types.get(decision_type, 0) + 1
        
        summary = []
        for decision_type, count in decision_types.items():
            summary.append(f"- **{decision_type}:** {count} decision(s)")
        
        return "\n".join(summary)

    def _calculate_data_mapping_quality(self, data: Dict[str, Any]) -> str:
        """Calculate data mapping quality from process steps"""
        steps = data.get("process_steps", [])
        for step in steps:
            if step.get("step_name") == "data_mapping_complete":
                step_data = step.get("data", {})
                quality = step_data.get("mapping_quality", 0)
                return f"{quality:.1%}"
        return "Unknown"

    def _get_verification_confidence(self, data: Dict[str, Any]) -> str:
        """Get verification confidence from process steps"""
        steps = data.get("process_steps", [])
        for step in steps:
            if step.get("step_name") == "api_verification_complete":
                step_data = step.get("data", {})
                confidence = step_data.get("confidence", 0)
                return f"{confidence:.1%}"
        return "Unknown"

    def _assess_risks(self, provider_info: Dict, final_result: Dict) -> str:
        """Assess risks based on provider information and results"""
        risks = []
        
        if len(provider_info["disciplinary_actions"]) > 0:
            risks.append("- **Disciplinary History:** Previous disciplinary actions require careful review")
        
        if provider_info["criminal_record"] != "Clean":
            risks.append("- **Criminal Record:** Criminal history requires additional scrutiny")
        
        if provider_info["malpractice_insurance"] != "Active":
            risks.append("- **Insurance Status:** Malpractice insurance not active")
        
        if len(provider_info["board_certifications"]) == 0:
            risks.append("- **Board Certification:** No board certifications found")
        
        if provider_info["cme_credits"] < 50:
            risks.append("- **CME Compliance:** Low continuing education credits")
        
        if provider_info["quality_score"] < 3.0:
            risks.append("- **Quality Metrics:** Below-average performance scores")
        
        if not risks:
            risks.append("- **No significant risks identified**")
        
        return "\n".join(risks)

    def _generate_risk_mitigation_recommendations(self, provider_info: Dict, final_result: Dict) -> str:
        """Generate risk mitigation recommendations"""
        recommendations = []
        
        if len(provider_info["disciplinary_actions"]) > 0:
            recommendations.append("- Conduct detailed review of disciplinary history")
        
        if provider_info["criminal_record"] != "Clean":
            recommendations.append("- Obtain detailed criminal background report")
        
        if provider_info["malpractice_insurance"] != "Active":
            recommendations.append("- Verify malpractice insurance status and coverage")
        
        if len(provider_info["board_certifications"]) == 0:
            recommendations.append("- Encourage pursuit of board certification")
        
        if provider_info["cme_credits"] < 50:
            recommendations.append("- Monitor CME compliance and provide support")
        
        if provider_info["quality_score"] < 3.0:
            recommendations.append("- Implement performance improvement plan")
        
        if not recommendations:
            recommendations.append("- Continue standard monitoring protocols")
        
        return "\n".join(recommendations)

    def _generate_immediate_recommendations(self, compliance_status: str, score: int) -> str:
        """Generate immediate recommendations based on compliance status"""
        if compliance_status == "COMPLIANT":
            return "- ✅ Approve provider for practice\n- Schedule regular monitoring\n- Proceed with onboarding"
        elif compliance_status == "NON_COMPLIANT":
            return "- ❌ Address compliance issues before approval\n- Review failed regulations\n- Develop corrective action plan"
        else:
            return "- ⚠️ Manual review required\n- Investigate compliance status\n- Gather additional information"

    def _format_regulations_markdown(
        self, regulations: Dict, is_scored: bool = False
    ) -> str:
        """Format regulations as markdown list"""
        if not regulations:
            return "- No data available"

        formatted = []
        for reg_id, value in regulations.items():
            if is_scored:
                formatted.append(f"- **{reg_id}:** {value}/5")
            else:
                status = "✅ Passed" if value else "❌ Failed"
                formatted.append(f"- **{reg_id}:** {status}")

        return "\n".join(formatted)

    def _generate_json_summary(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate JSON summary for programmatic access"""
        
        session_meta = data["session_metadata"]
        provider_info = data["provider_info"]
        final_result = data["final_result"].get("result", {})
        
        return {
            "metadata": {
                "report_id": f"RPT_{session_meta['session_id']}",
                "generated_at": datetime.now().isoformat(),
                "session_id": session_meta["session_id"],
                "provider_id": session_meta["provider_id"],
                "total_steps": session_meta["total_steps"],
                "total_llm_interactions": session_meta["total_llm_interactions"],
                "total_decisions": session_meta["total_decisions"],
            },
            "provider_summary": {
                "name": provider_info["name"],
                "specialty": provider_info["specialty"],
                "experience_years": provider_info["experience_years"],
                "compliance_status": final_result.get("compliance_status"),
                "overall_score": final_result.get("score"),
                "processing_time": final_result.get("processing_time"),
            },
            "compliance_summary": {
                "hard_regulations": final_result.get("hard_regulations", {}),
                "soft_regulations": final_result.get("soft_regulations", {}),
                "passed_hard_regulations": sum(1 for v in final_result.get("hard_regulations", {}).values() if v),
                "total_hard_regulations": len(final_result.get("hard_regulations", {})),
                "average_soft_score": sum(final_result.get("soft_regulations", {}).values()) / len(final_result.get("soft_regulations", {})) if final_result.get("soft_regulations") else 0,
            },
            "risk_indicators": {
                "has_disciplinary_actions": len(provider_info["disciplinary_actions"]) > 0,
                "has_criminal_record": provider_info["criminal_record"] != "Clean",
                "insurance_active": provider_info["malpractice_insurance"] == "Active",
                "has_board_certifications": len(provider_info["board_certifications"]) > 0,
                "cme_compliant": provider_info["cme_credits"] >= 50,
                "quality_score_acceptable": provider_info["quality_score"] >= 3.0,
            },
        }

    def generate_batch_reports(self, provider_ids: List[str]) -> Dict[str, Any]:
        """Generate comprehensive reports for multiple providers"""
        batch_results = {
            "batch_id": f"BATCH_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "generated_at": datetime.now().isoformat(),
            "total_providers": len(provider_ids),
            "successful_reports": [],
            "failed_reports": [],
            "summary": {}
        }

        successful_count = 0
        failed_count = 0

        for provider_id in provider_ids:
            try:
                # Get the most recent session for this provider
                credentialing_history = audit_logger.get_credentialing_history(provider_id)
                if not credentialing_history:
                    batch_results["failed_reports"].append({
                        "provider_id": provider_id,
                        "error": "No credentialing history found"
                    })
                    failed_count += 1
                    continue

                # Get the most recent session
                latest_session = credentialing_history[-1]
                session_id = latest_session.get("session_id")
                
                if not session_id:
                    batch_results["failed_reports"].append({
                        "provider_id": provider_id,
                        "error": "No session ID found in credentialing history"
                    })
                    failed_count += 1
                    continue

                # Generate report
                report = self.generate_credentialing_report(provider_id, session_id)
                batch_results["successful_reports"].append(report)
                successful_count += 1

            except Exception as e:
                batch_results["failed_reports"].append({
                    "provider_id": provider_id,
                    "error": str(e)
                })
                failed_count += 1

        # Generate batch summary
        batch_results["summary"] = {
            "successful_count": successful_count,
            "failed_count": failed_count,
            "success_rate": successful_count / len(provider_ids) if provider_ids else 0
        }

        # Save batch summary
        batch_filename = f"batch_report_{batch_results['batch_id']}.json"
        batch_file = self.reports_dir / batch_filename
        
        with open(batch_file, "w") as f:
            json.dump(batch_results, f, indent=2, default=str)

        batch_results["batch_file"] = str(batch_file)
        return batch_results

    def generate_summary_report(self, provider_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        """Generate a summary report for multiple providers using LLM analysis"""
        
        # Get credentialing history for all providers or specified providers
        if provider_ids:
            all_history = []
            for provider_id in provider_ids:
                history = audit_logger.get_credentialing_history(provider_id)
                all_history.extend(history)
        else:
            # Get all credentialing history
            all_history = audit_logger.get_credentialing_history()

        if not all_history:
            raise ValueError("No credentialing history found")

        # Analyze the data
        summary_data = self._analyze_credentialing_summary(all_history)

        # Generate comprehensive summary using LLM
        summary_report = self._generate_summary_report_content(summary_data)

        # Save summary report
        summary_filename = f"credentialing_summary_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        summary_file = self.reports_dir / summary_filename

        with open(summary_file, "w") as f:
            f.write(summary_report)

        # Save summary data as JSON
        summary_json_filename = f"credentialing_summary_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        summary_json_file = self.reports_dir / summary_json_filename

        with open(summary_json_file, "w") as f:
            json.dump(summary_data, f, indent=2, default=str)

        return {
            "summary_report_file": str(summary_file),
            "summary_data_file": str(summary_json_file),
            "generated_at": datetime.now().isoformat(),
            "providers_analyzed": len(set(h.get("provider_id") for h in all_history if h.get("provider_id"))),
            "total_credentialing_sessions": len(all_history),
            "summary_metadata": summary_data.get("metadata", {})
        }

    def _analyze_credentialing_summary(self, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze credentialing history to create summary statistics"""
        
        # Group by provider
        provider_data = {}
        for entry in history:
            provider_id = entry.get("provider_id")
            if not provider_id:
                continue
                
            if provider_id not in provider_data:
                provider_data[provider_id] = []
            provider_data[provider_id].append(entry)

        # Calculate statistics
        total_providers = len(provider_data)
        total_sessions = len(history)
        
        compliance_stats = {
            "compliant": 0,
            "non_compliant": 0,
            "failed": 0
        }
        
        score_distribution = {
            "1": 0, "2": 0, "3": 0, "4": 0, "5": 0
        }
        
        processing_times = []
        risk_indicators = {
            "disciplinary_actions": 0,
            "criminal_records": 0,
            "insurance_issues": 0,
            "certification_issues": 0
        }

        for provider_id, sessions in provider_data.items():
            # Get latest session for each provider
            latest_session = max(sessions, key=lambda x: x.get("timestamp", 0))
            
            # Analyze compliance status
            compliance_status = latest_session.get("compliance_status", "UNKNOWN")
            if compliance_status == "COMPLIANT":
                compliance_stats["compliant"] += 1
            elif compliance_status == "NON_COMPLIANT":
                compliance_stats["non_compliant"] += 1
            else:
                compliance_stats["failed"] += 1

            # Analyze score
            score = latest_session.get("score", 0)
            if score in score_distribution:
                score_distribution[str(score)] += 1

            # Analyze processing time
            processing_time = latest_session.get("processing_time", 0)
            if processing_time:
                processing_times.append(processing_time)

        return {
            "metadata": {
                "total_providers": total_providers,
                "total_sessions": total_sessions,
                "analysis_date": datetime.now().isoformat(),
                "average_sessions_per_provider": total_sessions / total_providers if total_providers > 0 else 0
            },
            "compliance_analysis": {
                "overall_stats": compliance_stats,
                "compliance_rate": compliance_stats["compliant"] / total_providers if total_providers > 0 else 0,
                "non_compliance_rate": compliance_stats["non_compliant"] / total_providers if total_providers > 0 else 0
            },
            "score_analysis": {
                "distribution": score_distribution,
                "average_score": sum(int(score) * count for score, count in score_distribution.items()) / total_providers if total_providers > 0 else 0
            },
            "performance_analysis": {
                "average_processing_time": sum(processing_times) / len(processing_times) if processing_times else 0,
                "min_processing_time": min(processing_times) if processing_times else 0,
                "max_processing_time": max(processing_times) if processing_times else 0
            },
            "risk_analysis": risk_indicators,
            "provider_details": {
                provider_id: {
                    "total_sessions": len(sessions),
                    "latest_compliance": max(sessions, key=lambda x: x.get("timestamp", 0)).get("compliance_status"),
                    "latest_score": max(sessions, key=lambda x: x.get("timestamp", 0)).get("score"),
                    "first_session": min(sessions, key=lambda x: x.get("timestamp", 0)).get("timestamp"),
                    "latest_session": max(sessions, key=lambda x: x.get("timestamp", 0)).get("timestamp")
                }
                for provider_id, sessions in provider_data.items()
            }
        }

    def _generate_summary_report_content(self, summary_data: Dict[str, Any]) -> str:
        """Generate comprehensive summary report content using LLM"""
        
        prompt = f"""
You are a senior healthcare credentialing analyst. Generate a comprehensive summary report based on the following credentialing system analysis data.

## SUMMARY STATISTICS
{json.dumps(summary_data, indent=2, default=str)}

Please generate a professional markdown summary report that includes:

1. **Executive Summary** - High-level overview of credentialing system performance
2. **Compliance Analysis** - Detailed breakdown of compliance rates and trends
3. **Score Distribution Analysis** - Analysis of provider performance scores
4. **System Performance** - Processing times and efficiency metrics
5. **Risk Assessment** - Overall risk indicators and trends
6. **Provider Insights** - Key findings about provider populations
7. **Recommendations** - System improvements and operational recommendations
8. **Trends and Patterns** - Identification of patterns in the data

The report should be:
- Professional and suitable for healthcare administration
- Data-driven with specific statistics and insights
- Actionable with clear recommendations
- Comprehensive yet concise
- Include visual suggestions (tables, charts) where appropriate

Format as clean markdown with proper headers, bullet points, and professional language.
"""

        try:
            response = self.llm_provider.generate(prompt)
            markdown_content = response.content
            
            # Add header
            header = f"""# Credentialing System Summary Report

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  
**Total Providers Analyzed:** {summary_data['metadata']['total_providers']}  
**Total Sessions:** {summary_data['metadata']['total_sessions']}  
**Analysis Period:** {summary_data['metadata']['analysis_date']}

---

"""
            
            return header + markdown_content
            
        except Exception as e:
            # Fallback to basic summary
            return self._generate_basic_summary_template(summary_data)

    def _generate_basic_summary_template(self, summary_data: Dict[str, Any]) -> str:
        """Generate basic summary template if LLM fails"""
        
        metadata = summary_data["metadata"]
        compliance = summary_data["compliance_analysis"]
        scores = summary_data["score_analysis"]
        performance = summary_data["performance_analysis"]
        
        return f"""# Credentialing System Summary Report

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  
**Total Providers Analyzed:** {metadata['total_providers']}  
**Total Sessions:** {metadata['total_sessions']}  
**Analysis Period:** {metadata['analysis_date']}

---

## Executive Summary

The credentialing system has processed {metadata['total_sessions']} sessions across {metadata['total_providers']} providers with an overall compliance rate of {compliance['compliance_rate']:.1%}.

## Compliance Analysis

- **Compliant Providers:** {compliance['overall_stats']['compliant']} ({compliance['compliance_rate']:.1%})
- **Non-Compliant Providers:** {compliance['overall_stats']['non_compliant']} ({compliance['non_compliance_rate']:.1%})
- **Failed Sessions:** {compliance['overall_stats']['failed']}

## Score Distribution

- **Score 5:** {scores['distribution']['5']} providers
- **Score 4:** {scores['distribution']['4']} providers
- **Score 3:** {scores['distribution']['3']} providers
- **Score 2:** {scores['distribution']['2']} providers
- **Score 1:** {scores['distribution']['1']} providers
- **Average Score:** {scores['average_score']:.2f}/5

## System Performance

- **Average Processing Time:** {performance['average_processing_time']:.2f} seconds
- **Fastest Processing:** {performance['min_processing_time']:.2f} seconds
- **Slowest Processing:** {performance['max_processing_time']:.2f} seconds

## Recommendations

1. Monitor compliance trends and identify areas for improvement
2. Review providers with low scores for targeted support
3. Optimize processing times for better efficiency
4. Implement regular system performance reviews

---

*Summary report generated by AI-powered credentialing system*
"""
