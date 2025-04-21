from api.models import Player
from .models import MatchHistory
from rest_framework import serializers

class PlayerInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = [
            "username", 
            "avatar", 
            "alias", 
            "status", 
            "friends", 
            "wins", 
            "losses",
            "level",
            "rank"
        ]


class SettingsInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ["username", "email", "first_name", "last_name", "avatar", "alias"]


class UsernameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['username', 'avatar']


class MatchHistorySerializer(serializers.ModelSerializer):

    class Meta:
        model = MatchHistory
        fields = ['winner', 'loser', 'score', 'game_mode']


class PublicProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = [
            "username", 
            "avatar", 
            "status",
            "wins",
            "losses",
            "level",
            "rank"
        ]