from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone

from tasks.models import Task


@receiver(pre_save, sender=Task)
def task_cache_old_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            prev = Task.objects.get(pk=instance.pk)
            instance._prev_status = prev.status
        except Task.DoesNotExist:
            instance._prev_status = None
    else:
        instance._prev_status = None


def _streak_user_for_task(instance):
    if instance.project_id:
        return instance.project.user
    if instance.owner_id:
        return instance.owner
    return None


def _adjust_streak_tasks(user, delta):
    if not user or delta == 0:
        return
    today = timezone.localdate()
    streak_day, _ = user.streak_days.get_or_create(date=today)
    streak_day.tasks_completed = max(0, streak_day.tasks_completed + delta)
    streak_day.save(update_fields=["tasks_completed"])


@receiver(post_save, sender=Task)
def task_streak_on_done(sender, instance, **kwargs):
    old = getattr(instance, "_prev_status", None)
    user = _streak_user_for_task(instance)
    if not user:
        return
    today = timezone.localdate()
    completed_today = (
        instance.status == "done"
        and instance.completed_at
        and timezone.localtime(instance.completed_at).date() == today
    )
    if instance.status == "done" and old != "done" and completed_today:
        _adjust_streak_tasks(user, 1)
    elif old == "done" and instance.status != "done":
        _adjust_streak_tasks(user, -1)
