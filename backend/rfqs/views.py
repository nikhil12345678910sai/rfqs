from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .filters import filter_rfqs, get_open_rfqs
from .models import RFQ
from .permissions import CanAccessRFQ
from .serializers import RFQSerializer


class RFQListCreateView(generics.ListCreateAPIView):
    serializer_class = RFQSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Buyers see only their own RFQs.
        if user.role == "BUYER":
            queryset = RFQ.objects.filter(
                buyer=user
            )

            return filter_rfqs(
                queryset,
                self.request.query_params,
            )

        # Suppliers see only currently open RFQs.
        if user.role == "SUPPLIER":
            queryset = RFQ.objects.select_related(
                "buyer"
            )

            queryset = get_open_rfqs(queryset)

            return filter_rfqs(
                queryset,
                self.request.query_params,
            )

        return RFQ.objects.none()


class RFQDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = RFQSerializer
    permission_classes = [
        IsAuthenticated,
        CanAccessRFQ,
    ]

    def get_queryset(self):
        user = self.request.user

        if user.role == "BUYER":
            return RFQ.objects.filter(
                buyer=user
            )

        if user.role == "SUPPLIER":
            return get_open_rfqs(
                RFQ.objects.select_related("buyer")
            )

        return RFQ.objects.none()