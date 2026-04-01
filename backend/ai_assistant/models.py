import uuid
from django.conf import settings
from django.db import models


class AiMessage(models.Model):
    MESSAGE_TYPES = [
        ("standup", "Standup"),
        ("breakdown", "Breakdown"),
        ("rubber_duck", "Rubber Duck"),
        ("context_summary", "Context Summary"),
        ("brain_dump", "Brain Dump"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ai_messages"
    )
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="ai_messages",
    )
    task = models.ForeignKey(
        "tasks.Task",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="ai_messages",
    )
    message_type = models.CharField(max_length=30, choices=MESSAGE_TYPES)
    prompt = models.TextField()
    response = models.TextField()
    tokens_used = models.IntegerField(default=0)
    model = models.CharField(max_length=100, default="llama-3.3-70b-versatile")
    latency_ms = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ai_assistant_ai_message"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} {self.message_type} @ {self.created_at}"


class Standup(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="standups"
    )
    standup_date = models.DateField()
    raw_summary = models.TextField()
    highlights = models.JSONField(default=list)
    blockers = models.JSONField(default=list)
    suggestions = models.JSONField(default=list)
    tokens_used = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ai_assistant_standup"
        unique_together = ("user", "standup_date")
        ordering = ["-standup_date"]

    def __str__(self):
        return f"{self.user} standup {self.standup_date}"
