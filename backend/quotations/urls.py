from django.urls import path

from .views import (
    AcceptQuotationView,
    QuotationDetailView,
    QuotationListCreateView,
    RejectQuotationView,
    RFQQuotationListView,
)


urlpatterns = [
    path(
        "",
        QuotationListCreateView.as_view(),
        name="quotation-list-create",
    ),
    path(
        "<int:pk>/",
        QuotationDetailView.as_view(),
        name="quotation-detail",
    ),
    path(
        "<int:pk>/accept/",
        AcceptQuotationView.as_view(),
        name="quotation-accept",
    ),
    path(
        "<int:pk>/reject/",
        RejectQuotationView.as_view(),
        name="quotation-reject",
    ),
    path(
        "rfq/<int:rfq_id>/",
        RFQQuotationListView.as_view(),
        name="rfq-quotation-list",
    ),
]