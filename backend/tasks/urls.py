from django.urls import path

from tasks.views import UserTaskListView

urlpatterns = [
    path("", UserTaskListView.as_view(), name="user-tasks"),
]
