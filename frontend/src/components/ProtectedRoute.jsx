import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import Loading from "./Loading";

function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading message="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    if (user.role === "BUYER") {
      return (
        <Navigate
          to="/buyer/dashboard"
          replace
        />
      );
    }

    if (user.role === "SUPPLIER") {
      return (
        <Navigate
          to="/supplier/dashboard"
          replace
        />
      );
    }

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;