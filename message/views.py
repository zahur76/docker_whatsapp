import errno
from pydoc import allmethods
import re
from sre_constants import GROUPREF_EXISTS
from urllib import response
from django.dispatch import receiver
from django.shortcuts import render, get_object_or_404, redirect, reverse
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.views.decorators.http import require_http_methods

from passwordgenerator import pwgenerator
from requests import request
from urllib3 import Retry

from .models import UserMessage
from django.contrib.auth.models import User
from .serializers import MessageSerializer
from django.template.defaulttags import register
from rest_framework import generics
import json

from message import serializers

# filters
@register.simple_tag
def unread_messages(user, username):
    """custom template filter to unread messages for signed in user """
    count = 0
    user_ = get_object_or_404(User, username=user)

    messages = UserMessage.objects.filter(user=user_, sender=username)

    for message in messages:
        if not message.message_read:
            count += 1

    return count


class UserMessages(generics.ListAPIView):
    # permission_classes = (IsAuthenticated,)
    serializer_class = MessageSerializer

    def get_queryset(self):
        """
        Return all messages for for the currently authenticated user and contact.
        """
        user = self.request.user
        user_two = get_object_or_404(User, username=self.kwargs['username'])
        return UserMessage.objects.filter(user=user, user_two=user_two)
    

# Create your views here.
@login_required
def send_message(request):
    """ View to send message from user to user"""

    # two entries made per user: one for receiver and sender

    if request.method == "POST":        

        body = json.loads(request.body)

        user_receiver = get_object_or_404(User, username=body['username'])

        relation_ = pwgenerator.generate()
        # store message
        try:
            # create 2 entries for each user
            UserMessage.objects.create(              
                relation = relation_,
                user = request.user,
                user_two = user_receiver,
                sender = request.user.username,              
                message = body['message'],               
            )
            UserMessage.objects.create(              
                relation = relation_,
                user = user_receiver,
                user_two = request.user,
                sender = request.user.username, 
                message = body['message'],                          
            )

            all_messages = UserMessage.objects.filter(user=request.user, user_two=user_receiver)
            serializer = MessageSerializer(all_messages, many=True)
            
            return JsonResponse({'data': serializer.data})
        except  Exception as e:
            return JsonResponse({'status': e})


@require_http_methods(["UPDATE"])
@login_required
def messages_read(request, username):
    """ View to mark all messages as read for sender and receiver """

    try:
        messages = UserMessage.objects.filter(user=request.user, sender=username)
    except:
        messages = None
    
    if not messages:
        return JsonResponse({'status': 'no messages from sender'})  
    
    for message in messages:
        message.message_read = True
        message.save()
    
    # Also mark as read for sender
    user = get_object_or_404(User, username=username)
    try:
        messages_ = UserMessage.objects.filter(user=user, sender=username)
    except:
        messages_ = None
    
    if not messages_:
        return JsonResponse({'status': 'no messages from sender'})  
    
    for message in messages_:
        message.message_read = True
        message.save()
    
    return JsonResponse({'status': 'ok'})


@require_http_methods(["DELETE"])
@login_required
def clear_message(request, message_id, username):
    """ View to clear message from one side only """

    try:
        message = UserMessage.objects.filter(user=request.user, id=message_id)
    except:
        message = None
    
    if not message:
        return JsonResponse(status=404)
    
    message.delete()

    user_two = get_object_or_404(User, id=username)

    print(user_two)

    all_messages = UserMessage.objects.filter(user=request.user, user_two=user_two)
    serializer = MessageSerializer(all_messages, many=True)
            
    return JsonResponse({'data': serializer.data})


@require_http_methods(["DELETE"])
@login_required
def delete_message(request, message_id, username):
    """ View to delete message from one from sender and receiver """

    try:
        message = get_object_or_404(UserMessage, user=request.user, id=message_id)
    except:
        message = None
    
    if not message:
        return JsonResponse(status=404)    
    
    messages = UserMessage.objects.filter(relation=message.relation)
    for message_ in messages:
        message_.message = "Message Deleted"
        message_.save()

    user_two = get_object_or_404(User, id=username)

    all_messages = UserMessage.objects.filter(user=request.user, user_two=user_two)
    serializer = MessageSerializer(all_messages, many=True)
            
    return JsonResponse({'data': serializer.data})
    
   




