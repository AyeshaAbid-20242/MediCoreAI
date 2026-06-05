import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiError } from "../../api/axios";
import { loginUser } from "../../api/authApi";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
    if (!emailIsValid || !formData.password) {
      setError("Please enter a valid email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser(formData);
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "doctor") navigate("/doctor/dashboard");
      else if (user.role === "patient") navigate("/patient/dashboard");
      else if (user.role === "ambulance_driver") navigate("/ambulance/dashboard");
      else setError(`Unsupported account role: ${user.role}`);
    } catch (err) {
      setError(getApiError(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const bg = darkMode ? "bg-[#060D18]" : "bg-[#EEF3F6]";
  const panel = darkMode ? "bg-[#0D1F35]" : "bg-white";
  const panelMuted = darkMode ? "bg-[#0A1628]" : "bg-[#F7FAFC]";
  const text = darkMode ? "text-[#E2E8F0]" : "text-[#0A1628]";
  const subtext = darkMode ? "text-[#94A3B8]" : "text-[#64748B]";
  const border = darkMode ? "border-[#162940]" : "border-[#DDE6EE]";

  return (
    <div className={`min-h-screen ${bg} flex items-center justify-center p-4 transition-colors duration-300`}>
      <div className={`w-full max-w-md rounded-xl border ${border} ${panel} shadow-[0_14px_34px_rgba(10,22,40,0.08)] transition-colors duration-300`}>

        {/* Header */}
        <div className={`flex items-center justify-between border-b ${border} px-6 py-5`}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C8102E]">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <p className={`text-sm font-black ${text}`}>MediCore</p>
              <p className={`text-[11px] font-semibold ${subtext}`}>Enterprise Health OS</p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border ${border} ${panelMuted} transition-colors`}
          >
            {darkMode ? (
              <svg className={`h-4 w-4 ${subtext}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className={`h-4 w-4 ${subtext}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-8">
          <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${subtext}`}>
            Welcome back
          </p>
          <h1 className={`mt-2 text-2xl font-black tracking-tight ${text}`}>
            Sign in to your account
          </h1>
          <p className={`mt-1 text-sm font-medium ${subtext}`}>
            Enter your credentials to continue
          </p>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm font-bold text-[#991B1B]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Email */}
            <div>
              <label className={`mb-1.5 block text-xs font-black uppercase tracking-wider ${subtext}`}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className={`h-11 w-full rounded-lg border ${border} ${panelMuted} px-3 text-sm font-medium ${text} outline-none focus:border-[#C8102E] transition-colors`}
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className={`text-xs font-black uppercase tracking-wider ${subtext}`}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs font-black text-[#C8102E] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className={`h-11 w-full rounded-lg border ${border} ${panelMuted} px-3 text-sm font-medium ${text} outline-none focus:border-[#C8102E] transition-colors`}
              />
            </div>

            {/* Submit */}
            <div className="mt-2 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="h-11 px-10 rounded-lg bg-[#C8102E] text-sm font-black text-white transition hover:bg-[#a50d25] disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={`border-t ${border} px-6 py-4 text-center`}>
          <p className={`text-sm font-medium ${subtext}`}>
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="font-black text-[#C8102E] hover:underline"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;