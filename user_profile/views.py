from django.shortcuts import render, get_object_or_404, redirect, reverse  
from .models import UserProfile

from django.contrib import messages

# Create your views here.
def upload_image(request):

    if request.method == 'POST':

        image = request.FILES['profile']

        print(image)

        try:
            profile = get_object_or_404(UserProfile, user=request.user)
            profile.profile_pic = image
            profile.save()
            messages.success(request, "Profile Image Added!")
            return redirect(reverse("home"))
        except Exception as e:
            messages.error(request, f"{e}")
            return redirect(reverse("home"))