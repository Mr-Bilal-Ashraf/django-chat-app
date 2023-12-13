from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Conversation(models.Model):
    initiator = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="initiator"
    )
    participant = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="participant"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.initiator} - {self.participant} on {self.created_at}"


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sender")
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    text = models.TextField(blank=True)
    send_at = models.DateTimeField(auto_now_add=True)
    seen = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender} - {self.text} ({self.send_at})"

    class Meta:
        ordering = ["send_at"]
