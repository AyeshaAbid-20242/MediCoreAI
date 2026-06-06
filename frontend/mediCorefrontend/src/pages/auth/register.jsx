import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiError } from "../../api/axios";
import { registerUser } from "../../api/authApi";

const Register = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient",
    specialization: "",
    experience: "",
    licenseNumber: "",
    vehicleNumber: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
    if (formData.name.trim().length < 2 || !emailIsValid) {
      setError("Please enter a valid name and email.");
      return;
    }
    if (
      formData.password.length < 8 ||
      !/[A-Za-z]/.test(formData.password) ||
      !/\d/.test(formData.password)
    ) {
      setError("Password must be at least 8 characters and include a letter and a number.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (
      formData.role === "doctor" &&
      (!formData.specialization.trim() || !formData.experience || !formData.licenseNumber.trim())
    ) {
      setError("Specialization, experience and license number are required for doctors.");
      return;
    }
    if (
      formData.role === "ambulance_driver" &&
      (!formData.licenseNumber.trim() || !formData.vehicleNumber.trim())
    ) {
      setError("License number and vehicle number are required for ambulance drivers.");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword: _unusedConfirmPassword, ...payload } = formData;
      void _unusedConfirmPassword;
      const res = await registerUser(payload);
      const tempPasswordText = res.data.tempPassword
        ? ` Temporary password: ${res.data.tempPassword}`
        : "";
      const warningText = res.data.emailWarning ? ` ${res.data.emailWarning}` : "";
      setSuccess(`${res.data.message}${warningText}${tempPasswordText}`);
      setTimeout(() => navigate("/login"), res.data.tempPassword ? 9000 : 3000);
    } catch (err) {
      setError(getApiError(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 py-10 ${darkMode ? "bg-[#0f1623]" : "bg-gray-100"}`}>
      <div className={`p-8 rounded-2xl shadow-lg w-full max-w-md transition-colors duration-300 ${darkMode ? "bg-[#1a2235]" : "bg-white"}`}>

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 p-2 rounded-lg">
              <span className="text-white text-xl">❤️</span>
            </div>
            <div>
              <h1 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>MediCore</h1>
              <p className="text-gray-400 text-xs">Enterprise Health OS</p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full text-xl transition-colors duration-300 ${darkMode ? "bg-[#0f1623] text-yellow-400" : "bg-gray-200 text-gray-700"}`}
          >
            {darkMode ? "🌙" : "☀️"}
          </button>
        </div>

        <h2 className={`text-2xl font-bold mb-1 ${darkMode ? "text-white" : "text-gray-800"}`}>
          Create Account
        </h2>
        <p className="text-gray-400 text-sm mb-6">Register to get started</p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {success} Redirecting to login...
          </div>
        )}

        <div className="space-y-4">

          {/* Name */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              minLength={2}
              maxLength={80}
              className={`w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:border-red-500 transition-colors duration-300
                ${darkMode ? "bg-[#0f1623] text-white border-gray-700" : "bg-gray-100 text-gray-800 border-gray-300"}`}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className={`w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:border-red-500 transition-colors duration-300
                ${darkMode ? "bg-[#0f1623] text-white border-gray-700" : "bg-gray-100 text-gray-800 border-gray-300"}`}
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Password</label>
            <PasswordInput
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              darkMode={darkMode}
              show={showPassword}
              setShow={setShowPassword}
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Confirm Password</label>
            <PasswordInput
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              darkMode={darkMode}
              show={showConfirmPassword}
              setShow={setShowConfirmPassword}
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Register As</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:border-red-500 transition-colors duration-300
                ${darkMode ? "bg-[#0f1623] text-white border-gray-700" : "bg-gray-100 text-gray-800 border-gray-300"}`}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="ambulance_driver">Ambulance Driver</option>
            </select>
          </div>

          {/* Doctor Fields */}
          {formData.role === "doctor" && (
            <>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Cardiology, Neurology"
                  required
                  maxLength={80}
                  className={`w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:border-red-500 transition-colors duration-300
                    ${darkMode ? "bg-[#0f1623] text-white border-gray-700" : "bg-gray-100 text-gray-800 border-gray-300"}`}
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Experience (years)</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  required
                  min={0}
                  max={70}
                  className={`w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:border-red-500 transition-colors duration-300
                    ${darkMode ? "bg-[#0f1623] text-white border-gray-700" : "bg-gray-100 text-gray-800 border-gray-300"}`}
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="Enter license number"
                  required
                  maxLength={60}
                  className={`w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:border-red-500 transition-colors duration-300
                    ${darkMode ? "bg-[#0f1623] text-white border-gray-700" : "bg-gray-100 text-gray-800 border-gray-300"}`}
                />
              </div>
            </>
          )}

          {/* Ambulance Driver Fields */}
          {formData.role === "ambulance_driver" && (
            <>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="Enter license number"
                  required
                  maxLength={60}
                  className={`w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:border-red-500 transition-colors duration-300
                    ${darkMode ? "bg-[#0f1623] text-white border-gray-700" : "bg-gray-100 text-gray-800 border-gray-300"}`}
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Vehicle Number</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  placeholder="Enter vehicle number"
                  required
                  maxLength={30}
                  className={`w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:border-red-500 transition-colors duration-300
                    ${darkMode ? "bg-[#0f1623] text-white border-gray-700" : "bg-gray-100 text-gray-800 border-gray-300"}`}
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition duration-200 disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>

          {/* Login Link */}
          <p className={`text-sm text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-red-400 cursor-pointer hover:underline"
            >
              Login here
            </span>
          </p>

        </div>
      </div>
    </div>
  );
};

const PasswordInput = ({ darkMode, show, setShow, ...props }) => (
  <div className="relative">
    <input
      {...props}
      type={show ? "text" : "password"}
      required
      minLength={8}
      className={`w-full rounded-lg border px-4 py-3 pr-12 text-sm transition-colors duration-300 focus:border-red-500 focus:outline-none
        ${darkMode ? "border-gray-700 bg-[#0f1623] text-white" : "border-gray-300 bg-gray-100 text-gray-800"}`}
    />
    <button
      type="button"
      onClick={() => setShow(!show)}
      className={`absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md ${darkMode ? "text-gray-400" : "text-gray-500"} hover:text-red-400`}
      aria-label={show ? "Hide password" : "Show password"}
    >
      <EyeIcon crossed={show} />
    </button>
  </div>
);

const EyeIcon = ({ crossed }) => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    {crossed && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4l16 16" />}
  </svg>
);

export default Register;
