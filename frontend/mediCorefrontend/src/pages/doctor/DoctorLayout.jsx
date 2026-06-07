import { useState } from "react";
import DoctorSidebar from "./DoctorSidebar";
import { doctorNavItems } from "../sidebarNav";
import ThemeToggle from "../../components/ThemeToggle";

const DoctorLayout = ({ doctor, activeTab, setActiveTab, darkMode, setDarkMode, theme, children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-300`}>
      {menuOpen && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-[#020617]/60 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0A1628] transition-transform lg:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#1E2D45] px-4 py-4 text-white">
          <div>
            <p className="font-black">MediCore</p>
            <p className="text-xs text-[#94A3B8]">Doctor console</p>
          </div>
          <button className="rounded-lg border border-[#1E2D45] px-3 py-2 text-sm" onClick={() => setMenuOpen(false)}>
            Close
          </button>
        </div>
        <nav className="space-y-1.5 p-4">
          {doctorNavItems.map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key);
                setMenuOpen(false);
              }}
              className={`h-11 w-full rounded-lg px-4 text-left text-sm font-bold ${
                activeTab === key
                  ? "bg-[#C8102E] text-white"
                  : "text-[#94A3B8] hover:bg-[#1E2D45] hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex">
        <DoctorSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} doctor={doctor} />
        <main className="min-w-0 flex-1">
          <header className={`sticky top-0 z-20 border-b ${theme.border} ${theme.header} backdrop-blur-xl`}>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 lg:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border ${theme.border} ${theme.panel} text-xs font-black ${theme.text} lg:hidden`}
                  onClick={() => setMenuOpen(true)}
                  aria-label="Open menu"
                >
                  Menu
                </button>
                <div className="min-w-0">
                  <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.subtext}`}>Doctor dashboard</p>
                  <h1 className={`truncate text-xl font-black ${theme.text}`}>
                    {doctor?.fullName || doctor?.name || "Doctor"} practice hub
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode(!darkMode)} theme={theme} />
                <div className="rounded-lg bg-[#C8102E] px-3 py-2 text-xs font-black text-white">
                  {(doctor?.status || "pending").toUpperCase()}
                </div>
                <div className={`hidden items-center gap-2 rounded-lg border ${theme.border} ${theme.panel} px-3 py-2 lg:flex`}>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C8102E] text-xs font-black text-white">
                    {(doctor?.fullName || doctor?.name || "D").charAt(0).toUpperCase()}
                  </div>
                  <span className={`text-sm font-black ${theme.text}`}>
                    {doctor?.fullName || doctor?.name || "Doctor"}
                  </span>
                </div>
              </div>
            </div>
          </header>
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
