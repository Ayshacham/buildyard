from datetime import timedelta
from django.utils import timezone


def calculate_health_score(project):
    now = timezone.now()
    week_ago = now - timedelta(days=7)

    commits_this_week = project.commits.filter(committed_at__gte=week_ago).count()
    open_prs = project.pull_requests.filter(state="open")
    open_prs_count = open_prs.count()

    avg_pr_age = 0
    if open_prs_count:
        ages = [(now - pr.pr_opened_at).days for pr in open_prs if pr.pr_opened_at]
        avg_pr_age = sum(ages) // len(ages) if ages else 0

    focus_minutes = sum(
        s.duration_minutes or 0
        for s in project.sessions.filter(started_at__gte=week_ago, completed=True)
    )

    tasks_done = project.tasks.filter(
        status="done",
        completed_at__gte=week_ago,
    ).count()

    days_since_commit = (
        (now - project.last_commit_at).days if project.last_commit_at else 999
    )
    days_since_session = (
        (now - project.last_session_at).days if project.last_session_at else 999
    )

    score = 100
    if commits_this_week == 0:
        score -= 30
    elif commits_this_week < 3:
        score -= 10

    if days_since_commit > 7:
        score -= 20
    elif days_since_commit > 3:
        score -= 10

    if avg_pr_age > 7:
        score -= 20
    elif avg_pr_age > 3:
        score -= 10

    if days_since_session > 7:
        score -= 15
    elif days_since_session > 3:
        score -= 5

    score = max(0, min(100, score))

    signals = {
        "commits_this_week": commits_this_week,
        "open_prs": open_prs_count,
        "avg_pr_age_days": avg_pr_age,
        "focus_minutes_this_week": focus_minutes,
        "tasks_completed_this_week": tasks_done,
        "days_since_commit": days_since_commit,
        "days_since_session": days_since_session,
    }

    from .models import HealthSnapshot

    HealthSnapshot.objects.create(
        project=project,
        health_score=score,
        commits_this_week=commits_this_week,
        open_prs=open_prs_count,
        avg_pr_age_days=avg_pr_age,
        focus_minutes_this_week=focus_minutes,
        tasks_completed_this_week=tasks_done,
        status="stale" if score < 50 else "active",
        signals=signals,
    )

    project.health_score = score
    project.status = "stale" if score < 50 else "active"
    project.save(update_fields=["health_score", "status"])

    return score
