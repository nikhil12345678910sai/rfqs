from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from rfqs.models import RFQ

from .models import Quotation


class QuotationTests(APITestCase):

    def setUp(self):
        self.buyer = User.objects.create_user(
            username="buyer1",
            email="buyer@example.com",
            password="StrongPass123!",
            role=User.Role.BUYER,
        )

        self.other_buyer = User.objects.create_user(
            username="buyer2",
            email="buyer2@example.com",
            password="StrongPass123!",
            role=User.Role.BUYER,
        )

        self.supplier = User.objects.create_user(
            username="supplier1",
            email="supplier@example.com",
            password="StrongPass123!",
            role=User.Role.SUPPLIER,
        )

        self.other_supplier = User.objects.create_user(
            username="supplier2",
            email="supplier2@example.com",
            password="StrongPass123!",
            role=User.Role.SUPPLIER,
        )

        self.rfq = RFQ.objects.create(
            buyer=self.buyer,
            product_service_name="Steel Sheets",
            requirement_description="Need high quality steel sheets.",
            quantity=100,
            delivery_location="Hyderabad",
            deadline=timezone.now() + timedelta(days=7),
        )

        self.list_url = reverse(
            "quotation-list-create"
        )

    def authenticate(self, user):
        self.client.force_authenticate(
            user=user
        )

    def quotation_data(self):
        return {
            "rfq": self.rfq.id,
            "quoted_price": "250000.00",
            "estimated_delivery_time": 10,
            "message": "We can deliver within 10 days.",
        }

    def test_supplier_can_submit_quotation(self):
        self.authenticate(self.supplier)

        response = self.client.post(
            self.list_url,
            self.quotation_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            Quotation.objects.count(),
            1,
        )

        quotation = Quotation.objects.first()

        self.assertEqual(
            quotation.supplier,
            self.supplier,
        )

        self.assertEqual(
            quotation.rfq,
            self.rfq,
        )

        self.assertEqual(
            quotation.status,
            Quotation.Status.PENDING,
        )

    def test_buyer_cannot_submit_quotation(self):
        self.authenticate(self.buyer)

        response = self.client.post(
            self.list_url,
            self.quotation_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            Quotation.objects.count(),
            0,
        )

    def test_supplier_cannot_submit_duplicate_quotation(self):
        self.authenticate(self.supplier)

        first_response = self.client.post(
            self.list_url,
            self.quotation_data(),
            format="json",
        )

        self.assertEqual(
            first_response.status_code,
            status.HTTP_201_CREATED,
        )

        second_response = self.client.post(
            self.list_url,
            self.quotation_data(),
            format="json",
        )

        self.assertEqual(
            second_response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            Quotation.objects.count(),
            1,
        )

    def test_supplier_cannot_quote_after_deadline(self):
        self.rfq.deadline = (
            timezone.now() - timedelta(days=1)
        )

        self.rfq.save()

        self.authenticate(self.supplier)

        response = self.client.post(
            self.list_url,
            self.quotation_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            Quotation.objects.count(),
            0,
        )

    def test_supplier_cannot_quote_on_own_rfq(self):
        own_rfq = RFQ.objects.create(
            buyer=self.supplier,
            product_service_name="Supplier Product",
            requirement_description="Own RFQ",
            quantity=10,
            delivery_location="Hyderabad",
            deadline=timezone.now() + timedelta(days=5),
        )

        self.authenticate(self.supplier)

        data = {
            "rfq": own_rfq.id,
            "quoted_price": "10000.00",
            "estimated_delivery_time": 5,
            "message": "Own RFQ quotation.",
        }

        response = self.client.post(
            self.list_url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_supplier_sees_only_own_quotations(self):
        Quotation.objects.create(
            rfq=self.rfq,
            supplier=self.other_supplier,
            quoted_price="200000.00",
            estimated_delivery_time=8,
            message="Other supplier quotation.",
        )

        Quotation.objects.create(
            rfq=self.rfq,
            supplier=self.supplier,
            quoted_price="250000.00",
            estimated_delivery_time=10,
            message="My quotation.",
        )

        self.authenticate(self.supplier)

        response = self.client.get(
            self.list_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["supplier"],
            self.supplier.id,
        )

    def test_buyer_sees_quotations_for_own_rfq(self):
        Quotation.objects.create(
            rfq=self.rfq,
            supplier=self.supplier,
            quoted_price="250000.00",
            estimated_delivery_time=10,
            message="Quotation.",
        )

        self.authenticate(self.buyer)

        response = self.client.get(
            self.list_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["rfq"],
            self.rfq.id,
        )

    def test_supplier_can_update_own_quotation(self):
        self.authenticate(self.supplier)

        create_response = self.client.post(
            self.list_url,
            self.quotation_data(),
            format="json",
        )

        quotation_id = create_response.data["id"]

        detail_url = reverse(
            "quotation-detail",
            kwargs={"pk": quotation_id},
        )

        response = self.client.patch(
            detail_url,
            {
                "quoted_price": "275000.00"
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        quotation = Quotation.objects.get(
            id=quotation_id
        )

        self.assertEqual(
            str(quotation.quoted_price),
            "275000.00",
        )

    def test_supplier_cannot_update_other_supplier_quotation(
        self,
    ):
        quotation = Quotation.objects.create(
            rfq=self.rfq,
            supplier=self.other_supplier,
            quoted_price="200000.00",
            estimated_delivery_time=8,
            message="Other quotation.",
        )

        self.authenticate(self.supplier)

        detail_url = reverse(
            "quotation-detail",
            kwargs={"pk": quotation.id},
        )

        response = self.client.patch(
            detail_url,
            {
                "quoted_price": "999999.00"
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_buyer_can_view_rfq_quotations(self):
        Quotation.objects.create(
            rfq=self.rfq,
            supplier=self.supplier,
            quoted_price="250000.00",
            estimated_delivery_time=10,
            message="Quotation.",
        )

        url = reverse(
            "rfq-quotation-list",
            kwargs={"rfq_id": self.rfq.id},
        )

        self.authenticate(self.buyer)

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

    def test_other_buyer_cannot_view_rfq_quotations(self):
        Quotation.objects.create(
            rfq=self.rfq,
            supplier=self.supplier,
            quoted_price="250000.00",
            estimated_delivery_time=10,
            message="Quotation.",
        )

        url = reverse(
            "rfq-quotation-list",
            kwargs={"rfq_id": self.rfq.id},
        )

        self.authenticate(self.other_buyer)

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            0,
        )

    def test_quoted_price_must_be_positive(self):
        self.authenticate(self.supplier)

        data = self.quotation_data()
        data["quoted_price"] = "0"

        response = self.client.post(
            self.list_url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_delivery_time_must_be_positive(self):
        self.authenticate(self.supplier)

        data = self.quotation_data()
        data["estimated_delivery_time"] = 0

        response = self.client.post(
            self.list_url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # BUYER ACCEPT / REJECT TESTS
    # ---------------------------------------------------------

    def test_buyer_can_accept_quotation(self):
        quotation = Quotation.objects.create(
            rfq=self.rfq,
            supplier=self.supplier,
            quoted_price="250000.00",
            estimated_delivery_time=10,
            message="Quotation.",
        )

        url = reverse(
            "quotation-accept",
            kwargs={"pk": quotation.id},
        )

        self.authenticate(self.buyer)

        response = self.client.post(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        quotation.refresh_from_db()
        self.rfq.refresh_from_db()

        self.assertEqual(
            quotation.status,
            Quotation.Status.ACCEPTED,
        )

        self.assertEqual(
            self.rfq.status,
            RFQ.Status.CLOSED,
        )

    def test_accepting_one_quotation_rejects_other_quotations(self):
        quotation_one = Quotation.objects.create(
            rfq=self.rfq,
            supplier=self.supplier,
            quoted_price="250000.00",
            estimated_delivery_time=10,
            message="Supplier one.",
        )

        quotation_two = Quotation.objects.create(
            rfq=self.rfq,
            supplier=self.other_supplier,
            quoted_price="275000.00",
            estimated_delivery_time=8,
            message="Supplier two.",
        )

        url = reverse(
            "quotation-accept",
            kwargs={"pk": quotation_one.id},
        )

        self.authenticate(self.buyer)

        response = self.client.post(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        quotation_one.refresh_from_db()
        quotation_two.refresh_from_db()

        self.assertEqual(
            quotation_one.status,
            Quotation.Status.ACCEPTED,
        )

        self.assertEqual(
            quotation_two.status,
            Quotation.Status.REJECTED,
        )

    def test_buyer_can_reject_quotation(self):
        quotation = Quotation.objects.create(
            rfq=self.rfq,
            supplier=self.supplier,
            quoted_price="250000.00",
            estimated_delivery_time=10,
            message="Quotation.",
        )

        url = reverse(
            "quotation-reject",
            kwargs={"pk": quotation.id},
        )

        self.authenticate(self.buyer)

        response = self.client.post(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        quotation.refresh_from_db()

        self.assertEqual(
            quotation.status,
            Quotation.Status.REJECTED,
        )

        self.rfq.refresh_from_db()

        # Rejecting one quotation does not close the RFQ.
        self.assertEqual(
            self.rfq.status,
            RFQ.Status.OPEN,
        )

    def test_other_buyer_cannot_accept_quotation(self):
        quotation = Quotation.objects.create(
            rfq=self.rfq,
            supplier=self.supplier,
            quoted_price="250000.00",
            estimated_delivery_time=10,
            message="Quotation.",
        )

        url = reverse(
            "quotation-accept",
            kwargs={"pk": quotation.id},
        )

        self.authenticate(self.other_buyer)

        response = self.client.post(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        quotation.refresh_from_db()

        self.assertEqual(
            quotation.status,
            Quotation.Status.PENDING,
        )

    def test_other_buyer_cannot_reject_quotation(self):
        quotation = Quotation.objects.create(
            rfq=self.rfq,
            supplier=self.supplier,
            quoted_price="250000.00",
            estimated_delivery_time=10,
            message="Quotation.",
        )

        url = reverse(
            "quotation-reject",
            kwargs={"pk": quotation.id},
        )

        self.authenticate(self.other_buyer)

        response = self.client.post(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        quotation.refresh_from_db()

        self.assertEqual(
            quotation.status,
            Quotation.Status.PENDING,
        )

    def test_supplier_cannot_accept_quotation(self):
        quotation = Quotation.objects.create(
            rfq=self.rfq,
            supplier=self.supplier,
            quoted_price="250000.00",
            estimated_delivery_time=10,
            message="Quotation.",
        )

        url = reverse(
            "quotation-accept",
            kwargs={"pk": quotation.id},
        )

        self.authenticate(self.supplier)

        response = self.client.post(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        quotation.refresh_from_db()

        self.assertEqual(
            quotation.status,
            Quotation.Status.PENDING,
        )

    def test_supplier_cannot_reject_quotation(self):
        quotation = Quotation.objects.create(
            rfq=self.rfq,
            supplier=self.supplier,
            quoted_price="250000.00",
            estimated_delivery_time=10,
            message="Quotation.",
        )

        url = reverse(
            "quotation-reject",
            kwargs={"pk": quotation.id},
        )

        self.authenticate(self.supplier)

        response = self.client.post(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        quotation.refresh_from_db()

        self.assertEqual(
            quotation.status,
            Quotation.Status.PENDING,
        )

    def test_supplier_cannot_edit_accepted_quotation(self):
        quotation = Quotation.objects.create(
            rfq=self.rfq,
            supplier=self.supplier,
            quoted_price="250000.00",
            estimated_delivery_time=10,
            message="Quotation.",
            status=Quotation.Status.ACCEPTED,
        )

        url = reverse(
            "quotation-detail",
            kwargs={"pk": quotation.id},
        )

        self.authenticate(self.supplier)

        response = self.client.patch(
            url,
            {
                "quoted_price": "300000.00"
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_supplier_cannot_edit_rejected_quotation(self):
        quotation = Quotation.objects.create(
            rfq=self.rfq,
            supplier=self.supplier,
            quoted_price="250000.00",
            estimated_delivery_time=10,
            message="Quotation.",
            status=Quotation.Status.REJECTED,
        )

        url = reverse(
            "quotation-detail",
            kwargs={"pk": quotation.id},
        )

        self.authenticate(self.supplier)

        response = self.client.patch(
            url,
            {
                "quoted_price": "300000.00"
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_buyer_cannot_accept_already_rejected_quotation(self):
        quotation = Quotation.objects.create(
            rfq=self.rfq,
            supplier=self.supplier,
            quoted_price="250000.00",
            estimated_delivery_time=10,
            message="Quotation.",
            status=Quotation.Status.REJECTED,
        )

        url = reverse(
            "quotation-accept",
            kwargs={"pk": quotation.id},
        )

        self.authenticate(self.buyer)

        response = self.client.post(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_buyer_cannot_reject_already_accepted_quotation(self):
        quotation = Quotation.objects.create(
            rfq=self.rfq,
            supplier=self.supplier,
            quoted_price="250000.00",
            estimated_delivery_time=10,
            message="Quotation.",
            status=Quotation.Status.ACCEPTED,
        )

        url = reverse(
            "quotation-reject",
            kwargs={"pk": quotation.id},
        )

        self.authenticate(self.buyer)

        response = self.client.post(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_supplier_cannot_change_quotation_status(self):
        quotation = Quotation.objects.create(
            rfq=self.rfq,
            supplier=self.supplier,
            quoted_price="250000.00",
            estimated_delivery_time=10,
            message="Quotation.",
        )

        url = reverse(
            "quotation-detail",
            kwargs={"pk": quotation.id},
        )

        self.authenticate(self.supplier)

        response = self.client.patch(
            url,
            {
                "status": "ACCEPTED"
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        quotation.refresh_from_db()

        # Supplier's attempted status change is ignored.
        self.assertEqual(
            quotation.status,
            Quotation.Status.PENDING,
        )

    def test_buyer_cannot_accept_expired_rfq_quotation(self):
        self.rfq.deadline = (
            timezone.now() - timedelta(days=1)
        )
        self.rfq.save()

        quotation = Quotation.objects.create(
            rfq=self.rfq,
            supplier=self.supplier,
            quoted_price="250000.00",
            estimated_delivery_time=10,
            message="Quotation.",
        )

        url = reverse(
            "quotation-accept",
            kwargs={"pk": quotation.id},
        )

        self.authenticate(self.buyer)

        response = self.client.post(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        quotation.refresh_from_db()
        self.rfq.refresh_from_db()

        self.assertEqual(
            quotation.status,
            Quotation.Status.PENDING,
        )

        self.assertEqual(
            self.rfq.status,
            RFQ.Status.EXPIRED,
        )