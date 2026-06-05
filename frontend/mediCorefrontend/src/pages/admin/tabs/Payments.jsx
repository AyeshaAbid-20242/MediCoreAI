import { motion } from "framer-motion";
import { useState } from "react";

const money = (amount = 0) => `Rs. ${Number(amount).toLocaleString()}`;

const Payments = ({ payments, totalRevenue, onExport, theme }) => {
  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;
  const softClass = `rounded-lg border ${theme.border} ${theme.panelMuted}`;
  const inputClass = `h-9 rounded-lg border ${theme.border} ${theme.panel} px-3 text-sm font-medium ${theme.text} focus:outline-none focus:border-[#C8102E]`;

  const [dateFilter, setDateFilter] = useState("");

  const filtered = payments.filter(p => {
    if (!dateFilter) return true;
    return new Date(p.updatedAt).toLocaleDateString() === new Date(dateFilter).toLocaleDateString();
  });

  const filteredRevenue = filtered.reduce((sum, p) => sum + p.consultationFee, 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className={`text-xl font-black tracking-tight ${theme.text}`}>Payments</h2>
        <p className={`mt-0.5 text-sm font-medium ${theme.subtext}`}>Revenue and payment history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: money(totalRevenue), color: "bg-[#DCFCE7] text-[#166534]" },
          { label: "Total Payments", value: payments.length, color: "bg-[#DBEAFE] text-[#1E40AF]" },
          { label: "Avg Payment", value: money(payments.length ? Math.round(totalRevenue / payments.length) : 0), color: "bg-[#F3E8FF] text-[#6B21A8]" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`${cardClass} p-5`}
          >
            <div className={`mb-3 inline-flex rounded-lg px-2 py-1 text-[10px] font-black ${stat.color}`}>
              {stat.label.toUpperCase()}
            </div>
            <p className={`text-2xl font-black ${theme.text}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className={`${cardClass} overflow-hidden`}>
        <div className={`flex items-center justify-between border-b ${theme.border} px-5 py-4`}>
          <div>
            <h3 className={`font-black ${theme.text}`}>Payment History</h3>
            <p className={`text-xs font-medium ${theme.subtext}`}>{filtered.length} payments — {money(filteredRevenue)}</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className={inputClass} />
            {dateFilter && (
              <button onClick={() => setDateFilter("")} className={`text-xs font-black ${theme.subtext} hover:text-[#C8102E]`}>Clear</button>
            )}
            <button
              onClick={onExport}
              className="h-9 rounded-lg bg-[#059669] px-4 text-sm font-black text-white transition hover:bg-[#047857]"
            >
              Export CSV
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-16 text-center">
  <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border ${theme.border} ${theme.panelMuted}`}>
    <svg className={`h-8 w-8 ${theme.subtext}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  </div>
  <p className={`font-black text-lg ${theme.text}`}>No payments found</p>
  <p className={`text-sm font-medium ${theme.subtext} mt-1`}>Payments will appear here once recorded</p>
</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme.border}`}>
                  {["Patient", "Doctor", "Specialization", "Amount", "Date", "Status"].map((h) => (
                    <th key={h} className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider ${theme.subtext}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <motion.tr
                    key={p._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={`border-b ${theme.border}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F3E8FF] text-xs font-black text-[#6B21A8]">
                          {p.patientId?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-sm font-black ${theme.text}`}>{p.patientId?.name || "N/A"}</p>
                          <p className={`text-xs font-medium ${theme.subtext}`}>{p.patientId?.email || ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-sm font-black ${theme.text}`}>{p.doctorId?.name || "N/A"}</p>
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold ${theme.subtext}`}>{p.doctorId?.specialization || "N/A"}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-black text-[#059669]">{money(p.consultationFee)}</span>
                    </td>
                    <td className={`px-4 py-3 text-xs font-semibold ${theme.subtext}`}>
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-[#DCFCE7] px-2 py-1 text-[10px] font-black text-[#166534]">PAID</span>
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

export default Payments;