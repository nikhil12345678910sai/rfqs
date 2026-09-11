import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import EmptyState from "../../components/EmptyState";
import RFQCard from "../../components/RFQCard";

import { getRFQs } from "../../services/rfqService";
import { useAuth } from "../../hooks/useAuth";

function SupplierDashboard() {
  const { user } = useAuth();

  const [rfqs, setRfqs] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRFQs = async (params = {}) => {
    try {
      setLoading(true);
      setError("");

      const data = await getRFQs({
        status: "OPEN",
        ...params,
      });

      setRfqs(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load available RFQs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRFQs();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    loadRFQs({
      search: search.trim(),
      delivery_location: location.trim(),
    });
  };

  const handleClear = () => {
    setSearch("");
    setLocation("");
    loadRFQs();
  };

  return (
    <>
      <Navbar />

      <main className="bg-light min-vh-100 py-4 py-md-5">
        <div className="container">
          {/* Header */}
          <div className="mb-4">
            <span className="text-primary fw-semibold">
              Supplier Dashboard
            </span>

            <h1 className="h2 fw-bold mt-1 mb-2">
              Find RFQs to Bid On
            </h1>

            <p className="text-muted mb-0">
              Welcome, {user?.username}. Browse open requests and submit competitive quotations.
            </p>
          </div>

          {/* Search */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div
                  className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "44px",
                    height: "44px",
                  }}
                >
                  🔎
                </div>

                <div>
                  <h2 className="h6 fw-bold mb-1">
                    Search RFQs
                  </h2>

                  <p className="text-muted small mb-0">
                    Find opportunities based on product or delivery location.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSearch}>
                <div className="row g-3">
                  <div className="col-12 col-md-5">
                    <label
                      htmlFor="search"
                      className="form-label small fw-semibold"
                    >
                      Product / Service
                    </label>

                    <input
                      type="text"
                      id="search"
                      className="form-control"
                      placeholder="e.g. Office Chairs"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                    />
                  </div>

                  <div className="col-12 col-md-5">
                    <label
                      htmlFor="location"
                      className="form-label small fw-semibold"
                    >
                      Delivery Location
                    </label>

                    <input
                      type="text"
                      id="location"
                      className="form-control"
                      placeholder="e.g. Hyderabad"
                      value={location}
                      onChange={(event) =>
                        setLocation(event.target.value)
                      }
                    />
                  </div>

                  <div className="col-12 col-md-2 d-flex align-items-end">
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={loading}
                    >
                      Search
                    </button>
                  </div>
                </div>

                {(search || location) && (
                  <button
                    type="button"
                    className="btn btn-link text-muted px-0 mt-3"
                    onClick={handleClear}
                  >
                    Clear filters
                  </button>
                )}
              </form>
            </div>
          </div>

          <ErrorMessage message={error} />

          {/* Results Header */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
            <div>
              <h2 className="h4 fw-bold mb-1">
                Open RFQs
              </h2>

              <p className="text-muted mb-0">
                {rfqs.length} opportunity
                {rfqs.length !== 1 ? "ies" : ""} available
              </p>
            </div>

            <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2">
              ● Open for Quotations
            </span>
          </div>

          {/* RFQs */}
          {loading ? (
            <Loading message="Finding available RFQs..." />
          ) : rfqs.length === 0 ? (
            <EmptyState
              title="No matching RFQs"
              message="There are currently no open RFQs matching your search criteria."
              action={
                (search || location) && (
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={handleClear}
                  >
                    Clear Search
                  </button>
                )
              }
            />
          ) : (
            <div className="row g-4">
              {rfqs.map((rfq) => (
                <div
                  className="col-12 col-md-6 col-xl-4"
                  key={rfq.id}
                >
                  <RFQCard
                    rfq={rfq}
                    detailsPath={`/supplier/rfqs/${rfq.id}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default SupplierDashboard;