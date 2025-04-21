from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import Player


class PlayerSignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Player
        fields = ['username', 'email', 'password', 'confirm_password']

    def validate_username(self, value):
        if Player.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        if Player.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        try:
            validate_password(data['password'])
        except serializers.ValidationError as e:
            raise serializers.ValidationError({"password": e.messages})
        return data


    def create(self, validated_data):
        validated_data.pop('confirm_password')
        return Player.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )

