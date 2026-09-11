import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import ErrorMessage from "../../components/ErrorMessage";
import Loading from "../../components/Loading";
import { useAuth } from "../../hooks/useAuth";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
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

    if (!formData.username.trim() || !formData.password) {
      setError("Please enter your username and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await login({
        username: formData.username.trim(),
        password: formData.password,
      });

      const role = data.user?.role;

      if (role === "BUYER") {
        navigate("/buyer/dashboard", { replace: true });
      } else if (role === "SUPPLIER") {
        navigate("/supplier/dashboard", { replace: true });
      } else {
        setError("Unable to determine your account type.");
      }
    } catch (err) {
      const responseData = err.response?.data;

      if (responseData?.detail) {
        setError(responseData.detail);
      } else if (responseData?.non_field_errors) {
        setError(responseData.non_field_errors[0]);
      } else {
        setError("Invalid username or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Signing you in..." />;
  }

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
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
                RFQ Marketplace
              </h1>

              <p className="text-muted mb-0">
                Sign in to your account
              </p>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-md-5">
                <h2 className="h5 fw-bold mb-4">
                  Welcome back
                </h2>

                <ErrorMessage message={error} />

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
                      className="form-control form-control-lg"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={handleChange}
                      autoComplete="username"
                      disabled={loading}
                    />
                  </div>

                  <div className="mb-4">
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
                      className="form-control form-control-lg"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 fw-semibold"
                    disabled={loading}
                  >
                    Sign In
                  </button>
                </form>

                <div className="text-center mt-4">
                  <span className="text-muted">
                    Don't have an account?{" "}
                  </span>

                  <Link
                    to="/register"
                    className="fw-semibold text-primary"
                  >
                    Create one
                  </Link>
                </div>
              </div>
            </div>

            <p className="text-center text-muted small mt-4 mb-0">
              Secure B2B procurement made simple.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;