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


def _use_gemini_model(prompt: str) -> str:
    """
    Call Google's Gemini API if credentials are available.
    Falls back to a deterministic explanation when not configured.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return (
            "Based on your preferences, this course offers a strong match with your "
            "desired stability, analytical depth, and long‑term career growth. "
            "It balances study duration with future opportunities and is likely to "
            "provide a healthy income trajectory over time."
        )

    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-pro-latest")
        response = model.generate_content(prompt)
        return response.text or "The model did not return any content."
    except Exception as exc:  # pragma: no cover - defensive path
        return (
            "An AI explanation could not be generated at this moment. "
            f"(Internal note: {exc})"
        )


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

