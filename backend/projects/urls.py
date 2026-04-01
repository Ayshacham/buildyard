from django.urls import path
from .views import (
    ProjectListCreateView,
    ProjectDetailView,
    ProjectContextView,
    ProjectHealthView,
)

urlpatterns = [
    path("", ProjectListCreateView.as_view(), name="project-list"),
    path("<uuid:pk>/", ProjectDetailView.as_view(), name="project-detail"),
    path("<uuid:pk>/context/", ProjectContextView.as_view(), name="project-context"),
    path("<uuid:pk>/health/", ProjectHealthView.as_view(), name="project-health"),
]
