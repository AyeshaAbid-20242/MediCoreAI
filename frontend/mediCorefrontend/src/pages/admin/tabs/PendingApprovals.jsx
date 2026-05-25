import { motion } from "framer-motion";

const PendingApprovals = ({ pendingUsers, onApprove, onReject, theme }) => {
  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;
  const softClass = `rounded-lg border ${theme.border} ${theme.panelMuted}`;

  return (
    <div className="space-y-5">
      <div>
        <h2 className={`text-xl font-black tracking-tight ${theme.text}`}>Pending Approvals</h2>
        <p className={`mt-0.5 text-sm font-medium ${theme.subtext}`}>
          {pendingUsers.length} application{pendingUsers.length !== 1 ? "s" : ""} waiting for review
        </p>
      </div>

      {pendingUsers.length === 0 ? (
        <div className={`${cardClass} p-16 text-center`}>
          <p className="text-5xl mb-4">✅</p>
          <p className={`font-black text-lg ${theme.text}`}>All caught up!</p>
          <p className={`text-sm font-medium mt-1 ${theme.subtext}`}>No pending applications at this time</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingUsers.map((u, i) => (
            <motion.div
              key={u._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`${cardClass} p-5`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#C8102E]/10 text-lg font-black text-[#C8102E]">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`font-black ${theme.text}`}>{u.name}</p>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-black
                        ${u.role === "doctor"
                          ? "bg-[#DBEAFE] text-[#1E40AF]"
                          : "bg-[#FEF9C3] text-[#854D0E]"}`}>
                        {u.role === "doctor" ? "DOCTOR" : "DRIVER"}
                      </span>
                    </div>
                    <p className={`text-sm font-medium ${theme.subtext}`}>{u.email}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {u.role === "doctor" && (
                        <>
                          {u.specialization && (
                            <div className={`${softClass} px-3 py-1.5`}>
                              <p className={`text-[10px] font-black uppercase tracking-wider ${theme.subtext}`}>Specialization</p>
                              <p className={`text-xs font-black ${theme.text}`}>{u.specialization}</p>
                            </div>
                          )}
                          {u.experience && (
                            <div className={`${softClass} px-3 py-1.5`}>
                              <p className={`text-[10px] font-black uppercase tracking-wider ${theme.subtext}`}>Experience</p>
                              <p className={`text-xs font-black ${theme.text}`}>{u.experience} years</p>
                            </div>
                          )}
                          {u.licenseNumber && (
                            <div className={`${softClass} px-3 py-1.5`}>
                              <p className={`text-[10px] font-black uppercase tracking-wider ${theme.subtext}`}>License</p>
                              <p className={`text-xs font-black ${theme.text}`}>{u.licenseNumber}</p>
                            </div>
                          )}
                        </>
                      )}
                      {u.role === "ambulance_driver" && (
                        <>
                          {u.vehicleNumber && (
                            <div className={`${softClass} px-3 py-1.5`}>
                              <p className={`text-[10px] font-black uppercase tracking-wider ${theme.subtext}`}>Vehicle</p>
                              <p className={`text-xs font-black ${theme.text}`}>{u.vehicleNumber}</p>
                            </div>
                          )}
                          {u.licenseNumber && (
                            <div className={`${softClass} px-3 py-1.5`}>
                              <p className={`text-[10px] font-black uppercase tracking-wider ${theme.subtext}`}>License</p>
                              <p className={`text-xs font-black ${theme.text}`}>{u.licenseNumber}</p>
                            </div>
                          )}
                        </>
                      )}
                      <div className={`${softClass} px-3 py-1.5`}>
                        <p className={`text-[10px] font-black uppercase tracking-wider ${theme.subtext}`}>Applied</p>
                        <p className={`text-xs font-black ${theme.text}`}>{new Date(u.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onApprove(u._id)}
                    className="h-10 rounded-lg bg-[#059669] px-5 text-sm font-black text-white transition hover:bg-[#047857]"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(u._id)}
                    className="h-10 rounded-lg border border-[#C8102E]/30 bg-[#C8102E]/10 px-5 text-sm font-black text-[#C8102E] transition hover:bg-[#C8102E] hover:text-white"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;