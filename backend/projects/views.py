from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Project, HealthSnapshot
from .serializers import (
    ProjectSerializer,
    ProjectListSerializer,
    HealthSnapshotSerializer,
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
        serializer.save(user=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)


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
