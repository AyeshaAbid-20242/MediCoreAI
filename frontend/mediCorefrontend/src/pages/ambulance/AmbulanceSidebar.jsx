export const navItems = [
  ["overview", "Overview", "M4 6h16M4 12h16M4 18h16"],
  ["profile", "Profile", "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"],
  ["jobs", "Active Jobs", "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"],
  ["payments", "Payments", "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"],
  ["subscription", "Subscription", "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"],
];

const AmbulanceSidebar = ({ activeTab, setActiveTab, onLogout, driver }) => (
  <aside className="hidden min-h-screen w-64 shrink-0 flex-col border-r border-[#1E2D45] bg-[#0A1628] lg:flex">

    {/* Logo */}
    <div className="border-b border-[#1E2D45] px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C8102E]">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-black text-white">MediCore</p>
          <p className="text-[11px] font-semibold text-[#94A3B8]">Driver console</p>
        </div>
      </div>
    </div>

    {/* Driver Info */}
    <div className="border-b border-[#1E2D45] px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1E2D45] text-sm font-black text-white">
          {driver?.name?.charAt(0).toUpperCase() || "D"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-white">{driver?.name || "Driver"}</p>
          <p className="truncate text-[11px] font-semibold text-[#94A3B8]">{driver?.vehicleNumber || "No vehicle assigned"}</p>
        </div>
      </div>
    </div>

    {/* Nav */}
    <nav className="flex-1 space-y-1 p-4">
      <p className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#4A5568]">Navigation</p>
      {navItems.map(([key, label, path]) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-bold transition-colors
            ${activeTab === key
              ? "bg-white text-[#0A1628]"
              : "text-[#94A3B8] hover:bg-[#15243A] hover:text-white"}`}
        >
          <svg
            className={`h-4 w-4 shrink-0 ${activeTab === key ? "text-[#C8102E]" : "text-[#94A3B8]"}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
          </svg>
          {label}
        </button>
      ))}
    </nav>

    {/* Bottom */}
    <div className="border-t border-[#1E2D45] p-4 space-y-2">
      <div className="rounded-lg border border-[#1E2D45] bg-[#0D1F35] px-3 py-2">
        <p className="text-[10px] font-black uppercase tracking-wider text-[#4A5568]">Subscription</p>
        <p className={`text-xs font-black mt-0.5
          ${driver?.subscriptionStatus === "active" ? "text-green-400" :
            driver?.subscriptionStatus === "expired" ? "text-red-400" :
            "text-yellow-400"}`}>
          {(driver?.subscriptionStatus || "none").toUpperCase()}
        </p>
      </div>
      <button
        onClick={onLogout}
        className="h-9 w-full rounded-lg border border-[#1E2D45] text-sm font-black text-[#94A3B8] transition hover:border-[#C8102E] hover:text-[#C8102E]"
      >
        Sign Out
      </button>
    </div>
  </aside>
);

export default AmbulanceSidebar;