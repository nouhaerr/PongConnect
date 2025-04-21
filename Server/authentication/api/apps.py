from django.apps import AppConfig
import threading
import time
from django.utils.timezone import now
from django.conf import settings
from django.contrib.auth import get_user_model

User = settings.AUTH_USER_MODEL

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    def ready(self):
        import api.signals