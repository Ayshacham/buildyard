import requests
from rest_framework import serializers


def _normalize_slug(raw: str) -> str:
    slug = (raw or "").strip()
    if not slug:
        return ""
    if slug.count("/") != 1:
        raise serializers.ValidationError(
            "Use the form owner/repo (for example, octocat/Hello-World)."
        )
    owner, name = slug.split("/", 1)
    owner, name = owner.strip(), name.strip()
    if not owner or not name:
        raise serializers.ValidationError(
            "Use the form owner/repo (for example, octocat/Hello-World)."
        )
    if len(owner) > 39 or len(name) > 100:
        raise serializers.ValidationError("Owner or repository name looks too long.")
    return f"{owner}/{name}"


def validate_github_repo_for_user(user, raw: str) -> str:
    slug = _normalize_slug(raw)
    if not slug:
        return ""

    token = (getattr(user, "github_token", None) or "").strip()
    headers = {
        "Accept": "application/vnd.github.v3+json",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    url = f"https://api.github.com/repos/{slug}"
    try:
        resp = requests.get(url, headers=headers, timeout=30)
    except requests.RequestException:
        raise serializers.ValidationError(
            "Could not reach GitHub. Check your connection and try again."
        ) from None

    if resp.status_code == 200:
        return slug

    if resp.status_code == 401:
        raise serializers.ValidationError(
            "GitHub rejected your saved credentials. Sign in again with GitHub."
        )

    if resp.status_code == 403:
        try:
            payload = resp.json()
            msg = payload.get("message", "")
        except ValueError:
            msg = ""
        if "rate limit" in msg.lower():
            raise serializers.ValidationError(
                "GitHub rate limit reached. Try again in a few minutes."
            ) from None
        raise serializers.ValidationError(
            "GitHub denied access to this repository. You may need permission from the owner."
        )

    if resp.status_code == 404:
        raise serializers.ValidationError(
            "Repository not found or not accessible with your GitHub account. "
            "Check the name, or if the repo is private, sign in with GitHub and ensure you have access."
        )

    raise serializers.ValidationError(
        "Could not verify the repository. Try again or check the owner/repo name."
    )
