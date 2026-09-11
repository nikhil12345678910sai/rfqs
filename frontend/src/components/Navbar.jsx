import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm sticky-top">
      <div className="container py-2">
        <Link
          to="/"
          className="navbar-brand fw-bold text-primary d-flex align-items-center"
        >
          <span className="fs-4 me-2">📋</span>
          RFQ Marketplace
        </Link>

        {user && (
          <>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#mainNavbar"
              aria-controls="mainNavbar"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div
              className="collapse navbar-collapse"
              id="mainNavbar"
            >
              <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
                {user.role === "BUYER" && (
                  <>
                    <li className="nav-item">
                      <Link
                        to="/buyer/dashboard"
                        className="nav-link px-3"
                      >
                        Dashboard
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        to="/buyer/rfqs/create"
                        className="btn btn-primary px-3"
                      >
                        + Create RFQ
                      </Link>
                    </li>
                  </>
                )}

                {user.role === "SUPPLIER" && (
                  <>
                    <li className="nav-item">
                      <Link
                        to="/supplier/dashboard"
                        className="nav-link px-3"
                      >
                        Browse RFQs
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        to="/supplier/quotations"
                        className="nav-link px-3"
                      >
                        My Quotations
                      </Link>
                    </li>
                  </>
                )}

                <li className="nav-item dropdown ms-lg-2">
                  <button
                    className="btn btn-light border dropdown-toggle d-flex align-items-center gap-2"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <span
                      className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center"
                      style={{
                        width: "34px",
                        height: "34px",
                        fontSize: "14px",
                      }}
                    >
                      {user.username
                        ?.charAt(0)
                        .toUpperCase()}
                    </span>

                    <span className="fw-semibold">
                      {user.username}
                    </span>
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                    <li>
                      <span className="dropdown-item-text">
                        <small className="text-muted d-block">
                          Signed in as
                        </small>

                        <strong>{user.username}</strong>
                      </span>
                    </li>

                    <li>
                      <hr className="dropdown-divider" />
                    </li>

                    <li>
                      <span className="dropdown-item-text">
                        <small className="text-muted">
                          Account type
                        </small>

                        <span className="badge bg-primary ms-2">
                          {user.role}
                        </span>
                      </span>
                    </li>

                    <li>
                      <hr className="dropdown-divider" />
                    </li>

                    <li>
                      <button
                        type="button"
                        className="dropdown-item text-danger"
                        onClick={handleLogout}
                      >
                        ↪ <span className="ms-2">Logout</span>
                      </button>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;