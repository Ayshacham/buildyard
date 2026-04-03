from django.urls import path
from .views import (
    BrainDumpView,
    StandupView,
    StandupHistoryView,
    BreakDownTaskView,
    RubberDuckView,
    ContextSummaryView,
)

urlpatterns = [
    path("standup/", StandupView.as_view(), name="standup"),
    path("standup/history/", StandupHistoryView.as_view(), name="standup-history"),
    path("breakdown/", BreakDownTaskView.as_view(), name="breakdown"),
    path("rubber-duck/", RubberDuckView.as_view(), name="rubber-duck"),
    path("context/", ContextSummaryView.as_view(), name="context"),
    path("brain-dump/", BrainDumpView.as_view(), name="brain-dump"),
]
