import Appointment from "../models/Appointment.js";
import User from "../models/user.js";

const activeDoctorStatus = ["approved", "active"];

const populateAppointment = (query) =>
  query
    .populate("patientId", "name fullName email")
    .populate("doctorId", "name fullName email specialization consultationFee");

const requestAppointment = async (req, res) => {
  try {
    const { doctorId, patientNotes, appointmentDate, appointmentTime } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        message: "Doctor, appointment date and appointment time are required.",
      });
    }

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

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      consultationFee: doctor.consultationFee || 0,
      patientNotes: patientNotes || "",
      appointmentDate,
      appointmentTime,
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
    const appointments = await populateAppointment(
      Appointment.find({ patientId: req.user._id }).sort({ createdAt: -1 })
    );

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
    const appointments = await populateAppointment(
      Appointment.find({ doctorId: req.user._id }).sort({ createdAt: -1 })
    );

    res.status(200).json({
      message: "Doctor appointments fetched successfully",
      appointments,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentStatus } = req.body;
    const allowedStatuses = ["accepted", "rejected", "completed", "cancelled"];

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
    await appointment.save();

    const populatedAppointment = await populateAppointment(
      Appointment.findById(appointment._id)
    );

    res.status(200).json({
      message: "Appointment status updated successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateZoomLink = async (req, res) => {
  try {
    const { zoomLink } = req.body;
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    appointment.zoomLink = zoomLink || "";
    await appointment.save();

    const populatedAppointment = await populateAppointment(
      Appointment.findById(appointment._id)
    );

    res.status(200).json({
      message: "Meeting link updated successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  getDoctorAppointments,
  getPatientAppointments,
  payAppointment,
  requestAppointment,
  updateAppointmentStatus,
  updateZoomLink,
};
