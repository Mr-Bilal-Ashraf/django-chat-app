from django.views.generic import TemplateView


class SignUpView(TemplateView):
    template_name = 'user/authentication.html'

    def get_context_data(self, **kwargs):
        return super().get_context_data(**kwargs)

    def dispatch(self, request, *args, **kwargs):
        if self.request.user.is_authenticated:
            return redirect(reverse("chat:index"))
        return super().dispatch(request, *args, **kwargs)
