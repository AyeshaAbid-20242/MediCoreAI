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
