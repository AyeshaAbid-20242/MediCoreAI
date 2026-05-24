import { useState } from "react";
import { getApiError } from "../../api/axios";
import { activateDoctorSubscription } from "../../api/doctorApi";

const DoctorSubscription = ({ doctor, onUpdated, theme }) => {
  const [packageName, setPackageName] = useState("Professional");
  const [months, setMonths] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await activateDoctorSubscription({ packageName, months });
      onUpdated(res.data.doctor);
    } catch (err) {
      setError(getApiError(err, "Subscription failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`rounded-lg border ${theme.border} ${theme.panel} p-4 shadow-[0_14px_34px_rgba(10,22,40,0.06)]`}>
      <h2 className={`text-lg font-black ${theme.text}`}>Doctor Subscription</h2>
      <p className={`text-sm font-semibold ${theme.subtext}`}>Active subscription makes your profile visible to patients.</p>

      <div className={`mt-4 rounded-lg border ${theme.border} ${theme.panelMuted} p-4`}>
        <p className={`text-sm font-black ${theme.text}`}>Current status: {doctor?.subscriptionStatus || "none"}</p>
        <p className={`mt-1 text-xs font-semibold ${theme.subtext}`}>
          {doctor?.subscriptionEnd ? `Ends ${new Date(doctor.subscriptionEnd).toLocaleDateString()}` : "No active subscription yet."}
        </p>
      </div>

      {error && <div className="mt-4 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm font-bold text-[#991B1B]">{error}</div>}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <label className={`mb-1 block text-sm font-bold ${theme.subtext}`}>Package</label>
          <select value={packageName} onChange={(event) => setPackageName(event.target.value)} className={`h-11 w-full rounded-lg border ${theme.border} ${theme.panelMuted} px-3 text-sm ${theme.text}`}>
            <option>Starter</option>
            <option>Professional</option>
            <option>Premium</option>
          </select>
        </div>
        <div>
          <label className={`mb-1 block text-sm font-bold ${theme.subtext}`}>Months</label>
          <input type="number" min="1" value={months} onChange={(event) => setMonths(event.target.value)} className={`h-11 w-full rounded-lg border ${theme.border} ${theme.panelMuted} px-3 text-sm ${theme.text}`} />
        </div>
      </div>

      <button onClick={subscribe} disabled={loading} className="mt-5 h-11 rounded-lg bg-[#C8102E] px-5 text-sm font-black text-white disabled:opacity-60">
        {loading ? "Activating..." : "Activate Subscription"}
      </button>
    </section>
  );
};

export default DoctorSubscription;
