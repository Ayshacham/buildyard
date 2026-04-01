from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(
            user=request.user, is_read=False
        ).order_by("-created_at")[:50]
        return Response(NotificationSerializer(notifications, many=True).data)


class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ids = request.data.get("ids", [])
        mark_all = request.data.get("all", False)

        qs = Notification.objects.filter(user=request.user)

        if mark_all:
            updated = qs.filter(is_read=False).update(
                is_read=True, read_at=timezone.now()
            )
        elif ids:
            updated = qs.filter(pk__in=ids, is_read=False).update(
                is_read=True, read_at=timezone.now()
            )
        else:
            return Response(
                {"detail": "ids or all required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({"marked": updated})
