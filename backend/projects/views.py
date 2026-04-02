from django.core.cache import cache
from django.db.models import Case, IntegerField, Value, When
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from tasks.models import Task
from tasks.serializers import TaskSerializer
from .models import Project, HealthSnapshot
from .serializers import (
    ProjectSerializer,
    ProjectListSerializer,
    HealthSnapshotSerializer,
)


def _enqueue_github_sync(project_id):
    from config.celery import app as celery_app

    celery_app.send_task(
        "github_sync.tasks.sync_project_github",
        args=[str(project_id)],
    )


class ProjectListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProjectSerializer
        return ProjectListSerializer

    def perform_create(self, serializer):
        project = serializer.save(user=self.request.user)
        if project.github_repo:
            _enqueue_github_sync(project.id)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.github_repo:
            throttle_key = f"github_sync_throttle:{instance.pk}"
            if cache.add(throttle_key, "1", timeout=600):
                _enqueue_github_sync(instance.id)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_update(self, serializer):
        instance = serializer.save()
        if "github_repo" in serializer.validated_data and instance.github_repo:
            _enqueue_github_sync(instance.id)


class ProjectTaskListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        project_id = self.kwargs["pk"]
        get_object_or_404(Project, pk=project_id, user=self.request.user)
        return (
            Task.objects.filter(
                project_id=project_id,
                project__user=self.request.user,
            )
            .exclude(status="done")
            .annotate(
                _section_order=Case(
                    When(status="in_progress", then=Value(0)),
                    When(status="todo", then=Value(1)),
                    default=Value(2),
                    output_field=IntegerField(),
                )
            )
            .order_by("_section_order", "-created_at")
        )


class ProjectContextView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        project = get_object_or_404(Project, pk=pk, user=request.user)
        return Response({"last_context": project.last_context})

    def post(self, request, pk):
        project = get_object_or_404(Project, pk=pk, user=request.user)
        context = request.data.get("last_context", "").strip()
        if context:
            project.last_context = context
            project.save(update_fields=["last_context"])
        return Response({"last_context": project.last_context})


class ProjectHealthView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        project = get_object_or_404(Project, pk=pk, user=request.user)
        snapshots = project.health_snapshots.order_by("-snapped_at")[:30]  # type: ignore[union-attr]
        return Response(
            {
                "current_score": project.health_score,
                "history": HealthSnapshotSerializer(snapshots, many=True).data,
            }
        )
