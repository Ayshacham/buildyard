from django.urls import path
from .views import (
    ProjectListCreateView,
    ProjectDetailView,
    ProjectTaskListView,
    ProjectTaskDetailView,
    ProjectContextView,
    ProjectHealthView,
)

urlpatterns = [
    path("", ProjectListCreateView.as_view(), name="project-list"),
    path("<uuid:pk>/", ProjectDetailView.as_view(), name="project-detail"),
    path("<uuid:pk>/tasks/", ProjectTaskListView.as_view(), name="project-tasks"),
    path(
        "<uuid:pk>/tasks/<uuid:task_id>/",
        ProjectTaskDetailView.as_view(),
        name="project-task-detail",
    ),
    path("<uuid:pk>/context/", ProjectContextView.as_view(), name="project-context"),
    path("<uuid:pk>/health/", ProjectHealthView.as_view(), name="project-health"),
]
