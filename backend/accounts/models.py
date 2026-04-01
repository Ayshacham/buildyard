import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    supabase_uid = models.CharField(max_length=255, unique=True, null=True, blank=True)
    github_username = models.CharField(max_length=100, blank=True)
    github_token = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
    adhd_mode = models.BooleanField(default=True)
    focus_duration = models.IntegerField(default=25)
    daily_goal_minutes = models.IntegerField(default=100)
    xp = models.IntegerField(default=0)
    level = models.IntegerField(default=1)

    REQUIRED_FIELDS = []

    class Meta:
        db_table = "accounts_user"

    def __str__(self):
        return self.username or self.email

    def add_xp(self, amount, event_type, description="", session=None, task=None):
        self.xp += amount
        new_level = (self.xp // 500) + 1
        levelled_up = new_level > self.level
        self.level = new_level
        self.save(update_fields=["xp", "level"])
        XpEvent.objects.create(
            user=self,
            event_type=event_type,
            xp_amount=amount,
            description=description,
            session=session,
            task=task,
        )
        return levelled_up


class StreakDay(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="streak_days")
    date = models.DateField()
    focus_minutes = models.IntegerField(default=0)
    tasks_completed = models.IntegerField(default=0)
    sessions_completed = models.IntegerField(default=0)
    goal_met = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "accounts_streak_day"
        unique_together = ("user", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user} - {self.date}"


class XpEvent(models.Model):
    EVENT_TYPES = [
        ("session_complete", "Session complete"),
        ("task_done", "Task done"),
        ("streak_bonus", "Streak bonus"),
        ("level_up", "Level up"),
        ("brain_dump", "Brain dump"),
        ("daily_goal", "Daily goal met"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="xp_events")
    session = models.ForeignKey(
        "chat_sessions.FocusSession",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="xp_events",
    )
    task = models.ForeignKey(
        "tasks.Task",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="xp_events",
    )
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    xp_amount = models.IntegerField()
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "accounts_xp_event"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} +{self.xp_amount} ({self.event_type})"
