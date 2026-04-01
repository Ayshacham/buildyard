from channels.generic.websocket import AsyncWebsocketConsumer
import json


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        if not user or not user.is_authenticated:
            await self.close()
            return

        channel_layer = self.channel_layer
        if channel_layer is None:
            await self.close()
            return

        self.group_name = f"user_{user.id}"
        await channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, "group_name"):
            channel_layer = self.channel_layer
            if channel_layer is not None:
                await channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        pass

    async def notification_message(self, event):
        await self.send(text_data=json.dumps(event["notification"]))
