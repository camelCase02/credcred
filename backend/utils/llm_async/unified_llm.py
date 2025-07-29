import os

from utils.llm_async.bedrock_llm import BedrockLLMProvider
from utils.llm_async.gpt_llm import GPTLLMProvider
from utils.llm_async.llm import LLMProvider, LLMResponse


class LLMProvider(LLMProvider):
    """
    Unified LLMProvider that automatically selects the backend (Bedrock or OpenAI GPT)
    based on the model name from config.yml.
    """

    def __init__(
        self,
        model_name: str = None,
        api_key: str = None,
        base_url: str = None,
        config_section: str = "paginate_config",
    ):
        # Load config if model_name is not provided
        if model_name is None:
            model_name = "gpt-4.1"
        self.model_name = model_name
        self.provider = self._select_provider(model_name, api_key, base_url)

    def _select_provider(self, model_name, api_key, base_url):
        model_name_lower = model_name.lower()
        # Add more logic here if you support more providers
        if model_name_lower.startswith("anthropic") or model_name_lower.startswith(
            "amazon"
        ):
            return BedrockLLMProvider(model_name)
        elif model_name_lower.startswith("gpt-") or model_name_lower.startswith(
            "openai"
        ):
            # Try to get API key from env if not provided
            api_key = api_key or os.environ.get("OPENAI_API_KEY")
            return GPTLLMProvider(model_name, api_key=api_key, base_url=base_url)
        else:
            raise ValueError(f"Unknown or unsupported model name: {model_name}")

    def generate(self, prompt, **kwargs) -> LLMResponse:
        return self.provider.generate(prompt, **kwargs)

    async def generate_async(self, prompt, **kwargs) -> LLMResponse:
        return await self.provider.generate_async(prompt, **kwargs)

    def generate_batch(self, prompts, **kwargs):
        return self.provider.generate_batch(prompts, **kwargs)

    async def generate_batch_async(self, prompts, **kwargs):
        return await self.provider.generate_batch_async(prompts, **kwargs)

    def generate_flexible(self, prompts, **kwargs):
        return self.provider.generate_flexible(prompts, **kwargs)

    async def generate_flexible_async(self, prompts, **kwargs):
        return await self.provider.generate_flexible_async(prompts, **kwargs)

    def as_runnable(self):
        return self.provider.as_runnable()
