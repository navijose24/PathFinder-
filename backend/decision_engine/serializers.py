from typing import Dict, Any

from rest_framework import serializers


class CalculateWeightsRequestSerializer(serializers.Serializer):
    domain = serializers.CharField()
    answers = serializers.DictField(
        child=serializers.FloatField(), help_text="Mapping of question_id -> selected value"
    )


class RankCoursesRequestSerializer(serializers.Serializer):
    combination_id = serializers.CharField()
    user_weights = serializers.DictField(
        child=serializers.FloatField(), help_text="Mapping of criterion -> normalized weight"
    )


class ExplanationRequestSerializer(serializers.Serializer):
    top_course = serializers.CharField()
    top_criteria = serializers.ListField(child=serializers.CharField())
    user_weights = serializers.DictField(child=serializers.FloatField())
    subject_combination = serializers.CharField()


def serialize_error(detail: Any) -> Dict[str, Any]:
    return {"error": detail}

