from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from enum import Enum
from .validators import validate_no_spaces

class PlayerManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not username:
            raise ValueError("The Username field must be set.")
        if " " in username:
            raise ValueError("Username cannot contain spaces.")
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        if password:
            try:
                validate_password(password)
            except ValidationError as e:
                raise ValueError(f"Password validation error: {', '.join(e.messages)}")
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if not extra_fields.get('is_staff'):
            raise ValueError("Superuser must have is_staff=True.")
        if not extra_fields.get('is_superuser'):
            raise ValueError("Superuser must have is_superuser=True.")

        username = extra_fields.pop('username', None)
        first_name = extra_fields.get('first_name')
        last_name = extra_fields.get('last_name')
        if not username:
            raise ValueError("Superuser must have a username")
        if not first_name:
            raise ValueError("Superuser must have a first name.")
        if not last_name:
            raise ValueError("Superuser must have a last name.")
        return self.create_user(email=email, username=username, password=password, **extra_fields)


class Player(AbstractBaseUser, PermissionsMixin):
    class Status(Enum):
        ONLINE = 'ONL'
        OFFLINE = 'OFF'
        INGAME = 'ING'
    STATUS = [
        (Status.ONLINE.value, 'ONLINE'),
        (Status.OFFLINE.value, 'OFFLINE'),
        (Status.INGAME.value, 'INGAME'),
    ]

    id=models.AutoField(primary_key=True)
    email= models.EmailField(max_length=60, blank=False, null=False, unique=True)
    username=models.CharField(max_length=20, blank=False, null=False, unique=True, validators=[validate_no_spaces])
    first_name = models.CharField(max_length=20, blank=True, null=True)
    last_name = models.CharField(max_length=20, blank=True, null=True)
    alias = models.CharField(max_length=20, blank=True, null=True, unique=True)
    avatar = models.URLField(
        max_length=255,
        blank=True, null=False,
        default='https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png'
    )
    auth_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    friends = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    level = models.FloatField(default=0.0)
    rank = models.CharField(max_length=20, default="default")
    status = models.CharField(max_length=3, choices=STATUS, default=Status.OFFLINE.value)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    channel_name = models.TextField(null=True, blank=True)

    def increment_wins(self):
        self.wins += 1
        self.save(update_fields=['wins'])

    def increment_losses(self):
        self.losses += 1
        self.save(update_fields=['losses'])

    def increment_friends(self):
        self.friends += 1
        self.save(update_fields=['friends'])

    def decrement_friends(self):
        if self.friends > 0:
            self.friends -= 1
            self.save(update_fields=['friends'])


    objects = PlayerManager()

    USERNAME_FIELD = 'username'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return f'Player: [ username: {self.username} ]'


class Conversation(models.Model):
    user1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="conversation_user1")
    user2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="converstaion_user2")
    last_message = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ('user1', 'user2')
        
    def __str__(self):
        return f"Conversation between {self.user1_id} and {self.user2_id}"
    
    # Async method for when you need the full string representation with usernames
    async def get_full_str(self):
        user1_username = await self.user1.username
        user2_username = await self.user2.username
        return f"Conversation between {user1_username} and {user2_username} with last message = {self.last_message}"


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=255)
    receiver = models.CharField(max_length=255)
    message = models.TextField()
    
    def __str__(self):
        return f"Message {self.message} from {self.sender} to {self.receiver}"
