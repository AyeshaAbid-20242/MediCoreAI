import { useState } from "react";
import { getApiError } from "../../api/axios";
import { updateAppointmentStatus, updateAppointmentZoomLink } from "../../api/appointmentApi";

const groups = [
  ["requested", "New Requests"],
  ["accepted", "Accepted"],
  ["completed", "Completed"],
  ["closed", "Rejected / Cancelled"],
];

const DoctorAppointments = ({ appointments, onRefresh, theme }) => {
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [links, setLinks] = useState({});

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
      await onRefresh();
    } catch (err) {
      setError(getApiError(err, "Could not update meeting link"));
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
      {error && <div className="rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm font-bold text-[#991B1B]">{error}</div>}
      {groups.map(([key, title]) => (
        <section key={key} className={`rounded-lg border ${theme.border} ${theme.panel} p-4 shadow-[0_14px_34px_rgba(10,22,40,0.06)]`}>
          <h2 className={`text-base font-black ${theme.text}`}>{title}</h2>
          <div className="mt-3 grid gap-3 xl:grid-cols-2">
            {getGroupItems(key).map((appointment) => (
              <article key={appointment._id} className={`rounded-lg border ${theme.border} ${theme.panelMuted} p-3`}>
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
                <p className={`mt-2 text-sm ${theme.subtext}`}>{appointment.patientNotes || "No notes provided."}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {appointment.appointmentStatus === "requested" && (
                    <>
                      <button disabled={savingId === appointment._id} onClick={() => handleStatus(appointment._id, "accepted")} className="h-8 rounded-lg bg-[#059669] px-3 text-xs font-black text-white">
                        Accept
                      </button>
                      <button disabled={savingId === appointment._id} onClick={() => handleStatus(appointment._id, "rejected")} className="h-8 rounded-lg bg-[#C8102E] px-3 text-xs font-black text-white">
                        Reject
                      </button>
                    </>
                  )}
                  {appointment.appointmentStatus === "accepted" && (
                    <button disabled={savingId === appointment._id} onClick={() => handleStatus(appointment._id, "completed")} className="h-8 rounded-lg bg-[#0A1628] px-3 text-xs font-black text-white">
                      Mark Completed
                    </button>
                  )}
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={links[appointment._id] ?? appointment.zoomLink ?? ""}
                    onChange={(event) => setLinks({ ...links, [appointment._id]: event.target.value })}
                    placeholder="Paste Zoom / Google Meet link"
                    className={`h-9 min-w-0 flex-1 rounded-lg border ${theme.border} ${theme.panel} px-3 text-xs ${theme.text} outline-none focus:border-[#C8102E]`}
                  />
                  <button disabled={savingId === appointment._id} onClick={() => handleZoom(appointment._id)} className="h-9 rounded-lg bg-[#0891B2] px-3 text-xs font-black text-white">
                    Save Link
                  </button>
                </div>
              </article>
            ))}
            {!getGroupItems(key).length && <p className={`text-sm font-semibold ${theme.subtext}`}>No appointments in this section.</p>}
          </div>
        </section>
      ))}
    </div>
  );
};

export default DoctorAppointments;
