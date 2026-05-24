const navItems = [
  ["overview", "Overview"],
  ["profile", "Profile"],
  ["appointments", "Appointments"],
  ["payments", "Payments"],
  ["reviews", "Reviews"],
  ["subscription", "Subscription"],
];

const navIcon = {
  overview: "⌁",
  profile: "Dr",
  appointments: "Ap",
  payments: "Rs",
  reviews: "★",
  subscription: "Sub",
};

const DoctorSidebar = ({ activeTab, setActiveTab, onLogout }) => (
  <aside className="hidden min-h-screen w-64 shrink-0 border-r border-[#1E2D45] bg-[#0A1628] text-white lg:flex lg:flex-col">
    <div className="border-b border-[#1E2D45] px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C8102E] text-lg font-black">
          M
        </div>
        <div>
          <p className="text-base font-black">MediCore</p>
          <p className="text-xs font-semibold text-[#94A3B8]">Doctor console</p>
        </div>
      </div>
    </div>

    <nav className="flex-1 space-y-1.5 p-4">
      {navItems.map(([key, label]) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-bold transition ${
            activeTab === key
              ? "bg-white text-[#0A1628]"
              : "text-[#94A3B8] hover:bg-[#15243A] hover:text-white"
          }`}
        >
          <span className={`flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-black ${
            activeTab === key ? "bg-[#C8102E] text-white" : "bg-[#15243A] text-[#CBD5E1]"
          }`}>
            {navIcon[key]}
          </span>
          {label}
        </button>
      ))}
    </nav>

    <div className="border-t border-[#1E2D45] p-4">
      <button
        onClick={onLogout}
        className="h-10 w-full rounded-lg bg-[#C8102E] text-sm font-black text-white transition hover:bg-[#A30D26]"
      >
        Logout
      </button>
    </div>
  </aside>
);

export { navItems };
export default DoctorSidebar;
