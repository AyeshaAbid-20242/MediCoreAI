const navItems = [
  ["overview", "Overview"],
  ["profile", "Profile"],
  ["appointments", "Appointments"],
  ["payments", "Payments"],
  ["reviews", "Reviews"],
  ["subscription", "Subscription"],
];

const DoctorSidebar = ({ activeTab, setActiveTab, onLogout, doctor }) => (
  <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#1E2D45] bg-[#0A1628] lg:flex">
    <div className="border-b border-[#1E2D45] px-5 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C8102E]">
          <span className="text-sm font-black text-white">M</span>
        </div>
        <div>
          <p className="font-black text-white">MediCore</p>
          <p className="text-xs text-[#94A3B8]">Doctor console</p>
        </div>
      </div>
    </div>

    <div className="border-b border-[#1E2D45] px-5 py-4">
      <p className="truncate text-sm font-black text-white">
        {doctor?.fullName || doctor?.name || "Doctor"}
      </p>
      <p className="truncate text-[11px] font-semibold text-[#94A3B8]">
        {doctor?.specialization || "Practice hub"}
      </p>
    </div>

    <nav className="flex-1 space-y-1 p-4">
      <p className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8]">
        Navigation
      </p>
      {navItems.map(([key, label]) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`flex h-10 w-full items-center rounded-lg px-3 text-left text-sm font-bold transition-colors ${
            activeTab === key
              ? "bg-[#C8102E] text-white"
              : "text-[#94A3B8] hover:bg-[#1E2D45] hover:text-white"
          }`}
        >
          {label}
        </button>
      ))}
    </nav>

    <div className="border-t border-[#1E2D45] p-4">
      <button
        onClick={onLogout}
        className="h-10 w-full rounded-lg border border-[#1E2D45] text-sm font-black text-[#94A3B8] transition hover:border-[#C8102E] hover:text-[#C8102E]"
      >
        Sign Out
      </button>
    </div>
  </aside>
);

export { navItems };
export default DoctorSidebar;
