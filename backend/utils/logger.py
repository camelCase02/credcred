"""
Comprehensive logging utility for the credentialing service.
"""

import json
import logging
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path
from config.settings import settings


class CredentialingLogger:
    """Comprehensive logger for credentialing service with LLM reasoning tracking"""

    def __init__(self, provider_id: str):
        """Initialize logger for a specific provider credentialing session"""
        self.provider_id = provider_id
        self.session_id = f"{provider_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.logs_dir = Path(settings.LOGS_DIR)
        self.logs_dir.mkdir(exist_ok=True)

        # Create session-specific log file
        self.log_file = self.logs_dir / f"credentialing_{self.session_id}.json"
        self.session_log = {
            "session_id": self.session_id,
            "provider_id": provider_id,
            "start_time": datetime.now().isoformat(),
            "steps": [],
            "llm_reasoning": [],
            "data_points": {},
            "decisions": [],
            "final_result": None,
            "end_time": None,
        }

        # Setup standard logging
        self.logger = logging.getLogger(f"credentialing.{provider_id}")
        self.logger.setLevel(getattr(logging, settings.LOG_LEVEL))

        # Create file handler
        log_file_path = self.logs_dir / f"credentialing_{self.session_id}.log"
        file_handler = logging.FileHandler(log_file_path)
        file_handler.setLevel(logging.INFO)

        # Create formatter
        formatter = logging.Formatter(settings.LOG_FORMAT)
        file_handler.setFormatter(formatter)

        # Add handler to logger
        self.logger.addHandler(file_handler)

    def log_step(
        self,
        step_name: str,
        step_data: Dict[str, Any],
        llm_reasoning: Optional[str] = None,
    ):
        """Log a credentialing step with data and LLM reasoning"""
        step = {
            "step_name": step_name,
            "timestamp": datetime.now().isoformat(),
            "data": step_data,
            "llm_reasoning": llm_reasoning,
        }

        self.session_log["steps"].append(step)
        self.logger.info(
            f"Step: {step_name} - Data: {json.dumps(step_data, default=str)}"
        )

        if llm_reasoning:
            self.logger.info(f"LLM Reasoning: {llm_reasoning}")

    def log_llm_interaction(
        self,
        interaction_type: str,
        prompt: str,
        response: str,
        reasoning: str,
        data_points: Dict[str, Any],
    ):
        """Log LLM interactions with reasoning and data points"""
        interaction = {
            "type": interaction_type,
            "timestamp": datetime.now().isoformat(),
            "prompt": prompt,
            "response": response,
            "reasoning": reasoning,
            "data_points": data_points,
        }

        self.session_log["llm_reasoning"].append(interaction)
        self.logger.info(f"LLM Interaction: {interaction_type}")
        self.logger.info(f"Reasoning: {reasoning}")

    def log_data_points(self, step_name: str, data_points: Dict[str, Any]):
        """Log data points available at a specific step"""
        self.session_log["data_points"][step_name] = {
            "timestamp": datetime.now().isoformat(),
            "data": data_points,
        }
        self.logger.info(
            f"Data Points for {step_name}: {json.dumps(data_points, default=str)}"
        )

    def log_decision(
        self,
        decision_type: str,
        decision: str,
        reasoning: str,
        supporting_data: Dict[str, Any],
        confidence: float = 1.0,
    ):
        """Log a decision made during credentialing with reasoning"""
        decision_log = {
            "type": decision_type,
            "decision": decision,
            "reasoning": reasoning,
            "supporting_data": supporting_data,
            "confidence": confidence,
            "timestamp": datetime.now().isoformat(),
        }

        self.session_log["decisions"].append(decision_log)
        self.logger.info(f"Decision: {decision_type} - {decision}")
        self.logger.info(f"Reasoning: {reasoning}")
        self.logger.info(f"Confidence: {confidence}")

    def log_regulation_check(
        self,
        regulation_id: str,
        regulation_name: str,
        passed: bool,
        data_used: Dict[str, Any],
        reasoning: str,
    ):
        """Log regulation check with detailed reasoning"""
        regulation_log = {
            "regulation_id": regulation_id,
            "regulation_name": regulation_name,
            "passed": passed,
            "data_used": data_used,
            "reasoning": reasoning,
            "timestamp": datetime.now().isoformat(),
        }

        self.session_log["steps"].append(
            {
                "step_name": f"regulation_check_{regulation_id}",
                "timestamp": datetime.now().isoformat(),
                "data": regulation_log,
                "llm_reasoning": reasoning,
            }
        )

        status = "PASSED" if passed else "FAILED"
        self.logger.info(
            f"Regulation Check: {regulation_name} ({regulation_id}) - {status}"
        )
        self.logger.info(f"Reasoning: {reasoning}")

    def log_scoring(
        self,
        regulation_id: str,
        regulation_name: str,
        score: int,
        max_score: int,
        reasoning: str,
        data_used: Dict[str, Any],
    ):
        """Log scoring decision with reasoning"""
        scoring_log = {
            "regulation_id": regulation_id,
            "regulation_name": regulation_name,
            "score": score,
            "max_score": max_score,
            "reasoning": reasoning,
            "data_used": data_used,
            "timestamp": datetime.now().isoformat(),
        }

        self.session_log["steps"].append(
            {
                "step_name": f"scoring_{regulation_id}",
                "timestamp": datetime.now().isoformat(),
                "data": scoring_log,
                "llm_reasoning": reasoning,
            }
        )

        self.logger.info(
            f"Scoring: {regulation_name} ({regulation_id}) - {score}/{max_score}"
        )
        self.logger.info(f"Reasoning: {reasoning}")

    def log_final_result(self, result: Dict[str, Any]):
        """Log the final credentialing result"""
        self.session_log["final_result"] = {
            "timestamp": datetime.now().isoformat(),
            "result": result,
        }
        self.session_log["end_time"] = datetime.now().isoformat()

        self.logger.info(f"Final Result: {json.dumps(result, default=str)}")

        # Save complete session log
        self.save_session_log()

    def save_session_log(self):
        """Save the complete session log to file"""
        try:
            with open(self.log_file, "w") as f:
                json.dump(self.session_log, f, indent=2, default=str)
            self.logger.info(f"Session log saved to {self.log_file}")
        except Exception as e:
            self.logger.error(f"Failed to save session log: {e}")

    def get_session_summary(self) -> Dict[str, Any]:
        """Get a summary of the credentialing session"""
        return {
            "session_id": self.session_id,
            "provider_id": self.provider_id,
            "total_steps": len(self.session_log["steps"]),
            "total_llm_interactions": len(self.session_log["llm_reasoning"]),
            "total_decisions": len(self.session_log["decisions"]),
            "start_time": self.session_log["start_time"],
            "end_time": self.session_log["end_time"],
            "final_result": self.session_log["final_result"],
        }

    def get_session_log(self) -> Dict[str, Any]:
        """Get the complete session log"""
        return self.session_log.copy()


class AuditLogger:
    """Logger for audit trail and chatbot training data"""

    def __init__(self):
        """Initialize audit logger"""
        self.logs_dir = Path(settings.LOGS_DIR)
        self.logs_dir.mkdir(exist_ok=True)

        # Create audit log file
        self.audit_file = self.logs_dir / "audit_trail.jsonl"
        self.chatbot_training_file = self.logs_dir / "chatbot_training_data.jsonl"

    def log_audit_event(self, event_type: str, event_data: Dict[str, Any]):
        """Log an audit event"""
        audit_event = {
            "timestamp": datetime.now().isoformat(),
            "event_type": event_type,
            "event_data": event_data,
        }

        try:
            with open(self.audit_file, "a") as f:
                f.write(json.dumps(audit_event) + "\n")
        except Exception as e:
            print(f"Failed to log audit event: {e}")

    def log_chatbot_training_data(
        self, question: str, answer: str, context: Dict[str, Any]
    ):
        """Log data for chatbot training"""
        training_data = {
            "timestamp": datetime.now().isoformat(),
            "question": question,
            "answer": answer,
            "context": context,
        }

        try:
            with open(self.chatbot_training_file, "a") as f:
                f.write(json.dumps(training_data) + "\n")
        except Exception as e:
            print(f"Failed to log chatbot training data: {e}")

    def get_credentialing_history(
        self, provider_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get credentialing history for a provider or all providers"""
        history = []

        for log_file in self.logs_dir.glob("credentialing_*.json"):
            try:
                with open(log_file, "r") as f:
                    session_log = json.load(f)

                if provider_id is None or session_log.get("provider_id") == provider_id:
                    history.append(session_log)
            except Exception as e:
                print(f"Failed to read log file {log_file}: {e}")

        return sorted(history, key=lambda x: x.get("start_time", ""), reverse=True)

    def get_decision_reasoning(
        self, provider_id: str, decision_type: str
    ) -> List[Dict[str, Any]]:
        """Get reasoning for specific decision types"""
        history = self.get_credentialing_history(provider_id)
        reasoning = []

        for session in history:
            for decision in session.get("decisions", []):
                if decision.get("type") == decision_type:
                    reasoning.append(decision)

        return reasoning


# Global audit logger instance
audit_logger = AuditLogger()
