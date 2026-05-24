import Appointment from "../models/Appointment.js";
import Review from "../models/Review.js";
import User from "../models/user.js";

const doctorSelect = "-password -otp -otpExpiry";
const activeDoctorStatus = ["approved", "active"];

const isDoctorApproved = (doctor) => activeDoctorStatus.includes(doctor.status);

const getDoctorMe = async (req, res) => {
  try {
    res.status(200).json({
      message: "Doctor profile fetched successfully",
      doctor: req.user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateDoctorProfile = async (req, res) => {
  try {
    if (!isDoctorApproved(req.user)) {
      return res.status(403).json({
        message: "Your doctor account must be approved before editing profile.",
      });
    }

    const allowedFields = [
      "name",
      "fullName",
      "city",
      "specialization",
      "experience",
      "licenseNumber",
      "pmdcNumber",
      "bio",
      "consultationFee",
      "profileImageUrl",
      "availableDays",
      "availableTimeSlots",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (updates.name && !updates.fullName) updates.fullName = updates.name;
    if (updates.fullName && !updates.name) updates.name = updates.fullName;
    if (updates.experience !== undefined) updates.experience = Number(updates.experience) || 0;
    if (updates.consultationFee !== undefined) {
      updates.consultationFee = Number(updates.consultationFee) || 0;
    }

    const doctor = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select(doctorSelect);

    res.status(200).json({
      message: "Doctor profile updated successfully",
      doctor,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const activateDoctorSubscription = async (req, res) => {
  try {
    if (!isDoctorApproved(req.user)) {
      return res.status(403).json({
        message: "Your doctor account must be approved before subscribing.",
      });
    }

    const { packageName = "Professional", months = 1 } = req.body;
    const start = new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + Number(months || 1));

    const doctor = await User.findByIdAndUpdate(
      req.user._id,
      {
        subscriptionStatus: "active",
        packageName,
        subscriptionStart: start,
        subscriptionEnd: end,
      },
      { new: true }
    ).select(doctorSelect);

    res.status(200).json({
      message: "Subscription activated successfully",
      doctor,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPublicDoctors = async (req, res) => {
  try {
    const doctors = await User.find({
      role: "doctor",
      status: { $in: activeDoctorStatus },
      subscriptionStatus: "active",
    }).select(doctorSelect);

    res.status(200).json({
      message: "Public doctors fetched successfully",
      doctors,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDoctorDashboard = async (req, res) => {
  try {
    if (!isDoctorApproved(req.user)) {
      return res.status(403).json({
        message: "Your doctor account is pending admin approval.",
      });
    }

    const doctorId = req.user._id;
    const appointments = await Appointment.find({ doctorId })
      .populate("patientId", "name fullName email")
      .sort({ createdAt: -1 });
    const reviews = await Review.find({ doctorId })
      .populate("patientId", "name fullName")
      .populate("appointmentId", "appointmentDate appointmentTime")
      .sort({ createdAt: -1 });

    const paidAppointments = appointments.filter(
      (appointment) => appointment.paymentStatus === "paid"
    );
    const totalEarnings = paidAppointments.reduce(
      (sum, appointment) => sum + appointment.consultationFee,
      0
    );
    const averageRating = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    res.status(200).json({
      message: "Doctor dashboard fetched successfully",
      doctor: req.user,
      stats: {
        totalAppointments: appointments.length,
        pendingRequests: appointments.filter((item) => item.appointmentStatus === "requested").length,
        completedConsultations: appointments.filter((item) => item.appointmentStatus === "completed").length,
        totalEarnings,
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews: reviews.length,
      },
      appointments,
      payments: paidAppointments.map((appointment) => ({
        _id: appointment._id,
        appointment,
        patient: appointment.patientId,
        amount: appointment.consultationFee,
        paymentStatus: appointment.paymentStatus,
        date: appointment.updatedAt,
      })),
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  activateDoctorSubscription,
  getDoctorDashboard,
  getDoctorMe,
  getPublicDoctors,
  updateDoctorProfile,
};
