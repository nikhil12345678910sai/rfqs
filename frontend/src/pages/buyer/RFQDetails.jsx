import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import EmptyState from "../../components/EmptyState";
import ErrorMessage from "../../components/ErrorMessage";
import Loading from "../../components/Loading";
import QuotationCard from "../../components/QuotationCard";

import { deleteRFQ, getRFQ } from "../../services/rfqService";
import {
  acceptQuotation,
  getRFQQuotations,
  rejectQuotation,
} from "../../services/quotationService";


function BuyerRFQDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rfq, setRfq] = useState(null);
  const [quotations, setQuotations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [quotationLoading, setQuotationLoading] = useState(false);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [rfqData, quotationData] = await Promise.all([
        getRFQ(id),
        getRFQQuotations(id),
      ]);

      setRfq(rfqData);
      setQuotations(quotationData);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load RFQ details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleDeleteRFQ = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this RFQ?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteRFQ(id);
      navigate("/buyer/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to delete RFQ."
      );
    }
  };

  const handleAccept = async (quotationId) => {
    const confirmed = window.confirm(
      "Are you sure you want to accept this quotation? All other quotations for this RFQ will be rejected and the RFQ will be closed."
    );

    if (!confirmed) {
      return;
    }

    try {
      setQuotationLoading(true);
      setActionError("");

      await acceptQuotation(quotationId);

      await loadData();
    } catch (err) {
      setActionError(
        err.response?.data?.detail ||
          "Failed to accept quotation."
      );
    } finally {
      setQuotationLoading(false);
    }
  };

  const handleReject = async (quotationId) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this quotation?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setQuotationLoading(true);
      setActionError("");

      await rejectQuotation(quotationId);

      await loadData();
    } catch (err) {
      setActionError(
        err.response?.data?.detail ||
          "Failed to reject quotation."
      );
    } finally {
      setQuotationLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container py-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="container py-4">
        <EmptyState
          title="RFQ not found"
          message="The requested RFQ could not be found."
        />
      </div>
    );
  }

  const isOpen = rfq.status === "OPEN";

  return (
    <div className="container py-4">

      {/* Back Button */}
      <div className="mb-3">
        <Link
          to="/buyer/dashboard"
          className="btn btn-outline-secondary"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* RFQ Header */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">

            <div>
              <h2 className="mb-1">
                {rfq.product_service_name}
              </h2>

              <p className="text-muted mb-0">
                RFQ #{rfq.id}
              </p>
            </div>

            <span
              className={`badge ${
                rfq.status === "OPEN"
                  ? "bg-success"
                  : rfq.status === "CLOSED"
                  ? "bg-secondary"
                  : "bg-danger"
              } fs-6`}
            >
              {rfq.status}
            </span>

          </div>

          <hr />

          {/* RFQ Details */}
          <div className="row g-3">

            <div className="col-md-6">
              <div className="border rounded p-3 h-100">
                <small className="text-muted d-block">
                  Requirement
                </small>

                <p className="mb-0">
                  {rfq.requirement_description}
                </p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="border rounded p-3 h-100">
                <small className="text-muted d-block">
                  Delivery Location
                </small>

                <p className="mb-0">
                  {rfq.delivery_location}
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="border rounded p-3">
                <small className="text-muted d-block">
                  Quantity
                </small>

                <strong>
                  {rfq.quantity}
                </strong>
              </div>
            </div>

            <div className="col-md-4">
              <div className="border rounded p-3">
                <small className="text-muted d-block">
                  Deadline
                </small>

                <strong>
                  {new Date(
                    rfq.deadline
                  ).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            <div className="col-md-4">
              <div className="border rounded p-3">
                <small className="text-muted d-block">
                  Quotations Received
                </small>

                <strong>
                  {quotations.length}
                </strong>
              </div>
            </div>

          </div>

          {/* RFQ Actions */}
          {isOpen && (
            <div className="d-flex gap-2 mt-4">

              <Link
                to={`/buyer/rfqs/${rfq.id}/edit`}
                className="btn btn-primary"
              >
                Edit RFQ
              </Link>

              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={handleDeleteRFQ}
              >
                Delete RFQ
              </button>

            </div>
          )}

        </div>
      </div>

      {/* Action Error */}
      {actionError && (
        <div className="alert alert-danger">
          {actionError}
        </div>
      )}

      {/* Quotations */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-1">
            Quotations Received
          </h3>

          <p className="text-muted mb-0">
            Review supplier quotations and make your decision.
          </p>
        </div>

        <span className="badge bg-primary fs-6">
          {quotations.length}
        </span>
      </div>

      {quotations.length === 0 ? (
        <EmptyState
          title="No quotations yet"
          message="Suppliers have not submitted any quotations for this RFQ yet."
        />
      ) : (
        <div className="row g-4">
          {quotations.map((quotation) => (
            <div
              className="col-12 col-lg-6"
              key={quotation.id}
            >
              <QuotationCard
                quotation={quotation}
                showActions={isOpen}
                onAccept={handleAccept}
                onReject={handleReject}
                actionLoading={quotationLoading}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BuyerRFQDetails;