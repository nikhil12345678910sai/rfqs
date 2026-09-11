from django.urls import path

from .views import (
    RFQDetailView,
    RFQListCreateView,
)


urlpatterns = [
    path(
        "",
        RFQListCreateView.as_view(),
        name="rfq-list-create",
    ),
    path(
        "<int:pk>/",
        RFQDetailView.as_view(),
        name="rfq-detail",
    ),
]