from typing import Dict, Any, List
import os


def _format_prompt(
    top_course: str,
    top_criteria: List[str],
    user_weights: Dict[str, float],
    subject_combination: str,
) -> str:
    weighted_lines = [
        f"- {crit}: {weight:.2f}"
        for crit, weight in sorted(
            user_weights.items(), key=lambda kv: kv[1], reverse=True
        )
    ]

    criteria_text = "\n".join(weighted_lines)
    top_criteria_text = ", ".join(top_criteria)

    return (
        "You are a career guidance expert explaining recommendations to a +2 student.\n\n"
        f"Top recommended course: {top_course}\n"
        f"Subject combination: {subject_combination}\n"
        f"Most influential criteria: {top_criteria_text}\n\n"
        "User preference weights (higher means more important):\n"
        f"{criteria_text}\n\n"
        "Explain in clear, encouraging language:\n"
        "1. Why this course fits the student based on their preferences.\n"
        "2. How the course aligns with their strengths and study commitment.\n"
        "3. Career stability and growth outlook.\n"
        "4. Financial and income potential in simple terms.\n"
        "Keep it concise (3–5 short paragraphs) and avoid jargon."
    )


def _fallback_explanation() -> str:
    """
    Deterministic text used when the Gemini API is not available.
    """
    return (
        "Based on your preferences, this course offers a strong match with your "
        "desired stability, analytical depth, and long‑term career growth. "
        "It balances study duration with future opportunities and is likely to "
        "provide a healthy income trajectory over time."
    )


def _use_gemini_model(prompt: str) -> str:
    """
    Call Google's Gemini API (using the modern google-genai SDK) if credentials
    are available. Falls back to a deterministic explanation otherwise.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return _fallback_explanation()

    model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

    try:
        # Preferred: new google-genai SDK.
        from google import genai  # type: ignore[import]

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
        )

        # Try to extract text in a robust way across SDK versions.
        text = ""
        if getattr(response, "candidates", None):
            first = response.candidates[0]
            parts = getattr(first, "content", getattr(first, "contents", None)).parts  # type: ignore[attr-defined]
            text = "".join(getattr(p, "text", "") for p in parts)
        else:
            text = getattr(response, "text", "") or ""

        return text or _fallback_explanation()
    except Exception:
        # As a safety net, fall back to the deterministic copy instead of
        # surfacing internal errors to end users.
        return _fallback_explanation()


def generate_course_explanation(payload: Dict[str, Any]) -> Dict[str, str]:
    top_course = payload.get("top_course", "")
    top_criteria = payload.get("top_criteria", [])
    user_weights = payload.get("user_weights", {})
    subject_combination = payload.get("subject_combination", "")

    prompt = _format_prompt(
        top_course=top_course,
        top_criteria=top_criteria,
        user_weights=user_weights,
        subject_combination=subject_combination,
    )

    text = _use_gemini_model(prompt)

    return {
        "prompt": prompt,
        "explanation": text,
    }

