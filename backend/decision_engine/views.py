import json
from typing import Any, Dict

from django.conf import settings
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .serializers import (
    CalculateWeightsRequestSerializer,
    RankCoursesRequestSerializer,
    ExplanationRequestSerializer,
    serialize_error,
)
from .services.weight_engine import calculate_normalized_weights
from .services.ranking_engine import rank_courses
from .services.gemini_service import generate_course_explanation


def _load_streams() -> Dict[str, Any]:
    with open(settings.STREAMS_JSON_PATH, encoding="utf-8") as f:
        return json.load(f)


def _load_questions() -> Dict[str, Any]:
    with open(settings.QUESTIONS_JSON_PATH, encoding="utf-8") as f:
        return json.load(f)


@api_view(["GET"])
def streams_view(_request):
    """
    GET /api/streams
    Returns available domains with basic metadata.
    """
    data = _load_streams()
    domains = []
    for domain_name, domain_data in data.items():
        domains.append(
            {
                "name": domain_name,
                "description": domain_data.get("description"),
                "combination_count": len(domain_data.get("combinations", [])),
            }
        )
    return Response({"domains": domains})


@api_view(["GET"])
def combinations_view(_request, domain: str):
    """
    GET /api/combinations/<domain>
    Returns subject combinations for a given domain.
    """
    data = _load_streams()
    domain_data = data.get(domain)
    if not domain_data:
        return Response(
            serialize_error("Unknown domain"), status=status.HTTP_404_NOT_FOUND
        )
    return Response({"domain": domain, "combinations": domain_data.get("combinations", [])})


@api_view(["GET"])
def questions_view(_request, domain: str):
    """
    GET /api/questions/<domain>
    Returns combined core + stream-specific questions.
    """
    data = _load_questions()
    core = data.get("core_questions", [])
    stream_specific = data.get("stream_specific_questions", {}).get(domain, [])
    return Response({"domain": domain, "questions": core + stream_specific})


@api_view(["POST"])
def calculate_weights_view(request):
    """
    POST /api/calculate-weights
    Body: { domain: string, answers: { questionId: numericValue } }
    """
    serializer = CalculateWeightsRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    domain = serializer.validated_data["domain"]
    answers = serializer.validated_data["answers"]

    result = calculate_normalized_weights(domain, answers)

    primary_criteria = ["stability", "analytical", "income_priority", "years_willing"]

    return Response(
        {
            "raw_scores": result["raw_scores"],
            "normalized_weights": result["normalized_weights"],
            "sorted_criteria": result["sorted_criteria"],
            "primary_criteria": primary_criteria,
        }
    )


@api_view(["POST"])
def rank_courses_view(request):
    """
    POST /api/rank-courses
    Body: { combination_id: string, user_weights: { criterion: weight } }
    """
    serializer = RankCoursesRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    combination_id = serializer.validated_data["combination_id"]
    user_weights = serializer.validated_data["user_weights"]

    result = rank_courses(combination_id=combination_id, user_weights=user_weights)
    return Response(result)


@api_view(["POST"])
def generate_explanation_view(request):
    """
    POST /api/generate-explanation
    Body: { top_course, top_criteria, user_weights, subject_combination }
    """
    serializer = ExplanationRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    payload = serializer.validated_data
    result = generate_course_explanation(payload)
    return Response(result)

