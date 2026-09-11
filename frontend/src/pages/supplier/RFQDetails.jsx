import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";

import { getRFQ } from "../../services/rfqService";
import { createQuotation } from "../../services/quotationService";

import { formatDate } from "../../utils/formatDate";

function RFQDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rfq, setRfq] = useState(null);

  const [formData, setFormData] = useState({
    quoted_price: "",
    estimated_delivery_time: "",
    message: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadRFQ = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getRFQ(id);
        setRfq(data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Unable to load RFQ details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRFQ();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.quoted_price ||
      !formData.estimated_delivery_time
    ) {
      setError(
        "Please enter your quoted price and estimated delivery time."
      );
      return;
    }

    if (Number(formData.quoted_price) <= 0) {
      setError("Quoted price must be greater than zero.");
      return;
    }

    if (Number(formData.estimated_delivery_time) <= 0) {
      setError(
        "Estimated delivery time must be greater than zero."
      );
      return;
    }

    try {
      setSubmitting(true);

      await createQuotation({
        rfq: Number(id),
        quoted_price: formData.quoted_price,
        estimated_delivery_time: Number(
          formData.estimated_delivery_time
        ),
        message: formData.message.trim(),
      });

      setSuccess(
        "Quotation submitted successfully."
      );

      setFormData({
        quoted_price: "",
        estimated_delivery_time: "",
        message: "",
      });

      setTimeout(() => {
        navigate("/supplier/quotations");
      }, 1000);
    } catch (err) {
      const responseData = err.response?.data;

      if (responseData) {
        const messages = [];

        Object.entries(responseData).forEach(
          ([field, value]) => {
            if (Array.isArray(value)) {
              messages.push(
                `${field}: ${value.join(" ")}`
              );
            } else if (typeof value === "string") {
              messages.push(`${field}: ${value}`);
            }
          }
        );

        setError(
          messages.length
            ? messages.join(" ")
            : "Unable to submit quotation."
        );
      } else {
        setError(
          "Unable to submit quotation. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Loading message="Loading RFQ details..." />
      </>
    );
  }

  if (!rfq) {
    return (
      <>
        <Navbar />

        <main className="bg-light min-vh-100 py-5">
          <div className="container">
            <ErrorMessage
              message={error || "RFQ not found."}
            />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="bg-light min-vh-100 py-4 py-md-5">
        <div className="container">
          <div className="mb-4">
            <Link
              to="/supplier/dashboard"
              className="text-decoration-none text-muted small"
            >
              ← Back to RFQs
            </Link>
          </div>

          <ErrorMessage message={error} />

          {success && (
            <div
              className="alert alert-success shadow-sm border-0"
              role="alert"
            >
              ✓ {success}
            </div>
          )}

          <div className="row g-4">
            {/* RFQ Information */}
            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4 p-md-5">
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                    <div>
                      <span className="text-muted small">
                        RFQ #{rfq.id}
                      </span>

                      <h1 className="h2 fw-bold mt-1 mb-2">
                        {rfq.product_service_name}
                      </h1>

                      <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2">
                        {rfq.status}
                      </span>
                    </div>
                  </div>

                  <hr className="my-4" />

                  <div className="mb-4">
                    <h2 className="h6 fw-bold mb-2">
                      Requirement
                    </h2>

                    <p className="text-muted mb-0">
                      {rfq.requirement_description}
                    </p>
                  </div>

                  <div className="row g-4">
                    <div className="col-6">
                      <div className="small text-muted mb-1">
                        Quantity
                      </div>

                      <div className="fw-semibold">
                        {rfq.quantity}
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="small text-muted mb-1">
                        Delivery Location
                      </div>

                      <div className="fw-semibold">
                        {rfq.delivery_location}
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="small text-muted mb-1">
                        Quotation Deadline
                      </div>

                      <div className="fw-semibold text-danger">
                        {formatDate(rfq.deadline)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="alert alert-info border-0 shadow-sm mt-4">
                <strong>Before submitting:</strong> Make sure your
                price and delivery estimate accurately reflect your
                offer.
              </div>
            </div>

            {/* Quotation Form */}
            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4 p-md-5">
                  <div className="mb-4">
                    <h2 className="h5 fw-bold mb-1">
                      Submit Quotation
                    </h2>

                    <p className="text-muted small mb-0">
                      Send your best offer to the buyer.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label
                        htmlFor="quoted_price"
                        className="form-label fw-semibold"
                      >
                        Quoted Price
                      </label>

                      <div className="input-group">
                        <span className="input-group-text">
                          ₹
                        </span>

                        <input
                          type="number"
                          id="quoted_price"
                          name="quoted_price"
                          className="form-control"
                          min="0.01"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.quoted_price}
                          onChange={handleChange}
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="estimated_delivery_time"
                        className="form-label fw-semibold"
                      >
                        Estimated Delivery Time
                      </label>

                      <div className="input-group">
                        <input
                          type="number"
                          id="estimated_delivery_time"
                          name="estimated_delivery_time"
                          className="form-control"
                          min="1"
                          placeholder="e.g. 15"
                          value={
                            formData.estimated_delivery_time
                          }
                          onChange={handleChange}
                          disabled={submitting}
                        />

                        <span className="input-group-text">
                          days
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="message"
                        className="form-label fw-semibold"
                      >
                        Message
                        <span className="text-muted fw-normal">
                          {" "}
                          (Optional)
                        </span>
                      </label>

                      <textarea
                        id="message"
                        name="message"
                        className="form-control"
                        rows="5"
                        placeholder="Add any additional information about your quotation..."
                        value={formData.message}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Submitting...
                        </>
                      ) : (
                        "Submit Quotation"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default RFQDetails;