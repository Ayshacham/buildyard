from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:  # pyright: ignore[reportIncompatibleVariableOverride]
        model = Notification
        fields = [
            "id",
            "notification_type",
            "title",
            "body",
            "data",
            "is_read",
            "read_at",
            "created_at",
        ]
