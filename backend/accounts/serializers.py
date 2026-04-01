from rest_framework import serializers
from .models import User, StreakDay, XpEvent


class UserSerializer(serializers.ModelSerializer):
    class Meta:  # pyright: ignore[reportIncompatibleVariableOverride]
        model = User
        fields = [
            "id",
            "username",
            "email",
            "github_username",
            "avatar_url",
            "adhd_mode",
            "focus_duration",
            "daily_goal_minutes",
            "xp",
            "level",
            "supabase_uid",
        ]
        read_only_fields = ["id", "supabase_uid", "xp", "level"]


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:  # pyright: ignore[reportIncompatibleVariableOverride]
        model = User
        fields = [
            "username",
            "adhd_mode",
            "focus_duration",
            "daily_goal_minutes",
        ]


class StreakDaySerializer(serializers.ModelSerializer):
    class Meta:  # pyright: ignore[reportIncompatibleVariableOverride]
        model = StreakDay
        fields = [
            "id",
            "date",
            "focus_minutes",
            "tasks_completed",
            "sessions_completed",
            "goal_met",
        ]


class XpEventSerializer(serializers.ModelSerializer):
    class Meta:  # pyright: ignore[reportIncompatibleVariableOverride]
        model = XpEvent
        fields = [
            "id",
            "event_type",
            "xp_amount",
            "description",
            "session",
            "task",
            "created_at",
        ]
