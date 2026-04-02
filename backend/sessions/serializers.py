from rest_framework import serializers
from .models import FocusSession, TimerState


class FocusSessionSerializer(serializers.ModelSerializer):
    class Meta:  # pyright: ignore[reportIncompatibleVariableOverride]
        model = FocusSession
        fields = [
            "id",
            "project",
            "task",
            "started_at",
            "ended_at",
            "duration_minutes",
            "planned_duration_minutes",
            "completed",
            "notes",
            "xp_earned",
            "interrupted_reason",
            "was_resumed",
            "created_at",
        ]


class TimerStateSerializer(serializers.ModelSerializer):
    session = FocusSessionSerializer(read_only=True)

    class Meta:  # pyright: ignore[reportIncompatibleVariableOverride]
        model = TimerState
        fields = [
            "id",
            "session",
            "task",
            "project",
            "elapsed_seconds",
            "planned_seconds",
            "is_running",
            "is_paused",
            "last_tick_at",
            "stuck_notification_sent",
        ]
