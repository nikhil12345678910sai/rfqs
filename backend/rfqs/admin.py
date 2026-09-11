from django.contrib import admin

from .models import RFQ


@admin.register(RFQ)
class RFQAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "product_service_name",
        "buyer",
        "quantity",
        "delivery_location",
        "deadline",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "created_at",
        "deadline",
    )

    search_fields = (
        "product_service_name",
        "requirement_description",
        "delivery_location",
        "buyer__username",
        "buyer__email",
    )

    ordering = ("-created_at",)

    readonly_fields = (
        "created_at",
        "updated_at",
    )