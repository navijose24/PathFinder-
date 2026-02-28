from collections import defaultdict
from dataclasses import dataclass
from typing import Dict, List, Any

from django.conf import settings
import json


@dataclass
class QuestionOption:
    text: str
    value: float


@dataclass
class Question:
    id: str
    text: str
    criterion: str
    options: List[QuestionOption]


def _load_questions_for_domain(domain: str) -> List[Question]:
    with open(settings.QUESTIONS_JSON_PATH, encoding="utf-8") as f:
        data = json.load(f)

    questions: List[Question] = []

    for q in data.get("core_questions", []):
        questions.append(
            Question(
                id=q["id"],
                text=q["text"],
                criterion=q["criterion"],
                options=[QuestionOption(**opt) for opt in q["options"]],
            )
        )

    for q in data.get("stream_specific_questions", {}).get(domain, []):
        questions.append(
            Question(
                id=q["id"],
                text=q["text"],
                criterion=q["criterion"],
                options=[QuestionOption(**opt) for opt in q["options"]],
            )
        )

    return questions


def calculate_normalized_weights(domain: str, answers: Dict[str, float]) -> Dict[str, Any]:
    """
    Convert questionnaire answers into normalized criterion weights.

    answers: mapping of question_id -> selected numeric value (1–4).
    """
    questions = _load_questions_for_domain(domain)

    raw_scores: Dict[str, float] = defaultdict(float)

    for q in questions:
        if q.id not in answers:
            continue
        raw_scores[q.criterion] += float(answers[q.id])

    total_score = sum(raw_scores.values())
    if total_score <= 0:
        normalized = {k: 0.0 for k in raw_scores.keys()}
    else:
        normalized = {k: v / total_score for k, v in raw_scores.items()}

    sorted_criteria = sorted(
        normalized.items(), key=lambda kv: kv[1], reverse=True
    )

    return {
        "raw_scores": raw_scores,
        "normalized_weights": normalized,
        "sorted_criteria": [c for c, _ in sorted_criteria],
    }

