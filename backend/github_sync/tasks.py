from datetime import datetime, timedelta
from celery import shared_task

from .github import GithubClient


def _parse_iso(s):
    if not s:
        return None
    s = s.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(s)
    except (ValueError, TypeError):
        return None


@shared_task
def sync_project_github(project_id):
    from projects.models import Project, GithubPR, GithubCommit

    project = Project.objects.filter(pk=project_id).first()
    if not project or not project.github_repo:
        return

    user = project.user
    token = getattr(user, "github_token", None)
    if not token:
        return

    client = GithubClient(token)
    repo = project.github_repo

    since = None
    if project.last_commit_at:
        since = project.last_commit_at - timedelta(days=1)

    try:
        commits_data = client.get_commits(repo, since=since)
    except Exception:
        return

    latest_commit_at = None
    for c in commits_data:
        sha = c.get("sha", "")
        commit = c.get("commit", {})
        if isinstance(commit, dict):
            author = commit.get("author", {}) or {}
            message = commit.get("message", "")
            author_name = author.get("name", "")
            author_email = author.get("email", "")
        else:
            message = ""
            author_name = ""
            author_email = ""

        committed_at = _parse_iso(
            c.get("commit", {}).get("author", {}).get("date")
        )

        GithubCommit.objects.update_or_create(
            project=project,
            sha=sha,
            defaults={
                "message": message,
                "author_name": author_name,
                "author_email": author_email,
                "url": c.get("html_url", ""),
                "committed_at": committed_at,
            },
        )
        if committed_at and (not latest_commit_at or committed_at > latest_commit_at):
            latest_commit_at = committed_at

    try:
        open_prs = client.get_pull_requests(repo, state="open")
    except Exception:
        open_prs = []

    for pr in open_prs:
        pr_number = pr.get("number")
        title = pr.get("title", "")
        state = pr.get("state", "open")
        if state == "closed" and pr.get("merged_at"):
            state = "merged"
        author = pr.get("user", {}).get("login", "") if isinstance(pr.get("user"), dict) else ""
        url = pr.get("html_url", "")
        additions = pr.get("additions", 0)
        deletions = pr.get("deletions", 0)
        comments_count = pr.get("comments", 0)
        pr_opened_at = _parse_iso(pr.get("created_at"))
        pr_merged_at = _parse_iso(pr.get("merged_at"))

        GithubPR.objects.update_or_create(
            project=project,
            pr_number=pr_number,
            defaults={
                "title": title,
                "state": state,
                "author": author,
                "url": url,
                "additions": additions,
                "deletions": deletions,
                "comments_count": comments_count,
                "pr_opened_at": pr_opened_at,
                "pr_merged_at": pr_merged_at,
            },
        )

    if latest_commit_at:
        project.last_commit_at = latest_commit_at
        project.save(update_fields=["last_commit_at"])


@shared_task
def sync_all_active_projects():
    from projects.models import Project

    for project in Project.objects.filter(status="active"):
        if project.github_repo:
            sync_project_github.delay(str(project.id))  # type: ignore[attr-defined]


@shared_task
def snapshot_project_health(project_id):
    from projects.models import Project
    from projects.services import calculate_health_score
    from notifications.utils import push_notification

    project = Project.objects.filter(pk=project_id).first()
    if not project:
        return

    old_score = project.health_score
    calculate_health_score(project)
    project.refresh_from_db()
    new_score = project.health_score

    if new_score < 50 and old_score >= 50:
        push_notification(
            user_id=str(project.user.pk),
            notification_type="stuck_alert",
            title="Project health dropped",
            body=f"{project.name} health score fell below 50",
            data={"project_id": str(project.id), "health_score": new_score},
        )
