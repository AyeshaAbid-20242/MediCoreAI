import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiError } from "../../api/axios";
import { getDoctorDashboard } from "../../api/doctorApi";
import DoctorAppointments from "./DoctorAppointments";
import DoctorLayout from "./DoctorLayout";
import DoctorOverview from "./DoctorOverview";
import DoctorPayments from "./DoctorPayments";
import DoctorProfile from "./DoctorProfile";
import DoctorReviews from "./DoctorReviews";
import DoctorSubscription from "./DoctorSubscription";

const emptyDashboard = {
  doctor: null,
  stats: {},
  appointments: [],
  payments: [],
  reviews: [],
};

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const theme = useMemo(
    () =>
      darkMode
        ? {
            bg: "bg-[#060D18]",
            panel: "bg-[#0D1F35]",
            panelMuted: "bg-[#0A1628]",
            text: "text-[#E2E8F0]",
            subtext: "text-[#94A3B8]",
            border: "border-[#162940]",
            header: "bg-[#0D1F35]/90",
            line: "#162940",
            darkMode,
          }
        : {
            bg: "bg-[#EEF3F6]",
            panel: "bg-white",
            panelMuted: "bg-[#F7FAFC]",
            text: "text-[#0A1628]",
            subtext: "text-[#64748B]",
            border: "border-[#DDE6EE]",
            header: "bg-white/90",
            line: "#DDE6EE",
            darkMode,
          },
    [darkMode]
  );

  const loadDashboard = useCallback(async () => {
    setError("");
    try {
      const res = await getDoctorDashboard();
      setDashboard(res.data);
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...savedUser, ...res.data.doctor }));
    } catch (err) {
      setError(getApiError(err, "Could not load doctor dashboard"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await loadDashboard();
    };
    void init();
  }, [loadDashboard]);

  const visibleDashboard = useMemo(() => {
    const appointments = dashboard.appointments || [];
    return {
      ...dashboard,
      appointments,
      payments: dashboard.payments || [],
      reviews: dashboard.reviews || [],
      stats: dashboard.stats || {},
    };
  }, [dashboard]);

  const updateDoctor = (doctor) => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    localStorage.setItem("user", JSON.stringify({ ...savedUser, ...doctor }));
    setDashboard((current) => ({ ...current, doctor }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF3F6]">
        <div className="rounded-lg border border-[#DDE6EE] bg-white px-6 py-5 text-sm font-black text-[#0A1628] shadow">
          Loading doctor dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF3F6] p-4">
        <div className="max-w-md rounded-lg border border-[#FCA5A5] bg-white p-6 shadow">
          <h1 className="text-lg font-black text-[#991B1B]">Doctor dashboard unavailable</h1>
          <p className="mt-2 text-sm font-semibold text-[#64748B]">{error}</p>
        </div>
      </div>
    );
  }

  const content = {
    overview: (
      <DoctorOverview
        doctor={visibleDashboard.doctor}
        stats={visibleDashboard.stats}
        appointments={visibleDashboard.appointments}
        payments={visibleDashboard.payments}
        reviews={visibleDashboard.reviews}
        setActiveTab={setActiveTab}
        theme={theme}
      />
    ),
    profile: <DoctorProfile doctor={visibleDashboard.doctor} onUpdated={updateDoctor} theme={theme} />,
    appointments: <DoctorAppointments appointments={visibleDashboard.appointments} onRefresh={loadDashboard} theme={theme} />,
    payments: <DoctorPayments payments={visibleDashboard.payments} theme={theme} />,
    reviews: <DoctorReviews reviews={visibleDashboard.reviews} stats={visibleDashboard.stats} theme={theme} />,
    subscription: <DoctorSubscription doctor={visibleDashboard.doctor} onUpdated={updateDoctor} theme={theme} />,
  };

  return (
    <DoctorLayout
      doctor={visibleDashboard.doctor}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      theme={theme}
    >
      {content[activeTab] || content.overview}
    </DoctorLayout>
  );
};

export default DoctorDashboard;
