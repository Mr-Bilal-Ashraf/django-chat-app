from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractUser
from django.core.mail import send_mail
from django.db import models


class User(AbstractUser):
    username = models.CharField(
        _("Unique Username"), max_length=255, unique=True, db_index=True
    )
    email = models.EmailField(_("email address"), unique=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    friends = models.ManyToManyField("self", blank=True)
    time_zone = models.CharField(max_length=40, default="UTC")

    first_name = None
    last_name = None

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []

    def email_user(self, subject, message, from_email=None, **kwargs):
        if kwargs.get("email"):
            self.email = kwargs.pop("email")
        send_mail(subject, message, from_email, [self.email], **kwargs)
