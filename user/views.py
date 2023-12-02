from rest_framework.response import Response
from rest_framework.views import APIView

from django.views.generic import TemplateView, View
from django.shortcuts import redirect, reverse
from django.contrib.auth import login, logout

from user.serializers import SignUpSerializer, SignInSerializer


class SignUpView(TemplateView):
    template_name = 'user/authentication.html'

    def get_context_data(self, **kwargs):
        return super().get_context_data(**kwargs)

    def dispatch(self, request, *args, **kwargs):
        if self.request.user.is_authenticated:
            return redirect(reverse("chat:index"))
        return super().dispatch(request, *args, **kwargs)


class SignUpAPI(APIView):
    def post(self, request):
        data = dict(request.data)
        for key in data.keys():
            data[key] = data[key][0]
        serializer = SignUpSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "code": "success"
            })
        else:
            return Response({
                "errors": serializer.errors,
                "code": "error"
            })


class SignInAPI(APIView):
    def post(self, request):
        data = dict(request.data)
        serializer = SignInSerializer(data=data)
        if serializer.is_valid():
            user = serializer.get_user()
            login(request, user)
            return Response({
                "code": "success"
            })
        else:
            return Response({
                "errors": serializer.errors,
                "code": "error"
            })
