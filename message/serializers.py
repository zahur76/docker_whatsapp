from rest_framework import serializers
from .models import User, UserMessage

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMessage
        fields = '__all__'
