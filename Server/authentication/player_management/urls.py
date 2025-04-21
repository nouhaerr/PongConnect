from django.urls import path
from . import views

urlpatterns = [
    path('player_friendship_get/', views.player_friendship_get, name='player_friendship_get'),
] 