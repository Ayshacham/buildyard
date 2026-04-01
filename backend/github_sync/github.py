import requests


class GithubClient:
    def __init__(self, github_token):
        self.token = github_token
        self.headers = {
            "Authorization": f"Bearer {github_token}",
            "Accept": "application/vnd.github.v3+json",
        }

    def get_repo(self, repo):
        url = f"https://api.github.com/repos/{repo}"
        resp = requests.get(url, headers=self.headers, timeout=30)
        resp.raise_for_status()
        return resp.json()

    def get_commits(self, repo, since=None):
        url = f"https://api.github.com/repos/{repo}/commits"
        params = {}
        if since:
            params["since"] = since.isoformat()
        resp = requests.get(url, headers=self.headers, params=params, timeout=30)
        resp.raise_for_status()
        return resp.json()

    def get_pull_requests(self, repo, state="open"):
        url = f"https://api.github.com/repos/{repo}/pulls"
        params = {"state": state}
        resp = requests.get(url, headers=self.headers, params=params, timeout=30)
        resp.raise_for_status()
        return resp.json()
