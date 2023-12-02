from django.urls import path

from user.views import SignUpView, SignUpAPI, SignInAPI, SignOutView

app_name = "user"

urlpatterns = [
    path("auth", SignUpView.as_view(), name="login"),
    path("signout/", SignOutView.as_view(), name="signout"),
    path("api/signup/", SignUpAPI.as_view(), name="signup"),
    path("api/signin/", SignInAPI.as_view(), name="signin"),
]
