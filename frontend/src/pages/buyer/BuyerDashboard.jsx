import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import EmptyState from "../../components/EmptyState";
import RFQCard from "../../components/RFQCard";

import { getRFQs } from "../../services/rfqService";
import { useAuth } from "../../hooks/useAuth";

function BuyerDashboard() {
  const { user } = useAuth();

  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRFQs = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getRFQs();
        setRfqs(data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Unable to load your RFQs."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRFQs();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <Loading message="Loading your RFQs..." />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="bg-light min-vh-100 py-4 py-md-5">
        <div className="container">
          {/* Header */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div>
              <span className="text-primary fw-semibold">
                Buyer Dashboard
              </span>

              <h1 className="h2 fw-bold mt-1 mb-2">
                Welcome, {user?.username}
              </h1>

              <p className="text-muted mb-0">
                Manage your requests for quotations and review supplier responses.
              </p>
            </div>

            <Link
              to="/buyer/rfqs/create"
              className="btn btn-primary px-4"
            >
              + Create RFQ
            </Link>
          </div>

          <ErrorMessage message={error} />

          {/* Summary */}
          {!error && (
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="text-muted small mb-1">
                          Total RFQs
                        </p>
                        <h3 className="fw-bold mb-0">
                          {rfqs.length}
                        </h3>
                      </div>

                      <div
                        className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "48px",
                          height: "48px",
                          fontSize: "22px",
                        }}
                      >
                        📋
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="text-muted small mb-1">
                          Open RFQs
                        </p>
                        <h3 className="fw-bold mb-0">
                          {
                            rfqs.filter(
                              (rfq) => rfq.status === "OPEN"
                            ).length
                          }
                        </h3>
                      </div>

                      <div
                        className="bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "48px",
                          height: "48px",
                          fontSize: "22px",
                        }}
                      >
                        ✓
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="text-muted small mb-1">
                          Closed / Expired
                        </p>
                        <h3 className="fw-bold mb-0">
                          {
                            rfqs.filter(
                              (rfq) => rfq.status !== "OPEN"
                            ).length
                          }
                        </h3>
                      </div>

                      <div
                        className="bg-secondary-subtle text-secondary rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "48px",
                          height: "48px",
                          fontSize: "22px",
                        }}
                      >
                        ✓
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RFQs */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="h4 fw-bold mb-1">
                My RFQs
              </h2>
              <p className="text-muted mb-0">
                Your submitted requests for quotations.
              </p>
            </div>
          </div>

          {rfqs.length === 0 ? (
            <EmptyState
              title="No RFQs yet"
              message="Create your first RFQ to start receiving supplier quotations."
              action={
                <Link
                  to="/buyer/rfqs/create"
                  className="btn btn-primary"
                >
                  Create Your First RFQ
                </Link>
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
                    detailsPath={`/buyer/rfqs/${rfq.id}`}
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

export default BuyerDashboard;