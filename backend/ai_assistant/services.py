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


def _standup_clip_list(items, max_items=5):
    if not isinstance(items, list):
        return []
    out = []
    for x in items:
        if isinstance(x, str) and x.strip():
            line = " ".join(x.strip().split())
            if line:
                out.append(line[:500])
        if len(out) >= max_items:
            break
    return out


def _standup_pick_list(parsed, *keys):
    for k in keys:
        if k in parsed and parsed[k] is not None:
            return parsed[k]
    return []


def generate_standup(user):
    today = date.today()
    tz = timezone.get_current_timezone()
    start_of_day = timezone.make_aware(datetime.combine(today, dt_time.min), tz)
    end_of_day = timezone.make_aware(datetime.combine(today, dt_time.max), tz)

    from django.db.models import Q

    from projects.models import GithubCommit, GithubPR, Project
    from tasks.models import Task

    sessions_today = (
        user.focus_sessions.filter(
            completed=True,
            ended_at__gte=start_of_day,
            ended_at__lte=end_of_day,
        )
        .select_related("project", "task")
        .order_by("-ended_at")
    )

    session_lines = []
    for s in sessions_today[:40]:
        dur = int(s.duration_minutes or 0)
        plan = max(1, int(s.planned_duration_minutes or 25))
        pname = s.project.name if s.project_id else "no project"
        tname = s.task.title if s.task_id else "no task linked"
        overrun = max(0, dur - plan)
        ratio = dur / plan if plan else 0.0
        ratio_s = f"{ratio:.1f}".rstrip("0").rstrip(".")
        if overrun > 0:
            session_lines.append(
                f"- {dur}m on «{tname}» ({pname}), planned {plan}m, ~{ratio_s}x over plan"
            )
        else:
            session_lines.append(
                f"- {dur}m focus on «{tname}» ({pname}), planned {plan}m"
            )

    incomplete_today = (
        user.focus_sessions.filter(
            completed=False,
            ended_at__gte=start_of_day,
            ended_at__lte=end_of_day,
        )
        .select_related("project", "task")
        .order_by("-ended_at")[:20]
    )
    incomplete_lines = []
    for s in incomplete_today:
        pname = s.project.name if s.project_id else "no project"
        tname = s.task.title if s.task_id else "no task linked"
        incomplete_lines.append(f"- Ended incomplete: «{tname}» ({pname})")

    tasks_done_qs = (
        Task.objects.filter(
            Q(project__user=user) | Q(owner=user, project__isnull=True),
            status="done",
            completed_at__gte=start_of_day,
            completed_at__lte=end_of_day,
        )
        .select_related("project")
        .order_by("-completed_at")[:40]
    )
    task_lines = []
    for t in tasks_done_qs:
        pname = t.project.name if t.project_id else "unassigned"
        task_lines.append(f"- «{t.title}» ({pname})")

    pr_qs = (
        GithubPR.objects.filter(project__user=user, state="open")
        .select_related("project")
        .order_by("pr_opened_at")[:40]
    )
    pr_lines = [f"- {p.project.name}: {p.title}" for p in pr_qs]

    active_projects = Project.objects.filter(user=user, status="active").order_by(
        "name"
    )
    project_blocks = []
    for proj in active_projects:
        desc = (proj.description or "").strip()
        goals_text = (proj.goals or "").strip()
        ctx = (proj.last_context or "").strip()
        if len(ctx) > 4000:
            ctx = ctx[:3999] + "…"
        commits = (
            GithubCommit.objects.filter(
                project=proj, committed_at__isnull=False
            )
            .order_by("-committed_at")[:8]
        )
        commit_msgs = []
        for c in commits:
            first_line = (c.message or "").split("\n", 1)[0].strip()
            if first_line:
                commit_msgs.append(first_line[:220])
        if not commit_msgs:
            commit_msgs = ["(no recent commits on this repo in the DB)"]
        project_blocks.append(
            f"### {proj.name}\n"
            f"Here is what this project is supposed to be: {desc or '(not set)'}\n"
            f"Here are the planned phases or goals: {goals_text or '(not set)'}\n\n"
            f"**last_context** (what we already know about this project):\n{ctx or '(empty — infer only from commits and activity below)'}\n\n"
            f"**Recent commit messages (first line each, newest first):**\n"
            + "\n".join(f"- {m}" for m in commit_msgs)
        )

    standup, _ = Standup.objects.update_or_create(
        user=user,
        standup_date=today,
        defaults={
            "raw_summary": "",
            "highlights": [],
            "where_you_are": [],
            "blockers": [],
            "suggestions": [],
            "tokens_used": 0,
        },
    )

    project_block_text = (
        "\n\n".join(project_blocks)
        if project_blocks
        else "(No active projects — use sessions and tasks only.)"
    )

    prompt = f"""Calendar day: {today}.

You are writing a standup for a developer. Write like a senior engineer who has been watching their work all day — not a dashboard. Use **real names** from the data: task titles, project names, PR titles, commit subject lines, and what last_context says. Never say things like "you completed 2 tasks" or "2 focus sessions". Say instead what they actually did, e.g. "You finished the Supabase auth integration and cleaned up the login page component."

**Active projects — for each project you have: what it is for, planned phases/goals, last_context, and recent commits. Use goals + description + commits + tasks done today to infer which phase the user is probably in. Compare recent commits and completed tasks against the stated goals: say which phase they appear to be in, and what is still missing.**

{project_block_text}

---

**Focus sessions completed today (each line has task + project + duration; if over plan, use the ratio to write one concrete line like: one session ran ~9x over plan on the Redis config work — worth breaking that kind of task into smaller chunks next time, not a vague "risk"):**

{chr(10).join(session_lines) if session_lines else "- none"}

**Sessions that ended today but were not marked completed:**

{chr(10).join(incomplete_lines) if incomplete_lines else "- none"}

**Tasks marked done today (title + project):**

{chr(10).join(task_lines) if task_lines else "- none"}

**Open PRs:**

{chr(10).join(pr_lines) if pr_lines else "- none"}

---

Output **strict JSON only** with these four arrays (each max 5 strings, one line each):

{{
  "shipped": [ ... ],
  "where_you_are": [ ... ],
  "blocking": [ ... ],
  "next": [ ... ]
}}

Sections:
1. **shipped** — What you shipped: specific things completed, named (tasks, PRs merged if inferable, commits reflected in work). No counts.
2. **where_you_are** — Where you are: up to 5 short lines total (often one sentence is enough) on current state of the work, grounded in **last_context** + recent commits per project. Say what phase they're in (e.g. wiring auth, hardening infra, polishing UI).
3. **blocking** — What's blocking or aging: open PRs, stale work, incomplete sessions, or friction from last_context. Name the PR or issue.
4. **next** — What to tackle next: recommend the **next logical phase** or the obvious **missing piece** if goals/phases are set and something clear has not been started yet (e.g. if goals list Phase 3 ordering but commits are still on landing page, say that). Tie bullets to description + goals + what's left in commits/tasks. Not generic advice.

Rules:
- No filler ("it is recommended", "consider reviewing", "you may want to"). Direct plain language only.
- If a session ran far over plan, say it like: "One session ran ~9x over plan on the Redis config — worth breaking that kind of task down next time" (use actual ratio and subject from the data).
- Max 5 bullets per array.
"""

    system_prompt = (
        "Return only valid JSON. No markdown fences. No commentary outside the JSON object."
    )
    raw, tokens = groq_chat(prompt, system_prompt, user, "standup")
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    try:
        parsed = json.loads(raw)
        standup.raw_summary = raw
        standup.highlights = _standup_clip_list(
            _standup_pick_list(parsed, "shipped", "highlights")
        )
        standup.where_you_are = _standup_clip_list(
            _standup_pick_list(parsed, "where_you_are")
        )
        standup.blockers = _standup_clip_list(
            _standup_pick_list(parsed, "blocking", "blockers")
        )
        standup.suggestions = _standup_clip_list(
            _standup_pick_list(parsed, "next", "suggestions")
        )
    except json.JSONDecodeError:
        standup.raw_summary = raw
        standup.highlights = []
        standup.where_you_are = []
        standup.blockers = []
        standup.suggestions = []
    standup.tokens_used = tokens
    standup.save()
    return standup


