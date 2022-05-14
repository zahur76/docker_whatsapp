from django.contrib import admin
from .models import UserMessage

# Register your models here.
class UserMessageAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "message",
        "user_two",
        "sender",
        "message_read",
    )    

admin.site.register(UserMessage, UserMessageAdmin)
