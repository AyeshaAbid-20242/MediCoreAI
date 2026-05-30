import api from "./axios";

export const getAdminStats = async () => {
  const res = await api.get("/admin/stats");
  return res.data;
};

export const getPendingUsers = async () => {
  const res = await api.get("/admin/users/pending");
  return res.data;
};

export const approveUser = async (id) => {
  const res = await api.patch(`/admin/users/${id}/approve`);
  return res.data;
};

export const rejectUser = async (id) => {
  const res = await api.patch(`/admin/users/${id}/reject`);
  return res.data;
};

export const getAllUsers = async (role = "", status = "") => {
  const res = await api.get("/admin/users", { params: { role, status } });
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

export const editUser = async (id, data) => {
  const res = await api.put(`/admin/users/${id}`, data);
  return res.data;
};

export const blockUnblockUser = async (id) => {
  const res = await api.patch(`/admin/users/${id}/block`);
  return res.data;
};

export const resendTempPassword = async (id) => {
  const res = await api.post(`/admin/users/${id}/password`);
  return res.data;
};

export const getAllSubscriptions = async () => {
  const res = await api.get("/admin/subscriptions");
  return res.data;
};

export const updateSubscription = async (id, data) => {
  const res = await api.patch(`/admin/subscriptions/${id}`, data);
  return res.data;
};

export const getSubscriptionPlans = async () => {
  const res = await api.get("/admin/subscription-plans");
  return res.data;
};

export const updateSubscriptionPlans = async (data) => {
  const res = await api.put("/admin/subscription-plans", data);
  return res.data;
};

export const getAllAppointments = async () => {
  const res = await api.get("/admin/appointments");
  return res.data;
};

export const cancelAppointment = async (id) => {
  const res = await api.patch(`/admin/appointments/${id}/cancel`);
  return res.data;
};

export const getAllPayments = async () => {
  const res = await api.get("/admin/payments");
  return res.data;
};

export const getRevenueStats = async () => {
  const res = await api.get("/admin/analytics/revenue");
  return res.data;
};

export const getDoctorRatings = async () => {
  const res = await api.get("/admin/analytics/doctor-ratings");
  return res.data;
};

export const sendEmailToUser = async (id, data) => {
  const res = await api.post(`/admin/users/${id}/emails`, data);
  return res.data;
};

export const broadcastEmail = async (data) => {
  const res = await api.post("/admin/emails/broadcast", data);
  return res.data;
};

export const changeAdminPassword = async (data) => {
  const res = await api.put("/admin/settings/password", data);
  return res.data;
};

export const getAllReviews = async () => {
  const res = await api.get("/admin/reviews");
  return res.data;
};

export const deleteReview = async (id) => {
  const res = await api.delete(`/admin/reviews/${id}`);
  return res.data;
};
