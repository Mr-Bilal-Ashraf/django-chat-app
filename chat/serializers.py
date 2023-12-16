from rest_framework import serializers

from chat.models import Conversation, Message
from user.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    unseen_count = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ("id", "sender", "text", "seen", "unseen_count", "send_at")

    def get_unseen_count(self, obj):
        if self.context.get("user"):
            return obj.conversation.message_set.filter(seen=False, sender=self.context.get("user")).count()
        elif self.context.get("receiver"):
            return obj.conversation.message_set.filter(seen=False).exclude(sender=self.context.get("receiver")).count()
        return obj.conversation.message_set.filter(seen=False).count()


class ConvoSerializer(serializers.ModelSerializer):
    last_msg = serializers.SerializerMethodField()
    initiator = UserSerializer()
    participant = UserSerializer()

    class Meta:
        model = Conversation
        fields = ("id", "initiator", "participant", "last_msg")

    def get_last_msg(self, obj):
        return MessageSerializer(obj.message_set.last(), context=self.context).data
