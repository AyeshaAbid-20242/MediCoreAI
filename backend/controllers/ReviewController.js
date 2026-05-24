import Appointment from "../models/Appointment.js";
import Review from "../models/Review.js";

const createReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;

    if (!appointmentId || !rating) {
      return res.status(400).json({ message: "Appointment and rating are required." });
    }

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
      rating: Number(rating),
      comment: comment || "",
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

const getPublicDoctorReviews = async (req, res) => {
  try {
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

export { createReview, getDoctorReviews, getPublicDoctorReviews };
