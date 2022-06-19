from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from django.shortcuts import render, get_object_or_404

from django.contrib.auth.models import User
from user_profile.models import ChatRoom
from django.template.defaulttags import register


# filters
@register.simple_tag
def get_chat_room(*args, **kwargs):
    """ custom template to get chat room name """

    user_one = get_object_or_404(User, username=kwargs['user_one'])
    user_two = get_object_or_404(User, username=kwargs['user_two'])   

    print(user_one)
    print(user_two)

    chat_room = get_object_or_404(ChatRoom, user_one=user_one, user_two=user_two)

    return chat_room


# Create your views here
def index(request):
    """A view to return the home page"""

    users = User.objects.all()

    context = {
        "users": users,
    }

    return render(request, "home/index.html", context)


@receiver(user_logged_in)
def on_user_logged_out(sender, request, user, **kwargs):
    """A view for flash messages in sign in and logout"""
    pass
