import { useNavigate } from "react-router-dom";

const PaymentCancel = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleBack = () => {
    if (user.role === "doctor") navigate("/doctor/dashboard");
    else if (user.role === "ambulance_driver") navigate("/ambulance/dashboard");
    else navigate("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EEF3F6] p-4">
      <div className="w-full max-w-md rounded-xl border border-[#DDE6EE] bg-white p-8 shadow text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF9C3]">
          <svg className="h-8 w-8 text-[#854D0E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-black text-[#0A1628]">Payment Cancelled</h2>
        <p className="mt-2 text-sm font-semibold text-[#64748B]">
          Your payment was cancelled. No charges were made.
        </p>
        <button
          onClick={handleBack}
          className="mt-6 h-11 w-full rounded-lg bg-[#C8102E] text-sm font-black text-white hover:bg-[#a50d25] transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentCancel;