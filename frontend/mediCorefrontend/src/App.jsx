import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import ForgotPassword from "./pages/auth/forgotpassword";
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
        <Route path="/forgotpassword" element={<ForgotPassword />} />

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
