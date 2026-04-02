from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.models import Project
from tasks.models import Task

from .models import FocusSession, TimerState
from .serializers import FocusSessionSerializer, TimerStateSerializer


def _clamp_elapsed(value: int, planned_seconds: int) -> int:
    return max(0, min(value, planned_seconds * 3))


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
        body_elapsed = request.data.get("elapsed_seconds")
        if body_elapsed is not None:
            elapsed_seconds = int(body_elapsed)
            elapsed_seconds = max(0, elapsed_seconds)
        else:
            elapsed_seconds = timer.elapsed_seconds
            if timer.is_running and not timer.is_paused and timer.last_tick_at:
                now = timezone.now()
                delta = int((now - timer.last_tick_at).total_seconds())
                if delta > 0:
                    elapsed_seconds = min(
                        timer.planned_seconds * 3,
                        timer.elapsed_seconds + delta,
                    )

        duration_minutes = elapsed_seconds // 60
        session.completed = True
        session.ended_at = timezone.now()
        session.duration_minutes = duration_minutes
        session.xp_earned = duration_minutes * 2
        session.save()

        if session.project:
            session.project.total_focus_minutes += duration_minutes
            session.project.last_session_at = session.ended_at
            session.project.save(update_fields=["total_focus_minutes", "last_session_at"])

        project_id_for_task = session.project_id

        timer.delete()

        session.refresh_from_db()

        if project_id_for_task:
            from config.celery import app as celery_app

            celery_app.send_task(
                "ai_assistant.tasks.summarise_context_task",
                args=[str(project_id_for_task)],
            )

        return Response(FocusSessionSerializer(session).data)


class SessionPauseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        timer = get_object_or_404(TimerState, user=request.user)
        body_elapsed = request.data.get("elapsed_seconds")
        if body_elapsed is not None:
            elapsed = int(body_elapsed)
            timer.elapsed_seconds = _clamp_elapsed(elapsed, timer.planned_seconds)
        elif timer.is_running and not timer.is_paused and timer.last_tick_at:
            now = timezone.now()
            delta = int((now - timer.last_tick_at).total_seconds())
            if delta > 0:
                timer.elapsed_seconds = min(
                    timer.planned_seconds * 3,
                    timer.elapsed_seconds + delta,
                )
        timer.is_paused = True
        timer.save(update_fields=["elapsed_seconds", "is_paused"])
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

    def post(self, request):
        timer = TimerState.objects.filter(user=request.user).first()
        if not timer:
            return Response(
                {"detail": "No active timer"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        elapsed_raw = request.data.get("elapsed_seconds")
        if elapsed_raw is None:
            return Response(
                {"detail": "elapsed_seconds required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        elapsed = int(elapsed_raw)
        timer.elapsed_seconds = _clamp_elapsed(elapsed, timer.planned_seconds)
        timer.last_tick_at = timezone.now()
        timer.save(update_fields=["elapsed_seconds", "last_tick_at"])
        return Response(TimerStateSerializer(timer).data)


class SessionHistoryView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FocusSessionSerializer

    def get_queryset(self):
        return FocusSession.objects.filter(user=self.request.user).order_by("-started_at")
