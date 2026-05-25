import { motion } from "framer-motion";
import { useState } from "react";

const Appointments = ({ appointments, onCancel, theme }) => {
  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;
  const inputClass = `h-9 rounded-lg border ${theme.border} ${theme.panel} px-3 text-sm font-medium ${theme.text} focus:outline-none focus:border-[#C8102E]`;

  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  const filtered = appointments.filter(a => {
    const matchStatus = statusFilter ? a.appointmentStatus === statusFilter : true;
    const matchPayment = paymentFilter ? a.paymentStatus === paymentFilter : true;
    return matchStatus && matchPayment;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`text-xl font-black tracking-tight ${theme.text}`}>Appointments</h2>
          <p className={`mt-0.5 text-sm font-medium ${theme.subtext}`}>{filtered.length} of {appointments.length} appointments</p>
        </div>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
            <option value="">All Status</option>
            <option value="requested">Requested</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className={inputClass}>
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-5xl mb-4">📅</p>
            <p className={`font-black text-lg ${theme.text}`}>No appointments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme.border}`}>
                  {["Patient", "Doctor", "Date", "Fee", "Payment", "Status", "Actions"].map((h) => (
                    <th key={h} className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider ${theme.subtext}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <motion.tr
                    key={a._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={`border-b ${theme.border}`}
                  >
                    <td className="px-4 py-3">
                      <p className={`text-sm font-black ${theme.text}`}>{a.patientId?.name || "N/A"}</p>
                      <p className={`text-xs font-medium ${theme.subtext}`}>{a.patientId?.email || ""}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-sm font-black ${theme.text}`}>{a.doctorId?.name || "N/A"}</p>
                      <p className={`text-xs font-medium ${theme.subtext}`}>{a.doctorId?.specialization || ""}</p>
                    </td>
                    <td className={`px-4 py-3 text-xs font-semibold ${theme.subtext}`}>
                      {new Date(a.appointmentDate).toLocaleDateString()} {a.appointmentTime}
                    </td>
                    <td className={`px-4 py-3 text-sm font-black ${theme.text}`}>Rs. {a.consultationFee}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-1 text-[10px] font-black
                        ${a.paymentStatus === "paid" ? "bg-[#DCFCE7] text-[#166534]" :
                          a.paymentStatus === "pending" ? "bg-[#FEF9C3] text-[#854D0E]" :
                          a.paymentStatus === "refunded" ? "bg-[#DBEAFE] text-[#1E40AF]" :
                          "bg-[#FEE2E2] text-[#991B1B]"}`}>
                        {a.paymentStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-1 text-[10px] font-black
                        ${a.appointmentStatus === "completed" ? "bg-[#DCFCE7] text-[#166534]" :
                          a.appointmentStatus === "accepted" ? "bg-[#DBEAFE] text-[#1E40AF]" :
                          a.appointmentStatus === "requested" ? "bg-[#FEF9C3] text-[#854D0E]" :
                          "bg-[#FEE2E2] text-[#991B1B]"}`}>
                        {a.appointmentStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {a.appointmentStatus !== "cancelled" && a.appointmentStatus !== "completed" && (
                        <button
                          onClick={() => onCancel(a._id)}
                          className="h-8 rounded-lg border border-[#C8102E]/30 px-3 text-xs font-black text-[#C8102E] transition hover:bg-[#C8102E] hover:text-white"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;