def clean_and_validate(field, value, max_length):
    """Helper function to trim, validate, and return a cleaned value."""
    cleaned_value = ' '.join(value.split())  # Remove extra spaces
    if not cleaned_value or len(cleaned_value) > max_length:
        raise ValueError(f"Invalid {field}. It must be 1-{max_length} characters long.")
    return cleaned_value


from django.db.models import Q
from api.models import Player
from .models import Friendship
import math

def block_user(sender_username, receiver_username):
    if sender_username == receiver_username:
        return {"error": "You cannot block yourself."}

    try:
        sender = Player.objects.get(username=sender_username)
        receiver = Player.objects.get(username=receiver_username)
    except Player.DoesNotExist:
        return {"error": "Player not found."}

    friendship, created = Friendship.objects.get_or_create(
        sender=sender, receiver=receiver
    )

    if friendship.status == "BLK":
        return {"error": f"You have already blocked {receiver_username}."}

    friendship.status = "BLK"
    friendship.save()

    sender.decrement_friends()
    receiver.decrement_friends()

    return {"success": f"{receiver_username} has been blocked."}


def unblock_user(sender_username, receiver_username):
    try:
        sender = Player.objects.get(username=sender_username)
        receiver = Player.objects.get(username=receiver_username)
    except Player.DoesNotExist:
        return {"error": "Player not found."}

    friendship = Friendship.objects.filter(
        Q(sender=sender, receiver=receiver) | Q(sender=receiver, receiver=sender),
        status="BLK"
    ).first()

    if not friendship:
        return {"error": "No blocked relationship found."}

    friendship.delete()
    return {"success": f"You have successfully unblocked {receiver_username}."}

def get_rank(level):
    if level < 2:
        return "Bronze"
    elif level < 4:
        return "Silver"
    elif level < 6:
        return "Gold"
    elif level < 8:
        return "Platinum"
    elif level < 10:
        return "Diamond"

def calculate_level(wins, losses):
    total_games = wins + losses
    if total_games == 0:
        return 0.0

    win_ratio = wins / total_games

    base_level = 10 * (1 - math.exp(-0.05 * wins)) * (win_ratio ** 1.5)

    penalty = min(3.0, losses ** 0.4 / 3)

    level = base_level - penalty

    return round(max(0.0, min(level, 9.9)), 1)

