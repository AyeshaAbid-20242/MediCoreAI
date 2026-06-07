import { useState } from "react";
import AmbulanceSidebar from "./AmbulanceSidebar";
import { ambulanceNavItems } from "../sidebarNav";
import ThemeToggle from "../../components/ThemeToggle";

const AmbulanceLayout = ({ driver, activeTab, setActiveTab, darkMode, setDarkMode, theme, children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-300`}>

      {/* Mobile Overlay */}
      {menuOpen && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-[#020617]/60 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0A1628] transition-transform lg:hidden
        ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-[#1E2D45] px-5 py-4">
          <div>
            <p className="font-black text-white">MediCore</p>
            <p className="text-xs text-[#94A3B8]">Driver console</p>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="rounded-lg border border-[#1E2D45] px-3 py-1.5 text-xs font-black text-white"
          >
            Close
          </button>
        </div>
        <nav className="space-y-1 p-4">
          {ambulanceNavItems.map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setMenuOpen(false); }}
              className={`h-10 w-full rounded-lg px-4 text-left text-sm font-bold transition
                ${activeTab === key ? "bg-[#C8102E] text-white" : "text-[#94A3B8] hover:bg-[#1E2D45] hover:text-white"}`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <AmbulanceSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          driver={driver}
        />

        {/* Main */}
        <main className="min-w-0 flex-1">

          {/* Header */}
          <header className={`sticky top-0 z-20 border-b ${theme.border} ${theme.header} backdrop-blur-xl`}>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 lg:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  onClick={() => setMenuOpen(true)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border ${theme.border} ${theme.panel} text-xs font-black ${theme.text} lg:hidden`}
                >
                  Menu
                </button>
                <div className="min-w-0">
                  <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.subtext}`}>
                    Ambulance Driver Dashboard
                  </p>
                  <h1 className={`truncate text-xl font-black ${theme.text}`}>
                    {driver?.name || "Driver"} operations hub
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode(!darkMode)} theme={theme} />

                {/* Status Badge */}
                <div className={`rounded-lg px-3 py-2 text-xs font-black
                  ${driver?.status === "active" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                    driver?.status === "approved" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                    "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"}`}>
                  {(driver?.status || "pending").toUpperCase()}
                </div>

                {/* Driver Info */}
                <div className={`hidden items-center gap-2 rounded-lg border ${theme.border} ${theme.panel} px-3 py-2 lg:flex`}>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C8102E] text-xs font-black text-white">
                    {driver?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className={`text-sm font-black ${theme.text}`}>{driver?.name}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AmbulanceLayout;
