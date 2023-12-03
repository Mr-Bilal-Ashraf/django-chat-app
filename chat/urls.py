from django.urls import path

from chat.views import IndexView, FriendListAPI

app_name = "chat"


urlpatterns = [
    path("", IndexView.as_view(), name="index"),
    path("friends/", FriendListAPI.as_view(), name="friends"),
]
