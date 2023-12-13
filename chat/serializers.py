from rest_framework import serializers

from chat.models import Conversation, Message
from user.serializers import UserSerializer
from chat.utils import convert_to_timezone


class MessageSerializer(serializers.ModelSerializer):
    unseen_count = serializers.SerializerMethodField()
    msg_timestamp = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ("id", "sender", "text", "seen", "msg_timestamp", "unseen_count")

    def get_msg_timestamp(self, obj):
        user = obj.sender
        if self.context.get("user"):
            user = self.context.get("user")
        elif self.context.get("receiver"):
            user = self.context.get("receiver")

        return str(convert_to_timezone(obj.send_at, user.time_zone))

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
