from celery import shared_task

from notifications.utils import push_notification

from .models import TimerState


@shared_task
def check_overrunning_sessions():
    qs = TimerState.objects.filter(is_running=True, is_paused=False).select_related(
        "user"
    )
    for timer in qs:
        limit = int(timer.planned_seconds * 1.5)
        if timer.elapsed_seconds <= limit:
            continue
        if timer.stuck_notification_sent:
            continue
        minutes = timer.elapsed_seconds // 60
        push_notification(
            str(timer.user.pk),
            "focus_stuck",
            "Wrap up?",
            f"You've been going {minutes} minutes. Want to wrap up or keep going?",
            {"timer_id": str(timer.id)},
        )
        timer.stuck_notification_sent = True
        timer.save(update_fields=["stuck_notification_sent"])
