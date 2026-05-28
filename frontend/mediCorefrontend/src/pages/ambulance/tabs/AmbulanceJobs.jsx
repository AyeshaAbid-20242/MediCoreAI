import { motion } from "framer-motion";

const AmbulanceJobs = ({ jobs, onRefresh, theme }) => {
  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;
  const softClass = `rounded-lg border ${theme.border} ${theme.panelMuted}`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-black tracking-tight ${theme.text}`}>Active Jobs</h2>
          <p className={`mt-0.5 text-sm font-medium ${theme.subtext}`}>
            {jobs.length} total assignments
          </p>
        </div>
        <button
          onClick={onRefresh}
          className={`h-9 rounded-lg border ${theme.border} ${theme.panel} px-4 text-sm font-black ${theme.subtext} transition hover:border-[#C8102E] hover:text-[#C8102E]`}
        >
          Refresh
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className={`${cardClass} p-16 text-center`}>
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border ${theme.border} ${theme.panelMuted}`}>
            <svg className={`h-8 w-8 ${theme.subtext}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className={`font-black text-lg ${theme.text}`}>No jobs assigned yet</p>
          <p className={`text-sm font-medium ${theme.subtext} mt-1`}>
            Jobs will appear here once assigned by dispatch
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job, i) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`${cardClass} p-5`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`rounded-md px-2 py-1 text-[10px] font-black
                      ${job.status === "completed" ? "bg-[#DCFCE7] text-[#166534]" :
                        job.status === "active" ? "bg-[#DBEAFE] text-[#1E40AF]" :
                        job.status === "cancelled" ? "bg-[#FEE2E2] text-[#991B1B]" :
                        "bg-[#FEF9C3] text-[#854D0E]"}`}>
                      {(job.status || "pending").toUpperCase()}
                    </span>
                  </div>
                  <p className={`font-black ${theme.text}`}>{job.patientName || "Patient"}</p>
                  <div className="mt-2 space-y-1">
                    {[
                      ["Location", job.location],
                      ["Contact", job.contactNumber],
                      ["Notes", job.notes],
                    ].map(([label, value]) => value && (
                      <p key={label} className={`text-xs font-medium ${theme.subtext}`}>
                        <span className="font-black">{label}:</span> {value}
                      </p>
                    ))}
                  </div>
                </div>
                <p className={`text-xs font-semibold ${theme.subtext}`}>
                  {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AmbulanceJobs;