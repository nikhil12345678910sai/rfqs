from django.conf import settings
from django.db import models
from django.utils import timezone


class RFQ(models.Model):

    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        CLOSED = "CLOSED", "Closed"
        EXPIRED = "EXPIRED", "Expired"

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="rfqs",
        limit_choices_to={"role": "BUYER"},
    )

    product_service_name = models.CharField(
        max_length=255,
    )

    requirement_description = models.TextField()

    quantity = models.PositiveIntegerField()

    delivery_location = models.CharField(
        max_length=255,
    )

    deadline = models.DateTimeField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.product_service_name} - {self.buyer.username}"

    @property
    def is_expired(self):
        return timezone.now() >= self.deadline