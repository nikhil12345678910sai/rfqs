function QuotationCard({
  quotation,
  showActions = false,
  onEdit,
  onDelete,
  onAccept,
  onReject,
  actionLoading = false,
}) {
  const getStatusBadge = () => {
    switch (quotation.status) {
      case "ACCEPTED":
        return (
          <span className="badge bg-success">
            Accepted
          </span>
        );

      case "REJECTED":
        return (
          <span className="badge bg-danger">
            Rejected
          </span>
        );

      default:
        return (
          <span className="badge bg-warning text-dark">
            Pending
          </span>
        );
    }
  };

  const isPending = quotation.status === "PENDING";

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="card-title mb-1">
              {quotation.supplier_username}
            </h5>

            <small className="text-muted">
              Quotation #{quotation.id}
            </small>
          </div>

          {getStatusBadge()}
        </div>

        {/* Quotation Information */}
        <div className="mb-3">

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">
              Product / Service
            </span>

            <strong>
              {quotation.rfq_product_service_name}
            </strong>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">
              Quoted Price
            </span>

            <strong>
              ₹{Number(quotation.quoted_price).toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="d-flex justify-content-between">
            <span className="text-muted">
              Delivery Time
            </span>

            <strong>
              {quotation.estimated_delivery_time} days
            </strong>
          </div>
        </div>

        {/* Supplier Message */}
        {quotation.message && (
          <div className="bg-light rounded p-3 mb-3">
            <small className="text-muted d-block mb-1">
              Supplier Message
            </small>

            <p className="mb-0">
              {quotation.message}
            </p>
          </div>
        )}

        {/* Buyer Actions */}
        {showActions && isPending && (
          <div className="d-flex gap-2 mt-3">

            {onAccept && (
              <button
                type="button"
                className="btn btn-success flex-fill"
                onClick={() => onAccept(quotation.id)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Processing...
                  </>
                ) : (
                  "Accept"
                )}
              </button>
            )}

            {onReject && (
              <button
                type="button"
                className="btn btn-outline-danger flex-fill"
                onClick={() => onReject(quotation.id)}
                disabled={actionLoading}
              >
                Reject
              </button>
            )}
          </div>
        )}

        {/* Supplier Actions */}
        {showActions && isPending && onEdit && onDelete && (
          <div className="d-flex gap-2 mt-2">

            <button
              type="button"
              className="btn btn-outline-primary flex-fill"
              onClick={() => onEdit(quotation)}
              disabled={actionLoading}
            >
              Edit
            </button>

            <button
              type="button"
              className="btn btn-outline-danger flex-fill"
              onClick={() => onDelete(quotation.id)}
              disabled={actionLoading}
            >
              Delete
            </button>
          </div>
        )}

        {/* Final Status Message */}
        {quotation.status === "ACCEPTED" && (
          <div className="alert alert-success mt-3 mb-0">
            <small>
              This quotation was accepted by the buyer.
            </small>
          </div>
        )}

        {quotation.status === "REJECTED" && (
          <div className="alert alert-secondary mt-3 mb-0">
            <small>
              This quotation was rejected by the buyer.
            </small>
          </div>
        )}

      </div>
    </div>
  );
}

export default QuotationCard;