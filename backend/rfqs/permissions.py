from rest_framework.permissions import BasePermission


class IsBuyer(BasePermission):
    message = "Only buyers can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "BUYER"
        )


class IsSupplier(BasePermission):
    message = "Only suppliers can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "SUPPLIER"
        )


class CanAccessRFQ(BasePermission):
    """
    Buyers can access their own RFQs.
    Suppliers can access open, non-expired RFQs.
    """

    message = "You do not have permission to access this RFQ."

    def has_object_permission(self, request, view, obj):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # Buyer can access only their own RFQs.
        if user.role == "BUYER":
            return obj.buyer_id == user.id

        # Supplier can access only open and non-expired RFQs.
        if user.role == "SUPPLIER":
            return (
                obj.status == obj.Status.OPEN
                and not obj.is_expired
            )

        return False