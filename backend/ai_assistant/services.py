import json
import time
from datetime import date, datetime, timedelta, time as dt_time
from django.conf import settings
from django.utils import timezone
import requests

from .models import AiMessage, Standup


def groq_chat(prompt, system_prompt, user, message_type, project=None, task=None):
    api_key = getattr(settings, "GROQ_API_KEY", None)
    if not api_key:
        raise ValueError("GROQ_API_KEY not configured")

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
    }

    start = time.perf_counter()
    resp = requests.post(url, json=payload, headers=headers, timeout=60)
    latency_ms = (time.perf_counter() - start) * 1000

    resp.raise_for_status()
    data = resp.json()
    content = data["choices"][0]["message"]["content"]
    tokens_used = data.get("usage", {}).get("total_tokens", 0)

    AiMessage.objects.create(
        user=user,
        project=project,
        task=task,
        message_type=message_type,
        prompt=prompt,
        response=content,
        tokens_used=tokens_used,
        model="llama-3.3-70b-versatile",
        latency_ms=latency_ms,
    )

    return content, tokens_used


def generate_standup(user):
    today = date.today()
    standup, created = Standup.objects.get_or_create(
        user=user,
        standup_date=today,
        defaults={
            "raw_summary": "",
            "highlights": [],
            "blockers": [],
            "suggestions": [],
        },
    )

    week_ago = today - timedelta(days=7)
    week_ago_dt = timezone.make_aware(datetime.combine(week_ago, dt_time.min))
    sessions = user.focus_sessions.filter(
        started_at__gte=week_ago_dt, completed=True
    ).order_by("-started_at")[:20]

    commits = []
    prs = []
    tasks_done = []
    from projects.models import Project, GithubCommit, GithubPR
    from tasks.models import Task

    for project in user.projects.all():
        commits.extend(
            project.commits.filter(committed_at__gte=week_ago_dt).values_list(
                "message", flat=True
            )[:5]
        )
        prs.extend(
            project.pull_requests.filter(state="open").values_list("title", flat=True)[
                :5
            ]
        )
        tasks_done.extend(
            project.tasks.filter(status="done", completed_at__date=today).values_list(
                "title", flat=True
            )
        )

    prompt = f"""Generate a daily standup summary for {today}.

Sessions completed: {len(sessions)}
Recent commits: {list(commits)[:10]}
Open PRs: {list(prs)[:10]}
Tasks done today: {list(tasks_done)[:10]}

Return JSON only: {{"highlights": [...], "blockers": [...], "suggestions": [...]}}
"""

    system_prompt = "You are a concise standup assistant. Return only valid JSON."
    raw, tokens = groq_chat(prompt, system_prompt, user, "standup")
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    try:
        parsed = json.loads(raw)
        standup.raw_summary = raw
        standup.highlights = parsed.get("highlights", [])
        standup.blockers = parsed.get("blockers", [])
        standup.suggestions = parsed.get("suggestions", [])
    except json.JSONDecodeError:
        standup.raw_summary = raw
        standup.highlights = []
        standup.blockers = []
        standup.suggestions = []
    standup.tokens_used = tokens
    standup.save()
    return standup


def break_down_task(task, user):
    from tasks.models import Task

    if task.project.user_id != user.id:
        raise PermissionError("Task does not belong to user")

    prompt = f"""Break this task into smaller subtasks: "{task.title}"

Return JSON array only: [{{"title": "...", "estimated_minutes": N}}, ...]
"""

    system_prompt = "You are a task breakdown assistant. Return only a JSON array of objects with title and estimated_minutes."
    raw, _ = groq_chat(prompt, system_prompt, user, "breakdown", task=task)
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    try:
        items = json.loads(raw)
    except json.JSONDecodeError:
        return []

    created = []
    for item in items:
        title = item.get("title", "Untitled")
        est = item.get("estimated_minutes")
        subtask = Task.objects.create(
            project=task.project,
            parent_task=task,
            title=title,
            estimated_minutes=est,
            is_micro_task=True,
        )
        created.append(subtask)
    return created


def rubber_duck(text, user, project=None):
    system_prompt = "You are a rubber duck debugger. Give one clarifying question or one concrete next step. Be brief."
    content, _ = groq_chat(text, system_prompt, user, "rubber_duck", project=project)
    return content


def summarise_context(project, user):
    if project.user_id != user.id:
        raise PermissionError("Project does not belong to user")

    sessions = project.sessions.filter(completed=True).order_by("-started_at")[:3]
    commits = project.commits.order_by("-committed_at")[:5]
    prs = project.pull_requests.filter(state="open")

    notes = [s.notes for s in sessions if s.notes]
    commit_msgs = [c.message for c in commits]
    pr_titles = [p.title for p in prs]

    prompt = f"""Summarise this project context for a developer:

Recent session notes: {notes}
Recent commits: {commit_msgs}
Open PRs: {pr_titles}

Give a brief context summary (2-3 paragraphs).
"""

    system_prompt = "You are a context summariser. Be concise."
    summary, _ = groq_chat(
        prompt, system_prompt, user, "context_summary", project=project
    )
    project.last_context = summary
    project.save(update_fields=["last_context"])
    return summary
