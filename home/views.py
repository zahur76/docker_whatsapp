from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from django.shortcuts import render


# Create your views here
def index(request):
    """A view to return the home page"""

    context = {}

    return render(request, "home/index.html", context)


@receiver(user_logged_in)
def on_user_logged_out(sender, request, user, **kwargs):
    """A view for flash messages in sign in and logout"""
    pass
