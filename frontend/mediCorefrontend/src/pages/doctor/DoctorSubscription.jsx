import { useState } from "react";
import { motion } from "framer-motion";
import { createCheckoutSession } from "../../api/paymentApi";

const plans = [
  {
    name: "Basic",
    monthlyPrice: 10,
    yearlyPrice: 100,
    features: [
      "Profile visible to patients",
      "Basic appointment management",
      "Standard support",
      "Patient reviews",
    ],
  },
  {
    name: "Professional",
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      "Everything in Basic",
      "Priority listing in search",
      "Advanced analytics",
      "24/7 support",
      "Custom profile badge",
    ],
  },
  {
    name: "Premium",
    monthlyPrice: 49,
    yearlyPrice: 490,
    features: [
      "Everything in Professional",
      "Top search placement",
      "Dedicated account manager",
      "Unlimited appointments",
      "Featured doctor badge",
      "Revenue insights",
    ],
  },
];
const money = (amount) => `$${Number(amount).toLocaleString()}`;

const DoctorSubscription = ({ doctor, theme }) => {
  const [selectedPlan, setSelectedPlan] = useState("Professional");
  const [duration, setDuration] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;
  const softClass = `rounded-lg border ${theme.border} ${theme.panelMuted}`;

  const isActive = doctor?.subscriptionStatus === "active";

  const getPrice = (plan) => {
    return duration === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await createCheckoutSession({
        packageName: selectedPlan,
        duration,
      });
      // Redirect to Stripe Checkout
      window.location.href = res.url;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* Current Status */}
      <div className={`${cardClass} p-5`}>
        <h2 className={`text-lg font-black ${theme.text}`}>Doctor Subscription</h2>
        <p className={`text-sm font-semibold ${theme.subtext} mb-4`}>
          Active subscription makes your profile visible to patients.
        </p>

        <div className={`rounded-lg border p-4
          ${isActive ? "border-[#BBF7D0] bg-[#F0FDF4]" : "border-[#FED7AA] bg-[#FFF7ED]"}`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className={`font-black ${isActive ? "text-[#166534]" : "text-[#9A3412]"}`}>
                {isActive ? "Subscription Active" : "No Active Subscription"}
              </p>
              <p className="mt-1 text-xs font-semibold text-[#64748B]">
                {isActive
                  ? `${doctor?.packageName} plan — expires ${new Date(doctor?.subscriptionEnd).toLocaleDateString()}`
                  : "Subscribe to become visible to patients"}
              </p>
            </div>
            <span className={`rounded-lg px-3 py-1.5 text-xs font-black
              ${isActive ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEF9C3] text-[#854D0E]"}`}>
              {(doctor?.subscriptionStatus || "none").toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Duration Toggle */}
      <div className="flex items-center gap-4">
        <div className={`inline-flex rounded-lg border ${theme.border} ${theme.panel} p-1`}>
          {["monthly", "yearly"].map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`rounded-lg px-5 py-2 text-sm font-black transition-colors
                ${duration === d ? "bg-[#C8102E] text-white" : `${theme.subtext}`}`}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
        {duration === "yearly" && (
          <span className="rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-black text-[#166534]">
            Save up to 17%
          </span>
        )}
      </div>

      {/* Plans */}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedPlan(plan.name)}
            className={`${cardClass} p-5 cursor-pointer transition-all
              ${selectedPlan === plan.name ? "ring-2 ring-[#C8102E]" : ""}`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className={`font-black ${theme.text}`}>{plan.name}</p>
              {selectedPlan === plan.name && (
                <span className="rounded-full bg-[#C8102E] px-2 py-0.5 text-[10px] font-black text-white">
                  SELECTED
                </span>
              )}
            </div>

            <p className="text-2xl font-black text-[#C8102E]">
              {money(getPrice(plan))}
            </p>
            <p className={`text-xs font-semibold ${theme.subtext} mb-4`}>
              per {duration === "yearly" ? "year" : "month"}
            </p>

            <div className="space-y-2">
              {plan.features.map((f) => (
                <div key={f} className="flex items-start gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C8102E]" />
                  <p className={`text-xs font-semibold ${theme.subtext}`}>{f}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Checkout */}
      <div className={`${cardClass} p-5 max-w-sm`}>
        <h3 className={`font-black ${theme.text} mb-1`}>Complete Payment</h3>
        <p className={`text-xs font-medium ${theme.subtext} mb-4`}>
          You will be redirected to Stripe for secure payment
        </p>

        <div className={`${softClass} p-3 mb-4`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm font-black ${theme.text}`}>{selectedPlan} Plan</p>
            <p className="text-sm font-black text-[#C8102E]">
              {money(getPrice(plans.find(p => p.name === selectedPlan)))}
            </p>
          </div>
          <p className={`text-xs font-semibold ${theme.subtext} mt-0.5`}>
            {duration === "yearly" ? "Billed yearly" : "Billed monthly"}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm font-bold text-[#991B1B]">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="h-11 w-full rounded-lg bg-[#C8102E] text-sm font-black text-white transition hover:bg-[#a50d25] disabled:opacity-60"
        >
          {loading ? "Redirecting to payment..." : `Pay ${money(getPrice(plans.find(p => p.name === selectedPlan)))}`}
        </button>

        <p className={`mt-3 text-center text-xs font-semibold ${theme.subtext}`}>
          Secured by Stripe — Cancel anytime
        </p>
      </div>
    </div>
  );
};

export default DoctorSubscription;