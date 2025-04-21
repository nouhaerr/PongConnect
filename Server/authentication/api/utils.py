import datetime
import logging
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
from typing import Dict
from django.utils import timezone
from google.oauth2 import id_token
from google.auth.transport import requests
from django.db import IntegrityError
from os import getenv
from .models import Player
from django.contrib.auth import login as auth_login
from datetime import timedelta

logger = logging.getLogger(__name__)

def generate_unique_username(base_username):
    username = base_username
    counter = 1
    while Player.objects.filter(username=username).exists():
        username = f"{base_username}_{counter}"
        counter += 1
    return username


def create_player(player_data):
    username = player_data['username'].replace(' ', '_')[:20]
    first_name = player_data['first_name'][:20]
    last_name = player_data['last_name'][:20]
    auth_id = str(player_data['id'])
    try:
        player, created = Player.objects.get_or_create(
            auth_id=auth_id,
            defaults={
                'username': username,
                'email': player_data['email'],
                'first_name': first_name,
                'last_name': last_name,
                'avatar': player_data['avatar'],
            }
        )
        if not created:
            player.email = player_data['email']
            player.username = username
            player.first_name = first_name
            player.last_name = last_name
            player.avatar = player_data['avatar']
            player.save()
        return player
    except IntegrityError:
        return None


def decode_id_tok(id_token_str: str) -> Dict[str, str]:
    try:
        client_id = settings.GOOGLE_CLIENT_ID
        if not client_id:
            raise ValueError("GOOGLE_CLIENT_ID environment variable is not set.")
        decoded_token = id_token.verify_oauth2_token(
            id_token_str,
            requests.Request(),
            client_id
        )
        leeway_seconds=10
        now = datetime.datetime.now(datetime.timezone.utc).timestamp()
        iat = decoded_token.get("iat", 0)
        nbf = decoded_token.get("nbf", 0)
        exp = decoded_token.get("exp", 0)

        if iat - leeway_seconds > now:
            raise ValueError("Token used too early (iat too recent).")
        if nbf - leeway_seconds > now:
            raise ValueError("Token not valid yet (nbf too recent).")
        if exp + leeway_seconds < now:
            raise ValueError("Token expired.")

        return decoded_token
    except ValueError as e:
        raise ValueError(f"Failed to decode Google ID token: {str(e)}")


def handle_oauth_callback(request, user_data, backend):
    try:
        player = create_player(user_data)
        if not player:
            return Response({"message": "Redirect to login page."}, status=status.HTTP_404_NOT_FOUND)

        player.backend = backend
        auth_login(request, player)
        request.session.cycle_key()
        request.session['user_id'] = player.id
        request.session.save()

        player.status = player.Status.ONLINE.value
        player.save()

        return Response(
            {"message": "Logged in successfully."},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response({"message": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)