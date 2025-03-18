from django.db import models

class ChatMessage(models.Model):
    text = models.TextField()
    sender = models.ForeignKey('User', on_delete=models.CASCADE)
    chat_room = models.ForeignKey('ChatRoom', related_name='chat_messages', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "chatMessage"

class ChatRoom(models.Model):
    event = models.ForeignKey('Event', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_private = models.BooleanField(default=False)
    is_direct = models.BooleanField(default=False)
    participants = models.ManyToManyField('User', blank=True)
    messages = models.ManyToManyField(ChatMessage, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "chatRoom"

