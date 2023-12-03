import json

from urllib.parse import parse_qs

from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

from django.contrib.auth.models import User


class BaseConsumer(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.global_notifications_group = "global_notifications"
        self.user_notifications = None

    def connect(self):
        params = self.scope["query_string"].decode('utf-8')
        params = parse_qs(params)
        id = params.get('user_id', 1)[0]
        self.scope["user"] = User.objects.get(pk=id)
        if self.scope["user"].is_authenticated:
            self.user_notifications = f"noti_{self.scope['user'].id}"

            # Join groups
            async_to_sync(self.channel_layer.group_add)(
                self.global_notifications_group, self.channel_name
            )
            async_to_sync(self.channel_layer.group_add)(
                self.user_notifications, self.channel_name
            )
            self.accept()
        else:
            self.close()

    def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)

        try:
            response_object = getattr(self, f"action_{data['action'].lower()}")(data)
        except TypeError as e:
            msg = str(e).split(")")[1]
            response_object = {"error": f"{msg}"}
        except AttributeError as e:
            msg = " ".join(str(e).split("'")[2:-1])
            response_object = {"error": f"{msg}"}

        # response_object["action"] = action
        self.send(text_data=text_data)

    def disconnect(self, code):
        if self.scope["user"].is_authenticated:
            # Leave room group
            async_to_sync(self.channel_layer.group_discard)(
                self.user_notifications, self.channel_name
            )
            async_to_sync(self.channel_layer.group_discard)(
                self.global_notifications_group, self.channel_name
            )

    def action_chat(self, data: dict):
        """
            Format for action like : { "action": "CHAT", "user_id": "3040", "message": "hello dear"}
        """
        user_id = data.pop("receiver_id")
        data['sender'] = self.scope["user"].id
        async_to_sync(self.channel_layer.group_send)(
            f"noti_{user_id}",
            {
                "type": "chat.notifications",
                "data": data
            }
        )

    def chat_notifications(self, event):
        self.send(
            text_data=json.dumps(event["data"])
        )

    def action_gloabl_notification(self, data: dict):
        """
            Format for action like : { "action": "GLOBAL_NOTIFICATIONS", "notification": "bala bala bala"}
        """
        async_to_sync(self.channel_layer.group_send)(
            self.global_notifications_group,
            {
                "type": "global.notification",
                "data": data
            }
        )

    def global_notification(self, event):
        self.send(
            text_data=json.dumps(
                json.dumps(event["data"]),
            )
        )
