import Appointment from "../models/Appointment.js";
import User from "../models/user.js";
import {
  isFutureDate,
  isValidObjectId,
  sendValidationError,
  timeRegex,
  trimString,
  urlRegex,
} from "../helper/validators.js";
import { sendZoomLinkEmail } from "../helper/emailHelper.js";

const activeDoctorStatus = ["approved", "active"];
const openAppointmentStatuses = ["requested", "accepted"];
const bookedAppointmentStatuses = ["requested", "accepted"];

const createJitsiMeetingLink = (appointment) => {
  const id = appointment._id.toString();
  const datePart = new Date(appointment.appointmentDate)
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 8);

  return `https://meet.jit.si/medicore-${datePart}-${id.slice(-8)}-${randomPart}`;
};

const populateAppointment = (query) =>
  query
    .populate("patientId", "name fullName email")
    .populate("doctorId", "name fullName email specialization consultationFee availableTimeSlots availableDays");

const getDayRange = (dateValue) => {
  const start = new Date(dateValue);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
};

const getDayName = (dateValue) =>
  new Date(dateValue).toLocaleDateString("en-US", { weekday: "long" });

const ensureAcceptedMeetingLinks = async (appointments) => {
  const items = Array.isArray(appointments) ? appointments : [appointments];
  const updates = items
    .filter((appointment) =>
      appointment &&
      appointment.appointmentStatus === "accepted" &&
      appointment.paymentStatus === "paid" &&
      !appointment.zoomLink
    )
    .map(async (appointment) => {
      appointment.zoomLink = createJitsiMeetingLink(appointment);
      await appointment.save();
      return appointment;
    });

  if (updates.length) await Promise.all(updates);
  return appointments;
};

