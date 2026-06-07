// const User = require('../models/user');
// const bcrypt = require('bcryptjs');
// const { sendTempPassword } = require('../helper/emailHelper');

// // Generate random temporary password
// const generateTempPassword = () => {
//   return Math.random().toString(36).slice(-8) + '@123';
// };

// // ==========================================
// // @route   GET /api/admin/pending
// // @access  Admin only
// // ==========================================
// const getPendingUsers = async (req, res) => {
//   try {
//     const pendingUsers = await User.find({ status: 'pending' }).select('-password');

//     res.status(200).json({
//       message: 'Pending users fetched successfully',
//       count: pendingUsers.length,
//       users: pendingUsers
//     });

//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // ==========================================
// // @route   PUT /api/admin/approve/:id
// // @access  Admin only
// // ==========================================
// const approveUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     if (user.status === 'approved' || user.status === 'active') {
//       return res.status(400).json({ message: 'User is already approved' });
//     }

//     // Generate temp password
//     const tempPassword = generateTempPassword();
//     const hashedPassword = await bcrypt.hash(tempPassword, 10);

//     // Update user
//     user.password = hashedPassword;
//     user.status = 'approved';
//     user.isFirstLogin = true;
//     await user.save();

//     // Send temp password to user via email
//     await sendTempPassword(user.email, user.name, tempPassword);

//     res.status(200).json({
//       message: `${user.name} has been approved. Temporary password sent to their email.`
//     });

//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // ==========================================
// // @route   PUT /api/admin/reject/:id
// // @access  Admin only
// // ==========================================
// const rejectUser = async (req, res) => {
//   try {
//     const { reason } = req.body;

//     const user = await User.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     if (user.status === 'rejected') {
//       return res.status(400).json({ message: 'User is already rejected' });
//     }

//     user.status = 'rejected';
//     await user.save();

//     res.status(200).json({
//       message: `${user.name} has been rejected.`
//     });

//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // ==========================================
// // @route   GET /api/admin/all-users
// // @access  Admin only
// // ==========================================
// const getAllUsers = async (req, res) => {
//   try {
//     const { role, status } = req.query;

//     // Build filter
//     let filter = { role: { $ne: 'admin' } };
//     if (role) filter.role = role;
//     if (status) filter.status = status;

//     const users = await User.find(filter).select('-password');

//     res.status(200).json({
//       message: 'Users fetched successfully',
//       count: users.length,
//       users
//     });

//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // ==========================================
// // @route   DELETE /api/admin/delete/:id
// // @access  Admin only
// // ==========================================
// const deleteUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     if (user.role === 'admin') {
//       return res.status(403).json({ message: 'Cannot delete admin account' });
//     }

//     await User.findByIdAndDelete(req.params.id);

//     res.status(200).json({ message: `${user.name} has been deleted successfully` });

//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// module.exports = { getPendingUsers, approveUser, rejectUser, getAllUsers, deleteUser };



import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { sendTempPassword } from "../helper/emailHelper.js";
import Appointment from "../models/Appointment.js";
import AmbulanceReview from "../models/AmbulanceReview.js";
import Review from "../models/Review.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import nodemailer from "nodemailer";
import { formatUsage, resetUsage } from "../services/aiUsageService.js";
import {
  isStrongPassword,
  isValidEmail,
  isValidObjectId,
  normalizeEmail,
  sendValidationError,
  toNumber,
  trimString,
} from "../helper/validators.js";

const generateTempPassword = () => {
  return Math.random().toString(36).slice(-8) + "@123";
};

const allowedRoles = ["patient", "doctor", "ambulance_driver"];
const allowedStatuses = ["pending", "approved", "rejected", "active", "blocked"];
const allowedSubscriptionStatuses = ["none", "active", "expired"];
const planFields = [
  "basicMonthly",
  "basicYearly",
  "professionalMonthly",
  "professionalYearly",
  "premiumMonthly",
  "premiumYearly",
];

const validateIdParam = (req, res) => {
  if (isValidObjectId(req.params.id)) return true;
  sendValidationError(res, ["Valid id is required."]);
  return false;
};

