import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import ErrorMessage from "../../components/ErrorMessage";

import { createRFQ } from "../../services/rfqService";

function CreateRFQ() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    product_service_name: "",
    requirement_description: "",
    quantity: "",
    delivery_location: "",
    deadline: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (
      !formData.product_service_name.trim() ||
      !formData.requirement_description.trim() ||
      !formData.quantity ||
      !formData.delivery_location.trim() ||
      !formData.deadline
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (Number(formData.quantity) <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    try {
      setLoading(true);

      const deadlineDate = new Date(formData.deadline);

      if (deadlineDate <= new Date()) {
        setError("Deadline must be in the future.");
        setLoading(false);
        return;
      }

      await createRFQ({
        product_service_name:
          formData.product_service_name.trim(),

        requirement_description:
          formData.requirement_description.trim(),

        quantity: Number(formData.quantity),

        delivery_location:
          formData.delivery_location.trim(),

        deadline: deadlineDate.toISOString(),
      });

      navigate("/buyer/dashboard", { replace: true });
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
            : "Unable to create RFQ."
        );
      } else {
        setError("Unable to create RFQ. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="bg-light min-vh-100 py-4 py-md-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 col-xl-7">
              {/* Header */}
              <div className="mb-4">
                <Link
                  to="/buyer/dashboard"
                  className="text-decoration-none text-muted small"
                >
                  ← Back to Dashboard
                </Link>

                <h1 className="h2 fw-bold mt-3 mb-2">
                  Create RFQ
                </h1>

                <p className="text-muted mb-0">
                  Tell suppliers what product or service you need.
                </p>
              </div>

              <ErrorMessage message={error} />

              <div className="card border-0 shadow-sm">
                <div className="card-body p-4 p-md-5">
                  <form onSubmit={handleSubmit}>
                    {/* Product / Service */}
                    <div className="mb-4">
                      <label
                        htmlFor="product_service_name"
                        className="form-label fw-semibold"
                      >
                        Product / Service Name
                      </label>

                      <input
                        type="text"
                        id="product_service_name"
                        name="product_service_name"
                        className="form-control form-control-lg"
                        placeholder="e.g. Office Chairs"
                        value={formData.product_service_name}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <label
                        htmlFor="requirement_description"
                        className="form-label fw-semibold"
                      >
                        Requirement Description
                      </label>

                      <textarea
                        id="requirement_description"
                        name="requirement_description"
                        className="form-control"
                        rows="5"
                        placeholder="Describe your requirements, specifications, quality expectations, etc."
                        value={formData.requirement_description}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>

                    <div className="row g-4">
                      {/* Quantity */}
                      <div className="col-12 col-md-6">
                        <label
                          htmlFor="quantity"
                          className="form-label fw-semibold"
                        >
                          Quantity
                        </label>

                        <input
                          type="number"
                          id="quantity"
                          name="quantity"
                          className="form-control"
                          min="1"
                          placeholder="e.g. 100"
                          value={formData.quantity}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>

                      {/* Deadline */}
                      <div className="col-12 col-md-6">
                        <label
                          htmlFor="deadline"
                          className="form-label fw-semibold"
                        >
                          RFQ Deadline
                        </label>

                        <input
                          type="datetime-local"
                          id="deadline"
                          name="deadline"
                          className="form-control"
                          value={formData.deadline}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>

                      {/* Location */}
                      <div className="col-12">
                        <label
                          htmlFor="delivery_location"
                          className="form-label fw-semibold"
                        >
                          Delivery Location
                        </label>

                        <input
                          type="text"
                          id="delivery_location"
                          name="delivery_location"
                          className="form-control"
                          placeholder="e.g. Hyderabad, Telangana"
                          value={formData.delivery_location}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 mt-5">
                      <Link
                        to="/buyer/dashboard"
                        className="btn btn-outline-secondary px-4"
                      >
                        Cancel
                      </Link>

                      <button
                        type="submit"
                        className="btn btn-primary px-4"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Creating...
                          </>
                        ) : (
                          "Create RFQ"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="alert alert-info border-0 shadow-sm mt-4">
                <strong>Tip:</strong> Provide clear specifications and
                requirements so suppliers can submit accurate quotations.
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default CreateRFQ;