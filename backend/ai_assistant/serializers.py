from rest_framework import serializers
from .models import AiMessage, Standup


class AiMessageSerializer(serializers.ModelSerializer):
    class Meta:  # pyright: ignore[reportIncompatibleVariableOverride]
        model = AiMessage
        fields = [
            "id",
            "project",
            "task",
            "message_type",
            "prompt",
            "response",
            "tokens_used",
            "model",
            "latency_ms",
            "created_at",
        ]


class StandupSerializer(serializers.ModelSerializer):
    class Meta:  # pyright: ignore[reportIncompatibleVariableOverride]
        model = Standup
        fields = [
            "id",
            "standup_date",
            "raw_summary",
            "highlights",
            "where_you_are",
            "blockers",
            "suggestions",
            "tokens_used",
            "created_at",
        ]
