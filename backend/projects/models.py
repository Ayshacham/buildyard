import uuid
from django.db import models
from django.conf import settings


class Project(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("stale", "Stale"),
        ("archived", "Archived"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="projects"
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    goals = models.TextField(blank=True)
    color = models.CharField(max_length=7, default="#185FA5")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    github_repo = models.CharField(max_length=200, blank=True)
    github_repo_id = models.BigIntegerField(null=True, blank=True)
    github_default_branch = models.CharField(max_length=100, default="main")
    last_context = models.TextField(blank=True)
    health_score = models.IntegerField(default=100)
    total_focus_minutes = models.IntegerField(default=0)
    last_session_at = models.DateTimeField(null=True, blank=True)
    last_commit_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "projects_project"
        ordering = ["-last_session_at", "-created_at"]

    def __str__(self):
        return f"{self.user} / {self.name}"


class GithubPR(models.Model):
    STATE_CHOICES = [
        ("open", "Open"),
        ("closed", "Closed"),
        ("merged", "Merged"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="pull_requests"
    )
    pr_number = models.IntegerField()
    title = models.CharField(max_length=255)
    state = models.CharField(max_length=20, choices=STATE_CHOICES, default="open")
    author = models.CharField(max_length=100, blank=True)
    url = models.URLField(blank=True)
    additions = models.IntegerField(default=0)
    deletions = models.IntegerField(default=0)
    comments_count = models.IntegerField(default=0)
    pr_opened_at = models.DateTimeField(null=True, blank=True)
    pr_merged_at = models.DateTimeField(null=True, blank=True)
    fetched_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "projects_github_pr"
        unique_together = ("project", "pr_number")
        ordering = ["-pr_opened_at"]

    def __str__(self):
        return f"{self.project.name} PR #{self.pr_number}"


class GithubCommit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="commits"
    )
    sha = models.CharField(max_length=40)
    message = models.TextField()
    author_name = models.CharField(max_length=100, blank=True)
    author_email = models.CharField(max_length=200, blank=True)
    url = models.URLField(blank=True)
    committed_at = models.DateTimeField(null=True, blank=True)
    fetched_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "projects_github_commit"
        unique_together = ("project", "sha")
        ordering = ["-committed_at"]

    def __str__(self):
        return f"{self.project.name} {self.sha[:7]}"


class HealthSnapshot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="health_snapshots"
    )
    health_score = models.IntegerField()
    commits_this_week = models.IntegerField(default=0)
    open_prs = models.IntegerField(default=0)
    avg_pr_age_days = models.IntegerField(default=0)
    focus_minutes_this_week = models.IntegerField(default=0)
    tasks_completed_this_week = models.IntegerField(default=0)
    status = models.CharField(max_length=20, default="active")
    signals = models.JSONField(default=dict)
    snapped_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "projects_health_snapshot"
        ordering = ["-snapped_at"]

    def __str__(self):
        return f"{self.project.name} health={self.health_score} @ {self.snapped_at}"
