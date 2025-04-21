from django.urls import path
from . import consumers
from django.urls import re_path


websocket_urlpatterns = [
    re_path(r'ws/socket-server/(?P<username>\w+)/$', consumers.ChatConsumer.as_asgi())
]
