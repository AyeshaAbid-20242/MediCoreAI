import api from "./axios";

export const analyzeSymptoms = ({ message, model }) => {
  return api.post("/patients/me/symptom-check", { message, model });
};

export const getAiModels = () => {
  return api.get("/patients/me/ai-models");
};

export const getNearbyCare = ({ lat, lng, radius = 15000 }) => {
  return api.get("/patients/me/nearby-care", {
    params: { lat, lng, radius },
  });
};

export const getPatientHealthSummary = () => {
  return api.get("/patients/me/health-summary");
};

export const getPatientVitals = () => {
  return api.get("/patients/me/vitals");
};

export const createPatientVital = (data) => {
  return api.post("/patients/me/vitals", data);
};

export const updatePatientVital = (id, data) => {
  return api.put(`/patients/me/vitals/${id}`, data);
};

export const deletePatientVital = (id) => {
  return api.delete(`/patients/me/vitals/${id}`);
};

export const getPrescriptions = () => {
  return api.get("/patients/me/prescriptions");
};

export const createPrescription = (data) => {
  return api.post("/patients/me/prescriptions", data);
};

export const updatePrescription = (id, data) => {
  return api.put(`/patients/me/prescriptions/${id}`, data);
};

export const deletePrescription = (id) => {
  return api.delete(`/patients/me/prescriptions/${id}`);
};

export const getMedicalRecords = () => {
  return api.get("/patients/me/medical-records");
};

export const createMedicalRecord = (data) => {
  return api.post("/patients/me/medical-records", data);
};

export const updateMedicalRecord = (id, data) => {
  return api.put(`/patients/me/medical-records/${id}`, data);
};

export const deleteMedicalRecord = (id) => {
  return api.delete(`/patients/me/medical-records/${id}`);
};
