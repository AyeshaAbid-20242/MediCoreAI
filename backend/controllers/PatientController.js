import User from "../models/user.js";

const getPlatformProviders = async (req, res) => {
  try {
    const providers = await User.find({
      role: { $in: ["doctor", "ambulance_driver"] },
      status: { $in: ["approved", "active"] },
    }).select("-password -otp -otpExpiry");

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

export { getPlatformProviders };
