import User from "../models/user.js";
import bcrypt from "bcryptjs";

const activeStatuses = ["approved", "active"];
const isDriverApproved = (driver) => activeStatuses.includes(driver.status);

// Get driver profile
const getDriverMe = async (req, res) => {
  try {
    res.status(200).json({
      message: "Driver profile fetched successfully",
      driver: req.user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get driver dashboard
const getDriverDashboard = async (req, res) => {
  try {
    if (!isDriverApproved(req.user)) {
      return res.status(403).json({
        message: "Your account is pending admin approval.",
      });
    }

    res.status(200).json({
      message: "Driver dashboard fetched successfully",
      driver: req.user,
      stats: {
        totalJobs: 0,
        completedJobs: 0,
        pendingJobs: 0,
        totalEarnings: 0,
      },
      jobs: [],
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update driver profile
const updateDriverProfile = async (req, res) => {
  try {
    if (!isDriverApproved(req.user)) {
      return res.status(403).json({
        message: "Your account must be approved before editing profile.",
      });
    }

    const allowedFields = [
      "name",
      "city",
      "mobileNumber",
      "vehicleNumber",
      "ambulanceType",
      "drivingLicenseNumber",
      "driverExperience",
      "hasOxygen",
      "hasStretcher",
      "profileImageUrl",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const driver = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select("-password -otp -otpExpiry");

    res.status(200).json({
      message: "Profile updated successfully",
      driver,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Activate subscription
const activateDriverSubscription = async (req, res) => {
  try {
    if (!isDriverApproved(req.user)) {
      return res.status(403).json({
        message: "Your account must be approved before subscribing.",
      });
    }

    const { packageName = "Professional", months = 1 } = req.body;
    const start = new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + Number(months || 1));

    const driver = await User.findByIdAndUpdate(
      req.user._id,
      {
        subscriptionStatus: "active",
        packageName,
        subscriptionStart: start,
        subscriptionEnd: end,
      },
      { new: true }
    ).select("-password -otp -otpExpiry");

    res.status(200).json({
      message: "Subscription activated successfully",
      driver,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  getDriverMe,
  getDriverDashboard,
  updateDriverProfile,
  activateDriverSubscription,
};