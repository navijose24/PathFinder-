from typing import Dict, Any, List
import json

from django.conf import settings


def _load_streams() -> Dict[str, Any]:
    with open(settings.STREAMS_JSON_PATH, encoding="utf-8") as f:
        return json.load(f)


def _load_course_matrix() -> Dict[str, Dict[str, float]]:
    with open(settings.COURSE_MATRIX_JSON_PATH, encoding="utf-8") as f:
        return json.load(f)


def _get_courses_for_combination(combination_id: str) -> List[str]:
    streams = _load_streams()
    for domain_data in streams.values():
        for combo in domain_data.get("combinations", []):
            if combo.get("id") == combination_id:
                base_courses = combo.get("courses", [])
                new_courses = combo.get("new_courses", [])
                return base_courses + new_courses
    return []


def rank_courses(
    combination_id: str,
    user_weights: Dict[str, float],
) -> Dict[str, Any]:
    """
    Rank courses for a given subject combination using the user's criterion weights.
    """
    all_courses = _get_courses_for_combination(combination_id)
    course_matrix = _load_course_matrix()

    ranked: List[Dict[str, Any]] = []

    for course_name in all_courses:
        criterion_scores = course_matrix.get(course_name)
        if not criterion_scores:
            # Skip courses not present in the matrix
            continue

        final_score = 0.0
        contributions: Dict[str, float] = {}

        for criterion, weight in user_weights.items():
            course_score = float(criterion_scores.get(criterion, 0.0))
            contribution = weight * course_score
            contributions[criterion] = contribution
            final_score += contribution

        ranked.append(
            {
                "course": course_name,
                "final_score": final_score,
                "criterion_scores": criterion_scores,
                "contributions": contributions,
            }
        )

    ranked.sort(key=lambda c: c["final_score"], reverse=True)

    return {
        "ranked_courses": ranked,
        "top_3": ranked[:3],
    }

