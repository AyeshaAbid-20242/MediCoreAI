import api from "./axios";

export const getDoctorDashboard = () => {
  return api.get("/doctors/dashboard");
};

export const getDoctorProfile = () => {
  return api.get("/doctors/me");
};

export const updateDoctorProfile = (payload) => {
  return api.put("/doctors/me/profile", payload);
};

export const activateDoctorSubscription = (payload) => {
  return api.post("/doctors/me/subscription", payload);
};

export const createAppointmentPrescription = (appointmentId, payload) => {
  return api.post(`/doctors/appointments/${appointmentId}/prescriptions`, payload);
};

export const getPublicDoctors = () => {
  return api.get("/doctors/public");
};
