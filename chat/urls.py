from django.urls import path

from chat.views import IndexView, ConvoListAPI, MyUserAPI

app_name = "chat"


urlpatterns = [
    path("", IndexView.as_view(), name="index"),
    path("my_user/", MyUserAPI.as_view(), name="my_user"),
    path("conversations/", ConvoListAPI.as_view(), name="conversations"),
]
