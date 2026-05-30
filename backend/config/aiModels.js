const defaultModels = [
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Fast balanced responses for symptom guidance.",
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    description: "Clear general medical triage explanations.",
  },
  {
    id: "anthropic/claude-3.5-haiku",
    name: "Claude Haiku",
    description: "Short, careful, patient-friendly answers.",
  },
  {
    id: "meta-llama/llama-3.1-8b-instruct",
    name: "Llama 3.1 8B",
    description: "Open model option for simple questions.",
  },
];

const parseConfiguredModels = () => {
  if (!process.env.OPENROUTER_MODELS) return [];

  return process.env.OPENROUTER_MODELS.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [id, name, description] = entry.split("|").map((part) => part?.trim());
      return {
        id,
        name: name || id,
        description: description || "Available through OpenRouter.",
      };
    })
    .filter((model) => model.id);
};

const getAllowedAIModels = () => {
  const configuredModels = parseConfiguredModels();
  const models = configuredModels.length ? configuredModels : defaultModels;
  const preferredModel = process.env.OPENROUTER_MODEL;

  if (!preferredModel || models.some((model) => model.id === preferredModel)) {
    return models;
  }

  return [
    {
      id: preferredModel,
      name: preferredModel,
      description: "Default model from environment settings.",
    },
    ...models,
  ];
};

const getSafeAIModel = (requestedModel) => {
  const models = getAllowedAIModels();
  return models.find((model) => model.id === requestedModel)?.id || models[0].id;
};

export { getAllowedAIModels, getSafeAIModel };
