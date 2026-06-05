import { motion } from "framer-motion";
import { useState } from "react";

const Subscriptions = ({ subscriptions, onUpdate, theme }) => {
  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;
  const softClass = `rounded-lg border ${theme.border} ${theme.panelMuted}`;
  const inputClass = `h-10 w-full rounded-lg border ${theme.border} ${theme.panelMuted} px-3 text-sm font-medium ${theme.text} focus:outline-none focus:border-[#C8102E]`;

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ status: "active", packageName: "Professional", months: 1 });

  const handleEdit = (u) => {
    setModal(u);
    setForm({ status: u.subscriptionStatus, packageName: u.packageName || "Professional", months: 1 });
  };

  const handleSave = async () => {
    await onUpdate(modal._id, form);
    setModal(null);
  };

  const activeCount = subscriptions.filter(s => s.subscriptionStatus === "active").length;
  const expiredCount = subscriptions.filter(s => s.subscriptionStatus === "expired").length;
  const noneCount = subscriptions.filter(s => s.subscriptionStatus === "none").length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className={`text-xl font-black tracking-tight ${theme.text}`}>Subscriptions</h2>
        <p className={`mt-0.5 text-sm font-medium ${theme.subtext}`}>Manage doctor and driver subscriptions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active", value: activeCount, color: "bg-[#DCFCE7] text-[#166534]" },
          { label: "Expired", value: expiredCount, color: "bg-[#FEE2E2] text-[#991B1B]" },
          { label: "No Subscription", value: noneCount, color: "bg-[#FEF9C3] text-[#854D0E]" },
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
            <p className={`text-3xl font-black ${theme.text}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className={`${cardClass} overflow-hidden`}>
        {subscriptions.length === 0 ? (
          <div className="p-16 text-center">
  <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border ${theme.border} ${theme.panelMuted}`}>
    <svg className={`h-8 w-8 ${theme.subtext}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  </div>
  <p className={`font-black text-lg ${theme.text}`}>No subscriptions yet</p>
  <p className={`text-sm font-medium mt-1 ${theme.subtext}`}>Subscriptions will appear here once activated</p>
</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme.border}`}>
                  {["User", "Role", "Package", "Status", "Start", "End", "Actions"].map((h) => (
                    <th key={h} className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider ${theme.subtext}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((u, i) => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={`border-b ${theme.border}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C8102E]/10 text-sm font-black text-[#C8102E]">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-sm font-black ${theme.text}`}>{u.name}</p>
                          <p className={`text-xs font-medium ${theme.subtext}`}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-1 text-[10px] font-black
                        ${u.role === "doctor" ? "bg-[#DBEAFE] text-[#1E40AF]" : "bg-[#FEF9C3] text-[#854D0E]"}`}>
                        {u.role === "doctor" ? "DOCTOR" : "DRIVER"}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold ${theme.text}`}>{u.packageName || "N/A"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-1 text-[10px] font-black
                        ${u.subscriptionStatus === "active" ? "bg-[#DCFCE7] text-[#166534]" :
                          u.subscriptionStatus === "expired" ? "bg-[#FEE2E2] text-[#991B1B]" :
                          "bg-[#FEF9C3] text-[#854D0E]"}`}>
                        {(u.subscriptionStatus || "none").toUpperCase()}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-xs font-semibold ${theme.subtext}`}>
                      {u.subscriptionStart ? new Date(u.subscriptionStart).toLocaleDateString() : "N/A"}
                    </td>
                    <td className={`px-4 py-3 text-xs font-semibold ${theme.subtext}`}>
                      {u.subscriptionEnd ? new Date(u.subscriptionEnd).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleEdit(u)}
                        className={`h-8 rounded-lg border ${theme.border} px-3 text-xs font-black ${theme.subtext} transition hover:border-[#0891B2] hover:text-[#0891B2]`}
                      >
                        Edit
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md rounded-xl border ${theme.border} ${theme.panel} p-6 shadow-2xl`}
          >
            <h3 className={`font-black text-lg ${theme.text}`}>Edit Subscription</h3>
            <p className={`text-xs font-medium ${theme.subtext} mb-5`}>{modal.name} — {modal.email}</p>

            <div className="space-y-3">
              <div>
                <label className={`text-xs font-black ${theme.subtext} mb-1 block`}>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className={`text-xs font-black ${theme.subtext} mb-1 block`}>Package</label>
                <select value={form.packageName} onChange={(e) => setForm({ ...form, packageName: e.target.value })} className={inputClass}>
                  <option value="Basic">Basic</option>
                  <option value="Professional">Professional</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              <div>
                <label className={`text-xs font-black ${theme.subtext} mb-1 block`}>Extend by (months)</label>
                <input type="number" min="1" value={form.months} onChange={(e) => setForm({ ...form, months: e.target.value })} className={inputClass} />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button onClick={handleSave} className="flex-1 h-10 rounded-lg bg-[#C8102E] text-sm font-black text-white hover:bg-[#a50d25] transition">
                Save Changes
              </button>
              <button onClick={() => setModal(null)} className={`flex-1 h-10 rounded-lg border ${theme.border} text-sm font-black ${theme.subtext} transition`}>
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;