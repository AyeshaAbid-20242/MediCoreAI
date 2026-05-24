import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import PendingApproval from "./pages/doctor/PendingApproval";
import PatientDashboard from "./pages/patient/PatientDashboard";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole, requireApprovedDoctor = false }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
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

        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute allowedRole="doctor" requireApprovedDoctor>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
