from django.db.models import Case, IntegerField, Value, When
from rest_framework import generics, permissions

from tasks.models import Task
from tasks.serializers import UserTaskListSerializer


class UserTaskListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserTaskListSerializer

    def get_queryset(self):
        return (
            Task.objects.filter(project__user=self.request.user)
            .select_related("project")
            .annotate(
                _section_order=Case(
                    When(status="in_progress", then=Value(0)),
                    When(status="todo", then=Value(1)),
                    When(status="done", then=Value(2)),
                    default=Value(3),
                    output_field=IntegerField(),
                )
            )
            .order_by("_section_order", "-created_at")
        )
