from django.contrib import admin
from .models import UserProfile, ChatRoom

# Register your models here.
class UserProfileAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
    )

class ChatRoomAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user_one",
        "user_two",
    ) 

admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(ChatRoom, ChatRoomAdmin)
