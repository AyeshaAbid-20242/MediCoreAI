import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiError } from "../../api/axios";
import {
  resetPassword,
  sendForgotPasswordOtp,
  verifyPasswordOtp,
} from "../../api/authApi";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("medicore-theme") !== "light");
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    localStorage.setItem("medicore-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const inputClass = `w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:border-red-500 transition-colors duration-300
    ${darkMode ? "bg-[#0f1623] text-white border-gray-700" : "bg-gray-100 text-gray-800 border-gray-300"}`;

  // Step 1 - Send OTP
  const handleSendOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await sendForgotPasswordOtp(email);
      if (res.data.otp) {
        setOtp(res.data.otp);
        setSuccess(`${res.data.message} OTP: ${res.data.otp}`);
      } else {
        setSuccess(res.data.message);
      }
      setStep(2);
    } catch (err) {
      setError(getApiError(err, "Failed to send OTP"));
    } finally {
      setLoading(false);
    }
  };

  // Step 2 - Verify OTP
  const handleVerifyOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await verifyPasswordOtp(email, otp);
      setSuccess(res.data.message);
      setStep(3);
    } catch (err) {
      setError(getApiError(err, "Invalid OTP"));
    } finally {
      setLoading(false);
    }
  };

  // Step 3 - Reset Password
  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await resetPassword({
        email,
        otp,
        newPassword
      });
      setSuccess(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(getApiError(err, "Failed to reset password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? "bg-[#0f1623]" : "bg-gray-100"}`}>
      <div className={`p-8 rounded-2xl shadow-lg w-full max-w-md transition-colors duration-300 ${darkMode ? "bg-[#1a2235]" : "bg-white"}`}>

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500 p-2 text-xl font-black text-white [&>span]:hidden">+
              <span className="text-white text-xl">❤️</span>
            </div>
            <div>
              <h1 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>MediCore</h1>
              <p className="text-gray-400 text-xs">Enterprise Health OS</p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`relative p-2 rounded-full text-xl text-transparent transition-colors duration-300 ${darkMode ? "bg-[#0f1623]" : "bg-gray-200"}`}
          >
            <span className={`absolute inset-0 flex items-center justify-center ${darkMode ? "text-yellow-400" : "text-gray-700"}`}>
              {darkMode ? "☀" : "◐"}
            </span>
            {darkMode ? "🌙" : "☀️"}
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300
                ${step >= s ? "bg-red-500 text-white" : darkMode ? "bg-[#0f1623] text-gray-500" : "bg-gray-200 text-gray-400"}`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-8 h-1 rounded transition-colors duration-300
                  ${step > s ? "bg-red-500" : darkMode ? "bg-gray-700" : "bg-gray-300"}`}
                />
              )}
            </div>
          ))}
        </div>

        <h2 className={`text-2xl font-bold mb-1 ${darkMode ? "text-white" : "text-gray-800"}`}>
          {step === 1 && "Forgot Password"}
          {step === 2 && "Verify OTP"}
          {step === 3 && "Reset Password"}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {step === 1 && "Enter your email to receive an OTP"}
          {step === 2 && "Enter the OTP sent to your email"}
          {step === 3 && "Enter your new password"}
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        <div className="space-y-4">

          {/* Step 1 - Email */}
          {step === 1 && (
            <>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={inputClass}
                />
              </div>
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition duration-200 disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          )}

          {/* Step 2 - OTP */}
          {step === 2 && (
            <>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className={inputClass}
                />
              </div>
              <button
                onClick={handleVerifyOTP}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition duration-200 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <p className="text-gray-400 text-sm text-center">
                Didn't receive OTP?{" "}
                <span
                  onClick={() => { setStep(1); setError(""); setSuccess(""); }}
                  className="text-red-400 cursor-pointer hover:underline"
                >
                  Resend
                </span>
              </p>
            </>
          )}

          {/* Step 3 - New Password */}
          {step === 3 && (
            <>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">New Password</label>
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  inputClass={inputClass}
                  show={showNewPassword}
                  setShow={setShowNewPassword}
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Confirm Password</label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  inputClass={inputClass}
                  show={showConfirmPassword}
                  setShow={setShowConfirmPassword}
                />
              </div>
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition duration-200 disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </>
          )}

          {/* Back to Login */}
          <p className={`text-sm text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Remember your password?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-red-400 cursor-pointer hover:underline"
            >
              Back to Login
            </span>
          </p>

        </div>
      </div>
    </div>
  );
};

const PasswordInput = ({ inputClass, show, setShow, ...props }) => (
  <div className="relative">
    <input {...props} type={show ? "text" : "password"} className={`${inputClass} pr-12`} />
    <button
      type="button"
      onClick={() => setShow(!show)}
      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 hover:text-red-400"
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

export default ForgotPassword;
