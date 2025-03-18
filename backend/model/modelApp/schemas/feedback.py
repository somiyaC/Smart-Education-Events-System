from django.db import models

class Feedback(models.Model):
    event = models.ForeignKey('Event', on_delete=models.CASCADE)
    session = models.ForeignKey('Session', null=True, blank=True, on_delete=models.SET_NULL)
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField()
    comments = models.TextField(blank=True)
    content_quality = models.PositiveSmallIntegerField(null=True, blank=True)
    speaker_quality = models.PositiveSmallIntegerField(null=True, blank=True)
    venue_quality = models.PositiveSmallIntegerField(null=True, blank=True)
    organization_quality = models.PositiveSmallIntegerField(null=True, blank=True)
    would_recommend = models.BooleanField(default=False)
    improvement_suggestions = models.TextField(blank=True)
    is_anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "feedback"
