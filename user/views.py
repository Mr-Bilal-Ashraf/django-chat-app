from django.views.generic import TemplateView
from rest_framework.response import Response
from rest_framework.views import APIView


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
