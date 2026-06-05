import { motion } from "framer-motion";

const Patients = ({ allUsers, theme }) => {
  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;
  const patients = allUsers.filter(u => u.role === "patient");

  return (
    <div className="space-y-5">
      <div>
        <h2 className={`text-xl font-black tracking-tight ${theme.text}`}>Patients</h2>
        <p className={`mt-0.5 text-sm font-medium ${theme.subtext}`}>{patients.length} registered patients</p>
      </div>

      {patients.length === 0 ? (
        <div className={`${cardClass} p-16 text-center`}>
  <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border ${theme.border} ${theme.panelMuted}`}>
    <svg className={`h-8 w-8 ${theme.subtext}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  </div>
  <p className={`font-black text-lg ${theme.text}`}>No patients registered yet</p>
  <p className={`text-sm font-medium ${theme.subtext} mt-1`}>Patients will appear here once registered</p>
</div>
      ) : (
        <div className={`${cardClass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme.border}`}>
                  {["Patient", "City", "Age", "Mobile", "Status", "Joined"].map((h) => (
                    <th key={h} className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider ${theme.subtext}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.map((u, i) => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-b ${theme.border}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3E8FF] text-sm font-black text-[#6B21A8]">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-sm font-black ${theme.text}`}>{u.name}</p>
                          <p className={`text-xs font-medium ${theme.subtext}`}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold ${theme.subtext}`}>{u.city || "N/A"}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${theme.subtext}`}>{u.age || "N/A"}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${theme.subtext}`}>{u.mobileNumber || "N/A"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-1 text-[10px] font-black
                        ${u.status === "active" ? "bg-[#DCFCE7] text-[#166534]" :
                          u.status === "approved" ? "bg-[#DBEAFE] text-[#1E40AF]" :
                          "bg-[#FEF9C3] text-[#854D0E]"}`}>
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-xs font-semibold ${theme.subtext}`}>
                      {new Date(u.createdAt).toLocaleDateString()}
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

export default Patients;