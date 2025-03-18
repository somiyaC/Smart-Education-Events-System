from django.db import models

class Session(models.Model):
    EVENT_TYPES = [
        ('presentation', 'Presentation'),
        ('workshop', 'Workshop'),
        ('panel', 'Panel'),
        ('networking', 'Networking'),
        ('breakout', 'Breakout'),
    ]
    event = models.ForeignKey('Event', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    speaker = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL)
    location = models.CharField(max_length=255, blank=True)
    capacity = models.PositiveIntegerField(default=0)  # 0 means unlimited
    session_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    materials = models.TextField(blank=True)
    track = models.CharField(max_length=255, blank=True)
    attendees = models.ManyToManyField('User', related_name='sessions_attending', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "session"