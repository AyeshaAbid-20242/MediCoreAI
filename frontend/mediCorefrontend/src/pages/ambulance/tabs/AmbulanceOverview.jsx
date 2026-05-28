import { motion } from "framer-motion";

const AmbulanceOverview = ({ driver, stats, jobs, setActiveTab, theme }) => {
  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;
  const softClass = `rounded-lg border ${theme.border} ${theme.panelMuted}`;

  const isActive = ["approved", "active"].includes(driver?.status);
  const hasSubscription = driver?.subscriptionStatus === "active";

  const statCards = [
    { label: "Total Jobs", value: stats.totalJobs || 0, caption: "All time assignments" },
    { label: "Completed", value: stats.completedJobs || 0, caption: "Successfully completed" },
    { label: "Pending", value: stats.pendingJobs || 0, caption: "Awaiting completion" },
    { label: "Total Earnings", value: `Rs. ${Number(stats.totalEarnings || 0).toLocaleString()}`, caption: "Lifetime earnings" },
  ];

  return (
    <div className="space-y-5">

      {/* Hero */}
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardClass} overflow-hidden bg-[#0A1628] text-white`}
        >
          <div className="p-6">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#94A3B8]">
              Live operations hub
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Emergency response command center
            </h2>
            <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-[#CBD5E1]">
              Monitor your active assignments, track performance metrics, manage your profile and subscription from one unified driver console.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["Account Status", driver?.status || "pending"],
                ["Vehicle", driver?.vehicleNumber || "Not set"],
                ["Subscription", driver?.subscriptionStatus || "none"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[#1E2D45] bg-white/5 p-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">{label}</p>
                  <p className="mt-1 truncate text-sm font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`${cardClass} p-5`}
        >
          <h3 className={`text-base font-black ${theme.text}`}>Account Status</h3>
          <p className={`mt-0.5 text-xs font-medium ${theme.subtext}`}>Current platform access level</p>

          <div className={`mt-4 rounded-lg border p-4
            ${isActive ? "border-[#BBF7D0] bg-[#F0FDF4]" : "border-[#FED7AA] bg-[#FFF7ED]"}`}>
            <p className={`text-sm font-black ${isActive ? "text-[#166534]" : "text-[#9A3412]"}`}>
              {isActive ? "Account approved and active" : "Account pending approval"}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#64748B]">
              Status: {driver?.status || "pending"}
            </p>
          </div>

          {/* Equipment */}
          <div className="mt-4 space-y-2">
            <p className={`text-xs font-black uppercase tracking-wider ${theme.subtext}`}>Equipment</p>
            <div className="flex gap-2 flex-wrap">
              <div className={`rounded-lg border px-3 py-1.5 text-xs font-black
                ${driver?.hasOxygen
                  ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]"
                  : `${theme.border} ${theme.panelMuted} ${theme.subtext}`}`}>
                Oxygen Supply
              </div>
              <div className={`rounded-lg border px-3 py-1.5 text-xs font-black
                ${driver?.hasStretcher
                  ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]"
                  : `${theme.border} ${theme.panelMuted} ${theme.subtext}`}`}>
                Stretcher
              </div>
            </div>
          </div>

          {!hasSubscription && isActive && (
            <button
              onClick={() => setActiveTab("subscription")}
              className="mt-4 h-10 w-full rounded-lg bg-[#C8102E] text-sm font-black text-white hover:bg-[#a50d25] transition"
            >
              Activate Subscription
            </button>
          )}
        </motion.div>
      </section>

      {/* Stat Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, caption }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`${cardClass} p-5`}
          >
            <p className={`text-2xl font-black ${theme.text}`}>{value}</p>
            <p className={`mt-1 text-sm font-bold ${theme.text}`}>{label}</p>
            <p className={`text-xs ${theme.subtext}`}>{caption}</p>
          </motion.div>
        ))}
      </section>

      {/* Driver Details */}
      <section className="grid gap-5 xl:grid-cols-2">
        <div className={`${cardClass} p-5`}>
          <h3 className={`text-base font-black ${theme.text}`}>Vehicle Information</h3>
          <p className={`mt-0.5 text-xs font-medium ${theme.subtext} mb-4`}>Registered vehicle details</p>
          <div className="space-y-3">
            {[
              ["Vehicle Number", driver?.vehicleNumber],
              ["Ambulance Type", driver?.ambulanceType],
              ["Driving License", driver?.drivingLicenseNumber],
              ["Experience", driver?.driverExperience ? `${driver.driverExperience} years` : null],
              ["City", driver?.city],
              ["Mobile", driver?.mobileNumber],
            ].map(([label, value]) => (
              <div key={label} className={`${softClass} flex items-center justify-between p-3`}>
                <p className={`text-xs font-black uppercase tracking-wider ${theme.subtext}`}>{label}</p>
                <p className={`text-sm font-black ${theme.text}`}>{value || "Not set"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className={`${cardClass} p-5`}>
          <h3 className={`text-base font-black ${theme.text}`}>Recent Jobs</h3>
          <p className={`mt-0.5 text-xs font-medium ${theme.subtext} mb-4`}>Latest assignments</p>
          {jobs.length === 0 ? (
            <div className={`${softClass} p-8 text-center`}>
              <p className={`text-sm font-black ${theme.text}`}>No jobs assigned yet</p>
              <p className={`text-xs font-medium ${theme.subtext} mt-1`}>Jobs will appear here once assigned</p>
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.slice(0, 5).map((job) => (
                <div key={job._id} className={`${softClass} flex items-center justify-between p-3`}>
                  <div>
                    <p className={`text-sm font-black ${theme.text}`}>{job.patientName || "Patient"}</p>
                    <p className={`text-xs ${theme.subtext}`}>{job.location || "Location not set"}</p>
                  </div>
                  <span className={`rounded-md px-2 py-1 text-[10px] font-black
                    ${job.status === "completed" ? "bg-[#DCFCE7] text-[#166534]" :
                      job.status === "active" ? "bg-[#DBEAFE] text-[#1E40AF]" :
                      "bg-[#FEF9C3] text-[#854D0E]"}`}>
                    {(job.status || "pending").toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AmbulanceOverview;