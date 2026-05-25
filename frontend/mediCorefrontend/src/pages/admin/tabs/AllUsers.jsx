import { motion } from "framer-motion";
import { useState } from "react";

const AllUsers = ({ allUsers, roleFilter, statusFilter, setRoleFilter, setStatusFilter, onDelete, onExport, onEdit, onBlockUnblock, onResendPassword, theme }) => {
  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;
  const softClass = `rounded-lg border ${theme.border} ${theme.panelMuted}`;
  const inputClass = `h-9 rounded-lg border ${theme.border} ${theme.panel} px-3 text-sm font-medium ${theme.text} focus:outline-none focus:border-[#C8102E]`;

  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEditOpen = (u) => {
    setEditModal(u);
    setEditForm({
      name: u.name || "",
      city: u.city || "",
      specialization: u.specialization || "",
      experience: u.experience || "",
      consultationFee: u.consultationFee || "",
      vehicleNumber: u.vehicleNumber || "",
      ambulanceType: u.ambulanceType || "",
    });
  };

  const handleEditSave = async () => {
    await onEdit(editModal._id, editForm);
    setEditModal(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`text-xl font-black tracking-tight ${theme.text}`}>All Users</h2>
          <p className={`mt-0.5 text-sm font-medium ${theme.subtext}`}>{allUsers.length} total users</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={inputClass}>
            <option value="">All Roles</option>
            <option value="doctor">Doctor</option>
            <option value="patient">Patient</option>
            <option value="ambulance_driver">Driver</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="blocked">Blocked</option>
          </select>
          <button
            onClick={onExport}
            className="h-9 rounded-lg bg-[#059669] px-4 text-sm font-black text-white transition hover:bg-[#047857]"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${theme.border}`}>
                {["User", "Role", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider ${theme.subtext}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u, i) => (
                <motion.tr
                  key={u._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className={`border-b ${theme.border} transition-colors hover:${theme.panelMuted}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C8102E]/10 text-sm font-black text-[#C8102E]">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`text-sm font-black ${theme.text}`}>{u.name}</p>
                        <p className={`text-xs font-medium ${theme.subtext}`}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md px-2 py-1 text-[10px] font-black
                      ${u.role === "doctor" ? "bg-[#DBEAFE] text-[#1E40AF]" :
                        u.role === "patient" ? "bg-[#F3E8FF] text-[#6B21A8]" :
                        "bg-[#FEF9C3] text-[#854D0E]"}`}>
                      {u.role === "ambulance_driver" ? "DRIVER" : u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md px-2 py-1 text-[10px] font-black
                      ${u.status === "active" ? "bg-[#DCFCE7] text-[#166534]" :
                        u.status === "approved" ? "bg-[#DBEAFE] text-[#1E40AF]" :
                        u.status === "pending" ? "bg-[#FEF9C3] text-[#854D0E]" :
                        u.status === "blocked" ? "bg-[#FEE2E2] text-[#991B1B]" :
                        "bg-[#F1F5F9] text-[#64748B]"}`}>
                      {u.status.toUpperCase()}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-xs font-semibold ${theme.subtext}`}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleEditOpen(u)}
                        className={`h-8 rounded-lg border ${theme.border} px-3 text-xs font-black ${theme.subtext} transition hover:border-[#0891B2] hover:text-[#0891B2]`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onBlockUnblock(u._id)}
                        className={`h-8 rounded-lg border px-3 text-xs font-black transition
                          ${u.status === "blocked"
                            ? "border-[#059669]/30 text-[#059669] hover:bg-[#059669] hover:text-white"
                            : "border-[#F59E0B]/30 text-[#F59E0B] hover:bg-[#F59E0B] hover:text-white"}`}
                      >
                        {u.status === "blocked" ? "Unblock" : "Block"}
                      </button>
                      <button
                        onClick={() => onResendPassword(u._id)}
                        className={`h-8 rounded-lg border ${theme.border} px-3 text-xs font-black ${theme.subtext} transition hover:border-[#6366F1] hover:text-[#6366F1]`}
                      >
                        Resend
                      </button>
                      <button
                        onClick={() => onDelete(u._id)}
                        className="h-8 rounded-lg border border-[#C8102E]/30 px-3 text-xs font-black text-[#C8102E] transition hover:bg-[#C8102E] hover:text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md rounded-xl border ${theme.border} ${theme.panel} p-6 shadow-2xl`}
          >
            <h3 className={`font-black text-lg ${theme.text}`}>Edit User</h3>
            <p className={`text-xs font-medium ${theme.subtext} mb-5`}>{editModal.email}</p>

            <div className="space-y-3">
              {[
                { label: "Name", key: "name" },
                { label: "City", key: "city" },
                ...(editModal.role === "doctor" ? [
                  { label: "Specialization", key: "specialization" },
                  { label: "Experience (years)", key: "experience" },
                  { label: "Consultation Fee", key: "consultationFee" },
                ] : []),
                ...(editModal.role === "ambulance_driver" ? [
                  { label: "Vehicle Number", key: "vehicleNumber" },
                  { label: "Ambulance Type", key: "ambulanceType" },
                ] : []),
              ].map((field) => (
                <div key={field.key}>
                  <label className={`text-xs font-black ${theme.subtext} mb-1 block`}>{field.label}</label>
                  <input
                    type="text"
                    value={editForm[field.key] || ""}
                    onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                    className={`w-full h-10 rounded-lg border ${theme.border} ${theme.panelMuted} px-3 text-sm font-medium ${theme.text} focus:outline-none focus:border-[#C8102E]`}
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={handleEditSave}
                className="flex-1 h-10 rounded-lg bg-[#C8102E] text-sm font-black text-white transition hover:bg-[#a50d25]"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditModal(null)}
                className={`flex-1 h-10 rounded-lg border ${theme.border} text-sm font-black ${theme.subtext} transition hover:${theme.panelMuted}`}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;