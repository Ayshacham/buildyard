from django.urls import path
from .views import MeView, StreakView, XpHistoryView

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("streak/", StreakView.as_view(), name="streak"),
    path("xp/", XpHistoryView.as_view(), name="xp-history"),
]
