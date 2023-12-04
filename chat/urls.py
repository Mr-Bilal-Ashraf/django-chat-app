from django.urls import path

from chat.views import IndexView, ConvoListAPI, MyUserAPI

app_name = "chat"


urlpatterns = [
    path("", IndexView.as_view(), name="index"),
    path("friends/", FriendListAPI.as_view(), name="friends"),
    path("conversations/", ConvoListAPI.as_view(), name="conversations"),
]
