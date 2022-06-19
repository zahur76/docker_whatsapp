# chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.dispatch import receiver
from .models import UserMessage
from django.utils import timezone
from strgen import StringGenerator as SG

users = []

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        users.append('new user')
        print('connect')
        print(users)
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group

        users.pop()
        print(users)
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        type = text_data_json['type']
        message = text_data_json['message']
        receiver = text_data_json['receiver']
        sender = text_data_json['sender']
        message_id = text_data_json['message_id']
        modal_number = text_data_json['modal_number']

        # Send message to room group
        if type == 'send_message':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'receiver': receiver,
                    'sender': sender,
                    'message_id': int(message_id)+1,
                    'modal_number': modal_number,
                }
            )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        sender= event['sender']
        receiver = event['receiver']
        message_id = event['message_id']
        modal_number = event['modal_number']      

        # Send message to WebSocket
        print(event)
        await self.send(text_data=json.dumps({
            'type': 'send  message',
            'message': message,
            'sender': sender,
            'receiver': receiver,
            'created_at': timezone.now().strftime('%B %d,%Y,%H:%M%p'),
            'users': len(users),
            'random_one': SG("[\\u\\d]{12}").render(),
            'random_two': SG("[\\u\\d]{12}").render(),
            'message_id': message_id,
            'modal_number': modal_number
        }))