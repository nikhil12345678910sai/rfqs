import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ErrorMessage from "../../components/ErrorMessage";
import { registerUser } from "../../services/authService";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    role: "BUYER",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

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
      !formData.username.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.password2
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.password2) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        password2: formData.password2,
        role: formData.role,
      });

      setSuccess(
        "Registration successful. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
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
          messages.length > 0
            ? messages.join(" ")
            : "Registration failed. Please check your details."
        );
      } else {
        setError(
          "Unable to register. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="text-center mb-4">
              <div
                className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm mb-3"
                style={{
                  width: "64px",
                  height: "64px",
                  fontSize: "28px",
                }}
              >
                📋
              </div>

              <h1 className="h3 fw-bold mb-2">
                Create your account
              </h1>

              <p className="text-muted mb-0">
                Join the RFQ Marketplace
              </p>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-md-5">
                <h2 className="h5 fw-bold mb-4">
                  Registration
                </h2>

                {error && <ErrorMessage message={error} />}

                {success && (
                  <div
                    className="alert alert-success"
                    role="alert"
                  >
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label
                      htmlFor="username"
                      className="form-label fw-semibold"
                    >
                      Username
                    </label>

                    <input
                      type="text"
                      id="username"
                      name="username"
                      className="form-control"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleChange}
                      autoComplete="username"
                      disabled={loading}
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="email"
                      className="form-label fw-semibold"
                    >
                      Email Address
                    </label>

                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      disabled={loading}
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="password"
                      className="form-label fw-semibold"
                    >
                      Password
                    </label>

                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="form-control"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      disabled={loading}
                    />

                    <div className="form-text">
                      Use at least 8 characters.
                    </div>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="password2"
                      className="form-label fw-semibold"
                    >
                      Confirm Password
                    </label>

                    <input
                      type="password"
                      id="password2"
                      name="password2"
                      className="form-control"
                      placeholder="Re-enter your password"
                      value={formData.password2}
                      onChange={handleChange}
                      autoComplete="new-password"
                      disabled={loading}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Account Type
                    </label>

                    <div className="row g-3">
                      <div className="col-6">
                        <input
                          type="radio"
                          className="btn-check"
                          name="role"
                          id="buyer"
                          value="BUYER"
                          checked={formData.role === "BUYER"}
                          onChange={handleChange}
                          disabled={loading}
                        />

                        <label
                          className="btn btn-outline-primary w-100 py-3"
                          htmlFor="buyer"
                        >
                          <div className="fs-4 mb-1">
                            🛒
                          </div>

                          <div className="fw-semibold">
                            Buyer
                          </div>

                          <small className="d-block text-muted mt-1">
                            Create RFQs
                          </small>
                        </label>
                      </div>

                      <div className="col-6">
                        <input
                          type="radio"
                          className="btn-check"
                          name="role"
                          id="supplier"
                          value="SUPPLIER"
                          checked={
                            formData.role === "SUPPLIER"
                          }
                          onChange={handleChange}
                          disabled={loading}
                        />

                        <label
                          className="btn btn-outline-primary w-100 py-3"
                          htmlFor="supplier"
                        >
                          <div className="fs-4 mb-1">
                            🏭
                          </div>

                          <div className="fw-semibold">
                            Supplier
                          </div>

                          <small className="d-block text-muted mt-1">
                            Submit quotations
                          </small>
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <span className="text-muted">
                    Already have an account?{" "}
                  </span>

                  <Link
                    to="/login"
                    className="fw-semibold text-primary"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>

            <p className="text-center text-muted small mt-4 mb-0">
              By creating an account, you can participate in
              B2B procurement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;