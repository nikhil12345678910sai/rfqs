import { Link } from "react-router-dom";

import { formatDate } from "../utils/formatDate";

function RFQCard({ rfq, detailsPath }) {
  const getStatusClass = () => {
    switch (rfq.status) {
      case "OPEN":
        return "bg-success-subtle text-success";

      case "CLOSED":
        return "bg-secondary-subtle text-secondary";

      case "EXPIRED":
        return "bg-danger-subtle text-danger";

      default:
        return "bg-light text-dark";
    }
  };

  return (
    <div className="card h-100 border-0 shadow-sm">
      <div className="card-body p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <div>
            <span className="text-muted small">
              RFQ #{rfq.id}
            </span>

            <h5 className="card-title fw-bold mb-0 mt-1">
              {rfq.product_service_name}
            </h5>
          </div>

          <span
            className={`badge rounded-pill px-3 py-2 ${getStatusClass()}`}
          >
            {rfq.status}
          </span>
        </div>

        {/* Description */}
        <p className="text-muted mb-4">
          {rfq.requirement_description}
        </p>

        {/* Information */}
        <div className="border-top pt-3">
          <div className="row g-3">
            <div className="col-6">
              <div className="small text-muted">
                Quantity
              </div>

              <div className="fw-semibold">
                {rfq.quantity}
              </div>
            </div>

            <div className="col-6">
              <div className="small text-muted">
                Delivery Location
              </div>

              <div className="fw-semibold text-truncate">
                {rfq.delivery_location}
              </div>
            </div>

            <div className="col-12">
              <div className="small text-muted">
                Deadline
              </div>

              <div className="fw-semibold">
                {formatDate(rfq.deadline)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {detailsPath && (
        <div className="card-footer bg-white border-0 px-4 pb-4">
          <Link
            to={detailsPath}
            className="btn btn-primary w-100"
          >
            View RFQ Details
          </Link>
        </div>
      )}
    </div>
  );
}

export default RFQCard;