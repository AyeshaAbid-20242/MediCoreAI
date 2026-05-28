import { useState } from "react";
import { activateDriverSubscription } from "../../../api/ambulanceApi";
import { motion } from "framer-motion";

const AmbulanceSubscription = ({ driver, onUpdated, theme }) => {
  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;
  const softClass = `rounded-lg border ${theme.border} ${theme.panelMuted}`;
  const inputClass = `h-11 w-full rounded-lg border ${theme.border} ${theme.panelMuted} px-3 text-sm ${theme.text} outline-none focus:border-[#C8102E]`;

  const [form, setForm] = useState({ packageName: "Professional", months: 1 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isActive = driver?.subscriptionStatus === "active";

  const plans = [
    { name: "Basic", price: "Rs. 499/month", features: ["Basic job assignments", "Standard support", "Profile listing"] },
    { name: "Professional", price: "Rs. 999/month", features: ["Priority job assignments", "24/7 support", "Featured listing", "Analytics dashboard"] },
    { name: "Premium", price: "Rs. 1,999/month", features: ["Unlimited job assignments", "Dedicated support", "Top listing priority", "Advanced analytics", "Custom profile badge"] },
  ];

  const handleActivate = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await activateDriverSubscription(form);
      onUpdated(res.data.driver);
      setMessage("Subscription activated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Activation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className={`text-xl font-black tracking-tight ${theme.text}`}>Subscription</h2>
        <p className={`mt-0.5 text-sm font-medium ${theme.subtext}`}>
          Manage your driver subscription plan
        </p>
      </div>

      {/* Current Status */}
      <div className={`${cardClass} p-5`}>
        <h3 className={`font-black ${theme.text} mb-4`}>Current Subscription</h3>
        <div className={`rounded-lg border p-4
          ${isActive ? "border-[#BBF7D0] bg-[#F0FDF4]" : "border-[#FED7AA] bg-[#FFF7ED]"}`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className={`font-black ${isActive ? "text-[#166534]" : "text-[#9A3412]"}`}>
                {isActive ? "Subscription Active" : "No Active Subscription"}
              </p>
              <p className="text-xs font-semibold text-[#64748B] mt-0.5">
                {isActive
                  ? `${driver?.packageName} plan — expires ${new Date(driver?.subscriptionEnd).toLocaleDateString()}`
                  : "Activate a plan to receive job assignments"}
              </p>
            </div>
            <span className={`rounded-lg px-3 py-1.5 text-xs font-black
              ${isActive ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEF9C3] text-[#854D0E]"}`}>
              {(driver?.subscriptionStatus || "none").toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setForm({ ...form, packageName: plan.name })}
            className={`${cardClass} p-5 cursor-pointer transition-all
              ${form.packageName === plan.name
                ? "ring-2 ring-[#C8102E]"
                : ""}`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className={`font-black ${theme.text}`}>{plan.name}</p>
              {form.packageName === plan.name && (
                <span className="rounded-full bg-[#C8102E] px-2 py-0.5 text-[10px] font-black text-white">
                  SELECTED
                </span>
              )}
            </div>
            <p className="text-lg font-black text-[#C8102E] mb-3">{plan.price}</p>
            <div className="space-y-1.5">
              {plan.features.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#C8102E] shrink-0" />
                  <p className={`text-xs font-semibold ${theme.subtext}`}>{f}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Activate Form */}
      <div className={`${cardClass} p-5 max-w-sm`}>
        <h3 className={`font-black ${theme.text} mb-4`}>Activate Plan</h3>

        {message && (
          <div className="mb-4 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm font-bold text-[#166534]">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm font-bold text-[#991B1B]">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className={`mb-1 block text-sm font-black ${theme.subtext}`}>Selected Package</label>
            <select
              value={form.packageName}
              onChange={(e) => setForm({ ...form, packageName: e.target.value })}
              className={inputClass}
            >
              <option value="Basic">Basic</option>
              <option value="Professional">Professional</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
          <div>
            <label className={`mb-1 block text-sm font-black ${theme.subtext}`}>Duration (months)</label>
            <input
              type="number"
              min="1"
              max="12"
              value={form.months}
              onChange={(e) => setForm({ ...form, months: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
          <button
            onClick={handleActivate}
            disabled={loading}
            className="h-11 w-full rounded-lg bg-[#C8102E] text-sm font-black text-white transition hover:bg-[#a50d25] disabled:opacity-60"
          >
            {loading ? "Activating..." : "Activate Subscription"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceSubscription;