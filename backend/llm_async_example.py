import json
import logging
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field

from prompts.template_loader import prompt_loader
from schema.config import ClassifierConfig
from schema.path_manager import DOCPaths
from utils.doc_utils import DOC
from utils.llm_async.unified_llm import LLMProvider


class ModificationRequired(Enum):
    YES = "yes"
    NO = "no"
    UNCLEAR = "unclear"


class ScopeClassification(Enum):
    IN_SCOPE = "in_scope"
    OUT_OF_SCOPE = "out_of_scope"
    NOT_APPLICABLE = "not_applicable"


class RequiredInput(BaseModel):
    """Pydantic model for required input structure"""

    description: str = Field(
        description="Clear question or description of what input is needed"
    )
    type: str = Field(
        description="Data type expected (boolean, string, int, float, date, choice, etc.)"
    )
    options: Optional[List[str]] = Field(
        default=None,
        description="List of available choices (only for choice/boolean types)",
    )
    required: bool = Field(description="Whether this input is mandatory")
    variable_name: str = Field(
        description="Unique variable name for this input (snake_case, descriptive)"
    )


class ClassificationResult(BaseModel):
    """Pydantic model for LLM classification output"""

    modification_required: ModificationRequired = Field(
        description="Whether the comment requires document modification: yes, no, or unclear"
    )
    scope_classification: ScopeClassification = Field(
        description="Classification of scope: in_scope, out_of_scope, or not_applicable"
    )
    reasoning: str = Field(
        description="Brief explanation of the decision (2-3 sentences)"
    )
    confidence_score: int = Field(
        ge=1, le=5, description="Confidence rating from 1 (very low) to 5 (very high)"
    )
    required_inputs: List[RequiredInput] = Field(
        default=[],
        description="List of structured input requirements needed to implement the modification (only when modification is required and in scope)",
    )


@dataclass
class CommentAnalysis:
    comment_id: str
    annotation: str
    comment: str
    annotated_text: str
    surrounding_context: str
    span: List[int]
    modification_required: ModificationRequired
    scope_classification: ScopeClassification
    reasoning: str
    confidence_score: int
    required_inputs: List[RequiredInput] = field(default_factory=list)
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0
    input_cost: float = 0.0
    output_cost: float = 0.0
    total_cost: float = 0.0


