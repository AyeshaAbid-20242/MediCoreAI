import api from "./axios";

export const requestAppointment = (payload) => {
  return api.post("/appointments", payload);
};

export const getPatientAppointments = () => {
  return api.get("/appointments/me");
};

export const payAppointment = (appointmentId) => {
  return api.patch(`/appointments/${appointmentId}/pay`);
};

export const getDoctorAppointments = () => {
  return api.get("/appointments/doctor/me");
};

export const updateAppointmentStatus = (appointmentId, appointmentStatus) => {
  return api.patch(`/appointments/${appointmentId}/status`, { appointmentStatus });
};

export const updateAppointmentZoomLink = (appointmentId, zoomLink) => {
  return api.patch(`/appointments/${appointmentId}/zoom`, { zoomLink });
};
