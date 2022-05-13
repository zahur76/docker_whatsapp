from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.
# Create your models here.
class UserMessage(models.Model):
    """
    A model to store Messages between two Users
    """

    class Meta:
        verbose_name_plural = "User Messages"
        ordering = ("created_at",)

    created_at = models.DateTimeField(default=timezone.now)
    relation = models.CharField(max_length=50, null=True)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="message", null=True)
    user_two = models.ForeignKey(
        User, on_delete=models.CASCADE, default=None)
    sender = models.CharField(max_length=50, null=True)
    message = models.CharField(max_length=1024, null=True)  
    message_read = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username