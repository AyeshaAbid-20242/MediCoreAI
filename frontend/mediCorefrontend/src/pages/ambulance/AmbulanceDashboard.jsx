import { useState, useEffect, useMemo, useCallback } from "react";
import AmbulanceLayout from "./AmbulanceLayout";
import AmbulanceOverview from "./tabs/AmbulanceOverview";
import AmbulanceProfile from "./tabs/AmbulanceProfile";
import AmbulanceJobs from "./tabs/AmbulanceJobs";
import AmbulancePayments from "./tabs/AmbulancePayments";
import AmbulanceSubscription from "./tabs/AmbulanceSubscription";
import { getDriverDashboard } from "../../api/ambulanceApi";

const emptyDashboard = {
  driver: null,
  stats: {},
  jobs: [],
};

const AmbulanceDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const theme = useMemo(() =>
    darkMode ? {
      bg: "bg-[#060D18]",
      panel: "bg-[#0D1F35]",
      panelMuted: "bg-[#0A1628]",
      text: "text-[#E2E8F0]",
      subtext: "text-[#94A3B8]",
      border: "border-[#162940]",
      header: "bg-[#0D1F35]/90",
      darkMode,
    } : {
      bg: "bg-[#EEF3F6]",
      panel: "bg-white",
      panelMuted: "bg-[#F7FAFC]",
      text: "text-[#0A1628]",
      subtext: "text-[#64748B]",
      border: "border-[#DDE6EE]",
      header: "bg-white/90",
      darkMode,
    }, [darkMode]
  );

  const loadDashboard = useCallback(async () => {
    setError("");
    try {
      const res = await getDriverDashboard();
      setDashboard(res.data);
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...savedUser, ...res.data.driver }));
    } catch (err) {
      setError(err.response?.data?.message || "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const updateDriver = (driver) => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    localStorage.setItem("user", JSON.stringify({ ...savedUser, ...driver }));
    setDashboard((current) => ({ ...current, driver }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF3F6]">
        <div className="rounded-lg border border-[#DDE6EE] bg-white px-6 py-5 text-sm font-black text-[#0A1628] shadow">
          Loading driver dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF3F6] p-4">
        <div className="max-w-md rounded-lg border border-[#FCA5A5] bg-white p-6 shadow">
          <h1 className="text-lg font-black text-[#991B1B]">Dashboard unavailable</h1>
          <p className="mt-2 text-sm font-semibold text-[#64748B]">{error}</p>
        </div>
      </div>
    );
  }

  const content = {
    overview: (
      <AmbulanceOverview
        driver={dashboard.driver}
        stats={dashboard.stats}
        jobs={dashboard.jobs}
        setActiveTab={setActiveTab}
        theme={theme}
      />
    ),
    profile: (
      <AmbulanceProfile
        driver={dashboard.driver}
        onUpdated={updateDriver}
        theme={theme}
      />
    ),
    jobs: (
      <AmbulanceJobs
        jobs={dashboard.jobs}
        onRefresh={loadDashboard}
        theme={theme}
      />
    ),
    payments: (
      <AmbulancePayments
        driver={dashboard.driver}
        theme={theme}
      />
    ),
    subscription: (
      <AmbulanceSubscription
        driver={dashboard.driver}
        onUpdated={updateDriver}
        theme={theme}
      />
    ),
  };

  return (
    <AmbulanceLayout
      driver={dashboard.driver}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      theme={theme}
    >
      {content[activeTab] || content.overview}
    </AmbulanceLayout>
  );
};

export default AmbulanceDashboard;