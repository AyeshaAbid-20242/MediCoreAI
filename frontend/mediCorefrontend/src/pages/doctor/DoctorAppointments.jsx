import { useState } from "react";
import { getApiError } from "../../api/axios";
import { updateAppointmentStatus, updateAppointmentZoomLink } from "../../api/appointmentApi";
import { createAppointmentPrescription } from "../../api/doctorApi";

const groups = [
  ["requested", "New Requests"],
  ["accepted", "Accepted"],
  ["completed", "Completed"],
  ["closed", "Rejected / Cancelled"],
];

const getAppointmentStart = (appointment) => {
  if (!appointment?.appointmentDate || !appointment?.appointmentTime) return null;
  const datePart = new Date(appointment.appointmentDate).toISOString().slice(0, 10);
  const start = new Date(`${datePart}T${appointment.appointmentTime}:00`);

  return Number.isNaN(start.getTime()) ? null : start;
};

const canJoinAppointment = (appointment) => {
  const start = getAppointmentStart(appointment);
  if (!start) return false;

  const now = Date.now();
  return now >= start.getTime() - 10 * 60 * 1000 && now <= start.getTime() + 60 * 60 * 1000;
};

const getJoinHelpText = (appointment) => {
  const start = getAppointmentStart(appointment);
  if (!start) return "Meeting time is not set.";
  const opensAt = new Date(start.getTime() - 10 * 60 * 1000);

  if (Date.now() < opensAt.getTime()) {
    return `Join opens at ${opensAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`;
  }

  return "Meeting window has ended.";
};

