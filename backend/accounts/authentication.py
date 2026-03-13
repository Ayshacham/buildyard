import requests as http_requests
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from dataclasses import dataclass


@dataclass
class SupabaseUser:
    """Lightweight user object built from Supabase auth response."""

    id: str  # UUID — matches user_id in todo_list table
    email: str

    @property
    def is_authenticated(self):
        return True


class SupabaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ")[1]

        try:
            response = http_requests.get(
                f"{settings.SUPABASE_URL}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": settings.SUPABASE_SECRET_KEY,
                },
                timeout=5,
            )
        except http_requests.RequestException:
            raise AuthenticationFailed("Could not reach auth server")

        if response.status_code == 401:
            raise AuthenticationFailed("Invalid or expired token")

        if response.status_code != 200:
            raise AuthenticationFailed("Auth server error")

        data = response.json()

        return (SupabaseUser(id=data["id"], email=data.get("email", "")), token)
