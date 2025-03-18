from django.db import models

class TicketType(models.Model):
    event = models.ForeignKey('Event', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=0)
    available_from = models.DateTimeField()
    available_until = models.DateTimeField()
    discount_code = models.CharField(max_length=50, blank=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    allow_access_to = models.ManyToManyField('Session', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "ticketType"

class Ticket(models.Model):
    ticket_type = models.ForeignKey(TicketType, on_delete=models.CASCADE)
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    event = models.ForeignKey('Event', on_delete=models.CASCADE)
    purchase_date = models.DateTimeField(auto_now_add=True)
    ticket_number = models.CharField(max_length=255, unique=True)
    qr_code = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=[('active', 'Active'), ('used', 'Used'), ('cancelled', 'Cancelled'), ('refunded', 'Refunded')], default='active')
    checked_in = models.BooleanField(default=False)
    check_in_time = models.DateTimeField(null=True, blank=True)
    payment_reference = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = "ticket"
