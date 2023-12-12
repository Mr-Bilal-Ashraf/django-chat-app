from rest_framework import serializers

from chat.models import Conversation, Message
from user.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    msg_time = serializers.SerializerMethodField()
    unseen_count = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ("id", "sender", "text", "send_at", "msg_time", "unseen_count")

    def get_msg_time(self, obj):
        return obj.send_at.strftime("%I:%M %p")

    def get_unseen_count(self, obj):
        return obj.conversation.message_set.filter(seen=False).count()


class ConvoSerializer(serializers.ModelSerializer):
    last_msg = serializers.SerializerMethodField()
    initiator = UserSerializer()
    participant = UserSerializer()

    class Meta:
        model = Conversation
        fields = ("id", "initiator", "participant", "last_msg")

    def get_last_msg(self, obj):
        return MessageSerializer(obj.message_set.last()).data
