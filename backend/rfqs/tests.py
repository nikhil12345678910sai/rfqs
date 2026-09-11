from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from .models import RFQ


class RFQTests(APITestCase):

    def setUp(self):
        self.buyer = User.objects.create_user(
            username="buyer1",
            email="buyer@example.com",
            password="StrongPass123!",
            role=User.Role.BUYER,
        )

        self.supplier = User.objects.create_user(
            username="supplier1",
            email="supplier@example.com",
            password="StrongPass123!",
            role=User.Role.SUPPLIER,
        )

        self.other_buyer = User.objects.create_user(
            username="buyer2",
            email="buyer2@example.com",
            password="StrongPass123!",
            role=User.Role.BUYER,
        )

        self.rfq = RFQ.objects.create(
            buyer=self.buyer,
            product_service_name="Steel Sheets",
            requirement_description="Need high quality steel sheets.",
            quantity=100,
            delivery_location="Hyderabad",
            deadline=timezone.now() + timedelta(days=7),
        )

        self.list_url = reverse("rfq-list-create")

        self.detail_url = reverse(
            "rfq-detail",
            kwargs={"pk": self.rfq.id},
        )

    def authenticate(self, user):
        self.client.force_authenticate(
            user=user
        )

    def test_buyer_can_create_rfq(self):
        self.authenticate(self.buyer)

        data = {
            "product_service_name": "Office Chairs",
            "requirement_description": (
                "Need ergonomic office chairs."
            ),
            "quantity": 50,
            "delivery_location": "Hyderabad",
            "deadline": (
                timezone.now() + timedelta(days=5)
            ).isoformat(),
        }

        response = self.client.post(
            self.list_url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            RFQ.objects.count(),
            2,
        )

    def test_supplier_cannot_create_rfq(self):
        self.authenticate(self.supplier)

        data = {
            "product_service_name": "Test Product",
            "requirement_description": "Test requirement",
            "quantity": 10,
            "delivery_location": "Hyderabad",
            "deadline": (
                timezone.now() + timedelta(days=5)
            ).isoformat(),
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

    def test_buyer_sees_only_own_rfqs(self):
        RFQ.objects.create(
            buyer=self.other_buyer,
            product_service_name="Other Product",
            requirement_description="Other requirement",
            quantity=20,
            delivery_location="Delhi",
            deadline=timezone.now() + timedelta(days=7),
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
            response.data[0]["id"],
            self.rfq.id,
        )

    def test_supplier_can_browse_open_rfqs(self):
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
            response.data[0]["product_service_name"],
            "Steel Sheets",
        )

    def test_supplier_cannot_see_expired_rfq(self):
        self.rfq.deadline = (
            timezone.now() - timedelta(days=1)
        )

        self.rfq.save()

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
            0,
        )

    def test_buyer_can_update_own_rfq(self):
        self.authenticate(self.buyer)

        data = {
            "product_service_name": "Updated Steel Sheets"
        }

        response = self.client.patch(
            self.detail_url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.rfq.refresh_from_db()

        self.assertEqual(
            self.rfq.product_service_name,
            "Updated Steel Sheets",
        )

    def test_other_buyer_cannot_update_rfq(self):
        self.authenticate(self.other_buyer)

        data = {
            "product_service_name": "Unauthorized Update"
        }

        response = self.client.patch(
            self.detail_url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_buyer_can_delete_own_rfq(self):
        self.authenticate(self.buyer)

        response = self.client.delete(
            self.detail_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            RFQ.objects.filter(
                id=self.rfq.id
            ).exists()
        )

    def test_quantity_must_be_positive(self):
        self.authenticate(self.buyer)

        data = {
            "product_service_name": "Test Product",
            "requirement_description": "Test requirement",
            "quantity": 0,
            "delivery_location": "Hyderabad",
            "deadline": (
                timezone.now() + timedelta(days=5)
            ).isoformat(),
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

    def test_deadline_must_be_future(self):
        self.authenticate(self.buyer)

        data = {
            "product_service_name": "Test Product",
            "requirement_description": "Test requirement",
            "quantity": 10,
            "delivery_location": "Hyderabad",
            "deadline": (
                timezone.now() - timedelta(days=1)
            ).isoformat(),
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