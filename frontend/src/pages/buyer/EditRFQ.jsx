import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";

import { getRFQ, updateRFQ } from "../../services/rfqService";

function EditRFQ() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    product_service_name: "",
    requirement_description: "",
    quantity: "",
    delivery_location: "",
    deadline: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRFQ = async () => {
      try {
        setLoading(true);

        const data = await getRFQ(id);

        const deadlineDate = new Date(data.deadline);

        const localDeadline = new Date(
          deadlineDate.getTime() -
            deadlineDate.getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 16);

        setFormData({
          product_service_name:
            data.product_service_name || "",

          requirement_description:
            data.requirement_description || "",

          quantity: data.quantity || "",

          delivery_location:
            data.delivery_location || "",

          deadline: localDeadline,
        });
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Unable to load the RFQ."
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

    const deadlineDate = new Date(formData.deadline);

    if (deadlineDate <= new Date()) {
      setError("Deadline must be in the future.");
      return;
    }

    try {
      setSaving(true);

      await updateRFQ(id, {
        product_service_name:
          formData.product_service_name.trim(),

        requirement_description:
          formData.requirement_description.trim(),

        quantity: Number(formData.quantity),

        delivery_location:
          formData.delivery_location.trim(),

        deadline: deadlineDate.toISOString(),
      });

      navigate(`/buyer/rfqs/${id}`, {
        replace: true,
      });
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
            : "Unable to update RFQ."
        );
      } else {
        setError("Unable to update RFQ.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Loading message="Loading RFQ..." />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="bg-light min-vh-100 py-4 py-md-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 col-xl-7">
              <div className="mb-4">
                <Link
                  to={`/buyer/rfqs/${id}`}
                  className="text-decoration-none text-muted small"
                >
                  ← Back to RFQ
                </Link>

                <h1 className="h2 fw-bold mt-3 mb-2">
                  Edit RFQ
                </h1>

                <p className="text-muted mb-0">
                  Update the details of your request for quotation.
                </p>
              </div>

              <ErrorMessage message={error} />

              <div className="card border-0 shadow-sm">
                <div className="card-body p-4 p-md-5">
                  <form onSubmit={handleSubmit}>
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
                        value={formData.product_service_name}
                        onChange={handleChange}
                        disabled={saving}
                      />
                    </div>

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
                        value={formData.requirement_description}
                        onChange={handleChange}
                        disabled={saving}
                      />
                    </div>

                    <div className="row g-4">
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
                          value={formData.quantity}
                          onChange={handleChange}
                          disabled={saving}
                        />
                      </div>

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
                          disabled={saving}
                        />
                      </div>

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
                          value={formData.delivery_location}
                          onChange={handleChange}
                          disabled={saving}
                        />
                      </div>
                    </div>

                    <div className="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 mt-5">
                      <Link
                        to={`/buyer/rfqs/${id}`}
                        className="btn btn-outline-secondary px-4"
                      >
                        Cancel
                      </Link>

                      <button
                        type="submit"
                        className="btn btn-primary px-4"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
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
          </div>
        </div>
      </main>
    </>
  );
}

export default EditRFQ;