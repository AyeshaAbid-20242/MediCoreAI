import api from "./axios";

export const analyzeSymptoms = (message) => {
  return api.post("/patients/me/symptom-check", { message });
};

export const getNearbyCare = ({ lat, lng, radius = 15000 }) => {
  return api.get("/patients/me/nearby-care", {
    params: { lat, lng, radius },
  });
};
