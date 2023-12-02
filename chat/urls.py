from django.urls import path

from chat.views import IndexView

app_name = "chat"


urlpatterns = [
    path("", IndexView.as_view(), name="index"),
]
