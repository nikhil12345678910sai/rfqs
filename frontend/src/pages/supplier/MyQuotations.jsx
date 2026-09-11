import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../../components/EmptyState";
import ErrorMessage from "../../components/ErrorMessage";
import Loading from "../../components/Loading";
import QuotationCard from "../../components/QuotationCard";

import {
  deleteQuotation,
  getQuotations,
  updateQuotation,
} from "../../services/quotationService";


function MyQuotations() {
  const [quotations, setQuotations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [editingQuotation, setEditingQuotation] =
    useState(null);

  const [editForm, setEditForm] = useState({
    quoted_price: "",
    estimated_delivery_time: "",
    message: "",
  });

  const loadQuotations = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getQuotations();

      setQuotations(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load quotations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  const handleEdit = (quotation) => {
    if (quotation.status !== "PENDING") {
      return;
    }

    setActionError("");

    setEditingQuotation(quotation);

    setEditForm({
      quoted_price: quotation.quoted_price,
      estimated_delivery_time:
        quotation.estimated_delivery_time,
      message: quotation.message || "",
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!editingQuotation) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      await updateQuotation(
        editingQuotation.id,
        {
          quoted_price: editForm.quoted_price,
          estimated_delivery_time:
            editForm.estimated_delivery_time,
          message: editForm.message,
        }
      );

      setEditingQuotation(null);

      await loadQuotations();
    } catch (err) {
      setActionError(
        err.response?.data?.detail ||
          "Failed to update quotation."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (quotationId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quotation?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      await deleteQuotation(quotationId);

      await loadQuotations();
    } catch (err) {
      setActionError(
        err.response?.data?.detail ||
          "Failed to delete quotation."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusCount = (status) => {
    return quotations.filter(
      (quotation) => quotation.status === status
    ).length;
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

  return (
    <div className="container py-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

        <div>
          <h2 className="mb-1">
            My Quotations
          </h2>

          <p className="text-muted mb-0">
            View and manage quotations you have submitted.
          </p>
        </div>

        <Link
          to="/supplier/dashboard"
          className="btn btn-outline-secondary"
        >
          Browse RFQs
        </Link>

      </div>

      {/* Summary */}
      <div className="row g-3 mb-4">

        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <small className="text-muted">
                Total
              </small>

              <h3 className="mb-0">
                {quotations.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <small className="text-muted">
                Pending
              </small>

              <h3 className="mb-0 text-warning">
                {getStatusCount("PENDING")}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <small className="text-muted">
                Accepted
              </small>

              <h3 className="mb-0 text-success">
                {getStatusCount("ACCEPTED")}
              </h3>
            </div>
          </div>
        </div>

      </div>

      {/* Error */}
      {actionError && (
        <div className="alert alert-danger">
          {actionError}
        </div>
      )}

      {/* Quotations */}
      {quotations.length === 0 ? (
        <EmptyState
          title="No quotations yet"
          message="You have not submitted any quotations yet."
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
                showActions={quotation.status === "PENDING"}
                onEdit={handleEdit}
                onDelete={handleDelete}
                actionLoading={actionLoading}
              />
            </div>
          ))}

        </div>
      )}

      {/* Edit Modal */}
      {editingQuotation && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">
                  Edit Quotation
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setEditingQuotation(null)
                  }
                  disabled={actionLoading}
                />
              </div>

              <form onSubmit={handleUpdate}>

                <div className="modal-body">

                  <div className="mb-3">
                    <label
                      htmlFor="quoted_price"
                      className="form-label"
                    >
                      Quoted Price
                    </label>

                    <input
                      type="number"
                      className="form-control"
                      id="quoted_price"
                      name="quoted_price"
                      value={editForm.quoted_price}
                      onChange={handleEditChange}
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="estimated_delivery_time"
                      className="form-label"
                    >
                      Estimated Delivery Time
                    </label>

                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        id="estimated_delivery_time"
                        name="estimated_delivery_time"
                        value={
                          editForm.estimated_delivery_time
                        }
                        onChange={handleEditChange}
                        min="1"
                        required
                      />

                      <span className="input-group-text">
                        days
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="message"
                      className="form-label"
                    >
                      Message
                    </label>

                    <textarea
                      className="form-control"
                      id="message"
                      name="message"
                      rows="4"
                      value={editForm.message}
                      onChange={handleEditChange}
                    />
                  </div>

                </div>

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setEditingQuotation(null)
                    }
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />

                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>

                </div>

              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MyQuotations;