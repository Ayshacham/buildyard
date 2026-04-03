from django.utils import timezone
from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:  # pyright: ignore[reportIncompatibleVariableOverride]
        model = Task
        fields = [
            "id",
            "owner",
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
            "owner",
            "created_at",
            "completed_at",
            "parent_task",
            "is_micro_task",
        ]

    def validate(self, attrs):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return attrs
        user = request.user
        project = attrs.get("project")
        if project is not None and project.user_id != user.id:
            raise serializers.ValidationError(
                {"project": "You do not have access to this project."}
            )
        return attrs

    def create(self, validated_data):
        task = super().create(validated_data)
        if task.status == "done" and not task.completed_at:
            task.completed_at = timezone.now()
            task.save(update_fields=["completed_at"])
        return task

    def update(self, instance, validated_data):
        project = validated_data.get("project", serializers.empty)
        if project is not serializers.empty and project is not None:
            validated_data["owner"] = None
        task = super().update(instance, validated_data)
        if task.status == "done" and not task.completed_at:
            task.completed_at = timezone.now()
            task.save(update_fields=["completed_at"])
        elif task.status != "done" and task.completed_at is not None:
            task.completed_at = None
            task.save(update_fields=["completed_at"])
        return task


class UserTaskListSerializer(TaskSerializer):
    project_name = serializers.SerializerMethodField()
    project_color = serializers.SerializerMethodField()

    class Meta(TaskSerializer.Meta):  # pyright: ignore[reportIncompatibleVariableOverride]
        fields = TaskSerializer.Meta.fields + [
            "project_name",
            "project_color",
        ]

    def get_project_name(self, obj):
        if obj.project_id:
            return obj.project.name
        return ""

    def get_project_color(self, obj):
        if obj.project_id:
            return obj.project.color
        return "#888888"
