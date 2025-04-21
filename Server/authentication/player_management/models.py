from django.db import models
from api.models import Player
from enum import Enum


class Friendship(models.Model):
    class Status(Enum):
        ACCEPTED = 'ACC'
        PENDING = 'PEN'
        BLOCKED = 'BLK'
    STATUS_REQ = [
        (Status.ACCEPTED.value, 'ACCEPTED'),
        (Status.PENDING.value, 'PENDING'),
        (Status.BLOCKED.value, 'BLOCKED'),
    ]
    id=models.AutoField(primary_key=True)
    sender=models.ForeignKey("api.Player", on_delete=models.CASCADE, related_name="send_request")
    receiver=models.ForeignKey("api.Player", on_delete=models.CASCADE ,related_name="receive_request")
    status = models.CharField(max_length=3, choices=STATUS_REQ, default=Status.PENDING.value)
    
    def __str__(self):
        return f'{self.sender.username} send to {self.receiver.username}.'


class MatchHistory(models.Model):
    mainUser = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="main_user_pm",
    )
    score = models.CharField(max_length=10, default="0") 
    level = models.FloatField(default=0.0)
    rank = models.CharField(max_length=20, default="default")
    game_mode = models.CharField(max_length=20)
    super_user = models.CharField(max_length=20)
    winner = models.CharField(max_length=20)
    loser = models.CharField(max_length=20)
    wins = models.CharField(max_length=20, default="0")
    losses = models.CharField(max_length=20, default="0")

    def __str__(self):
        winner = self.winner if isinstance(self.winner, Player) else None
        loser = self.loser if isinstance(self.loser, Player) else None
        if winner and loser:
            return f"{winner.username} defeated {loser.username} ({self.score})"
        return "Invalid match data"
    # def __str__(self):
    #     return f"{self.winner.username} defeated {self.loser.username} ({self.score})"
