from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:  # pyright: ignore[reportIncompatibleVariableOverride]
        model = Task
        fields = [
            "id",
            "project",
            "parent_task",
            "title",
            "is_micro_task",
            "estimated_minutes",
            "status",
            "priority",
            "completed_at",
            "created_at",
        ]
