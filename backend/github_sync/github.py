import requests


class GithubClient:
    def __init__(self, github_token=None):
        self.token = github_token
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
        }
        if github_token:
            self.headers["Authorization"] = f"Bearer {github_token}"

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
        all_items = []
        page = 1
        while page <= 50:
            params = {"state": state, "per_page": 100, "page": page}
            resp = requests.get(url, headers=self.headers, params=params, timeout=30)
            resp.raise_for_status()
            batch = resp.json()
            if not isinstance(batch, list):
                break
            all_items.extend(batch)
            if len(batch) < 100:
                break
            page += 1
        return all_items
