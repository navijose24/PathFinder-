from django.urls import path
from rest_framework.response import Response
from rest_framework.decorators import api_view

from .services.weight_engine import calculate_normalized_weights
from .services.ranking_engine import rank_courses
from .services.gemini_service import generate_course_explanation
from . import views


urlpatterns = [
    path("api/streams", views.streams_view, name="streams"),
    path("api/combinations/<str:domain>", views.combinations_view, name="combinations"),
    path("api/questions/<str:domain>", views.questions_view, name="questions"),
    path("api/calculate-weights", views.calculate_weights_view, name="calculate-weights"),
    path("api/rank-courses", views.rank_courses_view, name="rank-courses"),
    path("api/generate-explanation", views.generate_explanation_view, name="generate-explanation"),
]

