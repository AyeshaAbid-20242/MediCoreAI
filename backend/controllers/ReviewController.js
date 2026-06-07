import Appointment from "../models/Appointment.js";
import AmbulanceJob from "../models/AmbulanceJob.js";
import AmbulanceReview from "../models/AmbulanceReview.js";
import Review from "../models/Review.js";
import {
  isValidObjectId,
  sendValidationError,
  toNumber,
  trimString,
} from "../helper/validators.js";

const createReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;
    const finalRating = toNumber(rating);
    const finalComment = trimString(comment) || "";
    const errors = [];

    if (!isValidObjectId(appointmentId)) errors.push("Valid appointment is required.");
    if (finalRating === null || finalRating < 1 || finalRating > 5) {
      errors.push("Rating must be between 1 and 5.");
    }
    if (finalComment.length > 1000) errors.push("Comment cannot exceed 1000 characters.");

    if (errors.length) return sendValidationError(res, errors);

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: req.user._id,
      appointmentStatus: "completed",
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Completed appointment not found for this patient.",
      });
    }

    const existingReview = await Review.findOne({ appointmentId });
    if (existingReview) {
      return res.status(400).json({ message: "Review already submitted for this appointment." });
    }

    const review = await Review.create({
      patientId: req.user._id,
      doctorId: appointment.doctorId,
      appointmentId,
      rating: finalRating,
      comment: finalComment,
    });

    const populatedReview = await Review.findById(review._id)
      .populate("patientId", "name fullName")
      .populate("doctorId", "name fullName specialization");

    res.status(201).json({
      message: "Review submitted successfully",
      review: populatedReview,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createAmbulanceReview = async (req, res) => {
  try {
    const { ambulanceJobId, rating, comment } = req.body;
    const finalRating = toNumber(rating);
    const finalComment = trimString(comment) || "";
    const errors = [];

    if (!isValidObjectId(ambulanceJobId)) errors.push("Valid ambulance job is required.");
    if (finalRating === null || finalRating < 1 || finalRating > 5) {
      errors.push("Rating must be between 1 and 5.");
    }
    if (finalComment.length > 1000) errors.push("Comment cannot exceed 1000 characters.");

    if (errors.length) return sendValidationError(res, errors);

    const job = await AmbulanceJob.findOne({
      _id: ambulanceJobId,
      patientId: req.user._id,
      status: "completed",
    });

    if (!job) {
      return res.status(404).json({
        message: "Completed ambulance ride not found for this patient.",
      });
    }

    const existingReview = await AmbulanceReview.findOne({ ambulanceJobId });
    if (existingReview) {
      return res.status(400).json({ message: "Review already submitted for this ambulance ride." });
    }

    const review = await AmbulanceReview.create({
      patientId: req.user._id,
      driverId: job.driverId,
      ambulanceJobId,
      rating: finalRating,
      comment: finalComment,
    });

    const populatedReview = await AmbulanceReview.findById(review._id)
      .populate("patientId", "name fullName")
      .populate("driverId", "name fullName ambulanceType vehicleNumber");

    res.status(201).json({
      message: "Ambulance review submitted successfully",
      review: populatedReview,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDoctorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ doctorId: req.user._id })
      .populate("patientId", "name fullName")
      .populate("appointmentId", "appointmentDate appointmentTime")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Doctor reviews fetched successfully",
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDriverReviews = async (req, res) => {
  try {
    const reviews = await AmbulanceReview.find({ driverId: req.user._id })
      .populate("patientId", "name fullName")
      .populate("ambulanceJobId", "pickupLocation destination fare status updatedAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Driver reviews fetched successfully",
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPublicDriverReviews = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.driverId)) {
      return sendValidationError(res, ["Valid driver id is required."]);
    }

    const reviews = await AmbulanceReview.find({ driverId: req.params.driverId })
      .populate("patientId", "name fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Public driver reviews fetched successfully",
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPublicDoctorReviews = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.doctorId)) {
      return sendValidationError(res, ["Valid doctor id is required."]);
    }

    const reviews = await Review.find({ doctorId: req.params.doctorId })
      .populate("patientId", "name fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Public doctor reviews fetched successfully",
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  createReview,
  createAmbulanceReview,
  getDoctorReviews,
  getDriverReviews,
  getPublicDoctorReviews,
  getPublicDriverReviews,
};
