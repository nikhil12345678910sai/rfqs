from django.db import IntegrityError
from django.utils import timezone
from rest_framework import serializers

from accounts.models import User
from .models import Quotation


class QuotationSerializer(serializers.ModelSerializer):
    supplier_username = serializers.CharField(
        source="supplier.username",
        read_only=True,
    )

    rfq_product_service_name = serializers.CharField(
        source="rfq.product_service_name",
        read_only=True,
    )

    class Meta:
        model = Quotation

        fields = [
            "id",
            "rfq",
            "rfq_product_service_name",
            "supplier",
            "supplier_username",
            "quoted_price",
            "estimated_delivery_time",
            "message",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "supplier",
            "supplier_username",
            "rfq_product_service_name",
            "status",
            "created_at",
            "updated_at",
        ]

    def validate_quoted_price(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Quoted price must be greater than zero."
            )

        return value

    def validate_estimated_delivery_time(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Estimated delivery time must be greater than zero."
            )

        return value

    def validate_message(self, value):
        return value.strip()

    def validate(self, attrs):
        request = self.context.get("request")

        # Authentication check
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        # Only suppliers can create or update quotations
        if request.user.role != User.Role.SUPPLIER:
            raise serializers.ValidationError(
                "Only suppliers can submit quotations."
            )

        # Get RFQ from request during creation.
        # During PATCH/PUT, use the existing quotation's RFQ.
        rfq = attrs.get("rfq")

        if rfq is None:
            if self.instance is not None:
                rfq = self.instance.rfq
            else:
                raise serializers.ValidationError(
                    {
                        "rfq": "RFQ is required."
                    }
                )

        # Creation checks
        if self.instance is None:

            # Supplier cannot quote on their own RFQ.
            if rfq.buyer_id == request.user.id:
                raise serializers.ValidationError(
                    "You cannot submit a quotation for your own RFQ."
                )

            # RFQ must still be open.
            if rfq.status != rfq.Status.OPEN:
                raise serializers.ValidationError(
                    "This RFQ is no longer open."
                )

            # Deadline must not have passed.
            if timezone.now() >= rfq.deadline:
                raise serializers.ValidationError(
                    "The quotation deadline has passed."
                )

            # Prevent duplicate quotations.
            if Quotation.objects.filter(
                rfq=rfq,
                supplier=request.user,
            ).exists():
                raise serializers.ValidationError(
                    "You have already submitted a quotation for this RFQ."
                )

        # Update checks
        else:

            # Only pending quotations can be edited.
            if self.instance.status != Quotation.Status.PENDING:
                raise serializers.ValidationError(
                    "Only pending quotations can be edited."
                )

        return attrs

    def create(self, validated_data):
        request = self.context["request"]

        # Always use the authenticated supplier.
        validated_data["supplier"] = request.user

        # Always start as pending.
        validated_data["status"] = Quotation.Status.PENDING

        try:
            return super().create(validated_data)

        except IntegrityError:
            # Handles the database-level unique constraint.
            raise serializers.ValidationError(
                "You have already submitted a quotation for this RFQ."
            )

    def update(self, instance, validated_data):
        # Supplier and RFQ cannot be changed after creation.
        validated_data.pop("supplier", None)
        validated_data.pop("rfq", None)

        # Supplier cannot change quotation status.
        validated_data.pop("status", None)

        return super().update(
            instance,
            validated_data,
        )