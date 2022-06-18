from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from django.contrib.auth.models import User
from strgen import StringGenerator as SG


# Create your models here.
class UserProfile(models.Model):
    """
    A user profile model for additonal info on User
    """

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    profile_pic = models.ImageField(null=True, blank=True) 

    def __str__(self):
        return self.user.username


# Create your models here.
class ChatRoom(models.Model):
    """
    A model to store unique chat room address bewtween users
    """

    user_one = models.ForeignKey(User, on_delete=models.CASCADE, related_name="profile_one")
    user_two = models.ForeignKey(User, on_delete=models.CASCADE, related_name="profile_two")
    chat_room = models.CharField(max_length=12)

    def __str__(self):
        return self.chat_room


@receiver(post_save, sender=User)
def create_chat_room(sender, instance, created, **kwargs):
    """
    Create chat room name between 2 users on user creation.
    """
    if created:
        users = User.objects.all()
        for user in users:
            if user != instance:
                chat_room_name = SG("[\\u\\d]{11}").render()
                ChatRoom.objects.create(
                    user_one=instance, 
                    user_two=user,
                    chat_room = chat_room_name
                    )
                ChatRoom.objects.create(
                    user_one=user, 
                    user_two=instance,
                    chat_room = chat_room_name
                    )


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """
    Create and update the user profile everytime user is created
    with user info.
    """
    if created:
        user = UserProfile.objects.create(user=instance)
