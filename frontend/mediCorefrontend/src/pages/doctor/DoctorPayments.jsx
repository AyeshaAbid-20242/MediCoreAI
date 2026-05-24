const DoctorPayments = ({ payments, theme }) => (
  <section className={`rounded-lg border ${theme.border} ${theme.panel} p-4 shadow-[0_14px_34px_rgba(10,22,40,0.06)]`}>
    <h2 className={`text-lg font-black ${theme.text}`}>Payment Records</h2>
    <p className={`text-sm font-semibold ${theme.subtext}`}>Placeholder payment records from paid appointments.</p>
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[680px] text-left">
        <thead className={`${theme.panelMuted} text-[11px] uppercase tracking-[0.12em] ${theme.subtext}`}>
          <tr>
            <th className="px-4 py-3">Patient</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment._id} className={`border-t ${theme.border}`}>
              <td className={`px-4 py-3 text-sm font-bold ${theme.text}`}>{payment.patient?.fullName || payment.patient?.name || "Patient"}</td>
              <td className={`px-4 py-3 text-sm ${theme.subtext}`}>Rs. {Number(payment.amount).toLocaleString()}</td>
              <td className="px-4 py-3 text-sm font-black text-[#059669]">{payment.paymentStatus}</td>
              <td className={`px-4 py-3 text-sm ${theme.subtext}`}>{new Date(payment.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!payments.length && <p className={`py-6 text-sm font-semibold ${theme.subtext}`}>No payments yet.</p>}
    </div>
  </section>
);

export default DoctorPayments;
