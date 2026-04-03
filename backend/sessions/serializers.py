from rest_framework import serializers
from .models import FocusSession, TimerState


class FocusSessionSerializer(serializers.ModelSerializer):
    overrun_minutes = serializers.SerializerMethodField()

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
            "overrun_minutes",
            "completed",
            "notes",
            "xp_earned",
            "interrupted_reason",
            "was_resumed",
            "created_at",
        ]

    def get_overrun_minutes(self, obj):
        if obj.duration_minutes is None:
            return 0
        plan = obj.planned_duration_minutes or 25
        return max(0, int(obj.duration_minutes) - int(plan))


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
