from django.urls import path

from chat.views import IndexView

urlpatterns = [
    path('', IndexView.as_view()),
]
