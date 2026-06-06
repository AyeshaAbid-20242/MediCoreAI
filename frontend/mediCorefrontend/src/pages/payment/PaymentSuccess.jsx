import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyPayment } from "../../api/paymentApi";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const checkPayment = async () => {
      const sessionId = searchParams.get("session_id");
      if (!sessionId) {
        setStatus("error");
        setMessage("Invalid payment session");
        return;
      }

      try {
        const data = await verifyPayment(sessionId);
        setStatus("success");
        setMessage(data.message);
        const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({
          ...savedUser,
          subscriptionStatus: data.subscription.status,
          packageName: data.subscription.packageName,
        }));
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Payment verification failed");
      }
    };

    void checkPayment();
  }, [searchParams]);

  const handleContinue = () => {
    if (user.role === "doctor") navigate("/doctor/dashboard");
    else if (user.role === "ambulance_driver") navigate("/ambulance/dashboard");
    else navigate("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EEF3F6] p-4">
      <div className="w-full max-w-md rounded-xl border border-[#DDE6EE] bg-white p-8 shadow text-center">

        {status === "verifying" && (
          <>
            <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-[#C8102E] border-t-transparent" />
            <h2 className="text-xl font-black text-[#0A1628]">Verifying Payment</h2>
            <p className="mt-2 text-sm font-semibold text-[#64748B]">Please wait while we confirm your payment...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#DCFCE7]">
              <svg className="h-8 w-8 text-[#166534]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-[#0A1628]">Payment Successful!</h2>
            <p className="mt-2 text-sm font-semibold text-[#64748B]">{message}</p>
            <p className="mt-1 text-sm font-semibold text-[#64748B]">Your subscription is now active.</p>
            <button
              onClick={handleContinue}
              className="mt-6 h-11 w-full rounded-lg bg-[#C8102E] text-sm font-black text-white hover:bg-[#a50d25] transition"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FEE2E2]">
              <svg className="h-8 w-8 text-[#991B1B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-[#0A1628]">Payment Failed</h2>
            <p className="mt-2 text-sm font-semibold text-[#64748B]">{message}</p>
            <button
              onClick={handleContinue}
              className="mt-6 h-11 w-full rounded-lg bg-[#C8102E] text-sm font-black text-white hover:bg-[#a50d25] transition"
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;