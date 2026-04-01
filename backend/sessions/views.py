from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.models import Project
from tasks.models import Task

from .models import FocusSession, TimerState
from .serializers import FocusSessionSerializer, TimerStateSerializer


class SessionStartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        project_id = request.data.get("project_id")
        task_id = request.data.get("task_id")
        planned_minutes = request.data.get("planned_duration_minutes", 25)

        project = None
        if project_id:
            project = get_object_or_404(Project, pk=project_id, user=user)

        task = None
        if task_id:
            task = get_object_or_404(Task, pk=task_id, project__user=user)

        TimerState.objects.filter(user=user).delete()

        session = FocusSession.objects.create(
            user=user,
            project=project,
            task=task,
            started_at=timezone.now(),
            planned_duration_minutes=planned_minutes,
        )

        timer = TimerState.objects.create(
            user=user,
            session=session,
            task=task,
            project=project,
            planned_seconds=planned_minutes * 60,
            is_running=True,
            last_tick_at=timezone.now(),
        )

        return Response(
            {
                "session": FocusSessionSerializer(session).data,
                "timer": TimerStateSerializer(timer).data,
            },
            status=status.HTTP_201_CREATED,
        )


class SessionEndView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        timer = TimerState.objects.filter(user=user).first()
        if not timer or not timer.session:
            return Response(
                {"detail": "No active session"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session = timer.session
        session.completed = True
        session.ended_at = timezone.now()
        if session.started_at and session.ended_at:
            delta = session.ended_at - session.started_at
            session.duration_minutes = int(delta.total_seconds() / 60)
        session.xp_earned = (session.duration_minutes or 0) * 2
        session.save()

        if session.project:
            session.project.total_focus_minutes += session.duration_minutes or 0
            session.project.last_session_at = session.ended_at
            session.project.save(update_fields=["total_focus_minutes", "last_session_at"])

        timer.delete()

        return Response(FocusSessionSerializer(session).data)


class SessionPauseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        timer = get_object_or_404(TimerState, user=request.user)
        timer.is_paused = True
        timer.save(update_fields=["is_paused"])
        return Response(TimerStateSerializer(timer).data)


class SessionResumeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        timer = get_object_or_404(TimerState, user=request.user)
        timer.is_paused = False
        timer.is_running = True
        timer.last_tick_at = timezone.now()
        timer.save(update_fields=["is_paused", "is_running", "last_tick_at"])
        return Response(TimerStateSerializer(timer).data)


class ActiveSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        timer = TimerState.objects.filter(user=request.user).first()
        if not timer:
            return Response({"timer": None, "session": None})

        return Response(
            {
                "timer": TimerStateSerializer(timer).data,
                "session": FocusSessionSerializer(timer.session).data if timer.session else None,
            }
        )


class SessionHistoryView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FocusSessionSerializer

    def get_queryset(self):
        return FocusSession.objects.filter(user=self.request.user).order_by("-started_at")
