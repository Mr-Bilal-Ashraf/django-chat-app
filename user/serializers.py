from rest_framework.fields import empty
from rest_framework import serializers

from django.contrib.auth.password_validation import validate_password as is_password_valid
from django.contrib.auth import get_user_model, authenticate

User = get_user_model()


class SignUpSerializer(serializers.ModelSerializer):
    re_password = serializers.CharField()

    class Meta:
        model = User
        fields = ("username", "email", "password", "re_password", "avatar")

    def validated_password(self, value):
        is_password_valid(value)
        return value

    def validate_re_password(self, value):
        if self.initial_data['password'] != value:
            raise serializers.ValidationError("Password fields don't match.")
        return value

    def create(self, validated_data):
        validated_data.pop("re_password")
        password = validated_data.pop("password")
        user = super().create(validated_data)
        user.set_password(password)
        user.save()
        return user

