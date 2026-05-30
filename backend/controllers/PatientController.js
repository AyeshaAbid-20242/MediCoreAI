import User from "../models/user.js";
import { getAllowedAIModels, getSafeAIModel } from "../config/aiModels.js";
import getOpenRouter from "../config/openRouter.js";
import { sendValidationError, toNumber, trimString } from "../helper/validators.js";
import { fetchNearbyCareFromOsm, getDistanceMeters } from "../services/nearbyCareService.js";

const activeStatuses = ["approved", "active"];
const providerSelect = "-password -otp -otpExpiry";

const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  if ([lat1, lng1, lat2, lng2].some((value) => value === null || value === undefined)) {
    return null;
  }

  return Number((getDistanceMeters(lat1, lng1, lat2, lng2) / 1000).toFixed(1));
};

const platformProviderFilter = {
  $or: [
    {
      role: "doctor",
      status: { $in: activeStatuses },
      subscriptionStatus: "active",
    },
    {
      role: "ambulance_driver",
      status: { $in: activeStatuses },
    },
  ],
};

const getPlatformProviders = async (req, res) => {
  try {
    const providers = await User.find(platformProviderFilter).select(providerSelect);

    const doctors = providers.filter((provider) => provider.role === "doctor");
    const ambulanceDrivers = providers.filter(
      (provider) => provider.role === "ambulance_driver"
    );

    res.status(200).json({
      message: "Platform providers fetched successfully",
      doctors,
      ambulanceDrivers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getAIModels = (req, res) => {
  res.status(200).json({
    message: "AI models fetched successfully",
    models: getAllowedAIModels(),
  });
};

const analyzeSymptoms = async (req, res) => {
  try {
    const message = trimString(req.body.message);
    const requestedModel = trimString(req.body.model);

    if (!message || message.length < 3) {
      return sendValidationError(res, ["Please describe your symptoms."]);
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(200).json({
        message: "OpenRouter API key is not configured.",
        answer:
          "I can help prepare care notes once OPENROUTER_API_KEY is added. For now: if symptoms are severe, sudden, or include chest pain, trouble breathing, fainting, heavy bleeding, or confusion, seek emergency care immediately.",
      });
    }

    const model = getSafeAIModel(requestedModel);
    const prompt = `
You are a cautious healthcare triage assistant for MediCore.
User symptoms: ${message}

Give:
1. Possible urgency level.
2. Practical next steps.
3. Red flags that need emergency care.
4. Which type of doctor to consider.

Do not diagnose. Keep it clear and short.
`;

    const openRouter = getOpenRouter();
    const completion = await openRouter.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a careful healthcare triage assistant. You do not diagnose. You explain red flags and practical next steps clearly.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const answer =
      completion.choices?.[0]?.message?.content?.trim() || "No response generated.";

    res.status(200).json({
      message: "Symptoms analyzed successfully",
      provider: "openrouter",
      model,
      answer,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getNearbyCare = async (req, res) => {
  try {
    const latitude = toNumber(req.query.lat);
    const longitude = toNumber(req.query.lng);
    const requestedRadius = toNumber(req.query.radius);
    const radius = Math.min(Math.max(requestedRadius || 15000, 1000), 25000);

    if (latitude === null || longitude === null) {
      return sendValidationError(res, ["Latitude and longitude are required."]);
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return sendValidationError(res, ["Latitude or longitude is outside the valid range."]);
    }

    const providers = await User.find(platformProviderFilter).select(providerSelect);
    const withDistance = providers.map((provider) => {
      const item = provider.toObject();
      item.distance = getDistanceKm(latitude, longitude, item.latitude, item.longitude);
      return item;
    });

    const doctors = withDistance.filter((provider) => provider.role === "doctor");
    const ambulanceDrivers = withDistance.filter(
      (provider) => provider.role === "ambulance_driver"
    );

    const places = await fetchNearbyCareFromOsm({ lat: latitude, lng: longitude, radius });
    const hospitals = places.filter((place) =>
      ["hospital", "clinic", "emergency"].includes(place.type)
    );

    res.status(200).json({
      success: true,
      source: "openstreetmap_overpass",
      count: places.length,
      message: "Nearby care fetched successfully",
      places,
      hospitals,
      doctors,
      ambulanceDrivers,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Nearby care service is temporarily unavailable. Please try again shortly.",
      places: [],
    });
  }
};

export { analyzeSymptoms, getAIModels, getNearbyCare, getPlatformProviders };
