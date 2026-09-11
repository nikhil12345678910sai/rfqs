from django.utils import timezone
from rest_framework import serializers

from .models import RFQ


class RFQSerializer(serializers.ModelSerializer):
    buyer_username = serializers.CharField(
        source="buyer.username",
        read_only=True,
    )

    effective_status = serializers.SerializerMethodField()

    class Meta:
        model = RFQ
        fields = [
            "id",
            "buyer",
            "buyer_username",
            "product_service_name",
            "requirement_description",
            "quantity",
            "delivery_location",
            "deadline",
            "status",
            "effective_status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "buyer",
            "buyer_username",
            "status",
            "effective_status",
            "created_at",
            "updated_at",
        ]

    def get_effective_status(self, obj):
        """
        Return EXPIRED when the deadline has passed,
        even if the stored status is still OPEN.
        """

        if obj.status == RFQ.Status.OPEN and obj.is_expired:
            return RFQ.Status.EXPIRED

        return obj.status

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Quantity must be greater than zero."
            )

        return value

    def validate_product_service_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Product or service name cannot be empty."
            )

        return value

    def validate_requirement_description(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Requirement description cannot be empty."
            )

        return value

    def validate_delivery_location(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Delivery location cannot be empty."
            )

        return value

    def validate_deadline(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError(
                "Deadline must be in the future."
            )

        return value

    def validate(self, attrs):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        if request.user.role != "BUYER":
            raise serializers.ValidationError(
                "Only buyers can create or modify RFQs."
            )

        return attrs

    def create(self, validated_data):
        request = self.context["request"]

        validated_data["buyer"] = request.user

        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Do not allow changing ownership.
        validated_data.pop("buyer", None)

        return super().update(
            instance,
            validated_data,
        )