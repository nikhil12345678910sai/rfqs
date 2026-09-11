from django.utils import timezone


def filter_rfqs(queryset, params):
    """
    Apply simple search and filtering to an RFQ queryset.
    """

    search = params.get("search")
    delivery_location = params.get("delivery_location")
    status = params.get("status")

    if search:
        queryset = queryset.filter(
            product_service_name__icontains=search
        ) | queryset.filter(
            requirement_description__icontains=search
        )

    if delivery_location:
        queryset = queryset.filter(
            delivery_location__icontains=delivery_location
        )

    if status:
        queryset = queryset.filter(status=status.upper())

    return queryset.distinct()


def get_open_rfqs(queryset):
    """
    Return RFQs that are currently open and whose deadline
    has not passed.
    """

    return queryset.filter(
        status="OPEN",
        deadline__gt=timezone.now(),
    )