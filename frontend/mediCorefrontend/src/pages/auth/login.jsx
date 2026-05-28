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

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? "bg-[#0f1623]" : "bg-gray-100"}`}>
      <div className={`p-8 rounded-2xl shadow-lg w-full max-w-md transition-colors duration-300 ${darkMode ? "bg-[#1a2235]" : "bg-white"}`}>

        {/* Top bar - Logo + Theme Toggle */}
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

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full text-xl transition-colors duration-300 ${darkMode ? "bg-[#0f1623] text-yellow-400" : "bg-gray-200 text-gray-700"}`}
          >
            {darkMode ? "🌙" : "☀️"}
          </button>
        </div>

        <h2 className={`text-2xl font-bold mb-1 ${darkMode ? "text-white" : "text-gray-800"}`}>
          Welcome Back
        </h2>
        <p className="text-gray-400 text-sm mb-6">Sign in to your account</p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
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
                ${darkMode
                  ? "bg-[#0f1623] text-white border-gray-700"
                  : "bg-gray-100 text-gray-800 border-gray-300"
                }`}
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className={`w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:border-red-500 transition-colors duration-300
                ${darkMode
                  ? "bg-[#0f1623] text-white border-gray-700"
                  : "bg-gray-100 text-gray-800 border-gray-300"
                }`}
            />
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <span
              onClick={() => navigate("/forgot-password")}
              className="text-red-400 text-sm cursor-pointer hover:underline"
            >
              Forgot Password?
            </span>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition duration-200 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Register Link */}
          <p className={`text-sm text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-red-400 cursor-pointer hover:underline"
            >
              Register here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
