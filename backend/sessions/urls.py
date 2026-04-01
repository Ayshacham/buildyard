from django.urls import path
from .views import (
    SessionStartView,
    SessionEndView,
    SessionPauseView,
    SessionResumeView,
    ActiveSessionView,
    SessionHistoryView,
)

urlpatterns = [
    path("start/", SessionStartView.as_view(), name="session-start"),
    path("end/", SessionEndView.as_view(), name="session-end"),
    path("pause/", SessionPauseView.as_view(), name="session-pause"),
    path("resume/", SessionResumeView.as_view(), name="session-resume"),
    path("active/", ActiveSessionView.as_view(), name="session-active"),
    path("history/", SessionHistoryView.as_view(), name="session-history"),
]
