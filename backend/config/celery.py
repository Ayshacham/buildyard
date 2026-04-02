import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from celery import Celery
from celery.schedules import crontab

app = Celery("config")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.beat_schedule = {
    "sync-all-active-projects": {
        "task": "github_sync.tasks.sync_all_active_projects",
        "schedule": crontab(minute="*/30"),
    },
    "check-overrunning-focus-sessions": {
        "task": "sessions.tasks.check_overrunning_sessions",
        "schedule": crontab(minute="*/5"),
    },
}
