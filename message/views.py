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
from django.template.defaulttags import register


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

# Create your views here.
@login_required
def send_message(request):
    """ View to send message from user to user"""

    # two entries made per user: one for receiver and sender

    if request.method == "POST":        

        body = request.POST

        user_receiver = get_object_or_404(User, username=request.POST['username'])

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

            messages.success(request, "Message Sent!")
            return redirect(request.META.get('HTTP_REFERER', 'home'))
        except  Exception as e:
            print(e)
            messages.error(request, "Could not send Message!")
            return redirect(request.META.get('HTTP_REFERER', 'home'))


# Create your views here.
@require_http_methods(["UPDATE"])
@login_required
def messages_read(request, username):
    """ View to mark all messages as read for sender """

    try:
        messages = UserMessage.objects.filter(user=request.user, sender=username)
    except:
        messages = None
    
    if not messages:
        messages.error(
            request,
            "Permission Denied!",
        )
        return redirect(reverse("home"))    
    
    for message in messages:
        message.message_read = True
        message.save()
    
    return JsonResponse({'status': 'ok'})


