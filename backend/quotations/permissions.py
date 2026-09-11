from rest_framework.permissions import BasePermission


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


class CanAccessQuotation(BasePermission):
    """
    Supplier:
        - Can access only their own quotations.

    Buyer:
        - Can access quotations received for their own RFQs.

    Modification/deletion restrictions are handled in the view.
    """

    message = "You do not have permission to access this quotation."

    def has_object_permission(self, request, view, obj):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # Supplier can access only their own quotation.
        if user.role == "SUPPLIER":
            return obj.supplier_id == user.id

        # Buyer can access quotations for their own RFQs.
        if user.role == "BUYER":
            return obj.rfq.buyer_id == user.id

        return False