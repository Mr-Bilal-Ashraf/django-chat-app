from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import get_user_model
from django.views.generic import TemplateView
from django.db.models import Q, Max

from user.serializers import UserSerializer
from chat.models import Conversation
from chat.serializers import ConvoSerializer, MessageSerializer

User = get_user_model()


class IndexView(LoginRequiredMixin, TemplateView):
    login_url = "/user/auth"
    template_name = "chat/index.html"


class MyUserAPI(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        return Response({"code": "success", "user": UserSerializer(request.user).data})


class ParticipantAPI(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, pk=None):
        user = User.objects.filter(id=pk)
        if user:
            return Response(
                {"code": "success", "user": UserSerializer(user.first()).data}
            )
        return Response(
            {
                "code": "error",
                "detail": "User not found, user may be hidden OR deleted.",
            }
        )


class ConvoListAPI(APIView):
    permission_classes = (IsAuthenticated,)
    pagination_class = PageNumberPagination

    def get(self, request):
        conversations = Conversation.objects.filter(
            Q(initiator=request.user) | Q(participant=request.user)
        ).annotate(latest_message_send_at=Max("message__send_at"))
        ordered_conversations = conversations.order_by("-latest_message_send_at")
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(ordered_conversations, request)
        serializer = ConvoSerializer(
            paginated_queryset, many=True, context={"receiver": request.user}
        )
        return paginator.get_paginated_response(serializer.data)


class ConvoDetailAPI(APIView):
    permission_classes = (IsAuthenticated,)
    pagination_class = PageNumberPagination

    def get(self, request, pk=None):
        conversation = Conversation.objects.filter(id=pk)
        if conversation:
            messages = conversation.first().message_set.order_by("-id")
            paginator = self.pagination_class()
            paginated_queryset = paginator.paginate_queryset(messages, request)
            serializer = MessageSerializer(paginated_queryset, many=True)
            return paginator.get_paginated_response(serializer.data)
        else:
            return Response({"code": "error", "detail": "No conversation found."})
