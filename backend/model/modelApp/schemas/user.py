from django.db import models

class User(models.Model):
    ROLE_CHOICES = [
        ('attendee', 'Attendee'),
        ('stakeholder', 'Stakeholder'),
        ('organizer', 'Organizer'),
        ('admin', 'Admin'),
    ]

    auth0_id = models.CharField(max_length=255, unique=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    picture = models.URLField(blank=True, null=True)

    # Profile fields
    bio = models.TextField(blank=True, null=True)
    company = models.CharField(max_length=255, blank=True, null=True)
    job_title = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    website = models.URLField(blank=True, null=True)

    # Social Media Links
    linkedin = models.URLField(blank=True, null=True)
    twitter = models.URLField(blank=True, null=True)
    facebook = models.URLField(blank=True, null=True)

    # Preferences
    interests = models.JSONField(default=list, blank=True)
    receive_notifications = models.BooleanField(default=True)

    # User role
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='attendee')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    class Meta:
        db_table = "user"
