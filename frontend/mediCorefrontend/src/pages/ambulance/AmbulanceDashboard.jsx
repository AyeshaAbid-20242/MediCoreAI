import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import AmbulanceLayout from "./AmbulanceLayout";
import AmbulanceOverview from "./tabs/AmbulanceOverview";
import AmbulanceProfile from "./tabs/AmbulanceProfile";
import AmbulanceJobs from "./tabs/AmbulanceJobs";
import AmbulancePayments from "./tabs/AmbulancePayments";
import AmbulanceReviews from "./tabs/AmbulanceReviews";
import AmbulanceSubscription from "./tabs/AmbulanceSubscription";
import { getDriverDashboard, updateDriverJobLocation, updateDriverJobStatus } from "../../api/ambulanceApi";

const emptyDashboard = {
  driver: null,
  stats: {},
  jobs: [],
  reviews: [],
};

const AmbulanceDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("medicore-theme") !== "light");
  const lastLocationSentRef = useRef({ jobId: "", at: 0, latitude: null, longitude: null });

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

  useEffect(() => {
    const init = async () => {
      await loadDashboard();
    };
    void init();
  }, [loadDashboard]);

  useEffect(() => {
    localStorage.setItem("medicore-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const activeTrackingJob = useMemo(
    () => dashboard.jobs.find((job) => ["accepted", "active"].includes(job.status)),
    [dashboard.jobs]
  );

  useEffect(() => {
    if (!activeTrackingJob?._id || !navigator.geolocation) return undefined;

    const watcherId = navigator.geolocation.watchPosition(
      async (position) => {
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));
        const previous = lastLocationSentRef.current;
        const now = Date.now();
        const movedEnough =
          previous.latitude === null ||
          Math.abs(latitude - previous.latitude) > 0.00008 ||
          Math.abs(longitude - previous.longitude) > 0.00008;
        const oldEnough = now - previous.at > 8000;

        if (previous.jobId === activeTrackingJob._id && !movedEnough && !oldEnough) return;

        lastLocationSentRef.current = {
          jobId: activeTrackingJob._id,
          at: now,
          latitude,
          longitude,
        };

        try {
          const response = await updateDriverJobLocation(activeTrackingJob._id, { latitude, longitude });
          setDashboard((current) => ({
            ...current,
            jobs: current.jobs.map((job) =>
              job._id === activeTrackingJob._id ? response.data.job : job
            ),
          }));
        } catch {
          // Keep the ride usable even if one GPS update fails.
        }
      },
      () => {},
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 12000,
      }
    );

    return () => navigator.geolocation.clearWatch(watcherId);
  }, [activeTrackingJob?._id]);

  const updateDriver = (driver) => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    localStorage.setItem("user", JSON.stringify({ ...savedUser, ...driver }));
    setDashboard((current) => ({ ...current, driver }));
  };

  const updateJobStatus = async (jobId, status, extra = {}) => {
    await updateDriverJobStatus(jobId, { status, ...extra });
    await loadDashboard();
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
        driver={dashboard.driver}
        jobs={dashboard.jobs}
        onRefresh={loadDashboard}
        onUpdateStatus={updateJobStatus}
        theme={theme}
      />
    ),
    payments: (
      <AmbulancePayments
        driver={dashboard.driver}
        jobs={dashboard.jobs}
        theme={theme}
      />
    ),
    reviews: (
      <AmbulanceReviews
        reviews={dashboard.reviews}
        stats={dashboard.stats}
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
