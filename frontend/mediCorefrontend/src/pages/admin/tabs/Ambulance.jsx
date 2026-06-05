import { motion } from "framer-motion";

const Ambulance = ({ allUsers, theme }) => {
  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;
  const drivers = allUsers.filter(u => u.role === "ambulance_driver");

  return (
    <div className="space-y-5">
      <div>
        <h2 className={`text-xl font-black tracking-tight ${theme.text}`}>Ambulance Drivers</h2>
        <p className={`mt-0.5 text-sm font-medium ${theme.subtext}`}>{drivers.length} registered drivers</p>
      </div>

      {drivers.length === 0 ? (
        <div className={`${cardClass} p-16 text-center`}>
  <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border ${theme.border} ${theme.panelMuted}`}>
    <svg className={`h-8 w-8 ${theme.subtext}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  </div>
  <p className={`font-black text-lg ${theme.text}`}>No drivers registered yet</p>
  <p className={`text-sm font-medium ${theme.subtext} mt-1`}>Drivers will appear here once registered</p>
</div>
      ) : (
        <div className={`${cardClass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme.border}`}>
                  {["Driver", "Vehicle", "Type", "License", "Equipment", "Subscription", "Status"].map((h) => (
                    <th key={h} className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider ${theme.subtext}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {drivers.map((u, i) => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-b ${theme.border}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FEF9C3] text-sm font-black text-[#854D0E]">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-sm font-black ${theme.text}`}>{u.name}</p>
                          <p className={`text-xs font-medium ${theme.subtext}`}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold ${theme.text}`}>{u.vehicleNumber || "N/A"}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${theme.subtext}`}>{u.ambulanceType || "N/A"}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${theme.subtext}`}>{u.drivingLicenseNumber || u.licenseNumber || "N/A"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {u.hasOxygen && <span className="rounded-md bg-[#DBEAFE] px-2 py-0.5 text-[10px] font-black text-[#1E40AF]">O2</span>}
                        {u.hasStretcher && <span className="rounded-md bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-black text-[#166534]">Stretcher</span>}
                        {!u.hasOxygen && !u.hasStretcher && <span className={`text-xs font-semibold ${theme.subtext}`}>None</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-1 text-[10px] font-black
                        ${u.subscriptionStatus === "active" ? "bg-[#DCFCE7] text-[#166534]" :
                          u.subscriptionStatus === "expired" ? "bg-[#FEE2E2] text-[#991B1B]" :
                          "bg-[#FEF9C3] text-[#854D0E]"}`}>
                        {(u.subscriptionStatus || "none").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-1 text-[10px] font-black
                        ${u.status === "active" ? "bg-[#DCFCE7] text-[#166534]" :
                          u.status === "approved" ? "bg-[#DBEAFE] text-[#1E40AF]" :
                          u.status === "pending" ? "bg-[#FEF9C3] text-[#854D0E]" :
                          "bg-[#FEE2E2] text-[#991B1B]"}`}>
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ambulance;