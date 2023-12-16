from django.urls import path

from chat.views import (
    IndexView,
    ConvoListAPI,
    ConvoDetailAPI,
    MyUserAPI,
    ParticipantAPI,
)

app_name = "chat"


urlpatterns = [
    path("", IndexView.as_view(), name="index"),
    path("my_user/", MyUserAPI.as_view(), name="my_user"),
    path("participant/<int:pk>/", ParticipantAPI.as_view(), name="participant"),
    path("conversations/", ConvoListAPI.as_view(), name="conversations"),
    path(
        "conversations/detail/<int:pk>/",
        ConvoDetailAPI.as_view(),
        name="conversations_detail",
    ),
]
