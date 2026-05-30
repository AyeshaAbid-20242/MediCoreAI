import User from "../models/user.js";
import AmbulanceJob from "../models/AmbulanceJob.js";
import {
  isValidObjectId,
  phoneRegex,
  sendValidationError,
  toBoolean,
  toNumber,
  trimString,
  urlRegex,
} from "../helper/validators.js";

const activeStatuses = ["approved", "active"];
const isDriverApproved = (driver) => activeStatuses.includes(driver.status);
const driverSelect = "-password -otp -otpExpiry";

const populateJob = (query) =>
  query
    .populate("patientId", "name fullName email mobileNumber")
    .populate("driverId", "name fullName email mobileNumber vehicleNumber ambulanceType");

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

    const jobs = await populateJob(
      AmbulanceJob.find({ driverId: req.user._id }).sort({ createdAt: -1 })
    );
    const completedJobs = jobs.filter((job) => job.status === "completed");
    const pendingJobs = jobs.filter((job) =>
      ["requested", "accepted", "active"].includes(job.status)
    );

    res.status(200).json({
      message: "Driver dashboard fetched successfully",
      driver: req.user,
      stats: {
        totalJobs: jobs.length,
        completedJobs: completedJobs.length,
        pendingJobs: pendingJobs.length,
        totalEarnings: completedJobs.reduce((sum, job) => sum + Number(job.fare || 0), 0),
      },
      jobs,
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
    const errors = [];

    if (updates.name !== undefined) {
      updates.name = trimString(updates.name);
      if (updates.name.length < 2) errors.push("Name must be at least 2 characters.");
    }

    if (updates.city !== undefined) updates.city = trimString(updates.city);
    if (updates.mobileNumber !== undefined) {
      updates.mobileNumber = trimString(updates.mobileNumber);
      if (updates.mobileNumber && !phoneRegex.test(updates.mobileNumber)) {
        errors.push("Mobile number format is invalid.");
      }
    }
    if (updates.vehicleNumber !== undefined) {
      updates.vehicleNumber = trimString(updates.vehicleNumber);
    }
    if (updates.ambulanceType !== undefined) {
      updates.ambulanceType = trimString(updates.ambulanceType);
    }
    if (updates.drivingLicenseNumber !== undefined) {
      updates.drivingLicenseNumber = trimString(updates.drivingLicenseNumber);
    }
    if (updates.profileImageUrl !== undefined) {
      updates.profileImageUrl = trimString(updates.profileImageUrl);
      if (updates.profileImageUrl && !urlRegex.test(updates.profileImageUrl)) {
        errors.push("Profile image URL must be a valid URL.");
      }
    }
    if (updates.driverExperience !== undefined) {
      updates.driverExperience = toNumber(updates.driverExperience);
      if (
        updates.driverExperience === null ||
        updates.driverExperience < 0 ||
        updates.driverExperience > 70
      ) {
        errors.push("Driver experience must be between 0 and 70 years.");
      }
    }
    if (updates.hasOxygen !== undefined) updates.hasOxygen = toBoolean(updates.hasOxygen);
    if (updates.hasStretcher !== undefined) {
      updates.hasStretcher = toBoolean(updates.hasStretcher);
    }

    if (errors.length) return sendValidationError(res, errors);

    const driver = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select(driverSelect);

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
    const finalMonths = toNumber(months);

    if (!trimString(packageName) || !finalMonths || finalMonths < 1 || finalMonths > 12) {
      return sendValidationError(res, [
        "Package name is required and months must be between 1 and 12.",
      ]);
    }

    const start = new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + finalMonths);

    const driver = await User.findByIdAndUpdate(
      req.user._id,
      {
        subscriptionStatus: "active",
        packageName: trimString(packageName),
        subscriptionStart: start,
        subscriptionEnd: end,
      },
      { new: true }
    ).select(driverSelect);

    res.status(200).json({
      message: "Subscription activated successfully",
      driver,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const requestAmbulance = async (req, res) => {
  try {
    const {
      driverId,
      patientName,
      contactNumber,
      pickupLocation,
      destination,
      notes,
    } = req.body;
    const errors = [];

    if (!isValidObjectId(driverId)) errors.push("Valid ambulance driver is required.");
    if (!trimString(patientName) || trimString(patientName).length < 2) {
      errors.push("Patient name is required.");
    }
    if (!phoneRegex.test(trimString(contactNumber) || "")) {
      errors.push("Valid contact number is required.");
    }
    if (!trimString(pickupLocation)) errors.push("Pickup location is required.");
    if (trimString(notes)?.length > 1000) errors.push("Notes cannot exceed 1000 characters.");

    if (errors.length) return sendValidationError(res, errors);

    const driver = await User.findOne({
      _id: driverId,
      role: "ambulance_driver",
      status: { $in: activeStatuses },
    });

    if (!driver) {
      return res.status(404).json({ message: "Ambulance driver is not available." });
    }

    const job = await AmbulanceJob.create({
      patientId: req.user._id,
      driverId,
      patientName: trimString(patientName),
      contactNumber: trimString(contactNumber),
      pickupLocation: trimString(pickupLocation),
      destination: trimString(destination) || "",
      notes: trimString(notes) || "",
    });

    const populatedJob = await populateJob(AmbulanceJob.findById(job._id));

    res.status(201).json({
      message: "Ambulance request sent to driver.",
      job: populatedJob,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPatientAmbulanceJobs = async (req, res) => {
  try {
    const jobs = await populateJob(
      AmbulanceJob.find({ patientId: req.user._id }).sort({ createdAt: -1 })
    );

    res.status(200).json({
      message: "Patient ambulance jobs fetched successfully",
      jobs,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDriverJobs = async (req, res) => {
  try {
    const jobs = await populateJob(
      AmbulanceJob.find({ driverId: req.user._id }).sort({ createdAt: -1 })
    );

    res.status(200).json({
      message: "Driver jobs fetched successfully",
      jobs,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateDriverJobStatus = async (req, res) => {
  try {
    const { status, fare } = req.body;
    const allowedStatuses = ["accepted", "active", "completed", "cancelled"];
    const errors = [];

    if (!isValidObjectId(req.params.id)) errors.push("Valid job id is required.");
    if (!allowedStatuses.includes(status)) errors.push("Invalid job status.");

    const finalFare = fare === undefined ? undefined : toNumber(fare);
    if (finalFare !== undefined && (finalFare === null || finalFare < 0)) {
      errors.push("Fare must be a positive number.");
    }

    if (errors.length) return sendValidationError(res, errors);

    const job = await AmbulanceJob.findOne({
      _id: req.params.id,
      driverId: req.user._id,
    });

    if (!job) return res.status(404).json({ message: "Job not found." });

    job.status = status;
    if (finalFare !== undefined) job.fare = finalFare;
    await job.save();

    const populatedJob = await populateJob(AmbulanceJob.findById(job._id));

    res.status(200).json({
      message: "Job updated successfully",
      job: populatedJob,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  getDriverJobs,
  getDriverMe,
  getDriverDashboard,
  getPatientAmbulanceJobs,
  requestAmbulance,
  updateDriverJobStatus,
  updateDriverProfile,
  activateDriverSubscription,
};
