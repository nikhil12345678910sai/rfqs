from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


class AccountTests(APITestCase):

    def test_user_registration(self):
        url = reverse("register")

        data = {
            "username": "buyer1",
            "email": "buyer@example.com",
            "password": "TestPassword123!",
            "role": User.Role.BUYER,
        }

        response = self.client.post(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        user = User.objects.get(username="buyer1")

        self.assertEqual(user.role, User.Role.BUYER)
        self.assertTrue(
            user.check_password("TestPassword123!")
        )

    def test_duplicate_email_registration(self):
        User.objects.create_user(
            username="existing",
            email="buyer@example.com",
            password="TestPassword123!",
            role=User.Role.BUYER,
        )

        url = reverse("register")

        data = {
            "username": "buyer2",
            "email": "buyer@example.com",
            "password": "TestPassword123!",
            "role": User.Role.BUYER,
        }

        response = self.client.post(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_invalid_role_registration(self):
        url = reverse("register")

        data = {
            "username": "user1",
            "email": "user@example.com",
            "password": "TestPassword123!",
            "role": "ADMIN",
        }

        response = self.client.post(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_login(self):
        User.objects.create_user(
            username="buyer1",
            email="buyer@example.com",
            password="TestPassword123!",
            role=User.Role.BUYER,
        )

        url = reverse("login")

        data = {
            "username": "buyer1",
            "password": "TestPassword123!",
        }

        response = self.client.post(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_me_requires_authentication(self):
        url = reverse("me")

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )