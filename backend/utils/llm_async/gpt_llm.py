import asyncio
from typing import List, Tuple

from langchain_openai import ChatOpenAI

from utils.llm_async.llm import LLMProvider, LLMResponse


class GPTLLMProvider(LLMProvider):
    """OpenAI GPT implementation of LLM provider"""

    def __init__(self, model_name: str, api_key: str = None, base_url: str = None):
        self.model_name = model_name
        self.api_key = api_key
        self.base_url = base_url
        self.llm = ChatOpenAI(
            model=model_name, openai_api_key=api_key, base_url=base_url
        )

    def generate(self, prompt, **kwargs) -> LLMResponse:
        response = self.llm.invoke(prompt, **kwargs)
        return self._process_response(response)

    async def generate_async(self, prompt, **kwargs) -> LLMResponse:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None, lambda: self.llm.invoke(prompt, **kwargs)
        )
        return self._process_response(response)

    def _process_response(self, response) -> LLMResponse:
        # LangChain OpenAI returns a response with .content and .usage_metadata
        if hasattr(response, "content"):
            usage_info = getattr(response, "usage_metadata", {})
            input_tokens = usage_info.get("input_tokens", 0)
            output_tokens = usage_info.get("output_tokens", 0)
            total_tokens = usage_info.get("total_tokens", 0)

            llm_response = LLMResponse(
                content=response.content,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                total_tokens=total_tokens,
                model_name=self.model_name,
            )
            print(f"Response Content: {response.content}")
            print(
                f"Token Usage - Input: {input_tokens}, Output: {output_tokens}, Total: {total_tokens}"
            )
            print(
                f"Cost - Input: ${llm_response.input_cost:.6f}, Output: ${llm_response.output_cost:.6f}, Total: ${llm_response.total_cost:.6f}"
            )
            return llm_response
        else:
            return LLMResponse(
                content=str(response),
                input_tokens=0,
                output_tokens=0,
                total_tokens=0,
                model_name=self.model_name,
            )
