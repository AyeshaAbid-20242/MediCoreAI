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
          <p className="text-5xl mb-4">🚑</p>
          <p className={`font-black text-lg ${theme.text}`}>No drivers registered yet</p>
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