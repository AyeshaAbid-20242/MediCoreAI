import { motion } from "framer-motion";

const money = (amount = 0) => `Rs. ${Number(amount).toLocaleString()}`;

const AmbulancePayments = ({ driver, theme }) => {
  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;
  const softClass = `rounded-lg border ${theme.border} ${theme.panelMuted}`;

  return (
    <div className="space-y-5">
      <div>
        <h2 className={`text-xl font-black tracking-tight ${theme.text}`}>Payments</h2>
        <p className={`mt-0.5 text-sm font-medium ${theme.subtext}`}>Your earnings and payment history</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Earnings", value: money(0), caption: "Lifetime earnings" },
          { label: "This Month", value: money(0), caption: "Current month" },
          { label: "Pending Payout", value: money(0), caption: "Awaiting processing" },
        ].map(({ label, value, caption }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`${cardClass} p-5`}
          >
            <p className={`text-2xl font-black text-[#059669]`}>{value}</p>
            <p className={`mt-1 text-sm font-bold ${theme.text}`}>{label}</p>
            <p className={`text-xs ${theme.subtext}`}>{caption}</p>
          </motion.div>
        ))}
      </div>

      {/* Payment History */}
      <div className={`${cardClass} p-5`}>
        <h3 className={`font-black ${theme.text} mb-1`}>Payment History</h3>
        <p className={`text-xs font-medium ${theme.subtext} mb-4`}>Record of all completed job payments</p>

        <div className={`${softClass} p-12 text-center`}>
          <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border ${theme.border}`}>
            <svg className={`h-6 w-6 ${theme.subtext}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className={`font-black ${theme.text}`}>No payments yet</p>
          <p className={`text-xs font-medium ${theme.subtext} mt-1`}>
            Completed job payments will appear here
          </p>
        </div>
      </div>
    </div>
  );
};

export default AmbulancePayments;