const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: "pending" }).select("-password");
    res.status(200).json({
      message: "Pending users fetched successfully",
      count: pendingUsers.length,
      users: pendingUsers,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const approveUser = async (req, res) => {
  try {
    if (!validateIdParam(req, res)) return;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.status === "approved" || user.status === "active") {
      return res.status(400).json({ message: "User is already approved" });
    }
    const hasPlaceholderPassword = await bcrypt.compare("placeholder", user.password);
    const tempPassword = hasPlaceholderPassword ? generateTempPassword() : null;
    if (hasPlaceholderPassword) {
      const emailResult = await sendTempPassword(user.email, user.name, tempPassword);
      if (!emailResult.sent) {
        return res.status(502).json({
          message: "Could not send temporary password email. User was not approved.",
          error: emailResult.error,
        });
      }
      user.password = await bcrypt.hash(tempPassword, 10);
    }
    user.status = "approved";
    user.isFirstLogin = true;
    await user.save();
    res.status(200).json({
      message: hasPlaceholderPassword
        ? `${user.name} has been approved. Temporary password sent to their email.`
        : `${user.name} has been approved. They can login with the password already sent to their email.`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const rejectUser = async (req, res) => {
  try {
    if (!validateIdParam(req, res)) return;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.status === "rejected") {
      return res.status(400).json({ message: "User is already rejected" });
    }
    user.status = "rejected";
    await user.save();
    res.status(200).json({ message: `${user.name} has been rejected.` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    let filter = { role: { $ne: "admin" } };
    if (role) {
      if (!allowedRoles.includes(role)) {
        return sendValidationError(res, ["Invalid role filter."]);
      }
      filter.role = role;
    }
    if (status) {
      if (!allowedStatuses.includes(status)) {
        return sendValidationError(res, ["Invalid status filter."]);
      }
      filter.status = status;
    }
    const users = await User.find(filter).select("-password");
    res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (!validateIdParam(req, res)) return;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin account" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: `${user.name} has been deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const activeProviderStatuses = ["approved", "active"];
    const totalDoctors = await User.countDocuments({
      role: "doctor",
      status: { $in: activeProviderStatuses },
    });
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalDrivers = await User.countDocuments({
      role: "ambulance_driver",
      status: { $in: activeProviderStatuses },
    });
    const pendingApprovals = await User.countDocuments({ status: "pending" });
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
    res.status(200).json({
      totalDoctors,
      totalPatients,
      totalDrivers,
      pendingApprovals,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const resetPatientAiUsage = async (req, res) => {
  try {
    if (!validateIdParam(req, res)) return;

    const patient = await User.findOne({ _id: req.params.id, role: "patient" });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const usage = await resetUsage(patient._id);

    res.status(200).json({
      message: "Patient AI usage reset successfully",
      usage: formatUsage(usage),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await User.find({
      role: { $in: ["doctor", "ambulance_driver"] },
    }).select("-password -otp -otpExpiry");
    const stats = {
      totalActive: subscriptions.filter(u => u.subscriptionStatus === "active").length,
      totalExpired: subscriptions.filter(u => u.subscriptionStatus === "expired").length,
      totalNone: subscriptions.filter(u => u.subscriptionStatus === "none").length,
    };
    res.status(200).json({ subscriptions, stats });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateSubscription = async (req, res) => {
  try {
    const { status, packageName, months } = req.body;
    if (!validateIdParam(req, res)) return;

    const finalMonths = months === undefined ? null : toNumber(months);
    if (!allowedSubscriptionStatuses.includes(status)) {
      return sendValidationError(res, ["Invalid subscription status."]);
    }
    if (finalMonths !== null && (finalMonths < 1 || finalMonths > 12)) {
      return sendValidationError(res, ["Subscription months must be between 1 and 12."]);
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const start = new Date();
    const end = new Date(start);
    if (finalMonths) end.setMonth(end.getMonth() + finalMonths);
    user.subscriptionStatus = status;
    if (packageName) user.packageName = trimString(packageName);
    if (finalMonths) {
      user.subscriptionStart = start;
      user.subscriptionEnd = end;
    }
    await user.save();
    res.status(200).json({ message: "Subscription updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patientId", "name email")
      .populate("doctorId", "name email specialization")
      .sort({ createdAt: -1 });
    res.status(200).json({ count: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    if (!validateIdParam(req, res)) return;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    appointment.appointmentStatus = "cancelled";
    await appointment.save();
    res.status(200).json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await Appointment.find({ paymentStatus: "paid" })
      .populate("patientId", "name email")
      .populate("doctorId", "name email specialization")
      .sort({ updatedAt: -1 });
    const totalRevenue = payments.reduce((sum, p) => sum + p.consultationFee, 0);
    res.status(200).json({ count: payments.length, totalRevenue, payments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ==========================================
// Edit User
// ==========================================
const editUser = async (req, res) => {
  try {
    const { name, email, city, specialization, experience, consultationFee, vehicleNumber, ambulanceType } = req.body;
    if (!validateIdParam(req, res)) return;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ message: "Cannot edit admin account" });

    const finalExperience = experience === undefined ? undefined : toNumber(experience);
    const finalFee = consultationFee === undefined ? undefined : toNumber(consultationFee);
    const finalEmail = email === undefined ? undefined : normalizeEmail(email);
    const errors = [];

    if (name !== undefined && trimString(name).length < 2) {
      errors.push("Name must be at least 2 characters.");
    }
    if (finalEmail !== undefined && !isValidEmail(finalEmail)) {
      errors.push("A valid email is required.");
    }
    if (finalExperience !== undefined && (finalExperience < 0 || finalExperience > 70)) {
      errors.push("Experience must be between 0 and 70 years.");
    }
    if (finalFee !== undefined && (finalFee < 0 || finalFee > 100000)) {
      errors.push("Consultation fee must be between 0 and 100000.");
    }
    if (errors.length) return sendValidationError(res, errors);

    if (finalEmail !== undefined && finalEmail !== user.email) {
      const emailOwner = await User.findOne({ email: finalEmail });
      if (emailOwner) {
        return res.status(400).json({ message: "Email already registered" });
      }
    }

    if (name !== undefined) {
      user.name = trimString(name);
      user.fullName = trimString(name);
    }
    if (finalEmail !== undefined) user.email = finalEmail;
    if (city !== undefined) user.city = trimString(city);
    if (specialization !== undefined) user.specialization = trimString(specialization);
    if (finalExperience !== undefined) user.experience = finalExperience;
    if (finalFee !== undefined) user.consultationFee = finalFee;
    if (vehicleNumber !== undefined) user.vehicleNumber = trimString(vehicleNumber);
    if (ambulanceType !== undefined) user.ambulanceType = trimString(ambulanceType);

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// Block / Unblock User
// ==========================================
const blockUnblockUser = async (req, res) => {
  try {
    if (!validateIdParam(req, res)) return;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ message: "Cannot block admin account" });

    if (user.status === "blocked") {
      user.status = "active";
      await user.save();
      return res.status(200).json({ message: `${user.name} has been unblocked` });
    } else {
      user.status = "blocked";
      await user.save();
      return res.status(200).json({ message: `${user.name} has been blocked` });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// Resend Temp Password
// ==========================================
const resendTempPassword = async (req, res) => {
  try {
    if (!validateIdParam(req, res)) return;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const tempPassword = Math.random().toString(36).slice(-8) + "@123";
    const emailResult = await sendTempPassword(user.email, user.name, tempPassword);
    if (!emailResult.sent) {
      return res.status(502).json({
        message: "Could not send temporary password email. Password was not changed.",
        error: emailResult.error,
      });
    }

    user.password = await bcrypt.hash(tempPassword, 10);
    user.isFirstLogin = true;
    await user.save();

    res.status(200).json({ message: `Temporary password sent to ${user.email}` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// Get Revenue Stats (monthly)
// ==========================================
const getRevenueStats = async (req, res) => {
  try {
    const payments = await Appointment.find({ paymentStatus: "paid" })
      .populate("doctorId", "name specialization");

    const monthlyRevenue = {};
    payments.forEach(p => {
      const month = new Date(p.updatedAt).toLocaleString("default", { month: "short", year: "numeric" });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + p.consultationFee;
    });

    const revenueChart = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    const registrationTrends = {};
    const users = await User.find({ role: { $ne: "admin" } });
    users.forEach(u => {
      const month = new Date(u.createdAt).toLocaleString("default", { month: "short", year: "numeric" });
      registrationTrends[month] = (registrationTrends[month] || 0) + 1;
    });

    const registrationChart = Object.entries(registrationTrends).map(([month, count]) => ({
      month,
      count,
    }));

    res.status(200).json({ revenueChart, registrationChart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// Get Doctor Ratings
// ==========================================
const getDoctorRatings = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("doctorId", "name specialization")
      .populate("driverId", "name fullName vehicleNumber ambulanceType")
      .populate("patientId", "name");

    const doctorRatings = {};
    reviews.forEach(r => {
      const id = r.doctorId?._id?.toString();
      if (!id) return;
      if (!doctorRatings[id]) {
        doctorRatings[id] = {
          doctor: r.doctorId,
          totalRating: 0,
          count: 0,
        };
      }
      doctorRatings[id].totalRating += r.rating;
      doctorRatings[id].count += 1;
    });

    const ratings = Object.values(doctorRatings).map(d => ({
      doctor: d.doctor,
      averageRating: (d.totalRating / d.count).toFixed(1),
      totalReviews: d.count,
    }));

    res.status(200).json({ ratings, reviews });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// Send Email to specific User
// ==========================================
const sendEmailToUser = async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!validateIdParam(req, res)) return;

    if (!trimString(subject) || !trimString(message)) {
      return sendValidationError(res, ["Subject and message are required."]);
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: trimString(subject),
      html: `
        <h2>Message from MediCore Admin</h2>
        <p>Dear ${user.name},</p>
        <p>${trimString(message)}</p>
        <br/>
        <p>Regards,<br/>MediCore Team</p>
      `,
    });

    res.status(200).json({ message: `Email sent to ${user.email}` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// Broadcast Email to all users or by role
// ==========================================
const broadcastEmail = async (req, res) => {
  try {
    const { subject, message, role } = req.body;

    if (!trimString(subject) || !trimString(message)) {
      return sendValidationError(res, ["Subject and message are required."]);
    }
    if (role && role !== "all" && !allowedRoles.includes(role)) {
      return sendValidationError(res, ["Invalid role filter."]);
    }

    let filter = { role: { $ne: "admin" } };
    if (role && role !== "all") filter.role = role;

    const users = await User.find(filter).select("email name");
    if (users.length === 0) return res.status(404).json({ message: "No users found" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    for (const user of users) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: trimString(subject),
        html: `
          <h2>Message from MediCore Admin</h2>
          <p>Dear ${user.name},</p>
          <p>${trimString(message)}</p>
          <br/>
          <p>Regards,<br/>MediCore Team</p>
        `,
      });
    }

    res.status(200).json({ message: `Email sent to ${users.length} users` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// Get Subscription Plans
// ==========================================
const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find();
    res.status(200).json({ plans });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// Update Subscription Plans
// ==========================================
const updateSubscriptionPlans = async (req, res) => {
  try {
    const { role, basicMonthly, basicYearly, professionalMonthly, professionalYearly, premiumMonthly, premiumYearly } = req.body;
    const planValues = {
      basicMonthly,
      basicYearly,
      professionalMonthly,
      professionalYearly,
      premiumMonthly,
      premiumYearly,
    };
    const errors = [];

    if (!["doctor", "ambulance_driver"].includes(role)) errors.push("Invalid plan role.");
    planFields.forEach((field) => {
      const value = toNumber(planValues[field]);
      if (value === null || value < 0) errors.push(`${field} must be a positive number.`);
      planValues[field] = value;
    });

    if (errors.length) return sendValidationError(res, errors);

    const plan = await SubscriptionPlan.findOneAndUpdate(
      { role },
      planValues,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ message: "Subscription plans updated successfully", plan });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// Change Admin Password
// ==========================================
const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !isStrongPassword(newPassword)) {
      return sendValidationError(res, [
        "Current password is required and new password must include at least 8 characters, a letter and a number.",
      ]);
    }

    const admin = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// Get All Reviews
// ==========================================
const getAllReviews = async (req, res) => {
  try {
    const doctorReviews = await Review.find()
      .populate("doctorId", "name specialization")
      .populate("patientId", "name email")
      .populate("appointmentId", "appointmentDate appointmentTime")
      .sort({ createdAt: -1 });
    const ambulanceReviews = await AmbulanceReview.find()
      .populate("driverId", "name fullName vehicleNumber ambulanceType")
      .populate("patientId", "name email")
      .populate("ambulanceJobId", "pickupLocation destination fare status")
      .sort({ createdAt: -1 });
    const reviews = [...doctorReviews, ...ambulanceReviews].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json({ count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// Delete Review
// ==========================================
const deleteReview = async (req, res) => {
  try {
    if (!validateIdParam(req, res)) return;

    const review = await Review.findById(req.params.id) || await AmbulanceReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.doctorId) {
      await Review.findByIdAndDelete(req.params.id);
    } else {
      await AmbulanceReview.findByIdAndDelete(req.params.id);
    }
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,
  deleteUser,
  getAdminStats,
  resetPatientAiUsage,
  getAllSubscriptions,
  updateSubscription,
  getAllAppointments,
  cancelAppointment,
  getAllPayments,
  editUser,
  blockUnblockUser,
  resendTempPassword,
  getRevenueStats,
  getDoctorRatings,
  sendEmailToUser,
  broadcastEmail,
  getSubscriptionPlans,
  updateSubscriptionPlans,
  changeAdminPassword,
  getAllReviews,
  deleteReview,
};
