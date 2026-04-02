from uuid import UUID

from celery import shared_task
from django.conf import settings

from projects.models import Project


@shared_task
def summarise_context_task(project_id: str):
    if not getattr(settings, "GROQ_API_KEY", None):
        return
    try:
        project = Project.objects.select_related("user").get(id=UUID(project_id))
    except (Project.DoesNotExist, ValueError):
        return
    try:
        from ai_assistant.services import summarise_context

        summarise_context(project, project.user)
    except Exception:
        return
