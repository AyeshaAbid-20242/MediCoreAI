import { motion } from "framer-motion";
import { useState } from "react";

const Messages = ({ allUsers, onSendEmail, onBroadcast, theme }) => {
  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;
  const inputClass = `h-10 w-full rounded-lg border ${theme.border} ${theme.panelMuted} px-3 text-sm font-medium ${theme.text} focus:outline-none focus:border-[#C8102E]`;

  const [activeSection, setActiveSection] = useState("individual");
  const [selectedUser, setSelectedUser] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [broadcastRole, setBroadcastRole] = useState("all");
  const [loading, setLoading] = useState(false);

  const handleSendIndividual = async () => {
    if (!selectedUser || !subject || !message) return;
    setLoading(true);
    await onSendEmail(selectedUser, { subject, message });
    setSubject(""); setMessage(""); setSelectedUser("");
    setLoading(false);
  };

  const handleSendBroadcast = async () => {
    if (!subject || !message) return;
    setLoading(true);
    await onBroadcast({ subject, message, role: broadcastRole });
    setSubject(""); setMessage("");
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className={`text-xl font-black tracking-tight ${theme.text}`}>Messages</h2>
        <p className={`mt-0.5 text-sm font-medium ${theme.subtext}`}>Send emails to users or broadcast announcements</p>
      </div>

      {/* Toggle */}
      <div className={`inline-flex rounded-lg border ${theme.border} ${theme.panel} p-1`}>
        {[
          { id: "individual", label: "Send to User" },
          { id: "broadcast", label: "Broadcast" },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`rounded-lg px-5 py-2 text-sm font-black transition-colors
              ${activeSection === s.id ? "bg-[#C8102E] text-white" : `${theme.subtext}`}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Individual */}
      {activeSection === "individual" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`${cardClass} p-6 max-w-2xl`}>
          <h3 className={`font-black ${theme.text}`}>Send Email to User</h3>
          <p className={`text-xs font-medium ${theme.subtext} mb-5`}>Send a direct message to a specific user</p>
          <div className="space-y-3">
            <div>
              <label className={`text-xs font-black ${theme.subtext} mb-1 block`}>Select User</label>
              <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className={inputClass}>
                <option value="">Choose a user...</option>
                {allUsers.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} — {u.email} ({u.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`text-xs font-black ${theme.subtext} mb-1 block`}>Subject</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" className={inputClass} />
            </div>
            <div>
              <label className={`text-xs font-black ${theme.subtext} mb-1 block`}>Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your message..." rows={5} className={`${inputClass} h-auto resize-none py-3`} />
            </div>
            <button
              onClick={handleSendIndividual}
              disabled={loading || !selectedUser || !subject || !message}
              className="h-10 rounded-lg bg-[#C8102E] px-6 text-sm font-black text-white transition hover:bg-[#a50d25] disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Email"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Broadcast */}
      {activeSection === "broadcast" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`${cardClass} p-6 max-w-2xl`}>
          <h3 className={`font-black ${theme.text}`}>Broadcast Email</h3>
          <p className={`text-xs font-medium ${theme.subtext} mb-5`}>Send email to all users or by role</p>
          <div className="space-y-3">
            <div>
              <label className={`text-xs font-black ${theme.subtext} mb-1 block`}>Send To</label>
              <select value={broadcastRole} onChange={(e) => setBroadcastRole(e.target.value)} className={inputClass}>
                <option value="all">All Users</option>
                <option value="doctor">Doctors Only</option>
                <option value="patient">Patients Only</option>
                <option value="ambulance_driver">Drivers Only</option>
              </select>
            </div>
            <div>
              <label className={`text-xs font-black ${theme.subtext} mb-1 block`}>Subject</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" className={inputClass} />
            </div>
            <div>
              <label className={`text-xs font-black ${theme.subtext} mb-1 block`}>Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your broadcast message..." rows={5} className={`${inputClass} h-auto resize-none py-3`} />
            </div>
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
              <p className="text-xs font-black text-yellow-500">
                ⚠️ This will send an email to all {broadcastRole === "all" ? "users" : broadcastRole + "s"} in the system.
              </p>
            </div>
            <button
              onClick={handleSendBroadcast}
              disabled={loading || !subject || !message}
              className="h-10 rounded-lg bg-[#C8102E] px-6 text-sm font-black text-white transition hover:bg-[#a50d25] disabled:opacity-50"
            >
              {loading ? "Broadcasting..." : "Send Broadcast"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Messages;