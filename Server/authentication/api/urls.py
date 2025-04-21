import os
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('authentication/', include('api.endpoints')),
    path('player_management/', include('player_management.endpoints')),
]

