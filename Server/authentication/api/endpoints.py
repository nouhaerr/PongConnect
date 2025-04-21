from django.urls import path
from . import views
from django.conf import settings


urlpatterns = [
    path('csrf/', views.get_csrf_token, name='csrftoken'),
    path('intra/', views.auth_42, name='intraView'),
    path('intra/callback/', views.auth_callback, name='authCallbackView'),
    path('google/', views.auth_google, name='googleView'),
    path('google/callback/', views.google_callback, name='googleCallbackView'),
    path('register/', views.sign_up, name="signupView"),
    path('signin/', views.sign_in, name="signinView"),
    path('session-status/', views.session_status, name="sessionStatus"),
    path('logout/', views.logout_user, name='logoutView'),
]
