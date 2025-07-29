"""
This module provides a base class for LLM providers.

The LLMProvider class defines a common interface for different LLM backends.
It provides a method for generating responses from the LLM given a prompt.
"""

import asyncio
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Union

from langchain_core.runnables import RunnableLambda

# Pricing per 1K tokens for different models (input, output)
LLM_PRICING = {
    # OpenAI GPT Models
    "gpt-4.1": (0.002, 0.008),
    "gpt-4": (0.03, 0.06),
    "gpt-4-turbo": (0.01, 0.03),
    "gpt-4-turbo-preview": (0.01, 0.03),
    "gpt-4o": (0.005, 0.015),
    "gpt-4o-mini": (0.00015, 0.0006),
    "gpt-3.5-turbo": (0.0015, 0.002),
    "gpt-3.5-turbo-16k": (0.003, 0.004),
    # Anthropic Models (via Bedrock)
    "anthropic.claude-3-sonnet-20240229-v1:0": (0.003, 0.015),
    "anthropic.claude-3-haiku-20240307-v1:0": (0.00025, 0.00125),
    "anthropic.claude-3-opus-20240229-v1:0": (0.015, 0.075),
    "anthropic.claude-3-5-sonnet-20240620-v1:0": (0.003, 0.015),
    "anthropic.claude-v2": (0.008, 0.024),
    "anthropic.claude-v2:1": (0.008, 0.024),
    "anthropic.claude-instant-v1": (0.0008, 0.0024),
    # Amazon Bedrock Models
    "amazon.titan-text-lite-v1": (0.0003, 0.0004),
    "amazon.titan-text-express-v1": (0.0008, 0.0016),
    # Default fallback pricing
    "default": (0.003, 0.015),
}


def get_model_pricing(model_name: str) -> tuple[float, float]:
    """
    Get the input and output pricing per 1K tokens for a given model.

    Args:
        model_name: The name of the LLM model

    Returns:
        Tuple of (input_cost_per_1k, output_cost_per_1k)
    """
    model_name = model_name.lower().strip()

    # Direct lookup first
    if model_name in LLM_PRICING:
        return LLM_PRICING[model_name]

    # Pattern matching for model families
    for model_key, pricing in LLM_PRICING.items():
        if model_key != "default" and model_key in model_name:
            return pricing

    # Check for common model patterns
    if "gpt-4" in model_name:
        if "turbo" in model_name or "preview" in model_name:
            return LLM_PRICING["gpt-4-turbo"]
        elif "mini" in model_name:
            return LLM_PRICING["gpt-4o-mini"]
        else:
            return LLM_PRICING["gpt-4"]
    elif "gpt-3.5" in model_name:
        if "16k" in model_name:
            return LLM_PRICING["gpt-3.5-turbo-16k"]
        else:
            return LLM_PRICING["gpt-3.5-turbo"]
    elif "claude-3-5" in model_name:
        return LLM_PRICING["anthropic.claude-3-5-sonnet-20240620-v1:0"]
    elif "claude-3" in model_name:
        if "opus" in model_name:
            return LLM_PRICING["anthropic.claude-3-opus-20240229-v1:0"]
        elif "haiku" in model_name:
            return LLM_PRICING["anthropic.claude-3-haiku-20240307-v1:0"]
        else:
            return LLM_PRICING["anthropic.claude-3-sonnet-20240229-v1:0"]
    elif "claude" in model_name:
        if "instant" in model_name:
            return LLM_PRICING["anthropic.claude-instant-v1"]
        else:
            return LLM_PRICING["anthropic.claude-v2"]
    elif "titan" in model_name:
        if "express" in model_name:
            return LLM_PRICING["amazon.titan-text-express-v1"]
        else:
            return LLM_PRICING["amazon.titan-text-lite-v1"]

    # Default fallback
    return LLM_PRICING["default"]


class LLMResponse:
    """Standard response format for LLM providers"""

    def __init__(
        self,
        content: str,
        input_tokens: int,
        output_tokens: int,
        total_tokens: int,
        model_name: str = "default",
        track_cost: bool = True,
    ):
        self.content = content
        self.input_tokens = input_tokens
        self.output_tokens = output_tokens
        self.total_tokens = total_tokens
        self.model_name = model_name

        # Get pricing based on model name
        input_cost_per_1k, output_cost_per_1k = get_model_pricing(model_name)

        # Calculate costs based on model-specific pricing
        self.input_cost = (input_tokens / 1000) * input_cost_per_1k
        self.output_cost = (output_tokens / 1000) * output_cost_per_1k
        self.total_cost = self.input_cost + self.output_cost

        # Automatically track costs if enabled
        if track_cost:
            try:
                from src.utils.cost_tracker import cost_tracker

                cost_tracker.track_llm_response(self)
            except ImportError:
                # Cost tracker not available, continue without tracking
                pass

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary format"""
        return {
            "content": self.content,
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "total_tokens": self.total_tokens,
            "model_name": self.model_name,
            "input_cost": round(self.input_cost, 6),
            "output_cost": round(self.output_cost, 6),
            "total_cost": round(self.total_cost, 6),
        }


class LLMProvider(ABC):
    """Abstract base class for LLM providers"""

    @abstractmethod
    def generate(self, prompt, **kwargs) -> LLMResponse:
        """Generate a response from the LLM given a prompt"""
        pass

    @abstractmethod
    async def generate_async(self, prompt, **kwargs) -> LLMResponse:
        """Generate a response from the LLM given a prompt (async version)"""
        pass

    def generate_batch(self, prompts: List[str], **kwargs) -> List[LLMResponse]:
        """Generate responses for multiple prompts (synchronous batch processing)"""
        return [self.generate(prompt, **kwargs) for prompt in prompts]

    async def generate_batch_async(
        self, prompts: List[str], **kwargs
    ) -> List[LLMResponse]:
        """Generate responses for multiple prompts (asynchronous batch processing with 5 request limit)"""
        if len(prompts) <= 50:
            # If 50 or fewer prompts, process all concurrently
            tasks = [self.generate_async(prompt, **kwargs) for prompt in prompts]
            return await asyncio.gather(*tasks)

        # For more than 5 prompts, process in batches of 5
        results = []
        for i in range(0, len(prompts), 50):
            batch = prompts[i : i + 50]
            tasks = [self.generate_async(prompt, **kwargs) for prompt in batch]
            batch_results = await asyncio.gather(*tasks)
            results.extend(batch_results)

        return results

    def generate_flexible(
        self, prompts: Union[str, List[str]], **kwargs
    ) -> Union[LLMResponse, List[LLMResponse]]:
        """
        Flexible generation method that accepts either a single prompt or a list of prompts.
        Returns either a single LLMResponse or a list of LLMResponse objects accordingly.
        """
        if isinstance(prompts, str):
            return self.generate(prompts, **kwargs)
        else:
            return self.generate_batch(prompts, **kwargs)

    async def generate_flexible_async(
        self, prompts: Union[str, List[str]], **kwargs
    ) -> Union[LLMResponse, List[LLMResponse]]:
        """
        Flexible async generation method that accepts either a single prompt or a list of prompts.
        Returns either a single LLMResponse or a list of LLMResponse objects accordingly.
        """
        if isinstance(prompts, str):
            return await self.generate_async(prompts, **kwargs)
        else:
            return await self.generate_batch_async(prompts, **kwargs)

    def as_runnable(self):
        """Return a runnable that calls the generate method and returns content"""
        return RunnableLambda(lambda x: self.generate(x).content)