class DocumentClassifier:
    """
    AI-powered document comment classifier for template standardization.

    This class analyzes comments in documents to determine:
    - Whether modifications are required (yes/no/unclear)
    - Scope classification (in_scope/out_of_scope/not_applicable)
    - Required inputs for template variables
    - Confidence scores and reasoning

    The classifier uses large language models to intelligently categorize
    document comments and extract actionable insights for template generation.

    Attributes:
        doc (DOC): Document instance being processed
        config (ClassifierConfig): Configuration with LLM model and settings
        llm (LLMProvider): Unified LLM provider for AI operations
        document_text (str): Full document text content
        comments (List): Extracted comments from the document
        output_path (Path): Directory for classification outputs

    Example:
        >>> classifier = DocumentClassifier(doc, config)
        >>> results = await classifier.classify_document()
        >>> print(f"Processed {results['report']['total_comments']} comments")
    """

    def __init__(self, doc: DOC, config: ClassifierConfig) -> None:
        """
        Initialize the document comment classifier.

        Args:
            doc (DOC): DOC instance containing the document data
            config (ClassifierConfig): Configuration with LLM model and settings

        Note:
            Creates output directory for classification results and initializes
            the unified LLM provider for AI-powered analysis.
        """
        self.doc = doc
        self.config = config
        self.llm = LLMProvider()  # Uses unified LLM provider like other utils
        self.document_text = ""
        self.comments = []
        self.output_path = self.doc.file_id_path / DOCPaths.CLASSIFIER_OUTPUT

    def load_document_data(self) -> None:
        """Load document text and comments from DOC instance files"""
        try:
            # Load document text from output.txt
            output_file = self.doc.file_id_path / DOCPaths.SPLIT_CONTENT / "output.txt"
            with open(output_file, "r", encoding="utf-8") as f:
                self.document_text = f.read()

            # Load comments from comments.json
            comments_file = (
                self.doc.file_id_path
                / DOCPaths.DOC_ATTRIBUTES
                / "updated_comments.json"
            )
            with open(comments_file, "r", encoding="utf-8") as f:
                self.comments = json.load(f)

            logging.info(f"Loaded document with {len(self.document_text)} characters")
            logging.info(f"Loaded {len(self.comments)} comments")

        except Exception as e:
            logging.error(f"Error loading document data: {e}")
            raise

    def _repair_llm_response(self, content: str) -> str:
        """
        Repair common LLM response formatting issues

        Args:
            content: Raw LLM response content

        Returns:
            Repaired content string
        """
        import re

        # Fix boolean values in options arrays: [true, false] -> ["true", "false"]
        def fix_boolean_options(match):
            full_match = match.group(0)
            # Replace boolean values with string equivalents
            fixed = full_match.replace("true", '"true"').replace("false", '"false"')
            return fixed

        # Pattern to match options arrays containing boolean values
        # Matches: "options": [true, false] or "options": [ true , false ]
        boolean_options_pattern = (
            r'"options":\s*\[\s*(?:true|false)(?:\s*,\s*(?:true|false))*\s*\]'
        )

        repaired_content = re.sub(
            boolean_options_pattern, fix_boolean_options, content, flags=re.IGNORECASE
        )

        # Also fix standalone true/false in options (more comprehensive)
        # This handles cases where there might be mixed content
        def fix_options_array(match):
            options_content = match.group(1)
            # Replace any unquoted boolean values
            options_content = re.sub(r"\btrue\b", '"true"', options_content)
            options_content = re.sub(r"\bfalse\b", '"false"', options_content)
            return f'"options": [{options_content}]'

        # More comprehensive pattern for options arrays
        options_pattern = r'"options":\s*\[([^\]]*)\]'
        repaired_content = re.sub(options_pattern, fix_options_array, repaired_content)

        self.log(
            f"Repaired LLM response: converted boolean values to strings in options arrays"
        )
        return repaired_content

    def extract_annotated_text_and_context(
        self, comment: Dict[str, Any]
    ) -> Tuple[str, str]:
        """Extract annotated text and surrounding context for a comment"""
        span = comment.get("span", [])
        if not span or len(span) != 2:
            return "", ""

        start_pos, end_pos = span
        annotated_text = self.document_text[start_pos:end_pos]

        # Get surrounding context (before and after)
        context_chars = self.config.context_chars
        context_start = max(0, start_pos - context_chars)
        context_end = min(len(self.document_text), end_pos + context_chars)

        before_context = self.document_text[context_start:start_pos]
        after_context = self.document_text[end_pos:context_end]

        surrounding_context = f"{before_context}[ANNOTATED_TEXT]{annotated_text}[/ANNOTATED_TEXT]{after_context}"

        return annotated_text, surrounding_context

    def create_classification_prompt_string(
        self,
        comment_id: str,
        comment_text: str,
        annotated_text: str,
        surrounding_context: str,
        format_instructions: str,
    ) -> str:
        """Create a classification prompt string using centralized template"""
        return prompt_loader.render_classification_prompt(
            comment_id=comment_id,
            comment_text=comment_text,
            annotated_text=annotated_text,
            surrounding_context=surrounding_context,
            format_instructions=format_instructions,
            strict_string_options=True,  # classifier_utils.py version has strict validation
        )

    async def classify_all_comments(self) -> List[CommentAnalysis]:
        """Classify all loaded comments using async batch processing"""
        if not self.comments:
            logging.warning(
                "No comments loaded. Please run load_document_data() first."
            )
            return []

        logging.info(
            f"Starting batch classification of {len(self.comments)} comments..."
        )

        # Prepare batch data
        prompts = []
        comment_data = []

        # Create parser
        parser = PydanticOutputParser(pydantic_object=ClassificationResult)

        # Prepare all prompts
        for i, comment in enumerate(self.comments):
            logging.debug(
                f"Preparing prompt {i+1}/{len(self.comments)}: {comment.get('comment_id', 'Unknown')}"
            )

            # Extract annotated text and context
            annotated_text, surrounding_context = (
                self.extract_annotated_text_and_context(comment)
            )

            # Format the prompt using centralized template
            formatted_prompt = self.create_classification_prompt_string(
                comment_id=comment.get("comment_id", "Unknown"),
                comment_text=comment.get("comment", ""),
                annotated_text=annotated_text,
                surrounding_context=surrounding_context,
                format_instructions=parser.get_format_instructions(),
            )

            prompts.append(formatted_prompt)
            comment_data.append(
                {
                    "comment": comment,
                    "annotated_text": annotated_text,
                    "surrounding_context": surrounding_context,
                }
            )

        # Execute batch processing
        logging.info(f"Executing async batch processing for {len(prompts)} prompts...")
        llm_responses = await self.llm.generate_batch_async(prompts)

        # Process responses
        results = []
        total_input_tokens = 0
        total_output_tokens = 0
        total_tokens = 0
        total_input_cost = 0.0
        total_output_cost = 0.0
        total_cost = 0.0

        for i, (llm_response, data) in enumerate(zip(llm_responses, comment_data)):
            comment = data["comment"]
            annotated_text = data["annotated_text"]
            surrounding_context = data["surrounding_context"]

            try:
                # Parse response using pydantic parser with error handling
                try:
                    result = parser.parse(llm_response.content)
                except Exception as parse_error:
                    # Try to fix common LLM formatting issues
                    self.log(
                        f"Initial parsing failed for comment {i+1}: {str(parse_error)}"
                    )
                    self.log(f"Attempting to repair LLM response...")

                    try:
                        # Try to repair the JSON and fix boolean values in options
                        repaired_content = self._repair_llm_response(
                            llm_response.content
                        )
                        result = parser.parse(repaired_content)
                        self.log(
                            f"Successfully repaired and parsed response for comment {i+1}"
                        )
                    except Exception as repair_error:
                        self.log(
                            f"Failed to repair response for comment {i+1}: {str(repair_error)}"
                        )
                        self.log(f"Original content: {llm_response.content[:500]}...")
                        raise parse_error  # Re-raise the original error

                analysis = CommentAnalysis(
                    comment_id=comment.get("comment_id", "Unknown"),
                    annotation=comment.get("annotation", ""),
                    comment=comment.get("comment", ""),
                    annotated_text=annotated_text,
                    surrounding_context=surrounding_context,
                    span=comment.get("span", []),
                    modification_required=result.modification_required,
                    scope_classification=result.scope_classification,
                    reasoning=result.reasoning,
                    confidence_score=result.confidence_score,
                    required_inputs=result.required_inputs,
                    input_tokens=llm_response.input_tokens,
                    output_tokens=llm_response.output_tokens,
                    total_tokens=llm_response.total_tokens,
                    input_cost=llm_response.input_cost,
                    output_cost=llm_response.output_cost,
                    total_cost=llm_response.total_cost,
                )

                logging.debug(
                    f"Successfully processed comment {i+1}/{len(self.comments)}: {comment.get('comment_id', 'Unknown')}"
                )
                results.append(analysis)

                # Update totals
                total_input_tokens += llm_response.input_tokens
                total_output_tokens += llm_response.output_tokens
                total_tokens += llm_response.total_tokens
                total_input_cost += llm_response.input_cost
                total_output_cost += llm_response.output_cost
                total_cost += llm_response.total_cost

            except Exception as e:
                logging.error(f"Error processing comment {i+1}: {e}")
                # Create a default analysis for failed processing
                analysis = CommentAnalysis(
                    comment_id=comment.get("comment_id", "Unknown"),
                    annotation=comment.get("annotation", ""),
                    comment=comment.get("comment", ""),
                    annotated_text=annotated_text,
                    surrounding_context=surrounding_context,
                    span=comment.get("span", []),
                    modification_required=ModificationRequired.UNCLEAR,
                    scope_classification=ScopeClassification.NOT_APPLICABLE,
                    reasoning=f"Processing failed: {str(e)}",
                    confidence_score=1,
                    required_inputs=[],
                )
                results.append(analysis)

        logging.info(
            f"Total token usage: Input={total_input_tokens}, Output={total_output_tokens}, Total={total_tokens}"
        )
        logging.info(
            f"Total cost: Input=${total_input_cost:.6f}, Output=${total_output_cost:.6f}, Total=${total_cost:.6f}"
        )

        return results

    def generate_report(self, analyses: List[CommentAnalysis]) -> Dict[str, Any]:
        """Generate a summary report of the classifications"""
        total_comments = len(analyses)

        # Count classifications
        modification_counts = {mod.value: 0 for mod in ModificationRequired}
        scope_counts = {scope.value: 0 for scope in ScopeClassification}

        # Confidence distribution
        confidence_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}

        # Token usage and cost summary
        total_input_tokens = sum(analysis.input_tokens for analysis in analyses)
        total_output_tokens = sum(analysis.output_tokens for analysis in analyses)
        total_tokens = sum(analysis.total_tokens for analysis in analyses)
        total_input_cost = sum(analysis.input_cost for analysis in analyses)
        total_output_cost = sum(analysis.output_cost for analysis in analyses)
        total_cost = sum(analysis.total_cost for analysis in analyses)

        for analysis in analyses:
            modification_counts[analysis.modification_required.value] += 1
            scope_counts[analysis.scope_classification.value] += 1
            confidence_distribution[analysis.confidence_score] += 1

        # Calculate averages
        avg_confidence = (
            sum(a.confidence_score for a in analyses) / len(analyses) if analyses else 0
        )

        low_confidence = [a for a in analyses if a.confidence_score < 4]

        # Get modification required items
        modifications_needed = [
            a for a in analyses if a.modification_required == ModificationRequired.YES
        ]

        # In-scope modifications
        in_scope_modifications = [
            a
            for a in modifications_needed
            if a.scope_classification == ScopeClassification.IN_SCOPE
        ]

        # Out-of-scope modifications
        out_of_scope_modifications = [
            a
            for a in modifications_needed
            if a.scope_classification == ScopeClassification.OUT_OF_SCOPE
        ]

        # Required inputs analysis
        total_required_inputs = sum(
            len(a.required_inputs) for a in in_scope_modifications
        )
        mandatory_inputs = sum(
            len([inp for inp in a.required_inputs if inp.required])
            for a in in_scope_modifications
        )
        optional_inputs = total_required_inputs - mandatory_inputs

        # Input type distribution
        input_type_distribution = {}
        for analysis in in_scope_modifications:
            for inp in analysis.required_inputs:
                input_type = inp.type
                input_type_distribution[input_type] = (
                    input_type_distribution.get(input_type, 0) + 1
                )

        return {
            "total_comments": total_comments,
            "modification_counts": modification_counts,
            "scope_counts": scope_counts,
            "confidence_distribution": confidence_distribution,
            "average_confidence": round(avg_confidence, 2),
            "low_confidence_items": len(low_confidence),
            "modifications_needed": len(modifications_needed),
            "in_scope_modifications": len(in_scope_modifications),
            "out_of_scope_modifications": len(out_of_scope_modifications),
            "token_usage": {
                "total_input_tokens": total_input_tokens,
                "total_output_tokens": total_output_tokens,
                "total_tokens": total_tokens,
                "average_tokens_per_comment": (
                    round(total_tokens / total_comments, 1) if total_comments else 0
                ),
            },
            "cost_summary": {
                "total_input_cost": round(total_input_cost, 6),
                "total_output_cost": round(total_output_cost, 6),
                "total_cost": round(total_cost, 6),
                "average_cost_per_comment": (
                    round(total_cost / total_comments, 6) if total_comments else 0
                ),
            },
            "required_inputs_summary": {
                "in_scope_modifications_with_inputs": len(
                    [a for a in in_scope_modifications if a.required_inputs]
                ),
                "total_required_inputs_count": total_required_inputs,
                "average_inputs_per_in_scope_modification": (
                    round(total_required_inputs / len(in_scope_modifications), 1)
                    if in_scope_modifications
                    else 0
                ),
                "mandatory_inputs": mandatory_inputs,
                "optional_inputs": optional_inputs,
                "input_type_distribution": input_type_distribution,
            },
            "summary": {
                "immediately_actionable": len(
                    [a for a in in_scope_modifications if not a.required_inputs]
                ),
                "requires_external_input": len(
                    [a for a in in_scope_modifications if a.required_inputs]
                ),
            },
        }

    def save_results(self, analyses: List[CommentAnalysis]) -> Dict[str, Any]:
        """Save classification results to JSON file"""
        self.output_path.mkdir(parents=True, exist_ok=True)

        # Prepare detailed results data
        results_data = []
        for analysis in analyses:
            # Convert required inputs to dict format
            required_inputs_dict = [
                {
                    "description": inp.description,
                    "type": inp.type,
                    "options": inp.options,
                    "required": inp.required,
                    "variable_name": inp.variable_name,
                }
                for inp in analysis.required_inputs
            ]

            results_data.append(
                {
                    "comment_id": analysis.comment_id,
                    "annotation": analysis.annotation,
                    "comment": analysis.comment,
                    "annotated_text": analysis.annotated_text,
                    "surrounding_context": analysis.surrounding_context,
                    "span": analysis.span,
                    "modification_required": analysis.modification_required.value,
                    "scope_classification": analysis.scope_classification.value,
                    "reasoning": analysis.reasoning,
                    "confidence_score": analysis.confidence_score,
                    "required_inputs": required_inputs_dict,
                    "token_usage": {
                        "input_tokens": analysis.input_tokens,
                        "output_tokens": analysis.output_tokens,
                        "total_tokens": analysis.total_tokens,
                    },
                    "cost_breakdown": {
                        "input_cost": round(analysis.input_cost, 6),
                        "output_cost": round(analysis.output_cost, 6),
                        "total_cost": round(analysis.total_cost, 6),
                    },
                }
            )

        # Generate report
        report = self.generate_report(analyses)

        # Combine results and report
        output_data = {"report": report, "detailed_results": results_data}

        # Save to file
        filename = self.output_path / "classification_results.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)

        logging.info(f"Classification results saved to {filename}")
        return output_data

    async def classify_document(self) -> Dict[str, Any]:
        """Main method to classify all comments in the document"""
        logging.info("Starting document classification process...")

        # Load document data
        self.load_document_data()

        # Classify all comments
        analyses = await self.classify_all_comments()

        # Save results and return
        results = self.save_results(analyses)

        # Log summary
        report = results["report"]
        logging.info(
            f"Classification complete: {report['total_comments']} comments processed"
        )
        logging.info(f"Modifications needed: {report['modifications_needed']}")
        logging.info(f"In-scope modifications: {report['in_scope_modifications']}")
        logging.info(f"Total cost: ${report['cost_summary']['total_cost']:.6f}")

        return results
