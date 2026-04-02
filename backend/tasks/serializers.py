from django.utils import timezone
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
        read_only_fields = [
            "id",
            "project",
            "created_at",
            "completed_at",
            "parent_task",
            "is_micro_task",
        ]

    def create(self, validated_data):
        task = super().create(validated_data)
        if task.status == "done" and not task.completed_at:
            task.completed_at = timezone.now()
            task.save(update_fields=["completed_at"])
        return task

    def update(self, instance, validated_data):
        task = super().update(instance, validated_data)
        if task.status == "done" and not task.completed_at:
            task.completed_at = timezone.now()
            task.save(update_fields=["completed_at"])
        elif task.status != "done" and task.completed_at is not None:
            task.completed_at = None
            task.save(update_fields=["completed_at"])
        return task
