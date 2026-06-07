import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser } from "./api/authApi";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import PendingApproval from "./pages/doctor/PendingApproval";
import PatientDashboard from "./pages/patient/PatientDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AmbulanceDashboard from "./pages/ambulance/AmbulanceDashboard";
import PaymentSuccess from "./pages/payment/PaymentSuccess";
import PaymentCancel from "./pages/payment/PaymentCancel";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole, requireApprovedDoctor = false }) => {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });
  const [checking, setChecking] = useState(Boolean(token));
  const [validSession, setValidSession] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    getCurrentUser()
      .then((response) => {
        if (!isMounted) return;
        const freshUser = response.data.user || {};
        localStorage.setItem("user", JSON.stringify(freshUser));
        setUser(freshUser);
        setValidSession(true);
      })
      .catch(() => {
        if (!isMounted) return;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setValidSession(false);
      })
      .finally(() => {
        if (isMounted) setChecking(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060D18] px-4 text-center">
        <div className="rounded-xl border border-[#162940] bg-[#0D1F35] px-6 py-5 text-sm font-black text-[#E2E8F0] shadow-2xl">
          Checking your secure session...
        </div>
      </div>
    );
  }

  if (!validSession) {
    return <Navigate to="/login" />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/login" />;
  }

  if (requireApprovedDoctor && !["approved", "active"].includes(user.status)) {
    return <PendingApproval />;
  }

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Protected Routes - we will add dashboards here soon */}
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute allowedRole="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
{/* Admin Dashboard */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
<Route path="/ambulance/dashboard" element={
  <ProtectedRoute allowedRole="ambulance_driver">
    <AmbulanceDashboard />
  </ProtectedRoute>
} />
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute allowedRole="doctor" requireApprovedDoctor>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
