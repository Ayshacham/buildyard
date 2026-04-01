from datetime import date, timedelta
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.models import Project

from .models import Standup
from .serializers import StandupSerializer
from .services import (
    generate_standup,
    break_down_task,
    rubber_duck,
    summarise_context,
)


class StandupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()
        standup = Standup.objects.filter(user=user, standup_date=today).first()
        if not standup:
            standup = generate_standup(user)
        return Response(StandupSerializer(standup).data)

    def post(self, request):
        standup = generate_standup(request.user)
        return Response(StandupSerializer(standup).data, status=status.HTTP_200_OK)


class StandupHistoryView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StandupSerializer

    def get_queryset(self):
        since = date.today() - timedelta(days=30)
        return Standup.objects.filter(
            user=self.request.user, standup_date__gte=since
        ).order_by("-standup_date")[:30]


class BreakDownTaskView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from tasks.models import Task
        from tasks.serializers import TaskSerializer

        task_id = request.data.get("task_id")
        if not task_id:
            return Response(
                {"detail": "task_id required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        task = get_object_or_404(Task, pk=task_id, project__user=request.user)
        try:
            subtasks = break_down_task(task, request.user)
        except PermissionError:
            return Response(
                {"detail": "Forbidden"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response(
            TaskSerializer(subtasks, many=True).data,
            status=status.HTTP_201_CREATED,
        )


class RubberDuckView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = request.data.get("message", "").strip()
        if not message:
            return Response(
                {"detail": "message required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        project_id = request.data.get("project_id")
        project = None
        if project_id:
            project = get_object_or_404(Project, pk=project_id, user=request.user)
        reply = rubber_duck(message, request.user, project=project)
        return Response({"reply": reply})


class ContextSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        project_id = request.data.get("project_id")
        if not project_id:
            return Response(
                {"detail": "project_id required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        project = get_object_or_404(Project, pk=project_id, user=request.user)
        try:
            summary = summarise_context(project, request.user)
        except PermissionError:
            return Response(
                {"detail": "Forbidden"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response({"last_context": summary})
