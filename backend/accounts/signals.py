from datetime import date
from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender="chat_sessions.FocusSession")
def on_session_saved(sender, instance, created, **kwargs):
    if not instance.completed:
        return

    user = instance.user
    xp = instance.xp_earned or 0

    levelled_up = user.add_xp(
        amount=xp,
        event_type="session_complete",
        description=f"{instance.duration_minutes}m focus session",
        session=instance,
    )

    today = date.today()
    streak_day, _ = user.streak_days.get_or_create(date=today)
    streak_day.focus_minutes += instance.duration_minutes or 0
    streak_day.sessions_completed += 1
    streak_day.goal_met = streak_day.focus_minutes >= user.daily_goal_minutes
    streak_day.save()

    from notifications.utils import push_notification

    push_notification(
        user_id=str(user.id),
        notification_type="session_complete",
        title="Session complete",
        body=f"+{xp} XP earned",
        data={"xp": xp, "session_id": str(instance.id)},
    )

    if levelled_up:
        push_notification(
            user_id=str(user.id),
            notification_type="level_up",
            title=f"Level {user.level}!",
            body="You levelled up. Keep going.",
            data={"level": user.level, "xp": user.xp},
        )
