from rest_framework.permissions import BasePermission


class IsBuyer(BasePermission):
    """
    Allows access only to authenticated buyers.
    """

    message = "Only buyers can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "BUYER"
        )


class IsSupplier(BasePermission):
    """
    Allows access only to authenticated suppliers.
    """

    message = "Only suppliers can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "SUPPLIER"
        )