"""
This module provides a base class for LLM providers.

The LLMProvider class defines a common interface for different LLM backends.
It provides a method for generating responses from the LLM given a prompt.
"""

from langchain_core.runnables import RunnableLambda
from abc import ABC, abstractmethod
from typing import Dict, Any



class LLMResponse:
    """Standard response format for LLM providers"""
    def __init__(self, content: str, input_tokens: int, output_tokens: int, total_tokens: int, 
                 input_cost_per_1k: float = 0.003, output_cost_per_1k: float = 0.015):
        self.content = content
        self.input_tokens = input_tokens
        self.output_tokens = output_tokens
        self.total_tokens = total_tokens
        
        # Calculate costs based on pricing
        self.input_cost = (input_tokens / 1000) * input_cost_per_1k
        self.output_cost = (output_tokens / 1000) * output_cost_per_1k
        self.total_cost = self.input_cost + self.output_cost
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary format"""
        return {
            'content': self.content,
            'input_tokens': self.input_tokens,
            'output_tokens': self.output_tokens,
            'total_tokens': self.total_tokens,
            'input_cost': round(self.input_cost, 6),
            'output_cost': round(self.output_cost, 6),
            'total_cost': round(self.total_cost, 6)
        }

class LLMProvider(ABC):
    """Abstract base class for LLM providers"""
    
    @abstractmethod
    def generate(self, prompt, **kwargs) -> LLMResponse:
        """Generate a response from the LLM given a prompt"""
        pass
    
    def as_runnable(self):
        """Return a runnable that calls the generate method and returns content"""
        return RunnableLambda(lambda x: self.generate(x).content)