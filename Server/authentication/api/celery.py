import os
from celery import Celery

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')

app = Celery('api')

# Use a string here as the setting is picklized
app.config_from_object('django.conf:settings', namespace='CELERY')
app.conf.broker_connection_retry_on_startup = True

# Load tasks from all registered Django app configs
app.autodiscover_tasks()