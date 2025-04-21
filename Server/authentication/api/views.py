import requests
from django.conf import settings
from django.http import HttpResponseBadRequest
from django.utils.http import urlencode, urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth import login, logout, authenticate
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie, csrf_protect
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import PlayerSignUpSerializer
from .models import Player
from .utils import decode_id_tok, handle_oauth_callback
from os import getenv
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.contrib.sessions.models import Session

@api_view(['POST'])
@permission_classes([AllowAny])
def sign_up(request):
	serializer = PlayerSignUpSerializer(data=request.data)
	if serializer.is_valid():
		user = serializer.save()
		return Response(
			{"message": "User registered successfully."},
			status=status.HTTP_201_CREATED,
		)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def get_csrf_token(request):
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([AllowAny])
def sign_in(request):
	if request.user.is_authenticated:
		return Response(
			{"message": f"{request.user} already logged in"},
			status=status.HTTP_400_BAD_REQUEST,
		)
	username = request.data.get('username')
	password = request.data.get('password')

	if not (username and password):
		return Response(
			{"error": 'Username and password are required.'},
			status=status.HTTP_400_BAD_REQUEST,
		)
	player = authenticate(username=username, password=password)
	if not player:
		return Response(
            {"error": "Invalid username or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )
	if not player.is_active:
		return Response(
            {"error": "This account is deactivated."},
            status=status.HTTP_403_FORBIDDEN,
        )
	login(request, player)
	request.session.cycle_key()
	request.session['user_id'] = player.id
	request.session.save()
	player.status = player.Status.ONLINE.value
	player.save()
	response = Response(
		{
			"message": "Sign-in successful.",
			"player": {
				"username": player.username,
				"status": player.status,
			},
		},
		status=status.HTTP_200_OK,
	)
	return response


@api_view(['GET'])
@permission_classes([AllowAny])
def auth_42(request):
	if request.user.is_authenticated:
		return Response({"message": f"{request.user} already logged in"},status=status.HTTP_400_BAD_REQUEST)
	client_id = settings.INTRA_CLIENT_ID
	if not client_id:
		return HttpResponseBadRequest("INTRA_CLIENT_ID not configured.")
	redirect_uri = urlencode({"redirect_uri": f"{settings.FRONTEND_URL}login"})
	authorization_url = (f"https://api.intra.42.fr/oauth/authorize?"
                f"client_id={client_id}&"
                f"{redirect_uri}&"
                f"response_type=code"
	)
	return Response(authorization_url ,status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def auth_callback(request):
	code = request.GET.get("code")
	error_msg = request.GET.get("error")
	if error_msg:
		return Response({"error": error_msg},
            status=status.HTTP_401_UNAUTHORIZED)
	if not code:
		return Response({"error": "code is requiered"},
            status=status.HTTP_401_UNAUTHORIZED)
	token_url = 'https://api.intra.42.fr/oauth/token'
	data = {
        'grant_type': 'authorization_code',
        'client_id': settings.INTRA_CLIENT_ID,
        'client_secret': settings.INTRA_CLIENT_SECRET,
        'code': code,
        'redirect_uri': f"{settings.FRONTEND_URL}login",
    }
	# Request access token from 42 API
	try:
		token_response = requests.post(token_url, data=data, timeout=10)
		token_response.raise_for_status()
		access_token = token_response.json().get("access_token")
		if not access_token:
			return Response({"error": "No access token received"},
                status=status.HTTP_401_UNAUTHORIZED)
	except (requests.RequestException, ValueError)as e:
		return Response({"error": f"Failed to fetch access token: {str(e)}"},
            status=status.HTTP_401_UNAUTHORIZED)

	# Fetch user information from 42 API
	try:
		user_response = requests.get("https://api.intra.42.fr/v2/me",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10)
		user_response.raise_for_status()
		user_data = user_response.json()
	except requests.RequestException as e:
		return Response({"error": f"Failed to fetch user data: {str(e)}"},
            status=status.HTTP_401_UNAUTHORIZED)

	# Extract user data
	try:
		player_data = {
			"id": user_data['id'],
			"email": user_data['email'],
			"username": user_data['login'],
			"first_name": user_data['first_name'],
			"last_name": user_data['last_name'],
			"avatar": user_data['image']['link'],
		}
	except ValueError:
		return Response({"error": "Invalide user data response"},
            status=status.HTTP_401_UNAUTHORIZED)
	return handle_oauth_callback(request, player_data, 'django.contrib.auth.backends.ModelBackend')


@api_view(['GET'])
@permission_classes([AllowAny])
def auth_google(request):
	if request.user.is_authenticated:
		return Response({"message": f"{request.user} already logged in"},status=status.HTTP_400_BAD_REQUEST)

	SCOPES = [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "openid",
	]
	google_client_id = settings.GOOGLE_CLIENT_ID
	if not google_client_id:
		return Response({"error": "GOOGLE_CLIENT_ID is not configured."}, status=status.HTTP_401_UNAUTHORIZED)
	params = {
        "response_type": "code",
        "client_id": google_client_id,
        "redirect_uri": f'{settings.AUTHENTICATION_URL}google/callback/',
        "scope": " ".join(SCOPES),
        "access_type": "offline",
        "include_granted_scopes": "true",
        "prompt": "select_account",
    }
	google_authorization_url = f"https://accounts.google.com/o/oauth2/auth?{urlencode(params)}"
	return redirect(google_authorization_url)


@api_view(['GET'])
@permission_classes([AllowAny])
def google_callback(request):
	if request.user.is_authenticated:
		return Response({"message": f"{request.user} already logged in"},status=status.HTTP_400_BAD_REQUEST)
	try:
		code = request.GET.get("code")
		error_msg = request.GET.get("error")
		if request.session.get('oauth_code_used') == code:
			return Response(status=status.HTTP_400_BAD_REQUEST)
		if error_msg:
			return Response({"error": error_msg}, status=status.HTTP_401_UNAUTHORIZED)
		if not code:
			return Response({"error": "Not Authorized User"}, status=status.HTTP_401_UNAUTHORIZED)
		# Exchange the authorization code for access token
		token_url = "https://oauth2.googleapis.com/token"
		data = {
			"grant_type": "authorization_code",
			"code": code,
			"client_id": settings.GOOGLE_CLIENT_ID,
			"client_secret": settings.GOOGLE_CLIENT_SECRET,
			"redirect_uri": f'{settings.AUTHENTICATION_URL}google/callback/',
		}
		try:
			token_response = requests.post(token_url, data=data, timeout=10)
			token_response.raise_for_status()
			tokens = token_response.json()
			if 'access_token' not in tokens:
				return Response({"error": "Token exchange failed."}, status=status.HTTP_401_UNAUTHORIZED)
			access_token = tokens.get("access_token")
			id_token = tokens.get("id_token")
			if not access_token or not id_token:
				raise ValueError("Access token or ID token missing.")
		except (requests.RequestException, ValueError) as e:
			return Response({"error": f"Failed to obtain access token: {str(e)}"},
				status=status.HTTP_401_UNAUTHORIZED)
		# Decode the ID token to get user information
		try:
			decoded_tok = decode_id_tok(id_token)
		except Exception as e:
			return Response({"error": f"Failed to decode ID token: {str(e)}"},
				status=status.HTTP_401_UNAUTHORIZED)
		# Prepare user data
		player_data = {
			"id": decoded_tok.get('sub'),
			"email": decoded_tok.get('email'),
			"username": decoded_tok.get('name'),
			"first_name": decoded_tok.get('given_name'),
			"last_name": decoded_tok.get('family_name'),
			"avatar": decoded_tok.get('picture'),
		}
		request.session['oauth_code_used'] = code
		return handle_oauth_callback(request, player_data, 'social_core.backends.google.GoogleOAuth2')
	except Exception as e:
		return Response({"error": f"Échec de l'authentification: {str(e)}"},
			status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@csrf_protect
def logout_user(request):
	user = request.user
	if user.is_authenticated:
		Session.objects.filter(session_key=request.session.session_key).delete()
		logout(request)
		user.status = user.Status.OFFLINE.value
		user.save()
		request.session.flush()
		response = Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
		# response.delete_cookie("sessionid", secure=True, httponly=True, samesite="Lax")
		# response.delete_cookie("django_admin_session", secure=True, httponly=True, samesite="Lax")
		# response.delete_cookie("csrftoken", secure=True, httponly=True, samesite="Lax")
		response.delete_cookie("sessionid")
		response.delete_cookie("django_admin_session")
		response.delete_cookie("csrftoken")
		return response
	return Response({"message": "No user is currently logged in."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def session_status(request):
    return Response({"user": request.user.username}, status=status.HTTP_200_OK)
