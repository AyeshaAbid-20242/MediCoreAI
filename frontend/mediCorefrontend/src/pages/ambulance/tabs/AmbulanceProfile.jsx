import { useEffect, useState } from "react";
import { updateDriverProfile } from "../../../api/ambulanceApi";

const emptyProfile = {
  name: "",
  city: "",
  mobileNumber: "",
  vehicleNumber: "",
  ambulanceType: "",
  drivingLicenseNumber: "",
  driverExperience: "",
  hasOxygen: false,
  hasStretcher: false,
  profileImageUrl: "",
};

const AmbulanceProfile = ({ driver, onUpdated, theme }) => {
  const [form, setForm] = useState(emptyProfile);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: driver?.name || "",
      city: driver?.city || "",
      mobileNumber: driver?.mobileNumber || "",
      vehicleNumber: driver?.vehicleNumber || "",
      ambulanceType: driver?.ambulanceType || "",
      drivingLicenseNumber: driver?.drivingLicenseNumber || "",
      driverExperience: driver?.driverExperience || "",
      hasOxygen: driver?.hasOxygen || false,
      hasStretcher: driver?.hasStretcher || false,
      profileImageUrl: driver?.profileImageUrl || "",
    });
  }, [driver]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await updateDriverProfile(form);
      onUpdated(res.data.driver);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = `h-11 w-full rounded-lg border ${theme.border} ${theme.panelMuted} px-3 text-sm ${theme.text} outline-none focus:border-[#C8102E]`;

  return (
    <section className={`rounded-lg border ${theme.border} ${theme.panel} p-6 shadow-[0_14px_34px_rgba(10,22,40,0.06)]`}>
      <h2 className={`text-lg font-black ${theme.text}`}>Driver Profile</h2>
      <p className={`text-sm font-semibold ${theme.subtext} mb-5`}>
        Keep your vehicle and contact information up to date.
      </p>

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

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <Field theme={theme} label="Full Name" name="name" value={form.name} onChange={handleChange} required minLength={2} maxLength={80} />
        <Field theme={theme} label="City" name="city" value={form.city} onChange={handleChange} />
        <Field theme={theme} label="Mobile Number" name="mobileNumber" value={form.mobileNumber} onChange={handleChange} maxLength={20} />
        <Field theme={theme} label="Vehicle Number" name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} maxLength={30} />
        <Field theme={theme} label="Ambulance Type" name="ambulanceType" value={form.ambulanceType} onChange={handleChange} placeholder="e.g. Basic, Advanced, ICU" maxLength={60} />
        <Field theme={theme} label="Driving License Number" name="drivingLicenseNumber" value={form.drivingLicenseNumber} onChange={handleChange} maxLength={60} />
        <Field theme={theme} label="Experience (years)" name="driverExperience" type="number" value={form.driverExperience} onChange={handleChange} min={0} max={70} />
        <Field theme={theme} label="Profile Image URL" name="profileImageUrl" value={form.profileImageUrl} onChange={handleChange} type="url" />

        {/* Checkboxes */}
        <div className="md:col-span-2">
          <p className={`mb-3 text-sm font-black ${theme.subtext}`}>Equipment Available</p>
          <div className="flex gap-6">
            {[
              { name: "hasOxygen", label: "Oxygen Supply" },
              { name: "hasStretcher", label: "Stretcher" },
            ].map((item) => (
              <label key={item.name} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name={item.name}
                  checked={form[item.name]}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 accent-[#C8102E]"
                />
                <span className={`text-sm font-bold ${theme.text}`}>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-lg bg-[#C8102E] px-6 text-sm font-black text-white transition hover:bg-[#a50d25] disabled:opacity-60 md:w-fit"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </section>
  );
};

const Field = ({ label, theme, ...props }) => (
  <div>
    <label className={`mb-1 block text-sm font-bold ${theme.subtext}`}>{label}</label>
    <input
      {...props}
      className={`h-11 w-full rounded-lg border ${theme.border} ${theme.panelMuted} px-3 text-sm ${theme.text} outline-none focus:border-[#C8102E]`}
    />
  </div>
);

export default AmbulanceProfile;
