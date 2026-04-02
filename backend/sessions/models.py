import uuid
from django.conf import settings
from django.db import models


class FocusSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="focus_sessions"
    )
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="sessions",
    )
    task = models.ForeignKey(
        "tasks.Task",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="sessions",
    )
    started_at = models.DateTimeField()
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(null=True, blank=True)
    planned_duration_minutes = models.IntegerField(default=25)
    completed = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    xp_earned = models.IntegerField(default=0)
    interrupted_reason = models.CharField(max_length=255, blank=True)
    was_resumed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "sessions_focus_session"
        ordering = ["-started_at"]

    def __str__(self):
        return f"{self.user} session {self.started_at}"


class TimerState(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="timer_state",
    )
    session = models.ForeignKey(
        FocusSession,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="timer_states",
    )
    task = models.ForeignKey(
        "tasks.Task",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="timer_states",
    )
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="timer_states",
    )
    elapsed_seconds = models.IntegerField(default=0)
    planned_seconds = models.IntegerField(default=1500)
    is_running = models.BooleanField(default=False)
    is_paused = models.BooleanField(default=False)
    last_tick_at = models.DateTimeField(null=True, blank=True)
    stuck_notification_sent = models.BooleanField(default=False)

    class Meta:
        db_table = "sessions_timer_state"

    def __str__(self):
        return f"{self.user} timer"
