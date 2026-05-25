import { motion } from "framer-motion";
import { useState } from "react";

const Settings = ({ subscriptionPlans, onUpdatePlans, onChangePassword, theme }) => {
  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;
  const inputClass = `h-10 w-full rounded-lg border ${theme.border} ${theme.panelMuted} px-3 text-sm font-medium ${theme.text} focus:outline-none focus:border-[#C8102E]`;

  const [activeSection, setActiveSection] = useState("plans");
  const [loading, setLoading] = useState(false);

  const doctorPlan = subscriptionPlans?.find(p => p.role === "doctor") || {};
  const driverPlan = subscriptionPlans?.find(p => p.role === "ambulance_driver") || {};

  const [doctorForm, setDoctorForm] = useState({
    role: "doctor",
    basicMonthly: doctorPlan.basicMonthly || 999,
    basicYearly: doctorPlan.basicYearly || 9999,
    professionalMonthly: doctorPlan.professionalMonthly || 2999,
    professionalYearly: doctorPlan.professionalYearly || 29999,
    premiumMonthly: doctorPlan.premiumMonthly || 4999,
    premiumYearly: doctorPlan.premiumYearly || 49999,
  });

  const [driverForm, setDriverForm] = useState({
    role: "ambulance_driver",
    basicMonthly: driverPlan.basicMonthly || 499,
    basicYearly: driverPlan.basicYearly || 4999,
    professionalMonthly: driverPlan.professionalMonthly || 999,
    professionalYearly: driverPlan.professionalYearly || 9999,
    premiumMonthly: driverPlan.premiumMonthly || 1999,
    premiumYearly: driverPlan.premiumYearly || 19999,
  });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");

  const planFields = [
    { label: "Basic Monthly", key: "basicMonthly" },
    { label: "Basic Yearly", key: "basicYearly" },
    { label: "Professional Monthly", key: "professionalMonthly" },
    { label: "Professional Yearly", key: "professionalYearly" },
    { label: "Premium Monthly", key: "premiumMonthly" },
    { label: "Premium Yearly", key: "premiumYearly" },
  ];

  const handleChangePassword = async () => {
    setPasswordError("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    await onChangePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className={`text-xl font-black tracking-tight ${theme.text}`}>Settings</h2>
        <p className={`mt-0.5 text-sm font-medium ${theme.subtext}`}>Manage subscription plans and admin account</p>
      </div>

      {/* Toggle */}
      <div className={`inline-flex rounded-lg border ${theme.border} ${theme.panel} p-1`}>
        {[
          { id: "plans", label: "Subscription Plans" },
          { id: "password", label: "Change Password" },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`rounded-lg px-5 py-2 text-sm font-black transition-colors
              ${activeSection === s.id ? "bg-[#C8102E] text-white" : `${theme.subtext}`}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Plans */}
      {activeSection === "plans" && (
        <div className="space-y-5">
          {/* Doctor Plans */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`${cardClass} p-6`}>
            <h3 className={`font-black ${theme.text}`}>Doctor Subscription Plans</h3>
            <p className={`text-xs font-medium ${theme.subtext} mb-5`}>Set pricing for doctor subscriptions (Rs.)</p>
            <div className="grid grid-cols-2 gap-4">
              {planFields.map((field) => (
                <div key={field.key}>
                  <label className={`text-xs font-black ${theme.subtext} mb-1 block`}>{field.label}</label>
                  <input
                    type="number"
                    value={doctorForm[field.key]}
                    onChange={(e) => setDoctorForm({ ...doctorForm, [field.key]: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={async () => { setLoading(true); await onUpdatePlans(doctorForm); setLoading(false); }}
              disabled={loading}
              className="mt-5 h-10 rounded-lg bg-[#C8102E] px-6 text-sm font-black text-white transition hover:bg-[#a50d25] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Doctor Plans"}
            </button>
          </motion.div>

          {/* Driver Plans */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={`${cardClass} p-6`}>
            <h3 className={`font-black ${theme.text}`}>Driver Subscription Plans</h3>
            <p className={`text-xs font-medium ${theme.subtext} mb-5`}>Set pricing for ambulance driver subscriptions (Rs.)</p>
            <div className="grid grid-cols-2 gap-4">
              {planFields.map((field) => (
                <div key={field.key}>
                  <label className={`text-xs font-black ${theme.subtext} mb-1 block`}>{field.label}</label>
                  <input
                    type="number"
                    value={driverForm[field.key]}
                    onChange={(e) => setDriverForm({ ...driverForm, [field.key]: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={async () => { setLoading(true); await onUpdatePlans(driverForm); setLoading(false); }}
              disabled={loading}
              className="mt-5 h-10 rounded-lg bg-[#C8102E] px-6 text-sm font-black text-white transition hover:bg-[#a50d25] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Driver Plans"}
            </button>
          </motion.div>
        </div>
      )}

      {/* Password */}
      {activeSection === "password" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`${cardClass} p-6 max-w-md`}>
          <h3 className={`font-black ${theme.text}`}>Change Admin Password</h3>
          <p className={`text-xs font-medium ${theme.subtext} mb-5`}>Update your admin account password</p>
          <div className="space-y-3">
            {[
              { label: "Current Password", key: "currentPassword" },
              { label: "New Password", key: "newPassword" },
              { label: "Confirm New Password", key: "confirmPassword" },
            ].map((field) => (
              <div key={field.key}>
                <label className={`text-xs font-black ${theme.subtext} mb-1 block`}>{field.label}</label>
                <input
                  type="password"
                  value={passwordForm[field.key]}
                  onChange={(e) => setPasswordForm({ ...passwordForm, [field.key]: e.target.value })}
                  placeholder={field.label}
                  className={inputClass}
                />
              </div>
            ))}
            {passwordError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-black text-red-400">
                {passwordError}
              </div>
            )}
            <button
              onClick={handleChangePassword}
              disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              className="h-10 w-full rounded-lg bg-[#C8102E] text-sm font-black text-white transition hover:bg-[#a50d25] disabled:opacity-50"
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Settings;