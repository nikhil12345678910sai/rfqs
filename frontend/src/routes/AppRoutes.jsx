import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import BuyerDashboard from "../pages/buyer/BuyerDashboard";
import CreateRFQ from "../pages/buyer/CreateRFQ";
import EditRFQ from "../pages/buyer/EditRFQ";
import BuyerRFQDetails from "../pages/buyer/RFQDetails";

import SupplierDashboard from "../pages/supplier/SupplierDashboard";
import SupplierRFQDetails from "../pages/supplier/RFQDetails";
import MyQuotations from "../pages/supplier/MyQuotations";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Buyer Routes */}
        <Route element={<ProtectedRoute allowedRoles={["BUYER"]} />}>
          <Route
            path="/buyer/dashboard"
            element={<BuyerDashboard />}
          />

          <Route
            path="/buyer/rfqs/create"
            element={<CreateRFQ />}
          />

          <Route
            path="/buyer/rfqs/:id/edit"
            element={<EditRFQ />}
          />

          <Route
            path="/buyer/rfqs/:id"
            element={<BuyerRFQDetails />}
          />
        </Route>

        {/* Supplier Routes */}
        <Route element={<ProtectedRoute allowedRoles={["SUPPLIER"]} />}>
          <Route
            path="/supplier/dashboard"
            element={<SupplierDashboard />}
          />

          <Route
            path="/supplier/rfqs/:id"
            element={<SupplierRFQDetails />}
          />

          <Route
            path="/supplier/quotations"
            element={<MyQuotations />}
          />
        </Route>

        {/* Default Route */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* 404 Route */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;