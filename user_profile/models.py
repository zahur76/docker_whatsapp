from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from django.contrib.auth.models import User


# Create your models here.
class UserProfile(models.Model):
    """
    A user profile model for additonal info on User
    """

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    profile_pic = models.ImageField(null=True, blank=True) 

    def __str__(self):
        return self.user.username


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """
    Create and update the user profile everytime user is created
    with user info. Also provide notification to complete profile info
    """
    if created:
        user = UserProfile.objects.create(user=instance)
