from django.db import models

class Venue(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20, blank=True, null=True)

    # Contact information
    contact_name = models.CharField(max_length=255, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)

    # Venue details
    capacity = models.PositiveIntegerField()
    website = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    # Coordinates for map
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)

    # Additional facilities
    has_wifi = models.BooleanField(default=False)
    has_parking = models.BooleanField(default=False)
    has_catering = models.BooleanField(default=False)
    has_av_equipment = models.BooleanField(default=False)

    # Images
    images = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "venue"
