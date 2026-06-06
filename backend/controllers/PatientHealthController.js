import MedicalRecord from "../models/MedicalRecord.js";
import PatientVital from "../models/PatientVital.js";
import Prescription from "../models/Prescription.js";
import { isValidDate, isValidObjectId, sendValidationError, toNumber, trimString } from "../helper/validators.js";

const populateCareTeam = (query) =>
  query.populate("doctorId", "name fullName specialization email");

const parseDate = (value, fallback = new Date()) => {
  if (!value) return fallback;
  return isValidDate(value) ? new Date(value) : null;
};

const requireValidPatientResourceId = (res, id) => {
  if (isValidObjectId(id)) return true;
  sendValidationError(res, ["Invalid resource id."]);
  return false;
};

const getPatientHealthSummary = async (req, res) => {
  try {
    const patientId = req.user._id;
    const [vitals, medicalRecords, prescriptions] = await Promise.all([
      PatientVital.find({ patientId }).sort({ measuredAt: -1 }).limit(14),
      populateCareTeam(MedicalRecord.find({ patientId }).sort({ recordDate: -1 }).limit(10)),
      populateCareTeam(Prescription.find({ patientId }).sort({ prescribedAt: -1 }).limit(10)),
    ]);

    const vitalsTrend = [...vitals]
      .reverse()
      .map((vital) => ({
        day: vital.measuredAt.toLocaleDateString("en-US", { weekday: "short" }),
        heart: vital.heartRate,
        oxygen: vital.oxygenSaturation,
        temp: vital.temperatureCelsius,
        measuredAt: vital.measuredAt,
      }));

    const latestVital = vitals[0] || null;
    const departmentCounts = medicalRecords.reduce((counts, record) => {
      const department = record.department || "General";
      counts[department] = (counts[department] || 0) + 1;
      return counts;
    }, {});

    const departmentMix = Object.entries(departmentCounts).map(([name, value]) => ({
      name,
      value,
    }));

    res.status(200).json({
      message: "Patient health summary fetched successfully",
      latestVital,
      vitalsTrend,
      medicalRecords,
      prescriptions,
      departmentMix,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPatientVitals = async (req, res) => {
  try {
    const vitals = await PatientVital.find({ patientId: req.user._id }).sort({ measuredAt: -1 });
    res.status(200).json({ message: "Vitals fetched successfully", vitals });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createPatientVital = async (req, res) => {
  try {
    const measuredAt = parseDate(req.body.measuredAt);
    if (!measuredAt) return sendValidationError(res, ["Measured date is invalid."]);

    const vital = await PatientVital.create({
      patientId: req.user._id,
      heartRate: toNumber(req.body.heartRate),
      bloodPressureSystolic: toNumber(req.body.bloodPressureSystolic),
      bloodPressureDiastolic: toNumber(req.body.bloodPressureDiastolic),
      oxygenSaturation: toNumber(req.body.oxygenSaturation),
      temperatureCelsius: toNumber(req.body.temperatureCelsius),
      notes: trimString(req.body.notes) || "",
      measuredAt,
    });

    res.status(201).json({ message: "Vital record created successfully", vital });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updatePatientVital = async (req, res) => {
  try {
    if (!requireValidPatientResourceId(res, req.params.id)) return;

    const updates = {};
    ["heartRate", "bloodPressureSystolic", "bloodPressureDiastolic", "oxygenSaturation", "temperatureCelsius"].forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = toNumber(req.body[field]);
    });
    if (req.body.notes !== undefined) updates.notes = trimString(req.body.notes) || "";
    if (req.body.measuredAt !== undefined) {
      const measuredAt = parseDate(req.body.measuredAt);
      if (!measuredAt) return sendValidationError(res, ["Measured date is invalid."]);
      updates.measuredAt = measuredAt;
    }

    const vital = await PatientVital.findOneAndUpdate(
      { _id: req.params.id, patientId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!vital) return res.status(404).json({ message: "Vital record not found." });
    res.status(200).json({ message: "Vital record updated successfully", vital });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deletePatientVital = async (req, res) => {
  try {
    if (!requireValidPatientResourceId(res, req.params.id)) return;
    const vital = await PatientVital.findOneAndDelete({ _id: req.params.id, patientId: req.user._id });
    if (!vital) return res.status(404).json({ message: "Vital record not found." });
    res.status(200).json({ message: "Vital record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await populateCareTeam(
      Prescription.find({ patientId: req.user._id }).sort({ prescribedAt: -1 })
    );
    res.status(200).json({ message: "Prescriptions fetched successfully", prescriptions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createPrescription = async (req, res) => {
  try {
    const medicine = trimString(req.body.medicine);
    const schedule = trimString(req.body.schedule);
    const prescribedAt = parseDate(req.body.prescribedAt);

    if (!medicine || !schedule) return sendValidationError(res, ["Medicine and schedule are required."]);
    if (!prescribedAt) return sendValidationError(res, ["Prescription date is invalid."]);

    const prescription = await Prescription.create({
      patientId: req.user._id,
      medicine,
      dosage: trimString(req.body.dosage) || "",
      schedule,
      duration: trimString(req.body.duration) || "",
      instructions: trimString(req.body.instructions) || "",
      status: req.body.status || "active",
      prescribedAt,
    });

    res.status(201).json({ message: "Prescription created successfully", prescription });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updatePrescription = async (req, res) => {
  try {
    if (!requireValidPatientResourceId(res, req.params.id)) return;
    const updates = {};
    ["medicine", "dosage", "schedule", "duration", "instructions", "status"].forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = trimString(req.body[field]);
    });
    if (req.body.prescribedAt !== undefined) {
      const prescribedAt = parseDate(req.body.prescribedAt);
      if (!prescribedAt) return sendValidationError(res, ["Prescription date is invalid."]);
      updates.prescribedAt = prescribedAt;
    }

    const prescription = await populateCareTeam(
      Prescription.findOneAndUpdate(
        { _id: req.params.id, patientId: req.user._id },
        updates,
        { new: true, runValidators: true }
      )
    );

    if (!prescription) return res.status(404).json({ message: "Prescription not found." });
    res.status(200).json({ message: "Prescription updated successfully", prescription });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deletePrescription = async (req, res) => {
  try {
    if (!requireValidPatientResourceId(res, req.params.id)) return;
    const prescription = await Prescription.findOneAndDelete({ _id: req.params.id, patientId: req.user._id });
    if (!prescription) return res.status(404).json({ message: "Prescription not found." });
    res.status(200).json({ message: "Prescription deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMedicalRecords = async (req, res) => {
  try {
    const medicalRecords = await populateCareTeam(
      MedicalRecord.find({ patientId: req.user._id }).sort({ recordDate: -1 })
    );
    res.status(200).json({ message: "Medical records fetched successfully", medicalRecords });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createMedicalRecord = async (req, res) => {
  try {
    const title = trimString(req.body.title);
    const recordDate = parseDate(req.body.recordDate);

    if (!title) return sendValidationError(res, ["Record title is required."]);
    if (!recordDate) return sendValidationError(res, ["Record date is invalid."]);

    const medicalRecord = await MedicalRecord.create({
      patientId: req.user._id,
      title,
      recordType: req.body.recordType || "other",
      department: trimString(req.body.department) || "General",
      summary: trimString(req.body.summary) || "",
      attachmentUrl: trimString(req.body.attachmentUrl) || "",
      status: req.body.status || "completed",
      recordDate,
    });

    res.status(201).json({ message: "Medical record created successfully", medicalRecord });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateMedicalRecord = async (req, res) => {
  try {
    if (!requireValidPatientResourceId(res, req.params.id)) return;
    const updates = {};
    ["title", "recordType", "department", "summary", "attachmentUrl", "status"].forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = trimString(req.body[field]);
    });
    if (req.body.recordDate !== undefined) {
      const recordDate = parseDate(req.body.recordDate);
      if (!recordDate) return sendValidationError(res, ["Record date is invalid."]);
      updates.recordDate = recordDate;
    }

    const medicalRecord = await populateCareTeam(
      MedicalRecord.findOneAndUpdate(
        { _id: req.params.id, patientId: req.user._id },
        updates,
        { new: true, runValidators: true }
      )
    );

    if (!medicalRecord) return res.status(404).json({ message: "Medical record not found." });
    res.status(200).json({ message: "Medical record updated successfully", medicalRecord });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteMedicalRecord = async (req, res) => {
  try {
    if (!requireValidPatientResourceId(res, req.params.id)) return;
    const medicalRecord = await MedicalRecord.findOneAndDelete({ _id: req.params.id, patientId: req.user._id });
    if (!medicalRecord) return res.status(404).json({ message: "Medical record not found." });
    res.status(200).json({ message: "Medical record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  createMedicalRecord,
  createPatientVital,
  createPrescription,
  deleteMedicalRecord,
  deletePatientVital,
  deletePrescription,
  getMedicalRecords,
  getPatientHealthSummary,
  getPatientVitals,
  getPrescriptions,
  updateMedicalRecord,
  updatePatientVital,
  updatePrescription,
};
