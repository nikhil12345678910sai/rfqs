from django.contrib import admin

from .models import Quotation


@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "rfq",
        "supplier",
        "quoted_price",
        "estimated_delivery_time",
        "created_at",
    )

    list_filter = (
        "created_at",
    )

    search_fields = (
        "supplier__username",
        "supplier__email",
        "rfq__product_service_name",
        "rfq__buyer__username",
    )

    ordering = ("-created_at",)

    readonly_fields = (
        "created_at",
        "updated_at",
    )