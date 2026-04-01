from datetime import date, timedelta
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, StreakDay, XpEvent
from .serializers import (
    UserSerializer,
    UserUpdateSerializer,
    StreakDaySerializer,
    XpEventSerializer,
)


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UserUpdateSerializer
        return UserSerializer


class StreakView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        days = 30
        since = date.today() - timedelta(days=days)
        streak_days = StreakDay.objects.filter(
            user=request.user,
            date__gte=since,
        ).order_by("date")
        serializer = StreakDaySerializer(streak_days, many=True)

        current_streak = 0
        check = date.today()
        dates = {s.date for s in streak_days if s.goal_met}
        while check in dates:
            current_streak += 1
            check -= timedelta(days=1)

        return Response(
            {
                "days": serializer.data,
                "current_streak": current_streak,
            }
        )


class XpHistoryView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = XpEventSerializer

    def get_queryset(self):
        return XpEvent.objects.filter(user=self.request.user).order_by("-created_at")[
            :50
        ]
