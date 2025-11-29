"""
AI/LLM API routes for content generation and educational AI features.

This is the unified AI endpoint - all LLM functionality is accessed through /api/ai/*
"""

import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api import deps
from app.models import User
from app.models.system_settings import SystemSettings
from app.schemas.content import ContentGenerationRequest
from app.schemas.llm import (
    ChatCompletionRequest,
    ChatMessage,
    ContentEnhanceRequest,
    ContentTranslationRequest,
    FeedbackGenerationRequest,
    GeneratedFeedback,
    GeneratedQuestion,
    LLMResponse,
    PedagogyAnalysisRequest,
    PedagogyAnalysisResponse,
    QuestionGenerationRequest,
    SummaryGenerationRequest,
)
from app.services.llm_service import llm_service

router = APIRouter()


# =============================================================================
# Content Generation
# =============================================================================


@router.post("/generate")
async def generate_content(
    request: ContentGenerationRequest,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
):
    """Generate educational content with AI assistance using streaming."""
    try:
        topic: str = request.topic or request.context or "General educational content"

        async def stream_response():
            async for chunk in llm_service.generate_content(
                pedagogy=request.pedagogy_style,
                topic=topic,
                content_type=request.content_type,
                user=current_user,
                db=db,
            ):
                yield f"data: {json.dumps({'content': chunk})}\n\n"

        if request.stream:
            return StreamingResponse(stream_response(), media_type="text/event-stream")

        # Non-streaming response
        result = ""
        async for chunk in llm_service.generate_content(
            pedagogy=request.pedagogy_style,
            topic=topic,
            content_type=request.content_type,
            user=current_user,
            db=db,
        ):
            result += chunk
        return {"content": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/enhance", response_model=LLMResponse)
async def enhance_content(
    request: ContentEnhanceRequest,
    current_user: User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> LLMResponse:
    """
    Enhance existing content with AI.

    Enhancement types:
    - improve: Improve clarity and engagement
    - simplify: Simplify for better understanding
    - expand: Add more details and examples
    - summarize: Create concise summary
    """
    try:
        enhanced_content = await llm_service.enhance_content(
            content=request.content,
            enhancement_type=request.enhancement_type,
            pedagogy_style=request.pedagogy_style,
            target_level=request.target_level,
            preserve_structure=request.preserve_structure,
            focus_areas=request.focus_areas,
            user=current_user,
            db=db,
        )
        return LLMResponse(
            content=enhanced_content, model="default", provider="configured"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Enhancement failed: {e!s}")


# =============================================================================
# Pedagogy & Analysis
# =============================================================================


@router.post("/analyze-pedagogy", response_model=PedagogyAnalysisResponse)
async def analyze_pedagogy(
    request: PedagogyAnalysisRequest,
    current_user: User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> PedagogyAnalysisResponse:
    """
    Analyze content for pedagogical quality and alignment.

    Returns current style, confidence score, strengths, weaknesses, and suggestions.
    """
    try:
        return await llm_service.analyze_pedagogy(
            content=request.content,
            target_style=request.target_style,
            user=current_user,
            db=db,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e!s}")


# =============================================================================
# Assessment & Questions
# =============================================================================


@router.post("/generate-questions", response_model=list[GeneratedQuestion])
async def generate_questions(
    request: QuestionGenerationRequest,
    current_user: User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> list[GeneratedQuestion]:
    """
    Generate assessment questions from content.

    Supports: multiple_choice, short_answer, true_false, essay, fill_blank
    """
    try:
        return await llm_service.generate_questions(
            content=request.content,
            question_types=request.question_types,
            count=request.count,
            difficulty=request.difficulty,
            bloom_levels=request.bloom_levels,
            user=current_user,
            db=db,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Question generation failed: {e!s}"
        )


@router.post("/generate-feedback", response_model=GeneratedFeedback)
async def generate_feedback(
    request: FeedbackGenerationRequest,
    current_user: User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> GeneratedFeedback:
    """Generate feedback for student work with rubric-based assessment."""
    try:
        return await llm_service.generate_feedback(
            student_work=request.student_work,
            rubric=request.rubric,
            assignment_context=request.assignment_context,
            feedback_tone=request.feedback_tone,
            user=current_user,
            db=db,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Feedback generation failed: {e!s}"
        )


# =============================================================================
# Summarization & Translation
# =============================================================================


@router.post("/generate-summary", response_model=LLMResponse)
async def generate_summary(
    request: SummaryGenerationRequest,
    current_user: User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> LLMResponse:
    """
    Generate summary of content.

    Types: executive, key_points, abstract, tldr
    """
    try:
        summary = await llm_service.generate_summary(
            content=request.content,
            summary_type=request.summary_type,
            max_length=request.max_length,
            bullet_points=request.bullet_points,
            user=current_user,
            db=db,
        )
        return LLMResponse(content=summary, model="default", provider="configured")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summary generation failed: {e!s}")


@router.post("/translate", response_model=LLMResponse)
async def translate_content(
    request: ContentTranslationRequest,
    current_user: User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> LLMResponse:
    """Translate educational content to another language with optional cultural adaptation."""
    try:
        translated = await llm_service.translate_content(
            content=request.content,
            target_language=request.target_language,
            preserve_formatting=request.preserve_formatting,
            cultural_adaptation=request.cultural_adaptation,
            glossary=request.glossary,
            user=current_user,
            db=db,
        )
        return LLMResponse(content=translated, model="default", provider="configured")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {e!s}")


# =============================================================================
# Learning Paths & Misconceptions
# =============================================================================


@router.post("/learning-path")
async def generate_learning_path(
    topic: str,
    current_knowledge: str,
    target_level: str,
    available_time: str,
    learning_style: str | None = None,
    current_user: User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> dict:
    """Generate personalized learning path with prerequisites, milestones, and resources."""
    try:
        return await llm_service.generate_learning_path(
            topic=topic,
            current_knowledge=current_knowledge,
            target_level=target_level,
            available_time=available_time,
            learning_style=learning_style,
            user=current_user,
            db=db,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Learning path generation failed: {e!s}"
        )


@router.post("/detect-misconceptions")
async def detect_misconceptions(
    student_response: str,
    correct_concept: str,
    context: str | None = None,
    current_user: User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> dict:
    """Detect and explain student misconceptions with remediation suggestions."""
    try:
        return await llm_service.detect_misconceptions(
            student_response=student_response,
            correct_concept=correct_concept,
            context=context,
            user=current_user,
            db=db,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Misconception detection failed: {e!s}"
        )


# =============================================================================
# Chat & General Completion
# =============================================================================


@router.post("/chat", response_model=LLMResponse)
async def chat_completion(
    request: ChatCompletionRequest,
    current_user: User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> LLMResponse:
    """General chat completion for educational assistance."""
    try:
        response = await llm_service.get_completion(
            messages=request.messages,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            user=current_user,
            db=db,
        )
        return LLMResponse(
            content=response,
            model=request.model or "default",
            provider=request.provider or "configured",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat completion failed: {e!s}")


@router.post("/validate-content")
async def validate_content_with_ai(
    content: str,
    validation_type: str = "comprehensive",
    current_user: User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> dict:
    """
    Validate content using AI for quality checks.

    Types: comprehensive, factual, consistency, completeness
    """
    prompt = f"""Validate the following content for {validation_type} quality:

{content}

Check for:
1. Factual accuracy
2. Internal consistency
3. Completeness of coverage
4. Logical flow
5. Appropriate difficulty level

Return findings as JSON with keys: issues, suggestions, score"""

    messages = [
        ChatMessage(role="system", content="You are an expert content validator."),
        ChatMessage(role="user", content=prompt),
    ]

    try:
        response = await llm_service.get_completion(messages, user=current_user, db=db)
        return {"validation_result": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {e!s}")


# =============================================================================
# Provider Status & Configuration
# =============================================================================


@router.get("/provider-status")
async def get_provider_status(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
):
    """Get the current LLM provider status for the user."""
    user_config = current_user.llm_config or {}
    if isinstance(user_config, str):
        user_config = json.loads(user_config)

    provider = user_config.get("provider", "system")

    # Get system default if using system
    if provider == "system":
        system_provider = (
            db.query(SystemSettings)
            .filter(SystemSettings.key == "default_llm_provider")
            .first()
        )
        actual_provider = system_provider.value if system_provider else "openai"
    else:
        actual_provider = provider

    # Check if API key is configured
    has_api_key = False
    if provider != "system":
        key_map = {
            "openai": "openai_api_key",
            "anthropic": "anthropic_api_key",
            "gemini": "gemini_api_key",
        }
        has_api_key = bool(user_config.get(key_map.get(provider, "")))
    else:
        system_key = (
            db.query(SystemSettings)
            .filter(SystemSettings.key == f"system_{actual_provider}_api_key")
            .first()
        )
        has_api_key = bool(system_key and system_key.value)

    return {
        "provider": provider,
        "actual_provider": actual_provider,
        "has_api_key": has_api_key,
        "model": user_config.get("model"),
        "is_configured": has_api_key,
    }


@router.get("/models")
async def list_available_models(
    current_user: User = Depends(deps.get_current_active_user),
) -> dict:
    """List available AI models and providers."""
    return {
        "providers": {
            "openai": {
                "available": llm_service.providers.get("openai", False),
                "models": ["gpt-4", "gpt-4-turbo", "gpt-4o", "gpt-3.5-turbo"],
                "capabilities": ["chat", "completion", "embedding"],
            },
            "anthropic": {
                "available": llm_service.providers.get("anthropic", False),
                "models": [
                    "claude-3-5-sonnet",
                    "claude-3-opus",
                    "claude-3-sonnet",
                    "claude-3-haiku",
                ],
                "capabilities": ["chat", "completion"],
            },
            "ollama": {
                "available": True,  # Always available if configured
                "models": ["llama3.2", "llama3.1", "mistral", "codellama"],
                "capabilities": ["chat", "completion"],
            },
        },
        "default_model": "gpt-4",
        "features": [
            "content_generation",
            "content_enhancement",
            "pedagogy_analysis",
            "question_generation",
            "summarization",
            "feedback_generation",
            "translation",
            "learning_paths",
            "misconception_detection",
        ],
    }
