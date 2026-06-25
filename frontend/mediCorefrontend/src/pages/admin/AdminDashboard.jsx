import { useState, useEffect, useMemo, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import Overview from "./tabs/Overview";
import PendingApprovals from "./tabs/PendingApprovals";
import AllUsers from "./tabs/AllUsers";
import Doctors from "./tabs/Doctors";
import Patients from "./tabs/Patients";
import Ambulance from "./tabs/Ambulance";
import Subscriptions from "./tabs/Subscriptions";
import Appointments from "./tabs/Appointments";
import Payments from "./tabs/Payments";
import Analytics from "./tabs/Analytics";
import Reviews from "./tabs/Reviews";
import Messages from "./tabs/Messages";
import Settings from "./tabs/Settings";
import {
  getAdminStats,
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  deleteUser,
  getAllSubscriptions,
  updateSubscription,
  getAllAppointments,
  cancelAppointment,
  getAllPayments,
  editUser,
  blockUnblockUser,
  resendTempPassword,
  getRevenueStats,
  getDoctorRatings,
  sendEmailToUser,
  broadcastEmail,
  getSubscriptionPlans,
  updateSubscriptionPlans,
  changeAdminPassword,
  getAllReviews,
  deleteReview,
} from "../../api/adminApi";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Data
  const [stats, setStats] = useState({});
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueStats, setRevenueStats] = useState({ revenueChart: [], registrationChart: [] });
  const [doctorRatings, setDoctorRatings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);

  // Filters
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const admin = JSON.parse(localStorage.getItem("user") || "{}");

  const theme = useMemo(() =>
    darkMode ? {
      bg: "bg-[#060D18]",
      panel: "bg-[#0D1F35]",
      panelMuted: "bg-[#0A1628]",
      text: "text-[#E2E8F0]",
      subtext: "text-[#94A3B8]",
      border: "border-[#162940]",
      header: "bg-[#0D1F35]/90",
      line: "#162940",
      darkMode,
    } : {
      bg: "bg-[#EEF3F6]",
      panel: "bg-white",
      panelMuted: "bg-[#F7FAFC]",
      text: "text-[#0A1628]",
      subtext: "text-[#64748B]",
      border: "border-[#DDE6EE]",
      header: "bg-white/90",
      line: "#DDE6EE",
      darkMode,
    }, [darkMode]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        statsData,
        pendingData,
        usersData,
        subsData,
        appointsData,
        paymentsData,
        revenueData,
        ratingsData,
        reviewsData,
        plansData,
      ] = await Promise.all([
        getAdminStats(),
        getPendingUsers(),
        getAllUsers(),
        getAllSubscriptions(),
        getAllAppointments(),
        getAllPayments(),
        getRevenueStats(),
        getDoctorRatings(),
        getAllReviews(),
        getSubscriptionPlans(),
      ]);
      setStats(statsData);
      setPendingUsers(pendingData.users);
      setAllUsers(usersData.users);
      setSubscriptions(subsData.subscriptions);
      setAppointments(appointsData.appointments);
      setPayments(paymentsData.payments);
      setTotalRevenue(paymentsData.totalRevenue);
      setRevenueStats(revenueData);
      setDoctorRatings(ratingsData.ratings);
      setReviews(reviewsData.reviews);
      setSubscriptionPlans(plansData.plans);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (activeTab === "users") {
      getAllUsers(roleFilter, statusFilter).then(data => setAllUsers(data.users));
    }
  }, [roleFilter, statusFilter, activeTab]);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleApprove = async (id) => {
    try { const res = await approveUser(id); showMessage(res.message); fetchData(); }
    catch { showMessage("Failed to approve user", "error"); }
  };

  const handleReject = async (id) => {
    try { const res = await rejectUser(id); showMessage(res.message); fetchData(); }
    catch { showMessage("Failed to reject user", "error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try { const res = await deleteUser(id); showMessage(res.message); fetchData(); }
    catch { showMessage("Failed to delete user", "error"); }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try { const res = await cancelAppointment(id); showMessage(res.message); fetchData(); }
    catch { showMessage("Failed to cancel appointment", "error"); }
  };

  const handleUpdateSubscription = async (id, data) => {
    try { const res = await updateSubscription(id, data); showMessage(res.message); fetchData(); }
    catch { showMessage("Failed to update subscription", "error"); }
  };

  const handleEditUser = async (id, data) => {
    try { const res = await editUser(id, data); showMessage(res.message); fetchData(); }
    catch { showMessage("Failed to edit user", "error"); }
  };

  const handleBlockUnblock = async (id) => {
    try { const res = await blockUnblockUser(id); showMessage(res.message); fetchData(); }
    catch { showMessage("Failed to block/unblock user", "error"); }
  };

  const handleResendPassword = async (id) => {
    try { const res = await resendTempPassword(id); showMessage(res.message); }
    catch { showMessage("Failed to resend password", "error"); }
  };

  const handleSendEmail = async (id, data) => {
    try { const res = await sendEmailToUser(id, data); showMessage(res.message); }
    catch { showMessage("Failed to send email", "error"); }
  };

  const handleBroadcastEmail = async (data) => {
    try { const res = await broadcastEmail(data); showMessage(res.message); }
    catch { showMessage("Failed to broadcast email", "error"); }
  };

  const handleUpdatePlans = async (data) => {
    try { const res = await updateSubscriptionPlans(data); showMessage(res.message); fetchData(); }
    catch { showMessage("Failed to update plans", "error"); }
  };

  const handleChangePassword = async (data) => {
    try { const res = await changeAdminPassword(data); showMessage(res.message); }
    catch (err) { showMessage(err.response?.data?.message || "Failed to change password", "error"); }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try { const res = await deleteReview(id); showMessage(res.message); fetchData(); }
    catch { showMessage("Failed to delete review", "error"); }
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Role", "Status", "Joined"];
    const rows = allUsers.map(u => [u.name, u.email, u.role, u.status, new Date(u.createdAt).toLocaleDateString()]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060D18]">
        <div className="rounded-lg border border-[#1E2D45] bg-[#0D1F35] px-6 py-5 text-sm font-black text-white shadow">
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  const tabProps = { theme, showMessage, fetchData };

  const content = {
    overview: <Overview stats={stats} setActiveTab={setActiveTab} allUsers={allUsers} appointments={appointments} payments={payments} {...tabProps} />,
    pending: <PendingApprovals pendingUsers={pendingUsers} onApprove={handleApprove} onReject={handleReject} {...tabProps} />,
    users: <AllUsers allUsers={allUsers} roleFilter={roleFilter} statusFilter={statusFilter} setRoleFilter={setRoleFilter} setStatusFilter={setStatusFilter} onDelete={handleDelete} onExport={handleExportCSV} onEdit={handleEditUser} onBlockUnblock={handleBlockUnblock} onResendPassword={handleResendPassword} {...tabProps} />,
    doctors: <Doctors allUsers={allUsers} doctorRatings={doctorRatings} {...tabProps} />,
    patients: <Patients allUsers={allUsers} {...tabProps} />,
    ambulance: <Ambulance allUsers={allUsers} {...tabProps} />,
    subscriptions: <Subscriptions subscriptions={subscriptions} onUpdate={handleUpdateSubscription} subscriptionPlans={subscriptionPlans} {...tabProps} />,
    appointments: <Appointments appointments={appointments} onCancel={handleCancelAppointment} {...tabProps} />,
    payments: <Payments payments={payments} totalRevenue={totalRevenue} onExport={handleExportCSV} {...tabProps} />,
    analytics: <Analytics revenueStats={revenueStats} doctorRatings={doctorRatings} {...tabProps} />,
    reviews: <Reviews reviews={reviews} onDelete={handleDeleteReview} {...tabProps} />,
    messages: <Messages allUsers={allUsers} onSendEmail={handleSendEmail} onBroadcast={handleBroadcastEmail} {...tabProps} />,
    settings: <Settings subscriptionPlans={subscriptionPlans} onUpdatePlans={handleUpdatePlans} onChangePassword={handleChangePassword} {...tabProps} />,
  };

  return (
    <AdminLayout
      admin={admin}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      theme={theme}
      pendingCount={stats.pendingApprovals || 0}
    >
      {/* Message */}
      {message.text && (
        <div className={`mb-4 rounded-lg border px-4 py-3 text-sm font-semibold
          ${message.type === "error"
            ? "border-red-500/30 bg-red-500/10 text-red-400"
            : "border-green-500/30 bg-green-500/10 text-green-400"}`}>
          {message.text}
        </div>
      )}
      {content[activeTab] || content.overview}
    </AdminLayout>
  );
};

export default AdminDashboard;