const requestAppointment = async (req, res) => {
  try {
    const { doctorId, patientNotes, appointmentDate, appointmentTime } = req.body;
    const finalTime = trimString(appointmentTime);
    const finalNotes = trimString(patientNotes) || "";
    const errors = [];

    if (!isValidObjectId(doctorId)) errors.push("Valid doctor is required.");
    if (!isFutureDate(appointmentDate)) errors.push("Appointment date must be today or later.");
    if (!timeRegex.test(finalTime || "")) errors.push("Appointment time must use HH:mm format.");
    if (finalNotes.length > 1000) errors.push("Patient notes cannot exceed 1000 characters.");

    if (errors.length) return sendValidationError(res, errors);

    const doctor = await User.findOne({
      _id: doctorId,
      role: "doctor",
      status: { $in: activeDoctorStatus },
      subscriptionStatus: "active",
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor is not available for public appointments.",
      });
    }

    if (
      Array.isArray(doctor.availableDays) &&
      doctor.availableDays.length &&
      !doctor.availableDays.includes(getDayName(appointmentDate))
    ) {
      return res.status(400).json({
        message: "Doctor is not available on this date.",
      });
    }

    if (
      Array.isArray(doctor.availableTimeSlots) &&
      doctor.availableTimeSlots.length &&
      !doctor.availableTimeSlots.includes(finalTime)
    ) {
      return res.status(400).json({
        message: "This time is not in the doctor's available schedule.",
      });
    }

    const existingOpenAppointment = await populateAppointment(
      Appointment.findOne({
        patientId: req.user._id,
        doctorId,
        appointmentStatus: { $in: openAppointmentStatuses },
        paymentStatus: { $in: ["pending", "paid"] },
      }).sort({ createdAt: -1 })
    );

    if (existingOpenAppointment) {
      return res.status(200).json({
        message:
          existingOpenAppointment.paymentStatus === "paid"
            ? "You already have a paid open appointment with this doctor."
            : "You already requested this doctor. Please complete payment instead of creating another request.",
        appointment: existingOpenAppointment,
        alreadyExists: true,
      });
    }

    const { start, end } = getDayRange(appointmentDate);
    const existingSlot = await Appointment.findOne({
      doctorId,
      appointmentDate: { $gte: start, $lt: end },
      appointmentTime: finalTime,
      appointmentStatus: { $in: bookedAppointmentStatuses },
    });

    if (existingSlot) {
      return res.status(409).json({ message: "This appointment slot is already booked." });
    }

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      consultationFee: doctor.consultationFee || 0,
      patientNotes: finalNotes,
      appointmentDate,
      appointmentTime: finalTime,
    });

    const populatedAppointment = await populateAppointment(
      Appointment.findById(appointment._id)
    );

    res.status(201).json({
      message: "Appointment requested. Please complete payment to confirm.",
      appointment: populatedAppointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const payAppointment = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return sendValidationError(res, ["Valid appointment id is required."]);
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    appointment.paymentStatus = "paid";
    await appointment.save();

    const populatedAppointment = await populateAppointment(
      Appointment.findById(appointment._id)
    );

    res.status(200).json({
      message: "Payment marked as paid. Gateway integration can be added later.",
      appointment: populatedAppointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await ensureAcceptedMeetingLinks(await populateAppointment(
      Appointment.find({ patientId: req.user._id }).sort({ createdAt: -1 })
    ));

    res.status(200).json({
      message: "Patient appointments fetched successfully",
      appointments,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await ensureAcceptedMeetingLinks(await populateAppointment(
      Appointment.find({ doctorId: req.user._id }).sort({ createdAt: -1 })
    ));

    res.status(200).json({
      message: "Doctor appointments fetched successfully",
      appointments,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!isValidObjectId(doctorId)) {
      return sendValidationError(res, ["Valid doctor is required."]);
    }

    if (!isFutureDate(date)) {
      return sendValidationError(res, ["Date must be today or later."]);
    }

    const doctor = await User.findOne({
      _id: doctorId,
      role: "doctor",
      status: { $in: activeDoctorStatus },
      subscriptionStatus: "active",
    }).select("availableDays availableTimeSlots");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor is not available." });
    }

    const { start, end } = getDayRange(date);
    const appointments = await Appointment.find({
      doctorId,
      appointmentDate: { $gte: start, $lt: end },
      appointmentStatus: { $in: bookedAppointmentStatuses },
    }).select("appointmentTime appointmentStatus paymentStatus");

    const bookedTimes = appointments.map((appointment) => appointment.appointmentTime);
    const configuredSlots = doctor.availableTimeSlots || [];
    const availableDay =
      !doctor.availableDays?.length || doctor.availableDays.includes(getDayName(date));

    res.status(200).json({
      message: "Doctor availability fetched successfully",
      date,
      bookedTimes,
      availableTimeSlots: availableDay
        ? configuredSlots.filter((slot) => !bookedTimes.includes(slot))
        : [],
      allTimeSlots: configuredSlots,
      availableDay,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentStatus } = req.body;
    const allowedStatuses = ["accepted", "rejected", "completed", "cancelled"];

    if (!isValidObjectId(req.params.id)) {
      return sendValidationError(res, ["Valid appointment id is required."]);
    }

    if (!allowedStatuses.includes(appointmentStatus)) {
      return res.status(400).json({ message: "Invalid appointment status." });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    if (appointmentStatus === "accepted" && appointment.paymentStatus !== "paid") {
      return res.status(400).json({
        message: "Patient payment must be paid before accepting appointment.",
      });
    }

    appointment.appointmentStatus = appointmentStatus;
    if (appointmentStatus === "accepted" && !appointment.zoomLink) {
      appointment.zoomLink = createJitsiMeetingLink(appointment);
    }
    await appointment.save();

    const populatedAppointment = await populateAppointment(
      Appointment.findById(appointment._id)
    );

    if (appointmentStatus === "accepted" && appointment.zoomLink) {
      const patient = populatedAppointment.patientId;
      const doctor = populatedAppointment.doctorId;
      await sendZoomLinkEmail(
        patient.email,
        patient.fullName || patient.name,
        doctor.fullName || doctor.name,
        new Date(appointment.appointmentDate).toLocaleDateString(),
        appointment.appointmentTime,
        appointment.zoomLink
      );
    }

    res.status(200).json({
      message:
        appointmentStatus === "accepted"
          ? "Appointment accepted and Jitsi meeting link generated."
          : "Appointment status updated successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateZoomLink = async (req, res) => {
  try {
    const { zoomLink } = req.body;
    const finalZoomLink = trimString(zoomLink) || "";

    if (!isValidObjectId(req.params.id)) {
      return sendValidationError(res, ["Valid appointment id is required."]);
    }

    if (finalZoomLink && !urlRegex.test(finalZoomLink)) {
      return sendValidationError(res, ["Meeting link must be a valid URL."]);
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    appointment.zoomLink = finalZoomLink;
    await appointment.save();

    const populatedAppointment = await populateAppointment(
      Appointment.findById(appointment._id)
    );

    if (finalZoomLink) {
      const patient = populatedAppointment.patientId;
      const doctor = populatedAppointment.doctorId;
      await sendZoomLinkEmail(
        patient.email,
        patient.fullName || patient.name,
        doctor.fullName || doctor.name,
        new Date(appointment.appointmentDate).toLocaleDateString(),
        appointment.appointmentTime,
        finalZoomLink
      );
    }

    res.status(200).json({
      message: "Meeting link updated and email sent to patient",
      appointment: populatedAppointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  getDoctorAppointments,
  getDoctorAvailability,
  getPatientAppointments,
  payAppointment,
  requestAppointment,
  updateAppointmentStatus,
  updateZoomLink,
};
