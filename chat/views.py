from rest_framework.response import Response
from rest_framework.views import APIView

from django.contrib.auth import get_user_model
from django.views.generic import TemplateView

from user.serializers import UserSerializer

User = get_user_model()


class IndexView(TemplateView):
    template_name = "chat/index.html"


class FriendListAPI(APIView):
    def get(self, request):
        friends = request.user.friends.all()
        serializer = UserSerializer(friends, many=True)
        return Response(serializer.data)
