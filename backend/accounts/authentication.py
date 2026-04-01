import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import User


class SupabaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ")[1]

        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired.")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid token.")

        supabase_uid = payload.get("sub")
        if not supabase_uid:
            raise AuthenticationFailed("Token missing sub claim.")

        user_metadata = payload.get("user_metadata", {})

        user, created = User.objects.get_or_create(
            supabase_uid=supabase_uid,
            defaults={
                "username": payload.get("email", supabase_uid).split("@")[0],
                "email": payload.get("email", ""),
            },
        )

        if created:
            user.github_username = user_metadata.get("user_name", "")
            user.avatar_url = user_metadata.get("avatar_url", "")
            user.save(update_fields=["github_username", "avatar_url"])

        return (user, token)
