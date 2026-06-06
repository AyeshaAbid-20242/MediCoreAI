const careRules = [
  {
    specialty: "Cardiology",
    condition: "possible heart or chest concern",
    keywords: ["chest", "heart", "cardiac", "cardio", "palpitation", "angina", "blood pressure"],
    hospitalKeywords: ["heart", "cardiac", "cardiology", "cardio", "chest"],
  },
  {
    specialty: "Pulmonology",
    condition: "possible breathing or lung concern",
    keywords: ["breath", "asthma", "wheezing", "cough", "lung", "oxygen"],
    hospitalKeywords: ["chest", "lung", "pulmonary", "respiratory"],
  },
  {
    specialty: "Neurology",
    condition: "possible nerve, head, or stroke concern",
    keywords: ["stroke", "seizure", "migraine", "headache", "numb", "weakness", "dizzy"],
    hospitalKeywords: ["neuro", "neurology", "brain", "stroke"],
  },
  {
    specialty: "Orthopedic",
    condition: "possible bone, joint, or injury concern",
    keywords: ["bone", "joint", "fracture", "sprain", "back pain", "knee", "shoulder"],
    hospitalKeywords: ["ortho", "orthopedic", "trauma", "bone"],
  },
  {
    specialty: "Dermatology",
    condition: "possible skin concern",
    keywords: ["rash", "skin", "itch", "acne", "allergy", "eczema"],
    hospitalKeywords: ["skin", "derma", "dermatology"],
  },
  {
    specialty: "Gastroenterology",
    condition: "possible stomach or digestion concern",
    keywords: ["stomach", "vomit", "diarrhea", "abdominal", "liver", "acid", "gastric"],
    hospitalKeywords: ["gastro", "liver", "digestive", "stomach"],
  },
  {
    specialty: "Dentist",
    condition: "possible dental concern",
    keywords: ["tooth", "teeth", "gum", "dental", "jaw"],
    hospitalKeywords: ["dental", "dentist", "tooth"],
  },
];

const getCareFocus = (message = "") => {
  const normalized = message.toLowerCase();
  const rule =
    careRules.find((item) => item.keywords.some((keyword) => normalized.includes(keyword))) ||
    {
      specialty: "General Medicine",
      condition: "general medical concern",
      hospitalKeywords: ["hospital", "clinic", "medical", "care"],
    };

  return {
    specialty: rule.specialty,
    condition: rule.condition,
    hospitalKeywords: rule.hospitalKeywords,
    note: `Based on your symptoms, start with ${rule.specialty}. This is guidance, not a diagnosis.`,
  };
};

export { getCareFocus };