def brain_dump_tasks(user, text, project_id=None):
    from django.shortcuts import get_object_or_404

    from projects.models import Project
    from tasks.models import Task

    raw_text = (text or "").strip()
    if not raw_text:
        raise ValueError("text is required")

    project = None
    if project_id:
        project = get_object_or_404(Project, pk=project_id, user=user)

    prompt = f"""From this brain dump, extract discrete actionable tasks.

Return JSON only: [{{"title": "...", "priority": "high"|"medium"|"low", "estimated_minutes": <positive integer>}}, ...]

Brain dump:
{raw_text}
"""

    system_prompt = (
        "Return only a valid JSON array. Each object must have title, priority, "
        "estimated_minutes. No markdown."
    )
    raw, tokens = groq_chat(prompt, system_prompt, user, "brain_dump", project=project)
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    try:
        items = json.loads(raw)
    except json.JSONDecodeError:
        items = []

    if not isinstance(items, list):
        items = []

    created = []
    for item in items:
        if not isinstance(item, dict):
            continue
        title = (item.get("title") or "Untitled").strip()[:255]
        pr = item.get("priority", "medium")
        if pr not in ("low", "medium", "high"):
            pr = "medium"
        est = item.get("estimated_minutes")
        try:
            est = int(est) if est is not None else None
        except (TypeError, ValueError):
            est = None
        if est is not None and est < 1:
            est = None

        task = Task.objects.create(
            project=project,
            owner=user if project is None else None,
            title=title,
            priority=pr,
            estimated_minutes=est,
            status="brain_dump",
        )
        created.append(task)

    return created, tokens


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

    desc = (project.description or "").strip()
    goals_text = (project.goals or "").strip()

    prompt = f"""Summarise this project context for a developer who will read it as "What was I doing?" when they come back to the project.

Here is what this project is supposed to be: {desc or "(not set)"}
Here are the planned phases or goals: {goals_text or "(not set)"}

Recent session notes: {notes}
Recent commits: {commit_msgs}
Open PRs: {pr_titles}

Write a brief context summary (2-3 short paragraphs). If goals/phases are set, say **which phase** the recent work belongs to (e.g. "You were working on Phase 2 — you were implementing the menu page component and got stuck on the image layout."). Name concrete work from commits and sessions. If goals are empty, still describe what the work was about in plain language.
"""

    system_prompt = (
        "You are a context summariser. Be concise and specific; mention phase when goals make that possible."
    )
    summary, _ = groq_chat(
        prompt, system_prompt, user, "context_summary", project=project
    )
    project.last_context = summary
    project.save(update_fields=["last_context"])
    return summary
