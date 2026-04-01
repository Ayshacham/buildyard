from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def push_notification(user_id, notification_type, title, body, data=None):
    from .models import Notification

    notification = Notification.objects.create(
        user_id=user_id,
        notification_type=notification_type,
        title=title,
        body=body,
        data=data or {},
    )

    channel_layer = get_channel_layer()
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            f"user_{user_id}",
            {
                "type": "notification_message",
                "notification": {
                    "id": str(notification.id),
                    "notification_type": notification_type,
                    "title": title,
                    "body": body,
                    "data": data or {},
                    "created_at": notification.created_at.isoformat(),
                },
            },
        )

    return notification
