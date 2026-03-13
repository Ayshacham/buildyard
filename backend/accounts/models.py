from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    supabase_uid = models.CharField(max_length=100, unique=True, null=True)
    github_username = models.CharField(max_length=100, blank=True)
    github_token = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
    timezone = models.CharField(max_length=50, default="UTC")
    adhd_mode = models.BooleanField(default=True)
    focus_duration = models.IntegerField(default=25)
    daily_goal = models.IntegerField(default=4)

    class Meta:
        db_table = "users"
