from django.db.models import Case, IntegerField, Q, Value, When
from rest_framework import generics, permissions

from tasks.models import Task
from tasks.serializers import TaskSerializer, UserTaskListSerializer


class UserTaskListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserTaskListSerializer

    def get_queryset(self):
        user = self.request.user
        return (
            Task.objects.filter(
                Q(project__user=user) | Q(owner=user, project__isnull=True)
            )
            .select_related("project", "owner")
            .annotate(
                _section_order=Case(
                    When(status="in_progress", then=Value(0)),
                    When(status="todo", then=Value(1)),
                    When(status="brain_dump", then=Value(1)),
                    When(status="done", then=Value(2)),
                    default=Value(3),
                    output_field=IntegerField(),
                )
            )
            .order_by("_section_order", "-created_at")
        )


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(
            Q(project__user=user) | Q(owner=user, project__isnull=True)
        ).select_related("project", "owner")
