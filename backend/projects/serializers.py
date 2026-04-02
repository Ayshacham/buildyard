from rest_framework import serializers
from .models import Project, GithubPR, GithubCommit, HealthSnapshot
from .github_repo_validation import validate_github_repo_for_user


class GithubCommitSerializer(serializers.ModelSerializer):
    sha_short = serializers.SerializerMethodField()

    class Meta:  # pyright: ignore[reportIncompatibleVariableOverride]
        model = GithubCommit
        fields = [
            "id",
            "sha",
            "sha_short",
            "message",
            "author_name",
            "committed_at",
            "url",
        ]

    def get_sha_short(self, obj):
        return obj.sha[:7]


class GithubPRSerializer(serializers.ModelSerializer):
    age_days = serializers.SerializerMethodField()

    class Meta:  # pyright: ignore[reportIncompatibleVariableOverride]
        model = GithubPR
        fields = [
            "id",
            "pr_number",
            "title",
            "state",
            "author",
            "url",
            "additions",
            "deletions",
            "comments_count",
            "pr_opened_at",
            "pr_merged_at",
            "age_days",
        ]

    def get_age_days(self, obj):
        if not obj.pr_opened_at:
            return None
        from django.utils import timezone

        return (timezone.now() - obj.pr_opened_at).days


class HealthSnapshotSerializer(serializers.ModelSerializer):
    class Meta:  # pyright: ignore[reportIncompatibleVariableOverride]
        model = HealthSnapshot
        fields = [
            "id",
            "health_score",
            "commits_this_week",
            "open_prs",
            "avg_pr_age_days",
            "focus_minutes_this_week",
            "tasks_completed_this_week",
            "status",
            "signals",
            "snapped_at",
        ]


class ProjectListSerializer(serializers.ModelSerializer):
    open_prs_count = serializers.SerializerMethodField()
    recent_commit = serializers.SerializerMethodField()

    class Meta:  # pyright: ignore[reportIncompatibleVariableOverride]
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "color",
            "status",
            "github_repo",
            "health_score",
            "total_focus_minutes",
            "last_session_at",
            "last_commit_at",
            "created_at",
            "open_prs_count",
            "recent_commit",
        ]

    def get_open_prs_count(self, obj):
        return obj.pull_requests.filter(state="open").count()

    def get_recent_commit(self, obj):
        commit = obj.commits.first()
        if commit:
            return GithubCommitSerializer(commit).data
        return None


class ProjectSerializer(serializers.ModelSerializer):
    recent_commits = serializers.SerializerMethodField()
    open_prs = serializers.SerializerMethodField()
    latest_health = serializers.SerializerMethodField()

    class Meta:  # pyright: ignore[reportIncompatibleVariableOverride]
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "color",
            "status",
            "github_repo",
            "github_default_branch",
            "health_score",
            "last_context",
            "total_focus_minutes",
            "last_session_at",
            "last_commit_at",
            "created_at",
            "recent_commits",
            "open_prs",
            "latest_health",
        ]
        read_only_fields = [
            "id",
            "health_score",
            "total_focus_minutes",
            "last_session_at",
            "last_commit_at",
        ]

    def validate_github_repo(self, value):
        request = self.context.get("request")
        user = getattr(request, "user", None) if request else None
        if not user or not user.is_authenticated:
            return (value or "").strip()
        return validate_github_repo_for_user(user, value)

    def get_recent_commits(self, obj):
        commits = obj.commits.order_by("-committed_at")[:5]
        return GithubCommitSerializer(commits, many=True).data

    def get_open_prs(self, obj):
        prs = obj.pull_requests.filter(state="open").order_by("-pr_opened_at")
        return GithubPRSerializer(prs, many=True).data

    def get_latest_health(self, obj):
        snapshot = obj.health_snapshots.first()
        if snapshot:
            return HealthSnapshotSerializer(snapshot).data
        return None
