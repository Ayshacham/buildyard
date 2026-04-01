import jwt
from django.conf import settings
from channels.db import database_sync_to_async
from .models import User


@database_sync_to_async
def get_user_from_token(token):
    if not token:
        return None
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

    supabase_uid = payload.get("sub")
    if not supabase_uid:
        return None

    try:
        return User.objects.get(supabase_uid=supabase_uid)
    except User.DoesNotExist:
        return None


class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        token = None
        if scope["type"] == "websocket":
            query_string = scope.get("query_string", b"").decode()
            for part in query_string.split("&"):
                if "=" in part:
                    k, v = part.split("=", 1)
                    if k == "token":
                        token = v
                        break

        scope["user"] = await get_user_from_token(token) if token else None
        return await self.app(scope, receive, send)
