import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const Analytics = ({ revenueStats, doctorRatings, theme }) => {
  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;

  const tooltipStyle = {
    backgroundColor: theme.darkMode ? "#0D1F35" : "#fff",
    border: "none",
    borderRadius: "8px",
    color: theme.darkMode ? "#E2E8F0" : "#0A1628",
    fontSize: "12px",
    fontWeight: "700",
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className={`text-xl font-black tracking-tight ${theme.text}`}>Analytics</h2>
        <p className={`mt-0.5 text-sm font-medium ${theme.subtext}`}>Revenue trends and performance insights</p>
      </div>

      {/* Revenue Chart */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${cardClass} p-5`}>
        <h3 className={`font-black ${theme.text}`}>Monthly Revenue</h3>
        <p className={`text-xs font-medium ${theme.subtext} mb-4`}>Total earnings per month</p>
        {revenueStats.revenueChart?.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className={`text-sm font-semibold ${theme.subtext}`}>No revenue data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueStats.revenueChart}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: theme.darkMode ? "#94A3B8" : "#64748B", fontSize: 11, fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.darkMode ? "#94A3B8" : "#64748B", fontSize: 11, fontWeight: 700 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#C8102E" strokeWidth={2.5} dot={{ fill: "#C8102E", r: 4 }} name="Revenue (Rs.)" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Registration Trends */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={`${cardClass} p-5`}>
        <h3 className={`font-black ${theme.text}`}>Registration Trends</h3>
        <p className={`text-xs font-medium ${theme.subtext} mb-4`}>New user registrations per month</p>
        {revenueStats.registrationChart?.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className={`text-sm font-semibold ${theme.subtext}`}>No registration data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueStats.registrationChart}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: theme.darkMode ? "#94A3B8" : "#64748B", fontSize: 11, fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.darkMode ? "#94A3B8" : "#64748B", fontSize: 11, fontWeight: 700 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#C8102E" radius={[4, 4, 0, 0]} name="New Users" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Doctor Ratings */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`${cardClass} overflow-hidden`}>
        <div className={`border-b ${theme.border} px-5 py-4`}>
          <h3 className={`font-black ${theme.text}`}>Doctor Ratings Overview</h3>
          <p className={`text-xs font-medium ${theme.subtext}`}>Average ratings from patient reviews</p>
        </div>
        {!doctorRatings?.length ? (
          <div className="p-16 text-center">
            <p className="text-5xl mb-4">⭐</p>
            <p className={`font-black text-lg ${theme.text}`}>No ratings yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme.border}`}>
                  {["Doctor", "Specialization", "Avg Rating", "Total Reviews"].map((h) => (
                    <th key={h} className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider ${theme.subtext}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {doctorRatings.map((d, i) => (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className={`border-b ${theme.border}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DBEAFE] text-sm font-black text-[#1E40AF]">
                          {d.doctor?.name?.charAt(0).toUpperCase()}
                        </div>
                        <p className={`text-sm font-black ${theme.text}`}>{d.doctor?.name}</p>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold ${theme.subtext}`}>{d.doctor?.specialization || "N/A"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={s <= Math.round(d.averageRating) ? "text-yellow-400" : "text-gray-300"}>★</span>
                          ))}
                        </div>
                        <span className={`text-sm font-black ${theme.text}`}>{d.averageRating}</span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold ${theme.subtext}`}>{d.totalReviews} reviews</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Analytics;