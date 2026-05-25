import { useNavigate } from "react-router-dom";

export const navItems = [
  ["overview", "Dashboard"],
  ["pending", "Pending Approvals"],
  ["users", "All Users"],
  ["doctors", "Doctors"],
  ["patients", "Patients"],
  ["ambulance", "Ambulance"],
  ["subscriptions", "Subscriptions"],
  ["appointments", "Appointments"],
  ["payments", "Payments"],
  ["analytics", "Analytics"],
  ["reviews", "Reviews"],
  ["messages", "Messages"],
  ["settings", "Settings"],
];

const AdminSidebar = ({ activeTab, setActiveTab, onLogout, pendingCount }) => {
  const mainItems = navItems.slice(0, 6);
  const clinicalItems = navItems.slice(6);

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#1E2D45] bg-[#0A1628] lg:flex">

      {/* Logo */}
      <div className="border-b border-[#1E2D45] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C8102E]">
            <span className="text-sm font-black text-white">M</span>
          </div>
          <div>
            <p className="font-black text-white">MediCore</p>
            <p className="text-xs text-[#94A3B8]">Enterprise Health OS</p>
          </div>
        </div>
      </div>

      {/* Live Status */}
      <div className="border-b border-[#1E2D45] px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
          <div>
            <p className="text-xs font-black text-white">Live — All Systems Normal</p>
            <p className="text-xs text-[#94A3B8]">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-4">
        <p className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8]">Main Menu</p>
        <div className="space-y-1 mb-6">
          {mainItems.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm font-bold transition-colors
                ${activeTab === key
                  ? "bg-[#C8102E] text-white"
                  : "text-[#94A3B8] hover:bg-[#1E2D45] hover:text-white"}`}
            >
              <span>{label}</span>
              {key === "pending" && pendingCount > 0 && (
                <span className="rounded-full bg-[#C8102E] px-2 py-0.5 text-[10px] font-black text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <p className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8]">Clinical</p>
        <div className="space-y-1">
          {clinicalItems.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex h-10 w-full items-center rounded-lg px-3 text-left text-sm font-bold transition-colors
                ${activeTab === key
                  ? "bg-[#C8102E] text-white"
                  : "text-[#94A3B8] hover:bg-[#1E2D45] hover:text-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Logout */}
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
};

export default AdminSidebar;