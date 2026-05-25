import axios from "axios";

const BASE_URL = "http://localhost:5000/api/auth";

const getToken = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

// ==========================================
// Stats
// ==========================================
export const getAdminStats = async () => {
  const res = await axios.get(`${BASE_URL}/admin/stats`, { headers: headers() });
  return res.data;
};

// ==========================================
// Users
// ==========================================
export const getPendingUsers = async () => {
  const res = await axios.get(`${BASE_URL}/admin/pending`, { headers: headers() });
  return res.data;
};

export const approveUser = async (id) => {
  const res = await axios.put(`${BASE_URL}/admin/approve/${id}`, {}, { headers: headers() });
  return res.data;
};

export const rejectUser = async (id) => {
  const res = await axios.put(`${BASE_URL}/admin/reject/${id}`, {}, { headers: headers() });
  return res.data;
};

export const getAllUsers = async (role = "", status = "") => {
  const res = await axios.get(`${BASE_URL}/admin/all-users?role=${role}&status=${status}`, { headers: headers() });
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await axios.delete(`${BASE_URL}/admin/delete/${id}`, { headers: headers() });
  return res.data;
};

export const editUser = async (id, data) => {
  const res = await axios.put(`${BASE_URL}/admin/edit-user/${id}`, data, { headers: headers() });
  return res.data;
};

export const blockUnblockUser = async (id) => {
  const res = await axios.put(`${BASE_URL}/admin/block-unblock/${id}`, {}, { headers: headers() });
  return res.data;
};

export const resendTempPassword = async (id) => {
  const res = await axios.post(`${BASE_URL}/admin/resend-password/${id}`, {}, { headers: headers() });
  return res.data;
};

// ==========================================
// Subscriptions
// ==========================================
export const getAllSubscriptions = async () => {
  const res = await axios.get(`${BASE_URL}/admin/subscriptions`, { headers: headers() });
  return res.data;
};

export const updateSubscription = async (id, data) => {
  const res = await axios.put(`${BASE_URL}/admin/subscriptions/${id}`, data, { headers: headers() });
  return res.data;
};

export const getSubscriptionPlans = async () => {
  const res = await axios.get(`${BASE_URL}/admin/subscription-plans`, { headers: headers() });
  return res.data;
};

export const updateSubscriptionPlans = async (data) => {
  const res = await axios.put(`${BASE_URL}/admin/subscription-plans`, data, { headers: headers() });
  return res.data;
};

// ==========================================
// Appointments
// ==========================================
export const getAllAppointments = async () => {
  const res = await axios.get(`${BASE_URL}/admin/appointments`, { headers: headers() });
  return res.data;
};

export const cancelAppointment = async (id) => {
  const res = await axios.put(`${BASE_URL}/admin/appointments/cancel/${id}`, {}, { headers: headers() });
  return res.data;
};

// ==========================================
// Payments
// ==========================================
export const getAllPayments = async () => {
  const res = await axios.get(`${BASE_URL}/admin/payments`, { headers: headers() });
  return res.data;
};

// ==========================================
// Analytics
// ==========================================
export const getRevenueStats = async () => {
  const res = await axios.get(`${BASE_URL}/admin/revenue-stats`, { headers: headers() });
  return res.data;
};

export const getDoctorRatings = async () => {
  const res = await axios.get(`${BASE_URL}/admin/doctor-ratings`, { headers: headers() });
  return res.data;
};

// ==========================================
// Emails
// ==========================================
export const sendEmailToUser = async (id, data) => {
  const res = await axios.post(`${BASE_URL}/admin/send-email/${id}`, data, { headers: headers() });
  return res.data;
};

export const broadcastEmail = async (data) => {
  const res = await axios.post(`${BASE_URL}/admin/broadcast-email`, data, { headers: headers() });
  return res.data;
};

// ==========================================
// Settings
// ==========================================
export const changeAdminPassword = async (data) => {
  const res = await axios.put(`${BASE_URL}/admin/change-password`, data, { headers: headers() });
  return res.data;
};

// ==========================================
// Reviews
// ==========================================
export const getAllReviews = async () => {
  const res = await axios.get(`${BASE_URL}/admin/reviews`, { headers: headers() });
  return res.data;
};

export const deleteReview = async (id) => {
  const res = await axios.delete(`${BASE_URL}/admin/reviews/${id}`, { headers: headers() });
  return res.data;
};