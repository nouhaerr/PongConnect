from rest_framework.response import Response
from rest_framework.decorators import api_view , permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.password_validation import validate_password
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializer import PlayerInfoSerializer, SettingsInfoSerializer, UsernameSerializer, PublicProfileSerializer, MatchHistorySerializer
from django.core.exceptions import ValidationError
from django.db import transaction
from django.contrib.auth import logout
from rest_framework.exceptions import PermissionDenied
from .models import Friendship, MatchHistory
from django.db.models import Q
from .utils import clean_and_validate, get_rank, calculate_level
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from urllib.parse import urljoin
from api.models import Player
import math
import os
import traceback
from django.utils import timezone
from datetime import timedelta


@api_view(['GET'])
def player_info(request):
    try:
        username = request.query_params.get("username")
        current_user = request.user

        if username:
            target_user = Player.objects.filter(username=username).first()
            if not target_user:
                return Response(
                    {"message": "No player found."},
                    status=status.HTTP_404_NOT_FOUND
                )
                
            is_blocked = Friendship.objects.filter(
                (Q(sender=current_user, receiver=target_user) | 
                 Q(sender=target_user, receiver=current_user)),
                status='BLK'
            ).exists()

            if is_blocked:
                return Response(
                    {"message": "This profile is not accessible"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            w = target_user.wins or 0
            l = target_user.losses or 0
            level = calculate_level(w, l)
            
            target_user.level = level
            target_user.rank = get_rank(level)
            target_user.save()

            match_history = MatchHistory.objects.filter(
                mainUser=target_user
            ).order_by('-id')[:10]

            friendship_status = None
            friendship = Friendship.objects.filter(
                (Q(sender=current_user, receiver=target_user) | 
                 Q(sender=target_user, receiver=current_user))
            ).first()

            if friendship:
                friendship_status = friendship.status

            response_data = {
                "profile": PlayerInfoSerializer(target_user).data,
                "match_history": MatchHistorySerializer(match_history, many=True).data,
                "friendship_status": friendship_status
            }

        else:
            w = current_user.wins
            l = current_user.losses
            level = calculate_level(w, l)
            current_user.level = level
            current_user.rank = get_rank(level)
            current_user.save()

            response_data = {
                "profile": PlayerInfoSerializer(current_user).data,
                "match_history": MatchHistorySerializer(
                    MatchHistory.objects.filter(mainUser=current_user).order_by('-id')[:10],
                    many=True
                ).data
            }

        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        print("Error in player_info:", str(e))
        return Response(
            {"message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_settings(request):
    player = request.user
    serializer = SettingsInfoSerializer(player)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def edit_profile(request):
    try:
        player = request.user
        player_data = request.data
        updated_fields = set()

        with transaction.atomic():
            if "username" in player_data:
                try:
                    username = clean_and_validate("username", player_data["username"], 20)
                    if username != player.username and Player.objects.filter(username=username).exclude(id=player.id).exists():
                        return Response({"message": f"Username '{username}' is already taken."}, status=status.HTTP_400_BAD_REQUEST)
                    player.username = username
                    updated_fields.add("username")
                except ValueError as e:
                    return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

            if "email" in player_data:
                email = player_data["email"].strip()
                if email and email != player.email:
                    if Player.objects.filter(email=email).exclude(id=player.id).exists():
                        return Response({"message": "This email is already associated with another account."},
                            status=status.HTTP_400_BAD_REQUEST)
                    player.email = email
                    updated_fields.add("email")

            for field in ["first_name", "last_name"]:
                if field in player_data:
                    if player_data[field].strip():
                        try:
                            cleaned_value = clean_and_validate(field, player_data[field], 20)
                            setattr(player, field, cleaned_value)
                            updated_fields.add(field)
                        except ValueError as e:
                            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

            if all(k in player_data for k in ["old_password", "new_password", "confirm_password"]):
                old_password = player_data["old_password"]
                new_password = player_data["new_password"]
                confirm_password = player_data["confirm_password"]
                if not player.check_password(old_password):
                    return Response({
                        "message": "Old password is incorrect."},
                        status=status.HTTP_400_BAD_REQUEST)
                if new_password != confirm_password:
                    return Response({
                        "message": "New passwords do not match."},
                        status=status.HTTP_400_BAD_REQUEST)
                try:
                    validate_password(new_password, user=player)
                    player.set_password(new_password)
                    updated_fields.add("password")
                except ValidationError as e:
                    return Response({"message": f"New password validation error: {', '.join(e.messages)}"},
                        status=status.HTTP_400_BAD_REQUEST)

            if updated_fields:
                player.save(update_fields=updated_fields)
                return Response({"message": "Profile updated successfully."},
                        status=status.HTTP_200_OK)
            return Response({"message": "No changes detected."},
                    status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def edit_avatar(request):
    try:
        username = request.data.get('username')
        if not username:
            return Response({"message": "Missing username"},
                status=status.HTTP_400_BAD_REQUEST)
        file = request.FILES.get('image')
        if not file:
            return Response({"message": "Missing image"},
                status=status.HTTP_400_BAD_REQUEST)
        player = Player.objects.get(username=username)
        updated_fields = set()
        if file:
            file_extension = os.path.splitext(file.name)[1] or ".jpg"
            new_filename = f"avatar_{username}{file_extension}"
            new_file_path = os.path.join(str(settings.MEDIA_URL)[1:], new_filename)
            media_root = str(settings.MEDIA_URL)[1:]
            avatar_prefix = f"avatar_{username}"
            for ext in {'.jpg', '.png', '.jpeg', '.gif', '.webp'}:
                old_file_path = os.path.join(media_root, avatar_prefix + ext)
                if default_storage.exists(old_file_path):
                    default_storage.delete(old_file_path)
            default_storage.save(new_file_path, ContentFile(file.read()))
            file_url = urljoin(settings.PLAYER_MANAGEMENT_URL, new_file_path)
            if file_url.strip() and file_url.strip() != player.avatar:
                player.avatar = file_url.strip()
                updated_fields.add("avatar")
        if updated_fields:
            player.save(update_fields=updated_fields)
        return Response({
            "message": "Avatar updated successfully",
            "avatar_url": player.avatar,
        }, status=status.HTTP_200_OK)
    except Player.DoesNotExist:
        return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def search_usernames(request):
    try:
        searched_username = request.query_params.get("username", "").strip()
        if not searched_username:
            return Response({"message": "Username query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST)
        current_user = request.user
        current_player = Player.objects.get(username=current_user.username)
       # Get the list of players who have blocked the current player (receiver blocked by current player)
        blocked_players = Friendship.objects.filter(
            receiver=current_player, status='BLK'
        ).values_list('sender', flat=True)

        # Get the list of players who the current player has blocked (sender blocking the current player)
        blocked_by_current_player = Friendship.objects.filter(
            sender=current_player, status='BLK'
        ).values_list('receiver', flat=True)

        # Combine both sets of blocked players (exclude players who are in either list)
        blocked_players_combined = list(blocked_players) + list(blocked_by_current_player)

        # Exclude the players who are either blocked by the current player or have blocked the current player
        users = Player.objects.filter(username__icontains=searched_username).exclude(id__in=blocked_players_combined)

        serializer = UsernameSerializer(users, many=True)
        if not users.exists():
            return Response({"message": "No players found"},
                status=status.HTTP_400_BAD_REQUEST)
            
        return Response(serializer.data , status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"message": f"An error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
def delete_account(request):
    try:
        user = request.user
        username = user.username
        friendships = Friendship.objects.filter(Q(sender=user) | Q(receiver=user),
            status="ACC"
        )

        with transaction.atomic():
            for friendship in friendships:
                if friendship.sender == user:
                    friendship.receiver.decrement_friends()
                else:
                    friendship.sender.decrement_friends()
                friendship.delete()

            logout(request)
            user.delete()
            return Response({"message": f"User '{username}' has been logged out and their account deleted successfully."},
                status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def player_friendship_get(request):
    try:
        user = request.user
        username = user.username
        player = Player.objects.get(username=username)
        get_type = request.query_params.get('target')

        if get_type == 'invites':
            friendships = Friendship.objects.filter(receiver=player, status='PEN')
            friendship_data = [
                PlayerInfoSerializer(friendship.sender).data for friendship in friendships
            ]
            return Response({"friendships": friendship_data}, status=status.HTTP_200_OK)

        elif get_type == 'friends':
            friends = Friendship.objects.filter(
                Q(sender=player, status='ACC') | Q(receiver=player, status='ACC')
            )

            friendship_data = [
                PlayerInfoSerializer(friendship.receiver if friendship.sender == player else friendship.sender).data
                for friendship in friends
            ]
            return Response({"status": 200, "friendships": friendship_data})

        elif get_type == 'requests':
            friendships = Friendship.objects.filter(sender=player, status='PEN')
            friendship_data = [
                PlayerInfoSerializer(friendship.receiver).data for friendship in friendships
            ]
            return Response({"friendships": friendship_data}, status=status.HTTP_200_OK)
        
        elif get_type == 'blocked':
            blocked_friendships = Friendship.objects.filter(sender=player, status='BLK')
            blocked_data = [
                PlayerInfoSerializer(friendship.receiver).data for friendship in blocked_friendships
            ]
            return Response({"blocked_list": blocked_data}, status=status.HTTP_200_OK)

        else:
            return Response({"message": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)
    except PermissionDenied as e:
        return Response({"message": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def player_friendship_post(request):
    try:
        user = request.user
        username = user.username
        sender = Player.objects.get(username=username)
        receiver_name = request.data.get('target_username')

        if receiver_name == username:
            return Response({"error": "You can't send a friend request to yourself"}, status=status.HTTP_400_BAD_REQUEST)

        receiver = Player.objects.get(username=receiver_name)

        if Friendship.objects.filter(sender=sender, receiver=receiver).exists():
            return Response({"error": "Friend request already sent"}, status=status.HTTP_400_BAD_REQUEST)

        elif Friendship.objects.filter(sender=receiver, receiver=sender).exists():
            friendships = Friendship.objects.filter(sender=receiver, receiver=sender)
            friendships.update(status='ACC')
            sender.increment_friends()  
            receiver.increment_friends()
            return Response({"error": "Friend request accepted successfully"}, status=status.HTTP_400_BAD_REQUEST)

        else:
            Friendship.objects.create(sender=sender, receiver=receiver, status='PEN')
            return Response({"message": "Friend request sent successfully"}, status=status.HTTP_200_OK)
    except PermissionDenied as e:
        return Response({"message": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
    except Player.DoesNotExist:
        return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def player_friendship_delete(request):
    try:
        user = request.user
        other = request.data.get('username')
        
        if not other:
            return Response({"message": "Username is required."},
                status=status.HTTP_400_BAD_REQUEST)

        friendship = Friendship.objects.filter(
            (Q(sender=user, receiver__username=other) | 
             Q(sender__username=other, receiver=user))
        ).first()

        if not friendship:
            return Response({"message": "No friendship found."},
                status=status.HTTP_404_NOT_FOUND)

        if friendship.status == 'ACC':
            friendship.sender.decrement_friends()
            friendship.receiver.decrement_friends()

        friendship.delete()

        return Response({
            "message": "Friendship removed successfully.",
            "status": "success"
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def block_friend(request):
    try:
        user = request.user
        me = user.username
        other = request.data.get('username')
        if not other:
            return Response({"message": "Target username is required."},
                status=status.HTTP_400_BAD_REQUEST)
        if me == other:
            return Response({"message": "You cannot block yourself."},
                status=status.HTTP_400_BAD_REQUEST)
        sender = Player.objects.get(username=me)

        try:
            receiver = Player.objects.get(username=other)
        except Player.DoesNotExist:
            return Response({"message": "Player not found."},
                status=status.HTTP_404_NOT_FOUND)
        friendship = Friendship.objects.filter(
            Q(sender=sender, receiver=receiver) | Q(sender=receiver, receiver=sender)
        ).first()

        if friendship:
            if friendship.status == "BLK" and friendship.sender == sender:
                return Response({"message": f"You have already blocked {other}."},
                                status=status.HTTP_400_BAD_REQUEST)

            friendship.status = "BLK"
            friendship.sender = sender
            friendship.receiver = receiver
            friendship.save()

            sender.decrement_friends()
            receiver.decrement_friends()

            return Response({"message": f"{other} has been blocked."},
                            status=status.HTTP_200_OK)

        return Response({"message": "No active friendship found to block."},
                        status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"message": f"An error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def unblock_friend(request):
    try:
        user = request.user
        me = user.username
        other = request.data.get('username')

        if not other:
            return Response(
                {"message": "Target username is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if me == other:
            return Response(
                {"message": "You cannot unblock yourself."},
                status=status.HTTP_400_BAD_REQUEST
            )

        sender = Player.objects.get(username=me)

        try:
            receiver = Player.objects.get(username=other)
        except Player.DoesNotExist:
            return Response(
                {"message": "Player not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        friendship = Friendship.objects.filter(
            Q(sender=sender, receiver=receiver) | Q(sender=receiver, receiver=sender),
            status='BLK'
        ).first()

        if not friendship:
            return Response(
                {"message": "No blocked relationship found with this player."},
                status=status.HTTP_400_BAD_REQUEST
            )
        friendship.delete()
        return Response(
            {"message": f"You have successfully unblocked {other}. The relationship has been reset."},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {"message": f"An error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def handle_friend_request(request):
    try:
        user = request.user
        username = request.data.get('username')
        action = request.data.get('action')

        if not username or not action:
            return Response({"message": "Username and action are required."},
                status=status.HTTP_400_BAD_REQUEST)

        if action not in ['accept', 'decline']:
            return Response({"message": "Invalid action."},
                status=status.HTTP_400_BAD_REQUEST)

        friendship = Friendship.objects.filter(
            sender__username=username,
            receiver=user,
            status='PEN'
        ).first()

        if not friendship:
            return Response({"message": "Friend request not found."},
                status=status.HTTP_404_NOT_FOUND)

        if action == 'accept':
            friendship.status = 'ACC'
            friendship.save()
            friendship.sender.increment_friends()
            friendship.receiver.increment_friends()
            message = "Friend request accepted."
        else:
            friendship.delete()
            message = "Friend request declined."
        return Response({"message": message}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def post_match_history(request):
    try:
        try:
            mainUser = Player.objects.get(username=request.data.get("mainUser").strip())
        except Player.DoesNotExist:
            if request.user.is_authenticated:
                mainUser = request.user
            # if mainUser:
            #     print(f"Using fallback player: {mainUser.username}")

        players = request.data.get("players", [])
        players = [p.strip() for p in players if p.strip()]

        # if mainUser.username in players:
        #     print("Exiiiiiiiiiiiiiiiiiiiiist HERE")

        if mainUser.username not in players:
            return Response([], status=status.HTTP_200_OK)
        
        super_user = request.data.get("super_user", "").strip()
        game_mode = request.data.get("game_mode", "").strip()
        winner = request.data.get("winner", "").strip()
        loser = request.data.get("loser", "").strip()


        if super_user == "semifinal" and winner == mainUser.username:
            return Response({"message": "Match does not meet save conditions."}, status=status.HTTP_200_OK)


        match = MatchHistory.objects.create(
            mainUser=mainUser,
            winner=request.data.get("winner").strip()[:20],
            loser=request.data.get("loser").strip()[:20],
            score=request.data.get("score").strip()[:20],
            game_mode=request.data.get("game_mode").strip()[:20],
            super_user=request.data.get("super_user").strip()[:20],
        )

        superUser = request.data.get("super_user").strip()
        winner = request.data.get("winner",'').strip()
        loser = request.data.get("loser",'').strip()

        if mainUser.username in players:
            if winner.strip() == mainUser.username:
                mainUser.wins += 1
            elif loser.strip() == mainUser.username:
                mainUser.losses += 1
            mainUser.save()

        w = mainUser.wins
        l = mainUser.losses

        level = calculate_level(w, l)
        mainUser.level = calculate_level(w, l)
        mainUser.rank = get_rank(level)
        mainUser.save()

        match_history = MatchHistory.objects.filter(mainUser=mainUser).order_by("-id")

        serializer = MatchHistorySerializer(match_history, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        print("Unexpected Error:", str(e))
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_user_data(request):
    player = request.user
    avatar_url = player.avatar if player.avatar else None
    user_data = {
        "username": player.username,
        "avatar": avatar_url
    }
    return Response(user_data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_match_data(request):
    player = request.user
    match_history = MatchHistory.objects.filter(mainUser=player).order_by('-id')

    match_data = [{
        "super_user": match.super_user,
        "wins": player.wins,
        "losses": player.losses,
        "game_mode": match.game_mode,
        "winner": match.winner, 
        "loser": match.loser,
        "score": match.score,
        "level": player.level,
        "rank": player.rank,
    } for match in match_history]

    return Response(match_data, status=status.HTTP_200_OK)



@api_view(['GET'])
def get_top_players(request):    
    top_players = Player.objects.exclude(username="AI Bot").order_by('-level')[:3]

    top_players_data = [{
        "username": player.username,
        "level": player.level,
        "rank": player.rank,
        "wins": player.wins,
        "losses": player.losses,
        "image": player.avatar
    } for player in top_players]

    return Response(top_players_data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_public_profile(request, username):
    try:
        target_user = Player.objects.get(username=username)
        current_user = request.user

        if not request.user.is_authenticated:
            OFFLINE_THRESHOLD = timedelta(minutes=5)
            
            if target_user.last_activity and timezone.now() - target_user.last_activity < OFFLINE_THRESHOLD:
                target_user.status = 'ONL'
            else:
                target_user.status = 'OFF'
            target_user.save()

            response_data = {
                "profile": PublicProfileSerializer(target_user).data,
                "match_history": [],
                "friendship_status": None
            }
            return Response(response_data, status=status.HTTP_200_OK)

        is_blocked = Friendship.objects.filter(
            (Q(sender=current_user, receiver=target_user) | 
             Q(sender=target_user, receiver=current_user)),
            status='BLK'
        ).exists()

        if is_blocked:
            return Response(
                {"message": "This profile is not accessible"},
                status=status.HTTP_403_FORBIDDEN
            )

        OFFLINE_THRESHOLD = timedelta(minutes=5)
        
        if target_user.last_activity and timezone.now() - target_user.last_activity < OFFLINE_THRESHOLD:
            target_user.status = 'ONL'
        else:
            target_user.status = 'OFF'
        target_user.save()

        match_history = MatchHistory.objects.filter(
            mainUser=target_user
        ).order_by('-id')[:10]

        profile_data = PublicProfileSerializer(target_user).data
        match_data = MatchHistorySerializer(match_history, many=True).data

        friendship_status = None
        friendship = Friendship.objects.filter(
            (Q(sender=current_user, receiver=target_user) | 
             Q(sender=target_user, receiver=current_user))
        ).first()

        if friendship:
            if friendship.status == 'PEN':
                if friendship.sender == current_user:
                    friendship_status = 'PEN'
                else:
                    friendship_status = 'PEN_RECEIVED'
            else:
                friendship_status = friendship.status

        response_data = {
            "profile": profile_data,
            "match_history": match_data,
            "friendship_status": friendship_status
        }

        return Response(response_data, status=status.HTTP_200_OK)

    except Player.DoesNotExist:
        return Response(
            {"message": "Player not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print(f"Error in get_public_profile: {str(e)}")
        return Response(
            {"message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

