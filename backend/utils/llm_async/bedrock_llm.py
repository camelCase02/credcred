"""
This module provides a Bedrock implementation of the LLM provider interface.

The BedrockLLMProvider class uses AWS Bedrock to generate responses from large language models.
It implements the LLMProvider interface to provide a consistent API for different LLM backends.
"""

import asyncio
import uuid
from typing import List, Tuple, Union

from langchain_aws import ChatBedrockConverse

from utils.llm_async.llm import LLMProvider, LLMResponse


class BedrockLLMProvider(LLMProvider):
    """Bedrock implementation of LLM provider"""

    def __init__(self, model_name: str, region_name: str = "us-east-1"):
        self.model_name = model_name
        self.region_name = region_name
        self.llm = ChatBedrockConverse(model=model_name, region_name=region_name)

    def generate(self, prompt, **kwargs) -> LLMResponse:
        """Generate a response from Bedrock given a prompt"""
        response = self.llm.invoke(prompt)
        return self._process_response(response)

    async def generate_async(self, prompt, **kwargs) -> LLMResponse:
        """Generate a response from Bedrock given a prompt (async version)"""
        # Run the synchronous invoke in a thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, self.llm.invoke, prompt)
        return self._process_response(response)

    async def _generate_async_with_uid(
        self, prompt: str, uid: str, **kwargs
    ) -> Tuple[str, LLMResponse]:
        """Generate a response with a UID to track order"""
        response = await self.generate_async(prompt, **kwargs)
        return uid, response

    def _process_response(self, response) -> LLMResponse:
        """Process the response from Bedrock and return an LLMResponse object"""
        if hasattr(response, "content"):
            # Extract token usage information
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
            # Fallback for unexpected response format
            return LLMResponse(
                content=str(response),
                input_tokens=0,
                output_tokens=0,
                total_tokens=0,
                model_name=self.model_name,
            )

    def generate_batch(self, prompts: List[str], **kwargs) -> List[LLMResponse]:
        """Generate responses for multiple prompts (synchronous batch processing)"""
        print(f"Processing batch of {len(prompts)} prompts synchronously...")
        responses = []
        for i, prompt in enumerate(prompts):
            print(f"Processing prompt {i+1}/{len(prompts)}")
            response = self.generate(prompt, **kwargs)
            responses.append(response)
        return responses

    async def generate_batch_async(
        self, prompts: List[str], **kwargs
    ) -> List[LLMResponse]:
        """
        Generate responses for multiple prompts (asynchronous batch processing)

        This method:
        1. Creates a unique ID for each prompt to track order
        2. Executes all API calls concurrently
        3. Returns responses in the same order as input prompts
        """
        print(f"Processing batch of {len(prompts)} prompts asynchronously...")

        # Create unique IDs for each prompt to maintain order
        prompt_uids = []
        tasks = []

        for i, prompt in enumerate(prompts):
            uid = str(uuid.uuid4())
            prompt_uids.append(uid)
            print(
                f"Creating async task for prompt {i+1}/{len(prompts)} with UID: {uid[:8]}..."
            )

            # Create task with UID to track order
            task = self._generate_async_with_uid(prompt, uid, **kwargs)
            tasks.append(task)

        # Execute all tasks concurrently
        print(f"Executing {len(tasks)} async tasks concurrently...")
        results = await asyncio.gather(*tasks)

        # Results come back as (uid, response) tuples
        # Create a dictionary to map UIDs to responses
        response_map = {uid: response for uid, response in results}

        # Reconstruct the responses in the original order using the UIDs
        ordered_responses = []
        for uid in prompt_uids:
            ordered_responses.append(response_map[uid])

        print(f"Completed processing {len(ordered_responses)} prompts asynchronously")
        print("✅ Order preserved: Responses returned in same order as input prompts")

        return ordered_responses
