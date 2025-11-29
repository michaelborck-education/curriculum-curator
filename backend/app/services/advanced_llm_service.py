"""
Advanced LLM Service with comprehensive AI capabilities for education.

This service provides specialized educational AI features built on top of
the unified LLMService (which uses LiteLLM under the hood).
"""

import json
from typing import Any

from app.schemas.llm import (
    ChatMessage,
    GeneratedFeedback,
    GeneratedQuestion,
    LLMProvider,
    PedagogyAnalysisResponse,
)
from app.services.llm_service import llm_service


class AdvancedLLMService:
    """Enhanced LLM service with educational AI capabilities"""

    def __init__(self):
        self.providers: dict[str, bool] = {}
        self._check_providers()

    def _check_providers(self):
        """Check which providers are available"""
        # These are checked based on environment variables
        from app.core.config import settings

        if settings.OPENAI_API_KEY:
            self.providers["openai"] = True
        if settings.ANTHROPIC_API_KEY:
            self.providers["anthropic"] = True

    async def enhance_content(
        self,
        content: str,
        enhancement_type: str = "improve",
        pedagogy_style: str | None = None,
        target_level: str | None = None,
        preserve_structure: bool = True,
        focus_areas: list[str] | None = None,
    ) -> str:
        """Enhance content with AI assistance"""
        prompt = self._build_enhancement_prompt(
            content=content,
            enhancement_type=enhancement_type,
            pedagogy_style=pedagogy_style,
            target_level=target_level,
            preserve_structure=preserve_structure,
            focus_areas=focus_areas,
        )

        system_prompt = "You are an expert educational content enhancer."
        result = await llm_service.generate_text(
            prompt=prompt,
            system_prompt=system_prompt,
        )

        if isinstance(result, str):
            return result
        # Collect generator if streaming was returned
        return "".join([chunk async for chunk in result])

    async def analyze_pedagogy(
        self,
        content: str,
        check_alignment: bool = True,
        suggest_improvements: bool = True,
        target_style: str | None = None,
    ) -> PedagogyAnalysisResponse:
        """Analyze content for pedagogical quality"""
        prompt = f"""Analyze the following educational content for pedagogical quality:

Content:
{content}

Please provide:
1. The current pedagogical style/approach
2. Confidence score (0-1)
3. Key strengths from a pedagogical perspective
4. Areas for improvement
5. Specific actionable suggestions
{f"6. Alignment with {target_style} style" if target_style else ""}

Format your response as JSON with keys: current_style, confidence, strengths, weaknesses, suggestions, alignment_score"""

        system_prompt = "You are an expert in educational pedagogy and instructional design. Always respond with valid JSON."

        result = await llm_service.generate_text(
            prompt=prompt,
            system_prompt=system_prompt,
        )

        response_text = (
            result
            if isinstance(result, str)
            else "".join([chunk async for chunk in result])
        )

        try:
            data = json.loads(response_text)
            return PedagogyAnalysisResponse(**data)
        except (json.JSONDecodeError, ValueError):
            return PedagogyAnalysisResponse(
                current_style="unknown",
                confidence=0.5,
                strengths=["Content provided"],
                weaknesses=["Analysis failed"],
                suggestions=["Please review content manually"],
            )

    async def generate_questions(
        self,
        content: str,
        question_types: list[str] | None = None,
        count: int = 5,
        difficulty: str = "medium",
        bloom_levels: list[str] | None = None,
    ) -> list[GeneratedQuestion]:
        """Generate assessment questions from content"""
        question_types = question_types or ["multiple_choice", "short_answer"]

        prompt = f"""Generate {count} assessment questions from the following content:

Content:
{content}

Requirements:
- Question types: {", ".join(question_types)}
- Difficulty level: {difficulty}
{f"- Target Bloom taxonomy levels: {', '.join(bloom_levels)}" if bloom_levels else ""}

For each question provide:
1. The question text
2. Question type
3. Options (for multiple choice)
4. Correct answer
5. Explanation
6. Difficulty level
7. Bloom's taxonomy level
8. Suggested point value

Format as JSON array with the structure for each question."""

        system_prompt = (
            "You are an expert assessment designer. Always respond with valid JSON."
        )

        result = await llm_service.generate_text(
            prompt=prompt,
            system_prompt=system_prompt,
        )

        response_text = (
            result
            if isinstance(result, str)
            else "".join([chunk async for chunk in result])
        )

        try:
            questions_data = json.loads(response_text)
            return [GeneratedQuestion(**q) for q in questions_data]
        except (json.JSONDecodeError, ValueError):
            return [
                GeneratedQuestion(
                    question="What are the key concepts discussed in this content?",
                    question_type="short_answer",
                    difficulty=difficulty,
                    bloom_level="comprehension",
                    points=5,
                )
            ]

    async def generate_summary(
        self,
        content: str,
        summary_type: str = "key_points",
        max_length: int | None = None,
        include_examples: bool = False,
        bullet_points: bool = True,
    ) -> str:
        """Generate summary of content"""
        format_instruction = "bullet points" if bullet_points else "paragraph form"
        length_instruction = f"Maximum {max_length} words" if max_length else "Concise"

        summary_prompts = {
            "executive": "Create an executive summary suitable for stakeholders",
            "key_points": "Extract and summarize the key learning points",
            "abstract": "Write an academic abstract",
            "tldr": "Create a brief TL;DR summary",
        }

        prompt = f"""{summary_prompts.get(summary_type, summary_prompts["key_points"])} from the following content:

Content:
{content}

Requirements:
- Format: {format_instruction}
- Length: {length_instruction}
{"- Include key examples" if include_examples else "- Focus on concepts, not examples"}
"""

        system_prompt = "You are an expert at summarizing educational content clearly and concisely."

        result = await llm_service.generate_text(
            prompt=prompt,
            system_prompt=system_prompt,
        )

        return (
            result
            if isinstance(result, str)
            else "".join([chunk async for chunk in result])
        )

    async def generate_feedback(
        self,
        student_work: str,
        rubric: dict[str, Any] | None = None,
        assignment_context: str | None = None,
        feedback_tone: str = "encouraging",
        include_suggestions: bool = True,
        highlight_strengths: bool = True,
    ) -> GeneratedFeedback:
        """Generate feedback for student work"""
        tone_instructions = {
            "encouraging": "Be supportive and highlight progress",
            "neutral": "Provide balanced, objective feedback",
            "direct": "Be clear and direct about areas needing improvement",
        }

        prompt = f"""Provide feedback on the following student work:

{f"Assignment: {assignment_context}" if assignment_context else ""}
{f"Rubric: {json.dumps(rubric, indent=2)}" if rubric else ""}

Student Work:
{student_work}

Provide feedback with a {feedback_tone} tone.
{"Include specific suggestions for improvement." if include_suggestions else ""}
{"Highlight what the student did well." if highlight_strengths else ""}

Structure your response as JSON with keys: overall_feedback, strengths, areas_for_improvement, specific_suggestions, grade_suggestion, rubric_scores"""

        system_prompt = f"You are an experienced educator providing constructive feedback. {tone_instructions.get(feedback_tone, '')} Always respond with valid JSON."

        result = await llm_service.generate_text(
            prompt=prompt,
            system_prompt=system_prompt,
        )

        response_text = (
            result
            if isinstance(result, str)
            else "".join([chunk async for chunk in result])
        )

        try:
            data = json.loads(response_text)
            return GeneratedFeedback(**data)
        except (json.JSONDecodeError, ValueError):
            return GeneratedFeedback(
                overall_feedback="Thank you for your submission.",
                strengths=["Submission completed"],
                areas_for_improvement=["Please review the assignment requirements"],
                specific_suggestions=["Consider reviewing the course materials"],
            )

    async def translate_content(
        self,
        content: str,
        target_language: str,
        preserve_formatting: bool = True,
        cultural_adaptation: bool = False,
        glossary: dict[str, str] | None = None,
    ) -> str:
        """Translate educational content"""
        prompt = f"""Translate the following educational content to {target_language}:

Content:
{content}

Requirements:
{"- Preserve all markdown formatting" if preserve_formatting else ""}
{"- Adapt examples and references for the target culture" if cultural_adaptation else "- Keep examples as-is"}
{f"- Use these specific translations for technical terms: {json.dumps(glossary, indent=2)}" if glossary else ""}
- Maintain educational clarity and accuracy
"""

        system_prompt = f"You are an expert translator specializing in educational content. Translate to {target_language} while maintaining pedagogical effectiveness."

        result = await llm_service.generate_text(
            prompt=prompt,
            system_prompt=system_prompt,
        )

        return (
            result
            if isinstance(result, str)
            else "".join([chunk async for chunk in result])
        )

    async def generate_learning_path(
        self,
        topic: str,
        current_knowledge: str,
        target_level: str,
        available_time: str,
        learning_style: str | None = None,
    ) -> dict[str, Any]:
        """Generate personalized learning path"""
        prompt = f"""Create a personalized learning path for:

Topic: {topic}
Current Knowledge Level: {current_knowledge}
Target Level: {target_level}
Available Time: {available_time}
{f"Preferred Learning Style: {learning_style}" if learning_style else ""}

Provide a structured learning path with:
1. Prerequisites to review
2. Core concepts to learn (in order)
3. Practical exercises
4. Assessment milestones
5. Estimated time for each component
6. Recommended resources

Format as JSON with appropriate structure."""

        system_prompt = "You are an expert learning designer creating personalized educational pathways. Always respond with valid JSON."

        result = await llm_service.generate_text(
            prompt=prompt,
            system_prompt=system_prompt,
        )

        response_text = (
            result
            if isinstance(result, str)
            else "".join([chunk async for chunk in result])
        )

        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            return {
                "prerequisites": [],
                "core_concepts": [topic],
                "exercises": ["Practice exercises"],
                "milestones": ["Complete topic"],
                "estimated_hours": 10,
                "resources": ["Course materials"],
            }

    async def detect_misconceptions(
        self,
        student_response: str,
        correct_concept: str,
        context: str | None = None,
    ) -> dict[str, Any]:
        """Detect and explain student misconceptions"""
        prompt = f"""Analyze the student's response for misconceptions:

{f"Context/Question: {context}" if context else ""}
Correct Concept: {correct_concept}
Student Response: {student_response}

Identify:
1. Any misconceptions present
2. The likely source of confusion
3. How to correct the misconception
4. Suggested remediation approach

Format as JSON with keys: misconceptions, confusion_sources, corrections, remediation_suggestions"""

        system_prompt = "You are an expert educator skilled at identifying and addressing student misconceptions. Always respond with valid JSON."

        result = await llm_service.generate_text(
            prompt=prompt,
            system_prompt=system_prompt,
        )

        response_text = (
            result
            if isinstance(result, str)
            else "".join([chunk async for chunk in result])
        )

        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            return {
                "misconceptions": ["Unable to analyze"],
                "confusion_sources": ["Unknown"],
                "corrections": ["Review the concept"],
                "remediation_suggestions": ["Additional practice recommended"],
            }

    def _build_enhancement_prompt(
        self,
        content: str,
        enhancement_type: str,
        pedagogy_style: str | None,
        target_level: str | None,
        preserve_structure: bool,
        focus_areas: list[str] | None,
    ) -> str:
        """Build prompt for content enhancement"""
        enhancement_instructions = {
            "improve": "Improve the clarity, engagement, and educational effectiveness",
            "simplify": "Simplify the language and concepts for better understanding",
            "expand": "Expand with more details, examples, and explanations",
            "summarize": "Create a concise summary maintaining key concepts",
        }

        return f"""{enhancement_instructions.get(enhancement_type, enhancement_instructions["improve"])} of the following content:

Content:
{content}

Requirements:
{f"- Apply {pedagogy_style} pedagogical style" if pedagogy_style else ""}
{f"- Target education level: {target_level}" if target_level else ""}
{"- Preserve the original structure and formatting" if preserve_structure else "- Reorganize for better flow if needed"}
{f"- Focus on these areas: {', '.join(focus_areas)}" if focus_areas else ""}

Provide the enhanced content maintaining markdown formatting."""

    async def get_completion(
        self,
        messages: list[ChatMessage],
        temperature: float = 0.7,
        max_tokens: int | None = None,
        provider: LLMProvider | None = None,
    ) -> str:
        """Get completion from available LLM provider"""
        # Convert ChatMessage objects to dict format
        system_prompt = None
        user_prompt = ""

        for msg in messages:
            if msg.role == "system":
                system_prompt = msg.content
            elif msg.role == "user":
                user_prompt = msg.content

        result = await llm_service.generate_text(
            prompt=user_prompt,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        return (
            result
            if isinstance(result, str)
            else "".join([chunk async for chunk in result])
        )


# Singleton instance
advanced_llm_service = AdvancedLLMService()
