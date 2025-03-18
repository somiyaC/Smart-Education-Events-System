from django.db import models

class PollOption(models.Model):
    text = models.CharField(max_length=255)
    votes = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "pollOption"

class Poll(models.Model):
    event = models.ForeignKey('Event', on_delete=models.CASCADE)
    session = models.ForeignKey('Session', null=True, blank=True, on_delete=models.SET_NULL)
    created_by = models.ForeignKey('User',  on_delete=models.CASCADE, related_name='polls_created' )
    question = models.CharField(max_length=255)
    options = models.ManyToManyField(PollOption)
    is_multiple_choice = models.BooleanField(default=False)
    duration = models.PositiveIntegerField(default=60)  # in seconds
    status = models.CharField(max_length=10, choices=[('active', 'Active'), ('closed', 'Closed')], default='active')
    voters = models.ManyToManyField('User', blank=True, related_name='polls_voted')

    created_at = models.DateTimeField(auto_now_add=True)
    ends_at = models.DateTimeField()

    class Meta:
        db_table = "poll"
