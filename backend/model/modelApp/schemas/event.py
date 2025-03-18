from django.db import models

class Event(models.Model):
    EVENT_TYPES = [
        ('conference', 'Conference'),
        ('seminar', 'Seminar'),
        ('workshop', 'Workshop'),
        ('webinar', 'Webinar'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField()
    objectives = models.TextField(blank=True, null=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_virtual = models.BooleanField(default=False)
    virtual_meeting_url = models.URLField(blank=True, null=True)
    venue = models.ForeignKey('Venue', on_delete=models.SET_NULL, null=True, blank=True)
    organizer = models.ForeignKey('User', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    # Additional fields
    banner_image = models.URLField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    max_attendees = models.IntegerField(default=0)  # 0 means unlimited

    # SEO & Promotion
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = "event" 

