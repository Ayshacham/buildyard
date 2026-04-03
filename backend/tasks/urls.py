from django.urls import path

from tasks.views import TaskDetailView, UserTaskListView

urlpatterns = [
    path("<uuid:pk>/", TaskDetailView.as_view(), name="task-detail"),
    path("", UserTaskListView.as_view(), name="user-tasks"),
]
