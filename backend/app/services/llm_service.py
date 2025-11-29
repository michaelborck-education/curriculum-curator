"""
Unified LLM Service using LiteLLM

Provides a single interface for multiple LLM providers (OpenAI, Anthropic, Ollama, etc.)
with support for:
- BYOK (Bring Your Own Key)
- Streaming responses
- Structured JSON output
- Token estimation and cost tracking
"""

import json
from collections.abc import AsyncGenerator
from typing import Any, cast

import litellm
from litellm import acompletion, completion_cost
from pydantic import BaseModel, ValidationError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.system_settings import SystemSettings
from app.models.user import User
from app.services.prompt_templates import PromptTemplate

# Configure LiteLLM
litellm.drop_params = True  # Automatically drop unsupported params per provider


class LLMService:
    """Unified LLM service using LiteLLM for multi-provider support"""

    # Default models per provider
    DEFAULT_MODELS = {
        "openai": "gpt-4",
        "anthropic": "claude-3-5-sonnet-20241022",
        "ollama": "ollama/llama3.2",
        "gemini": "gemini/gemini-pro",
    }

    def __init__(self):
        pass

    def _get_system_settings(self, db: Session) -> dict:
        """Get system-wide LLM settings from database"""
        settings_dict: dict[str, Any] = {}
        system_settings = (
            db.query(SystemSettings)
            .filter(
                SystemSettings.key.in_(
                    [
                        "default_llm_provider",
                        "default_llm_model",
                        "system_openai_api_key",
                        "system_anthropic_api_key",
                        "system_gemini_api_key",
                        "ollama_api_base",
                        "allow_user_api_keys",
                    ]
                )
            )
            .all()
        )

        for setting in system_settings:
            settings_dict[setting.key] = setting.value

        return settings_dict

    def _get_user_api_key(self, provider: str, user_config: dict) -> str | None:
        """Extract API key from user config based on provider"""
        api_key_map = {
            "openai": "openai_api_key",
            "anthropic": "anthropic_api_key",
            "gemini": "gemini_api_key",
        }
        key_name = api_key_map.get(provider)
        return user_config.get(key_name) if key_name else None

    def _get_system_api_key(self, provider: str, system_settings: dict) -> str | None:
        """Get system API key for provider"""
        provider_settings_map = {
            "openai": ("system_openai_api_key", settings.OPENAI_API_KEY),
            "anthropic": ("system_anthropic_api_key", settings.ANTHROPIC_API_KEY),
            "gemini": (
                "system_gemini_api_key",
                getattr(settings, "GEMINI_API_KEY", None),
            ),
        }

        if provider not in provider_settings_map:
            return None

        settings_key, env_key = provider_settings_map[provider]
        return system_settings.get(settings_key) or env_key

    def _get_user_llm_config(
        self, user: User | None
    ) -> tuple[str | None, str | None, str | None]:
        """Extract provider, model, and API key from user config"""
        if not user or not user.llm_config:
            return None, None, None

        user_config = user.llm_config
        if isinstance(user_config, str):
            user_config = json.loads(user_config)

        provider = user_config.get("provider")
        if not provider or provider == "system":
            return None, None, None

        model = user_config.get("model")
        api_key = self._get_user_api_key(provider, user_config)
        return provider, model, api_key

    def _get_llm_config(
        self, user: User | None = None, db: Session | None = None
    ) -> tuple[str, str, str | None, str | None]:
        """
        Get LLM configuration based on user preferences and system settings.

        Returns:
            Tuple of (model, provider, api_key, api_base)
        """
        # Get system settings
        system_settings = self._get_system_settings(db) if db else {}

        # Try user config first (BYOK)
        provider, model, api_key = self._get_user_llm_config(user)

        # Fall back to system defaults if needed
        if not provider:
            provider = system_settings.get("default_llm_provider", "openai")
            model = system_settings.get("default_llm_model")
            api_key = self._get_system_api_key(provider, system_settings)

        # Ensure we have a model
        if not model:
            model = self.DEFAULT_MODELS.get(provider, "gpt-4")

        # Format model name for LiteLLM (provider prefix for non-OpenAI)
        litellm_model = self._format_model_name(model, provider)

        # Get API base for self-hosted (Ollama)
        api_base = None
        if provider == "ollama":
            api_base = system_settings.get("ollama_api_base", "http://localhost:11434")

        return litellm_model, provider, api_key, api_base

    def _format_model_name(self, model: str, provider: str) -> str:
        """Format model name for LiteLLM (add provider prefix if needed)"""
        # If already prefixed, return as-is
        if "/" in model:
            return model

        # Add provider prefix for non-OpenAI models
        provider_prefixes = {
            "anthropic": "",  # LiteLLM recognizes claude- models
            "ollama": "ollama/",
            "gemini": "gemini/",
        }

        prefix = provider_prefixes.get(provider, "")
        return f"{prefix}{model}" if prefix else model

    async def generate_content(
        self,
        pedagogy: str,
        topic: str,
        content_type: str,
        user: User | None = None,
        db: Session | None = None,
    ) -> AsyncGenerator[str, None]:
        """Generate educational content using LLM with streaming"""
        model, provider, api_key, api_base = self._get_llm_config(user, db)

        if not api_key and provider not in ["ollama"]:
            yield f"No API key configured for provider {provider}"
            return

        prompt = self._build_prompt(pedagogy, topic, content_type)

        messages = [
            {"role": "system", "content": prompt},
            {
                "role": "user",
                "content": f"Create {content_type} content about: {topic}",
            },
        ]

        try:
            response = await acompletion(
                model=model,
                messages=messages,
                api_key=api_key,
                api_base=api_base,
                stream=True,
            )

            # Cast to async iterable for streaming response
            async for chunk in cast("Any", response):
                if hasattr(chunk, "choices") and chunk.choices:
                    delta = chunk.choices[0].delta
                    if hasattr(delta, "content") and delta.content:
                        yield delta.content

        except Exception as e:
            yield f"Error generating content: {e!s}"

    async def generate_text(
        self,
        prompt: str,
        system_prompt: str | None = None,
        user: User | None = None,
        db: Session | None = None,
        temperature: float = 0.7,
        max_tokens: int | None = None,
        stream: bool = False,
    ) -> AsyncGenerator[str, None] | str:
        """
        Generate text from a prompt.

        Args:
            prompt: The user prompt
            system_prompt: Optional system prompt
            user: User for BYOK support
            db: Database session
            temperature: Sampling temperature (0-2)
            max_tokens: Maximum tokens to generate
            stream: Whether to stream the response

        Returns:
            Generated text or async generator of chunks
        """
        model, provider, api_key, api_base = self._get_llm_config(user, db)

        if not api_key and provider not in ["ollama"]:
            error_msg = f"No API key configured for provider {provider}"
            if stream:

                async def error_gen() -> AsyncGenerator[str, None]:
                    yield error_msg

                return error_gen()
            return error_msg

        messages: list[dict[str, str]] = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        try:
            if stream:

                async def stream_gen() -> AsyncGenerator[str, None]:
                    response = await acompletion(
                        model=model,
                        messages=messages,
                        api_key=api_key,
                        api_base=api_base,
                        temperature=temperature,
                        max_tokens=max_tokens,
                        stream=True,
                    )
                    async for chunk in cast("Any", response):
                        if hasattr(chunk, "choices") and chunk.choices:
                            delta = chunk.choices[0].delta
                            if hasattr(delta, "content") and delta.content:
                                yield delta.content

                return stream_gen()

            response = await acompletion(
                model=model,
                messages=messages,
                api_key=api_key,
                api_base=api_base,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=False,
            )
            # Non-streaming response
            result = cast("Any", response)
            return result.choices[0].message.content or ""

        except Exception as e:
            error_msg = f"Error generating text: {e!s}"
            if stream:

                async def error_gen() -> AsyncGenerator[str, None]:
                    yield error_msg

                return error_gen()
            return error_msg

    async def enhance_content(
        self,
        content: str,
        enhancement_type: str,
        user: User | None = None,
        db: Session | None = None,
    ) -> str:
        """Enhance existing content"""
        enhancement_prompts = {
            "improve": "Improve the clarity, structure, and educational effectiveness of this content while preserving its core message:",
            "simplify": "Simplify this content for easier understanding while maintaining key concepts:",
            "expand": "Expand this content with more details, examples, and explanations:",
            "summarize": "Create a concise summary of this content:",
        }

        system_prompt = enhancement_prompts.get(
            enhancement_type, "Enhance this educational content:"
        )

        result = await self.generate_text(
            prompt=content,
            system_prompt=system_prompt,
            user=user,
            db=db,
            temperature=0.7,
        )

        if isinstance(result, str):
            return result
        # If it's a generator (shouldn't happen with stream=False), collect it
        return "".join([chunk async for chunk in result])

    def _build_prompt(self, pedagogy: str, topic: str, content_type: str) -> str:
        """Build pedagogically-aware prompt"""
        style = pedagogy.lower().replace(" ", "-")
        styles = {
            "traditional": "Focus on direct instruction, clear explanations, and structured practice.",
            "inquiry-based": "Encourage questioning, exploration, and discovery learning.",
            "project-based": "Emphasize real-world applications and hands-on projects.",
            "collaborative": "Promote group work, peer learning, and discussion.",
            "game-based": "Incorporate game elements, challenges, and rewards.",
            "flipped": "Design for self-paced learning with active classroom application.",
            "differentiated": "Provide multiple paths and options for different learners.",
            "constructivist": "Build on prior knowledge and encourage meaning-making.",
            "experiential": "Focus on learning through experience and reflection.",
        }

        return f"""You are an expert educational content creator specializing in {style} learning.
{styles.get(style, "")}
Create content that aligns with this pedagogical approach."""

    async def generate_structured_content(
        self,
        prompt: str,
        response_model: type[BaseModel],
        user: User | None = None,
        db: Session | None = None,
        temperature: float = 0.7,
        max_retries: int = 3,
    ) -> tuple[BaseModel | None, str | None]:
        """
        Generate structured content with JSON output.

        Args:
            prompt: The prompt to send to the LLM
            response_model: Pydantic model class for response validation
            user: User making the request (for API key selection)
            db: Database session
            temperature: LLM temperature (0-1)
            max_retries: Number of retries for parsing failures

        Returns:
            Tuple of (parsed_model, error_message)
        """
        model, provider, api_key, api_base = self._get_llm_config(user, db)

        if not api_key and provider not in ["ollama"]:
            return None, f"No API key configured for provider {provider}"

        # Get JSON schema from Pydantic model
        json_schema = response_model.model_json_schema()

        # Enhance prompt with JSON instructions
        enhanced_prompt = f"""{prompt}

IMPORTANT: You must respond with valid JSON that matches this exact schema:
{json.dumps(json_schema, indent=2)}

Provide ONLY the JSON object, no additional text or markdown formatting."""

        messages = [
            {
                "role": "system",
                "content": "You are an expert curriculum designer. Always respond with valid JSON.",
            },
            {"role": "user", "content": enhanced_prompt},
        ]

        # Try to get structured response
        for attempt in range(max_retries):
            try:
                # Adjust temperature for retries
                current_temp = max(0.3, temperature - (attempt * 0.1))

                # Use JSON mode if available (OpenAI, some others)
                response_format = None
                if provider == "openai" and "gpt-4" in model:
                    response_format = {"type": "json_object"}

                response = await acompletion(
                    model=model,
                    messages=messages,
                    api_key=api_key,
                    api_base=api_base,
                    temperature=current_temp,
                    response_format=response_format,
                )

                # Non-streaming response
                result = cast("Any", response)
                content = result.choices[0].message.content or ""

                # Clean response (remove markdown if present)
                content = content.strip()
                if content.startswith("```json"):
                    content = content[7:]
                if content.startswith("```"):
                    content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]
                content = content.strip()

                # Parse JSON
                json_data = json.loads(content)

                # Validate with Pydantic
                result = response_model(**json_data)
                return result, None

            except json.JSONDecodeError as e:
                error_msg = (
                    f"JSON parsing failed (attempt {attempt + 1}/{max_retries}): {e!s}"
                )
                if attempt < max_retries - 1:
                    messages.append(
                        {
                            "role": "user",
                            "content": f"Your response was not valid JSON. Error: {e!s}. Please provide valid JSON only.",
                        }
                    )
                    continue
                return None, error_msg

            except ValidationError as e:
                error_msg = f"Schema validation failed (attempt {attempt + 1}/{max_retries}): {e!s}"
                if attempt < max_retries - 1:
                    messages.append(
                        {
                            "role": "user",
                            "content": f"Your JSON didn't match the required schema. Errors: {e.json()}. Please fix and provide valid JSON.",
                        }
                    )
                    continue
                return None, error_msg

            except Exception as e:
                return None, f"Unexpected error: {e!s}"

        return None, f"Failed after {max_retries} attempts"

    async def generate_with_template(
        self,
        template: PromptTemplate,
        context: dict[str, Any],
        response_model: type[BaseModel] | None = None,
        user: User | None = None,
        db: Session | None = None,
    ) -> tuple[Any, str | None]:
        """
        Generate content using a prompt template.

        Args:
            template: PromptTemplate instance
            context: Context variables for template
            response_model: Optional Pydantic model for structured output
            user: User making the request
            db: Database session

        Returns:
            Tuple of (result, error_message)
        """
        try:
            # Render the template
            prompt = template.render(**context)

            # Generate structured or unstructured response
            if response_model:
                return await self.generate_structured_content(
                    prompt=prompt,
                    response_model=response_model,
                    user=user,
                    db=db,
                )

            # Unstructured text generation
            result = await self.generate_text(
                prompt=prompt,
                user=user,
                db=db,
            )
            if isinstance(result, str):
                return result, None
            # Collect generator
            return "".join([chunk async for chunk in result]), None

        except ValueError as e:
            return None, f"Template error: {e!s}"
        except Exception as e:
            return None, f"Generation error: {e!s}"

    def estimate_tokens(self, text: str, model: str = "gpt-4") -> int:
        """
        Estimate token count for a text using tiktoken.

        Args:
            text: Text to count tokens for
            model: Model to use for tokenization

        Returns:
            Estimated token count
        """
        try:
            import tiktoken

            encoding = tiktoken.encoding_for_model(model)
            return len(encoding.encode(text))
        except Exception:
            # Fallback: rough estimation (~4 chars per token)
            return len(text) // 4

    def estimate_cost(
        self,
        input_tokens: int,
        output_tokens: int,
        model: str = "gpt-4",
    ) -> float:
        """
        Estimate cost for token usage using LiteLLM's cost tracking.

        Args:
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            model: Model name

        Returns:
            Estimated cost in USD
        """
        try:
            # Use LiteLLM's built-in cost calculation
            cost = completion_cost(
                model=model,
                prompt="x" * input_tokens,  # Dummy for calculation
                completion="x" * output_tokens,
            )
            return cost
        except Exception:
            # Fallback to manual calculation
            pricing = {
                "gpt-4": {"input": 0.03, "output": 0.06},
                "gpt-4-turbo": {"input": 0.01, "output": 0.03},
                "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
                "claude-3-opus": {"input": 0.015, "output": 0.075},
                "claude-3-sonnet": {"input": 0.003, "output": 0.015},
                "claude-3-haiku": {"input": 0.00025, "output": 0.00125},
            }

            # Find matching model
            model_key = next((k for k in pricing if k in model.lower()), "gpt-4")
            model_pricing = pricing[model_key]

            input_cost = (input_tokens / 1000) * model_pricing["input"]
            output_cost = (output_tokens / 1000) * model_pricing["output"]
            return input_cost + output_cost

    async def list_available_models(self, provider: str | None = None) -> list[str]:
        """
        List available models for a provider.

        Args:
            provider: Optional provider filter

        Returns:
            List of model names
        """
        # Common models by provider
        models = {
            "openai": [
                "gpt-4",
                "gpt-4-turbo",
                "gpt-4o",
                "gpt-4o-mini",
                "gpt-3.5-turbo",
            ],
            "anthropic": [
                "claude-3-5-sonnet-20241022",
                "claude-3-opus-20240229",
                "claude-3-sonnet-20240229",
                "claude-3-haiku-20240307",
            ],
            "ollama": [
                "ollama/llama3.2",
                "ollama/llama3.1",
                "ollama/mistral",
                "ollama/codellama",
            ],
            "gemini": [
                "gemini/gemini-pro",
                "gemini/gemini-pro-vision",
            ],
        }

        if provider:
            return models.get(provider, [])

        # Return all models
        all_models = []
        for provider_models in models.values():
            all_models.extend(provider_models)
        return all_models

    async def test_connection(
        self,
        provider: str,
        api_key: str | None = None,
        api_url: str | None = None,
        bearer_token: str | None = None,
        model_name: str | None = None,
        test_prompt: str = "Hello, please respond with 'Connection successful!'",
    ) -> dict[str, Any]:
        """
        Test LLM connection with provided configuration.

        Args:
            provider: LLM provider name
            api_key: API key for the provider
            api_url: API URL (for self-hosted like Ollama)
            bearer_token: Bearer token (for Ollama)
            model_name: Model to test with
            test_prompt: Prompt to test generation

        Returns:
            Dict with success status, message, and available models
        """
        try:
            # Determine model
            model = model_name or self.DEFAULT_MODELS.get(provider, "gpt-3.5-turbo")
            litellm_model = self._format_model_name(model, provider)

            # For Ollama, try to list models first
            available_models: list[str] = []
            if provider == "ollama":
                try:
                    import httpx

                    base_url = api_url or "http://localhost:11434"
                    headers = {}
                    if bearer_token:
                        headers["Authorization"] = f"Bearer {bearer_token}"

                    async with httpx.AsyncClient() as client:
                        response = await client.get(
                            f"{base_url}/api/tags", headers=headers, timeout=10.0
                        )
                        if response.status_code == 200:
                            models_data = response.json()
                            available_models = [
                                m["name"] for m in models_data.get("models", [])
                            ]
                except Exception:
                    pass  # Continue with test even if model listing fails
            else:
                available_models = await self.list_available_models(provider)

            # Test generation
            messages = [{"role": "user", "content": test_prompt}]

            response = await acompletion(
                model=litellm_model,
                messages=messages,
                api_key=api_key,
                api_base=api_url,
                max_tokens=50,
            )

            result = cast("Any", response)
            response_text = result.choices[0].message.content or ""

            return {
                "success": True,
                "message": "Connection successful",
                "available_models": available_models,
                "response_text": response_text,
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Connection failed: {e!s}",
                "error": str(e),
            }

    def get_token_stats(
        self, db: Session, user_id: str, days: int = 30
    ) -> dict[str, Any]:
        """
        Get token usage statistics for a user.

        Args:
            db: Database session
            user_id: User ID to get stats for
            days: Number of days to look back

        Returns:
            Dict with usage statistics
        """
        from datetime import datetime, timedelta

        from app.models.llm_config import TokenUsageLog

        start_date = datetime.utcnow() - timedelta(days=days)

        logs = (
            db.query(TokenUsageLog)
            .filter(
                TokenUsageLog.user_id == user_id,
                TokenUsageLog.created_at >= start_date,
            )
            .all()
        )

        total_tokens = sum(log.total_tokens or 0 for log in logs)
        total_cost = sum(log.cost_estimate or 0 for log in logs)

        by_provider: dict[str, int] = {}
        by_model: dict[str, int] = {}

        for log in logs:
            provider = log.provider or "unknown"
            model = log.model or "unknown"
            tokens = log.total_tokens or 0

            by_provider[provider] = by_provider.get(provider, 0) + tokens
            by_model[model] = by_model.get(model, 0) + tokens

        return {
            "user_id": user_id,
            "total_tokens": total_tokens,
            "total_cost": total_cost,
            "by_provider": by_provider,
            "by_model": by_model,
            "period_start": start_date.isoformat(),
            "period_end": datetime.utcnow().isoformat(),
        }


# Create singleton instance
llm_service = LLMService()
