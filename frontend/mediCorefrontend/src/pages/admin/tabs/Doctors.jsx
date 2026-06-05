import { motion } from "framer-motion";

const Doctors = ({ allUsers, doctorRatings, theme }) => {
  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;
  const doctors = allUsers.filter(u => u.role === "doctor");

  const getRating = (id) => {
    const r = doctorRatings?.find(d => d.doctor?._id === id);
    return r ? r.averageRating : null;
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className={`text-xl font-black tracking-tight ${theme.text}`}>Doctors</h2>
        <p className={`mt-0.5 text-sm font-medium ${theme.subtext}`}>{doctors.length} registered doctors</p>
      </div>

      {doctors.length === 0 ? (
        <div className={`${cardClass} p-16 text-center`}>
  <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border ${theme.border} ${theme.panelMuted}`}>
    <svg className={`h-8 w-8 ${theme.subtext}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  </div>
  <p className={`font-black text-lg ${theme.text}`}>No doctors registered yet</p>
  <p className={`text-sm font-medium ${theme.subtext} mt-1`}>Doctors will appear here once registered</p>
</div>
      ) : (
        <div className={`${cardClass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme.border}`}>
                  {["Doctor", "Specialization", "Experience", "Fee", "Rating", "Subscription", "Status"].map((h) => (
                    <th key={h} className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider ${theme.subtext}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {doctors.map((u, i) => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-b ${theme.border}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DBEAFE] text-sm font-black text-[#1E40AF]">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-sm font-black ${theme.text}`}>{u.name}</p>
                          <p className={`text-xs font-medium ${theme.subtext}`}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold ${theme.text}`}>{u.specialization || "N/A"}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${theme.subtext}`}>{u.experience ? `${u.experience} yrs` : "N/A"}</td>
                    <td className={`px-4 py-3 text-sm font-black ${theme.text}`}>{u.consultationFee ? `Rs. ${u.consultationFee}` : "N/A"}</td>
                    <td className="px-4 py-3">
                      {getRating(u._id) ? (
                        <div className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
</svg>
                          <span className={`text-sm font-black ${theme.text}`}>{getRating(u._id)}</span>
                        </div>
                      ) : (
                        <span className={`text-xs font-semibold ${theme.subtext}`}>No reviews</span>
                      )}
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

export default Doctors;