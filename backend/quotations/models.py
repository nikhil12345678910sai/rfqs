from django.conf import settings
from django.db import models

from rfqs.models import RFQ


class Quotation(models.Model):

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"

    rfq = models.ForeignKey(
        RFQ,
        on_delete=models.CASCADE,
        related_name="quotations",
    )

    supplier = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="quotations",
        limit_choices_to={"role": "SUPPLIER"},
    )

    quoted_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    estimated_delivery_time = models.PositiveIntegerField(
        help_text="Estimated delivery time in days.",
    )

    message = models.TextField(
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

        constraints = [
            models.UniqueConstraint(
                fields=["rfq", "supplier"],
                name="unique_quotation_per_supplier_rfq",
            ),
        ]

    def __str__(self):
        return (
            f"Quotation #{self.id} - "
            f"{self.supplier.username} - "
            f"{self.rfq.product_service_name}"
        )