const DoctorAppointments = ({ appointments, onRefresh, theme }) => {
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [links, setLinks] = useState({});
  const [zoomSuccess, setZoomSuccess] = useState({});
  const [prescriptionForms, setPrescriptionForms] = useState({});
  const [prescriptionSuccess, setPrescriptionSuccess] = useState({});

  const handleStatus = async (appointmentId, appointmentStatus) => {
    setSavingId(appointmentId);
    setError("");
    try {
      await updateAppointmentStatus(appointmentId, appointmentStatus);
      await onRefresh();
    } catch (err) {
      setError(getApiError(err, "Could not update appointment"));
    } finally {
      setSavingId("");
    }
  };

  const handleZoom = async (appointmentId) => {
    setSavingId(appointmentId);
    setError("");
    try {
      await updateAppointmentZoomLink(appointmentId, links[appointmentId] || "");
      setZoomSuccess((prev) => ({ ...prev, [appointmentId]: true }));
      setTimeout(() => setZoomSuccess((prev) => ({ ...prev, [appointmentId]: false })), 3000);
      await onRefresh();
    } catch (err) {
      setError(getApiError(err, "Could not update meeting link"));
    } finally {
      setSavingId("");
    }
  };

  const updatePrescriptionForm = (appointmentId, field, value) => {
    setPrescriptionForms((current) => ({
      ...current,
      [appointmentId]: {
        medicine: "",
        dosage: "",
        schedule: "",
        duration: "",
        instructions: "",
        ...(current[appointmentId] || {}),
        [field]: value,
      },
    }));
  };

  const handlePrescription = async (appointmentId) => {
    const form = prescriptionForms[appointmentId] || {};
    setSavingId(appointmentId);
    setError("");

    try {
      await createAppointmentPrescription(appointmentId, form);
      setPrescriptionForms((current) => ({
        ...current,
        [appointmentId]: {
          medicine: "",
          dosage: "",
          schedule: "",
          duration: "",
          instructions: "",
        },
      }));
      setPrescriptionSuccess((current) => ({ ...current, [appointmentId]: true }));
      setTimeout(() => {
        setPrescriptionSuccess((current) => ({ ...current, [appointmentId]: false }));
      }, 3000);
    } catch (err) {
      setError(getApiError(err, "Could not create prescription"));
    } finally {
      setSavingId("");
    }
  };

  const getGroupItems = (key) => {
    if (key === "closed") {
      return appointments.filter((item) => ["rejected", "cancelled"].includes(item.appointmentStatus));
    }
    return appointments.filter((item) => item.appointmentStatus === key);
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm font-bold text-[#991B1B]">
          {error}
        </div>
      )}

      {groups.map(([key, title]) => (
        <section
          key={key}
          className={`rounded-lg border ${theme.border} ${theme.panel} p-4 shadow-[0_14px_34px_rgba(10,22,40,0.06)]`}
        >
          <h2 className={`text-base font-black ${theme.text}`}>{title}</h2>
          <div className="mt-3 grid gap-3 xl:grid-cols-2">
            {getGroupItems(key).map((appointment) => (
              <article
                key={appointment._id}
                className={`rounded-lg border ${theme.border} ${theme.panelMuted} p-3`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className={`text-sm font-black ${theme.text}`}>
                      {appointment.patientId?.fullName || appointment.patientId?.name || "Patient"}
                    </p>
                    <p className={`text-xs font-semibold ${theme.subtext}`}>
                      {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                    </p>
                  </div>
                  <span className={`rounded-md ${theme.panel} px-2 py-1 text-[11px] font-black ${theme.text}`}>
                    {appointment.paymentStatus}
                  </span>
                </div>

                {/* Notes */}
                <p className={`mt-2 text-sm ${theme.subtext}`}>
                  {appointment.patientNotes || "No notes provided."}
                </p>

                {/* Status Actions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {appointment.appointmentStatus === "requested" && (
                    <>
                      <button
                        disabled={savingId === appointment._id}
                        onClick={() => handleStatus(appointment._id, "accepted")}
                        className="h-8 rounded-lg bg-[#059669] px-3 text-xs font-black text-white transition hover:bg-[#047857] disabled:opacity-60"
                      >
                        Accept
                      </button>
                      <button
                        disabled={savingId === appointment._id}
                        onClick={() => handleStatus(appointment._id, "rejected")}
                        className="h-8 rounded-lg bg-[#C8102E] px-3 text-xs font-black text-white transition hover:bg-[#a50d25] disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {appointment.appointmentStatus === "accepted" && (
                    <button
                      disabled={savingId === appointment._id}
                      onClick={() => handleStatus(appointment._id, "completed")}
                      className={`h-8 rounded-lg border ${theme.border} px-3 text-xs font-black ${theme.subtext} transition hover:border-[#059669] hover:text-[#059669] disabled:opacity-60`}
                    >
                      Mark Completed
                    </button>
                  )}
                </div>

                {/* Meeting Link Section */}
                <div className={`mt-3 rounded-lg border ${theme.border} p-3 space-y-2`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-[11px] font-black uppercase tracking-wider ${theme.subtext}`}>
                      Meeting Link
                    </p>
                    {appointment.appointmentStatus === "requested" && (
                      <span className={`text-[11px] font-bold ${theme.subtext}`}>
                        Jitsi link auto-generates on accept
                      </span>
                    )}
                    {appointment.zoomLink && (
                      canJoinAppointment(appointment) ? (
                        <a
                          href={appointment.zoomLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-black text-[#0891B2] hover:underline"
                        >
                          Join Meeting
                        </a>
                      ) : (
                        <span className={`text-[11px] font-bold ${theme.subtext}`} title={getJoinHelpText(appointment)}>
                          {getJoinHelpText(appointment)}
                        </span>
                      )
                    )}
                  </div>

                  {/* Success message */}
                  {zoomSuccess[appointment._id] && (
                    <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-xs font-black text-[#166534]">
                      Meeting link saved and email sent to patient
                    </div>
                  )}

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      value={links[appointment._id] ?? appointment.zoomLink ?? ""}
                      onChange={(e) => setLinks({ ...links, [appointment._id]: e.target.value })}
                      placeholder="Auto Jitsi link, or paste custom meeting link"
                      className={`h-9 min-w-0 flex-1 rounded-lg border ${theme.border} ${theme.panel} px-3 text-xs ${theme.text} outline-none focus:border-[#0891B2]`}
                    />
                    <button
                      disabled={savingId === appointment._id}
                      onClick={() => handleZoom(appointment._id)}
                      className="h-9 rounded-lg bg-[#0891B2] px-4 text-xs font-black text-white transition hover:bg-[#0770a0] disabled:opacity-60"
                    >
                      {savingId === appointment._id ? "Saving..." : "Send Link"}
                    </button>
                  </div>

                  {/* Existing link preview */}
                  {appointment.zoomLink && (
                    <p className={`truncate text-xs font-medium ${theme.subtext}`}>
                      {appointment.zoomLink}
                    </p>
                  )}
                </div>

                {["accepted", "completed"].includes(appointment.appointmentStatus) && (
                  <div className={`mt-3 rounded-lg border ${theme.border} p-3 space-y-3`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className={`text-[11px] font-black uppercase tracking-wider ${theme.subtext}`}>
                        Prescription
                      </p>
                      <span className={`text-[11px] font-bold ${theme.subtext}`}>
                        Visible in patient prescriptions
                      </span>
                    </div>

                    {prescriptionSuccess[appointment._id] && (
                      <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-xs font-black text-[#166534]">
                        Prescription saved for patient
                      </div>
                    )}

                    <div className="grid gap-2 md:grid-cols-2">
                      <input
                        value={prescriptionForms[appointment._id]?.medicine || ""}
                        onChange={(event) => updatePrescriptionForm(appointment._id, "medicine", event.target.value)}
                        placeholder="Medicine name"
                        className={`h-9 rounded-lg border ${theme.border} ${theme.panel} px-3 text-xs ${theme.text} outline-none focus:border-[#0891B2]`}
                      />
                      <input
                        value={prescriptionForms[appointment._id]?.dosage || ""}
                        onChange={(event) => updatePrescriptionForm(appointment._id, "dosage", event.target.value)}
                        placeholder="Dosage e.g. 500mg"
                        className={`h-9 rounded-lg border ${theme.border} ${theme.panel} px-3 text-xs ${theme.text} outline-none focus:border-[#0891B2]`}
                      />
                      <input
                        value={prescriptionForms[appointment._id]?.schedule || ""}
                        onChange={(event) => updatePrescriptionForm(appointment._id, "schedule", event.target.value)}
                        placeholder="Schedule e.g. twice daily after meal"
                        className={`h-9 rounded-lg border ${theme.border} ${theme.panel} px-3 text-xs ${theme.text} outline-none focus:border-[#0891B2] md:col-span-2`}
                      />
                      <input
                        value={prescriptionForms[appointment._id]?.duration || ""}
                        onChange={(event) => updatePrescriptionForm(appointment._id, "duration", event.target.value)}
                        placeholder="Duration e.g. 5 days"
                        className={`h-9 rounded-lg border ${theme.border} ${theme.panel} px-3 text-xs ${theme.text} outline-none focus:border-[#0891B2]`}
                      />
                      <input
                        value={prescriptionForms[appointment._id]?.instructions || ""}
                        onChange={(event) => updatePrescriptionForm(appointment._id, "instructions", event.target.value)}
                        placeholder="Instructions"
                        className={`h-9 rounded-lg border ${theme.border} ${theme.panel} px-3 text-xs ${theme.text} outline-none focus:border-[#0891B2]`}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        disabled={savingId === appointment._id}
                        onClick={() => handlePrescription(appointment._id)}
                        className="h-9 rounded-lg bg-[#C8102E] px-4 text-xs font-black text-white transition hover:bg-[#a50d25] disabled:opacity-60"
                      >
                        {savingId === appointment._id ? "Saving..." : "Add Prescription"}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
            {!getGroupItems(key).length && (
              <p className={`text-sm font-semibold ${theme.subtext}`}>
                No appointments in this section.
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
};

export default DoctorAppointments;
