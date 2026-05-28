import { useEffect, useState } from "react";
import { getApiError } from "../../api/axios";
import { updateDoctorProfile } from "../../api/doctorApi";

const emptyProfile = {
  name: "",
  city: "",
  specialization: "",
  experience: "",
  licenseNumber: "",
  pmdcNumber: "",
  bio: "",
  consultationFee: "",
  profileImageUrl: "",
  availableDays: "",
  availableTimeSlots: "",
};

const DoctorProfile = ({ doctor, onUpdated, theme }) => {
  const [form, setForm] = useState(emptyProfile);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: doctor?.fullName || doctor?.name || "",
      city: doctor?.city || "",
      specialization: doctor?.specialization || "",
      experience: doctor?.experience || "",
      licenseNumber: doctor?.licenseNumber || "",
      pmdcNumber: doctor?.pmdcNumber || "",
      bio: doctor?.bio || "",
      consultationFee: doctor?.consultationFee || "",
      profileImageUrl: doctor?.profileImageUrl || "",
      availableDays: (doctor?.availableDays || []).join(", "),
      availableTimeSlots: (doctor?.availableTimeSlots || []).join(", "),
    });
  }, [doctor]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        fullName: form.name,
        availableDays: form.availableDays.split(",").map((item) => item.trim()).filter(Boolean),
        availableTimeSlots: form.availableTimeSlots.split(",").map((item) => item.trim()).filter(Boolean),
      };
      const res = await updateDoctorProfile(payload);
      onUpdated(res.data.doctor);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(getApiError(err, "Profile update failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={`rounded-lg border ${theme.border} ${theme.panel} p-4 shadow-[0_14px_34px_rgba(10,22,40,0.06)]`}>
      <h2 className={`text-lg font-black ${theme.text}`}>Doctor Profile</h2>
      <p className={`text-sm font-semibold ${theme.subtext}`}>This information becomes public only after approval and subscription.</p>

      {message && <div className="mt-4 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm font-bold text-[#166534]">{message}</div>}
      {error && <div className="mt-4 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm font-bold text-[#991B1B]">{error}</div>}

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
        <Field theme={theme} label="Full Name" name="name" value={form.name} onChange={handleChange} required minLength={2} maxLength={80} />
        <Field theme={theme} label="City" name="city" value={form.city} onChange={handleChange} />
        <Field theme={theme} label="Specialization" name="specialization" value={form.specialization} onChange={handleChange} maxLength={80} />
        <Field theme={theme} label="Experience" name="experience" type="number" value={form.experience} onChange={handleChange} min={0} max={70} />
        <Field theme={theme} label="PMDC / License Number" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} maxLength={60} />
        <Field theme={theme} label="PMDC Number" name="pmdcNumber" value={form.pmdcNumber} onChange={handleChange} maxLength={60} />
        <Field theme={theme} label="Consultation Fee" name="consultationFee" type="number" value={form.consultationFee} onChange={handleChange} min={0} max={100000} />
        <Field theme={theme} label="Profile Image URL" name="profileImageUrl" value={form.profileImageUrl} onChange={handleChange} type="url" />
        <Field theme={theme} label="Available Days" name="availableDays" value={form.availableDays} onChange={handleChange} placeholder="Mon, Tue, Wed" />
        <Field theme={theme} label="Time Slots" name="availableTimeSlots" value={form.availableTimeSlots} onChange={handleChange} placeholder="10:00 AM, 4:00 PM" />
        <div className="md:col-span-2">
          <label className={`mb-1 block text-sm font-bold ${theme.subtext}`}>Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            maxLength={1000}
            className={`h-28 w-full resize-none rounded-lg border ${theme.border} ${theme.panelMuted} px-3 py-2 text-sm ${theme.text} outline-none focus:border-[#C8102E]`}
          />
        </div>
        <button disabled={saving} className="h-11 rounded-lg bg-[#C8102E] px-5 text-sm font-black text-white disabled:opacity-60 md:w-fit">
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

export default DoctorProfile;
