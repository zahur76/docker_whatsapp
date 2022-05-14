from django.urls import path

from . import views

from .views import UserMessages

urlpatterns = [
    path("send_message", views.send_message, name="send_message"),
    path("messages_read/<slug:username>", views.messages_read, name="messages_read"),
    path("userMessages/<slug:username>", UserMessages.as_view(), name="UserMessages"),
]