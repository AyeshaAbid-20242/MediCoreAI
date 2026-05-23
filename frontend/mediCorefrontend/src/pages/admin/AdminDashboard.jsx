import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingUsers, getAllUsers, approveUser, rejectUser, deleteUser } from "../../api/adminApi";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, doctors: 0, patients: 0, drivers: 0, pending: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pending = await getPendingUsers();
      const all = await getAllUsers();

      setPendingUsers(pending.users);
      setAllUsers(all.users);

      setStats({
        total: all.users.length,
        doctors: all.users.filter(u => u.role === "doctor").length,
        patients: all.users.filter(u => u.role === "patient").length,
        drivers: all.users.filter(u => u.role === "ambulance_driver").length,
        pending: pending.users.length
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await approveUser(id);
      setMessage(res.message);
      fetchData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to approve user");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await rejectUser(id);
      setMessage(res.message);
      fetchData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to reject user");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await deleteUser(id);
      setMessage(res.message);
      fetchData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to delete user");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const bg = darkMode ? "bg-[#0f1623]" : "bg-gray-100";
  const card = darkMode ? "bg-[#1a2235]" : "bg-white";
  const text = darkMode ? "text-white" : "text-gray-800";
  const subtext = darkMode ? "text-gray-400" : "text-gray-500";
  const border = darkMode ? "border-gray-700" : "border-gray-200";
  const hover = darkMode ? "hover:bg-[#243050]" : "hover:bg-gray-50";

  return (
    <div className={`min-h-screen ${bg} flex transition-colors duration-300`}>

      {/* Sidebar */}
      <div className={`w-64 ${card} border-r ${border} flex flex-col transition-colors duration-300`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 p-2 rounded-lg">
              <span className="text-white text-lg">❤️</span>
            </div>
            <div>
              <h1 className={`font-bold ${text}`}>MediCore</h1>
              <p className={`text-xs ${subtext}`}>Enterprise Health OS</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: "overview", icon: "📊", label: "Overview" },
            { id: "pending", icon: "⏳", label: "Pending Approvals" },
            { id: "users", icon: "👥", label: "All Users" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors duration-200
                ${activeTab === item.id
                  ? "bg-red-500 text-white"
                  : `${subtext} ${hover}`
                }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.id === "pending" && stats.pending > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className={`p-4 border-t ${border}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className={`text-sm font-medium ${text}`}>{user.name}</p>
              <p className={`text-xs ${subtext}`}>Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-sm text-red-400 hover:text-red-300 text-left px-2 py-1"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Top Bar */}
        <div className={`${card} border-b ${border} px-6 py-4 flex items-center justify-between transition-colors duration-300`}>
          <div>
            <h2 className={`font-bold text-lg ${text}`}>
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "pending" && "Pending Approvals"}
              {activeTab === "users" && "All Users"}
            </h2>
            <p className={`text-xs ${subtext}`}>Welcome back, {user.name}</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full text-xl ${darkMode ? "bg-[#0f1623] text-yellow-400" : "bg-gray-200 text-gray-700"}`}
          >
            {darkMode ? "🌙" : "☀️"}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="mx-6 mt-4 bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg text-sm">
            {message}
          </div>
        )}

        <div className="flex-1 p-6 overflow-auto">

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total Users", value: stats.total, icon: "👥", color: "blue" },
                  { label: "Doctors", value: stats.doctors, icon: "👨‍⚕️", color: "green" },
                  { label: "Patients", value: stats.patients, icon: "🏥", color: "purple" },
                  { label: "Drivers", value: stats.drivers, icon: "🚑", color: "orange" },
                ].map((stat) => (
                  <div key={stat.label} className={`${card} p-5 rounded-xl border ${border} transition-colors duration-300`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{stat.icon}</span>
                    </div>
                    <p className={`text-2xl font-bold ${text}`}>{stat.value}</p>
                    <p className={`text-sm ${subtext}`}>{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Pending Alert */}
              {stats.pending > 0 && (
                <div
                  onClick={() => setActiveTab("pending")}
                  className="bg-red-500/10 border border-red-500 text-red-400 px-5 py-4 rounded-xl cursor-pointer hover:bg-red-500/20 transition"
                >
                  ⚠️ You have <strong>{stats.pending}</strong> pending approval{stats.pending > 1 ? "s" : ""} waiting for your review.
                  <span className="underline ml-2">Click to review →</span>
                </div>
              )}
            </div>
          )}

          {/* Pending Approvals Tab */}
          {activeTab === "pending" && (
            <div className={`${card} rounded-xl border ${border} overflow-hidden`}>
              {pendingUsers.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-4xl mb-3">✅</p>
                  <p className={`${text} font-medium`}>No pending approvals</p>
                  <p className={`${subtext} text-sm`}>All applications have been reviewed</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${border}`}>
                      {["Name", "Email", "Role", "Details", "Actions"].map((h) => (
                        <th key={h} className={`px-4 py-3 text-left text-xs font-medium ${subtext} uppercase`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((u) => (
                      <tr key={u._id} className={`border-b ${border} ${hover} transition-colors`}>
                        <td className={`px-4 py-3 text-sm font-medium ${text}`}>{u.name}</td>
                        <td className={`px-4 py-3 text-sm ${subtext}`}>{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium
                            ${u.role === "doctor" ? "bg-blue-500/20 text-blue-400" : "bg-orange-500/20 text-orange-400"}`}>
                            {u.role === "doctor" ? "Doctor" : "Driver"}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-xs ${subtext}`}>
                          {u.role === "doctor" && `${u.specialization} • ${u.experience} yrs`}
                          {u.role === "ambulance_driver" && `Vehicle: ${u.vehicleNumber}`}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(u._id)}
                              className="bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs px-3 py-1 rounded-lg transition"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleReject(u._id)}
                              className="bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs px-3 py-1 rounded-lg transition"
                            >
                              ✗ Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* All Users Tab */}
          {activeTab === "users" && (
            <div className={`${card} rounded-xl border ${border} overflow-hidden`}>
              {allUsers.length === 0 ? (
                <div className="p-10 text-center">
                  <p className={`${text} font-medium`}>No users found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${border}`}>
                      {["Name", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                        <th key={h} className={`px-4 py-3 text-left text-xs font-medium ${subtext} uppercase`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((u) => (
                      <tr key={u._id} className={`border-b ${border} ${hover} transition-colors`}>
                        <td className={`px-4 py-3 text-sm font-medium ${text}`}>{u.name}</td>
                        <td className={`px-4 py-3 text-sm ${subtext}`}>{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium
                            ${u.role === "doctor" ? "bg-blue-500/20 text-blue-400" :
                              u.role === "patient" ? "bg-purple-500/20 text-purple-400" :
                              "bg-orange-500/20 text-orange-400"}`}>
                            {u.role === "ambulance_driver" ? "Driver" : u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium
                            ${u.status === "active" ? "bg-green-500/20 text-green-400" :
                              u.status === "approved" ? "bg-blue-500/20 text-blue-400" :
                              u.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-red-500/20 text-red-400"}`}>
                            {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-xs ${subtext}`}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDelete(u._id)}
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs px-3 py-1 rounded-lg transition"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;