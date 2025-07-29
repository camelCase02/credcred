"""
This module provides a Bedrock implementation of the LLM provider interface.

The BedrockLLMProvider class uses AWS Bedrock to generate responses from large language models.
It implements the LLMProvider interface to provide a consistent API for different LLM backends.
"""

from langchain_aws import ChatBedrockConverse
from utils.llm.llm import LLMProvider, LLMResponse


class BedrockLLMProvider(LLMProvider):
    """Bedrock implementation of LLM provider"""
    
    def __init__(self, model_name: str, region_name: str = "us-east-1"):
        self.model_name = model_name
        self.llm = ChatBedrockConverse(model=model_name,  region_name=region_name)
    
    def generate(self, prompt, **kwargs) -> LLMResponse:
        """Generate a response from Bedrock given a prompt"""
        response = self.llm.invoke(prompt)
        if hasattr(response, 'content'):
            # Extract token usage information
            usage_info = getattr(response, 'usage_metadata', {})
            input_tokens = usage_info.get('input_tokens', 0)
            output_tokens = usage_info.get('output_tokens', 0)
            total_tokens = usage_info.get('total_tokens', 0)
            
            llm_response = LLMResponse(
                content=response.content,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                total_tokens=total_tokens
            )
            
            print(f"Response Content: {response.content}")
            print(f"Token Usage - Input: {input_tokens}, Output: {output_tokens}, Total: {total_tokens}")
            print(f"Cost - Input: ${llm_response.input_cost:.6f}, Output: ${llm_response.output_cost:.6f}, Total: ${llm_response.total_cost:.6f}")
            
            return llm_response
        else:
            # Fallback for unexpected response format
            return LLMResponse(
                content=str(response),
                input_tokens=0,
                output_tokens=0,
                total_tokens=0
            )
