from django.db import transaction
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Quotation
from .permissions import CanAccessQuotation
from .serializers import QuotationSerializer


class QuotationListCreateView(generics.ListCreateAPIView):
    """
    GET:
        Supplier -> their own quotations
        Buyer    -> quotations received for their RFQs

    POST:
        Supplier -> create quotation
        Buyer    -> not allowed
    """

    serializer_class = QuotationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Supplier sees only their own quotations.
        if user.role == "SUPPLIER":
            return Quotation.objects.filter(
                supplier=user
            ).select_related(
                "rfq",
                "supplier",
            )

        # Buyer sees quotations for their own RFQs.
        if user.role == "BUYER":
            return Quotation.objects.filter(
                rfq__buyer=user
            ).select_related(
                "rfq",
                "supplier",
            )

        return Quotation.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role != "SUPPLIER":
            raise PermissionDenied(
                "Only suppliers can submit quotations."
            )

        serializer.save()


class QuotationDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    GET:
        Supplier -> own quotation
        Buyer    -> quotation for their own RFQ

    PUT/PATCH:
        Supplier -> own pending quotation only
        Buyer    -> not allowed

    DELETE:
        Supplier -> own pending quotation only
        Buyer    -> not allowed
    """

    serializer_class = QuotationSerializer

    permission_classes = [
        IsAuthenticated,
        CanAccessQuotation,
    ]

    def get_queryset(self):
        user = self.request.user

        # Supplier can access their own quotations.
        if user.role == "SUPPLIER":
            return Quotation.objects.filter(
                supplier=user
            ).select_related(
                "rfq",
                "supplier",
            )

        # Buyer can access quotations for their own RFQs.
        if user.role == "BUYER":
            return Quotation.objects.filter(
                rfq__buyer=user
            ).select_related(
                "rfq",
                "supplier",
            )

        return Quotation.objects.none()

    def update(self, request, *args, **kwargs):
        if request.user.role != "SUPPLIER":
            raise PermissionDenied(
                "Only suppliers can modify quotations."
            )

        quotation = self.get_object()

        if quotation.status != Quotation.Status.PENDING:
            raise ValidationError(
                "Only pending quotations can be edited."
            )

        return super().update(
            request,
            *args,
            **kwargs,
        )

    def destroy(self, request, *args, **kwargs):
        if request.user.role != "SUPPLIER":
            raise PermissionDenied(
                "Only suppliers can delete quotations."
            )

        quotation = self.get_object()

        if quotation.status != Quotation.Status.PENDING:
            raise ValidationError(
                "Only pending quotations can be deleted."
            )

        return super().destroy(
            request,
            *args,
            **kwargs,
        )


class RFQQuotationListView(
    generics.ListAPIView
):
    """
    Allows a buyer to view all quotations
    received for their own RFQ.
    """

    serializer_class = QuotationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        rfq_id = self.kwargs["rfq_id"]

        # Only buyers can view all quotations for an RFQ.
        if user.role != "BUYER":
            return Quotation.objects.none()

        return Quotation.objects.filter(
            rfq_id=rfq_id,
            rfq__buyer=user,
        ).select_related(
            "rfq",
            "supplier",
        )


class AcceptQuotationView(APIView):
    """
    Allows the buyer who owns the RFQ to accept a quotation.

    When a quotation is accepted:
        - Selected quotation -> ACCEPTED
        - All other quotations -> REJECTED
        - RFQ -> CLOSED
    """

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        if request.user.role != "BUYER":
            raise PermissionDenied(
                "Only buyers can accept quotations."
            )

        try:
            quotation = Quotation.objects.select_related(
                "rfq",
                "supplier",
            ).get(pk=pk)
        except Quotation.DoesNotExist:
            return Response(
                {"detail": "Quotation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Buyer can only act on quotations for their own RFQs.
        if quotation.rfq.buyer_id != request.user.id:
            raise PermissionDenied(
                "You do not have permission to accept this quotation."
            )

        rfq = quotation.rfq

        # RFQ must still be open.
        if rfq.status != rfq.Status.OPEN:
            raise ValidationError(
                "This RFQ is no longer open."
            )

        # Deadline must not have passed.
        if timezone.now() >= rfq.deadline:
            rfq.status = rfq.Status.EXPIRED
            rfq.save(update_fields=["status", "updated_at"])

            raise ValidationError(
                "The RFQ deadline has passed."
            )

        # Only pending quotations can be accepted.
        if quotation.status != Quotation.Status.PENDING:
            raise ValidationError(
                "Only pending quotations can be accepted."
            )

        # Accept selected quotation.
        quotation.status = Quotation.Status.ACCEPTED
        quotation.save(
            update_fields=["status", "updated_at"]
        )

        # Reject all other quotations for this RFQ.
        Quotation.objects.filter(
            rfq=rfq
        ).exclude(
            id=quotation.id
        ).update(
            status=Quotation.Status.REJECTED
        )

        # Close the RFQ.
        rfq.status = rfq.Status.CLOSED
        rfq.save(
            update_fields=["status", "updated_at"]
        )

        return Response(
            QuotationSerializer(
                quotation,
                context={"request": request},
            ).data,
            status=status.HTTP_200_OK,
        )


class RejectQuotationView(APIView):
    """
    Allows the buyer who owns the RFQ to reject a quotation.
    """

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        if request.user.role != "BUYER":
            raise PermissionDenied(
                "Only buyers can reject quotations."
            )

        try:
            quotation = Quotation.objects.select_related(
                "rfq",
                "supplier",
            ).get(pk=pk)
        except Quotation.DoesNotExist:
            return Response(
                {"detail": "Quotation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Buyer can only act on quotations for their own RFQs.
        if quotation.rfq.buyer_id != request.user.id:
            raise PermissionDenied(
                "You do not have permission to reject this quotation."
            )

        rfq = quotation.rfq

        # RFQ must still be open.
        if rfq.status != rfq.Status.OPEN:
            raise ValidationError(
                "This RFQ is no longer open."
            )

        # Deadline must not have passed.
        if timezone.now() >= rfq.deadline:
            rfq.status = rfq.Status.EXPIRED
            rfq.save(update_fields=["status", "updated_at"])

            raise ValidationError(
                "The RFQ deadline has passed."
            )

        # Only pending quotations can be rejected.
        if quotation.status != Quotation.Status.PENDING:
            raise ValidationError(
                "Only pending quotations can be rejected."
            )

        # Reject the quotation.
        quotation.status = Quotation.Status.REJECTED
        quotation.save(
            update_fields=["status", "updated_at"]
        )

        return Response(
            QuotationSerializer(
                quotation,
                context={"request": request},
            ).data,
            status=status.HTTP_200_OK,
        )