from rest_framework.fields import empty
from rest_framework import serializers

from django.contrib.auth.password_validation import (
    validate_password as is_password_valid,
)
from django.contrib.auth import get_user_model, authenticate

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "avatar")


class SignUpSerializer(serializers.ModelSerializer):
    re_password = serializers.CharField()

    class Meta:
        model = User
        fields = ("username", "email", "password", "re_password", "avatar")

    def validated_password(self, value):
        is_password_valid(value)
        return value

    def validate_re_password(self, value):
        if self.initial_data["password"] != value:
            raise serializers.ValidationError("Password fields don't match.")
        return value

    def create(self, validated_data):
        validated_data.pop("re_password")
        password = validated_data.pop("password")
        user = super().create(validated_data)
        user.set_password(password)
        user.save()
        return user


class SignInSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def __init__(self, instance=None, data=empty, **kwargs):
        super().__init__(instance, data, **kwargs)
        self.user = None

    def get_user(self):
        return self.user

    def validate(self, attrs):
        user = authenticate(username=attrs["username"], password=attrs["password"])
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        self.user = user
        return super().validate(attrs)
