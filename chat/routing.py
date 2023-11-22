from django.urls import re_path

from chat.consumers import BaseConsumer

websocket_urlpatterns = [re_path(r"ws/", BaseConsumer.as_asgi())]
