const PendingApproval = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EEF3F6] p-4">
      <section className="w-full max-w-lg rounded-lg border border-[#DDE6EE] bg-white p-6 shadow-[0_14px_34px_rgba(10,22,40,0.08)]">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#C8102E] text-lg font-black text-white">
          M
        </div>
        <h1 className="text-2xl font-black text-[#0A1628]">Approval pending</h1>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-[#64748B]">
          {user.fullName || user.name || "Doctor"}, your doctor account is pending admin approval. Once approved, you can access the dashboard and activate your subscription.
        </p>
        <button onClick={handleLogout} className="mt-5 h-11 rounded-lg bg-[#C8102E] px-5 text-sm font-black text-white">
          Back to login
        </button>
      </section>
    </div>
  );
};

export default PendingApproval;
