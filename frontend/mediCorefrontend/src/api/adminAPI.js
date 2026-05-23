import axios from "axios";

const BASE_URL = "http://localhost:5000/api/auth";

const getToken = () => localStorage.getItem("token");

const headers = () => ({
  Authorization: `Bearer ${getToken()}`
});

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