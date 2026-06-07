import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import NearbyCareMap from "../../components/NearbyCareMap";
import ThemeToggle from "../../components/ThemeToggle";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getDoctorAvailability, getPatientAppointments, requestAppointment } from "../../api/appointmentApi";
import { getPatientAmbulanceRequests, requestAmbulance } from "../../api/ambulanceApi";
import { getPatientProviders } from "../../api/authApi";
import { getApiError } from "../../api/axios";
import { createAppointmentCheckout } from "../../api/paymentApi";
import { analyzeSymptoms, getAiModels, getNearbyCare, getPatientHealthSummary } from "../../api/patientApi";
import { createAmbulanceReview, createReview } from "../../api/reviewApi";

const LIGHT = {
  bg: "bg-[#EEF3F6]",
  panel: "bg-white",
  panelMuted: "bg-[#F7FAFC]",
  text: "text-[#0A1628]",
  subtext: "text-[#64748B]",
  border: "border-[#DDE6EE]",
  line: "#DDE6EE",
  tooltip: "#FFFFFF",
};

const DARK = {
  bg: "bg-[#060D18]",
  panel: "bg-[#0D1F35]",
  panelMuted: "bg-[#0A1628]",
  text: "text-[#E2E8F0]",
  subtext: "text-[#94A3B8]",
  border: "border-[#162940]",
  line: "#162940",
  tooltip: "#0D1F35",
};

const Icon = ({ name, size = 17, className = "" }) => {
  const paths = {
    dashboard: "M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-5H4v5Z",
    heart: "M12 21s-7-4.4-9.2-9A5.4 5.4 0 0 1 12 6.2 5.4 5.4 0 0 1 21.2 12C19 16.6 12 21 12 21Z",
    brain: "M9 4a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4H9Zm3 0v16M7 9h4m2 0h4M7 15h4m2 0h4",
    doctor: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0M12 15v4m-2-2h4",
    hospital: "M4 20V7l8-3 8 3v13H4Zm6-8h4m-2-2v4M8 20v-4h8v4",
    ambulance: "M3 17h2a2 2 0 0 0 4 0h6a2 2 0 0 0 4 0h2v-5l-3-4h-4V5H3v12Zm11-5h5M6 8h4m-2-2v4",
    file: "M6 3h8l4 4v14H6V3Zm8 0v5h5M9 12h6M9 16h6",
    card: "M3 6h18v12H3V6Zm0 4h18M7 15h3",
    calendar: "M7 3v3m10-3v3M4 8h20M5 5h18v17H5V5Zm4 7h3m3 0h3M9 16h3m3 0h3",
    settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0-12v3m0 11v3M4.2 6.2l2.1 2.1m11.4 7.4 2.1 2.1M2 12h3m14 0h3M4.2 17.8l2.1-2.1m11.4-7.4 2.1-2.1",
    search: "M10.5 18a7.5 7.5 0 1 1 5.3-12.8A7.5 7.5 0 0 1 10.5 18Zm5.5-2 5 5",
    mic: "M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Zm-7-3a7 7 0 0 0 14 0M12 18v4",
    send: "M3 11 21 3l-8 18-2-8-8-2Z",
    phone: "M6.6 3.5 9 6l-1.5 2c1 2.2 2.8 4 5 5L14.5 11 17 13.4V18c0 .6-.4 1-1 1C9.9 19 5 14.1 5 8V4.5c0-.6.4-1 1-1h.6Z",
    map: "M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Zm0-15v15m6-12v15",
    bell: "M18 16H6l1.5-2V9a4.5 4.5 0 0 1 9 0v5L18 16Zm-4 3a2 2 0 0 1-4 0",
    moon: "M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z",
    sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-15v3m0 14v3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M2 12h3m14 0h3M4.2 19.8l2.1-2.1m11.4-11.4 2.1-2.1",
    menu: "M4 7h16M4 12h16M4 17h16",
    close: "M6 6l12 12M18 6 6 18",
    trend: "M4 17 9 12l4 4 7-9M14 7h6v6",
  };

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={["dashboard", "heart"].includes(name) ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.dashboard} />
    </svg>
  );
};

const fallbackAiModels = [
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Fast balanced responses for symptom guidance.",
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    description: "Clear general medical triage explanations.",
  },
];

const defaultLocation = { lat: 32.1877, lng: 74.1945 };

const formatDistance = (item) => {
  if (Number.isFinite(item?.distanceMeters)) {
    return item.distanceMeters >= 1000
      ? `${(item.distanceMeters / 1000).toFixed(1)} km`
      : `${item.distanceMeters} m`;
  }

  if (Number.isFinite(item?.distance)) return `${item.distance} km`;
  return "Distance unavailable";
};

const getAppointmentStart = (appointment) => {
  if (!appointment?.appointmentDate || !appointment?.appointmentTime) return null;
  const datePart = new Date(appointment.appointmentDate).toISOString().slice(0, 10);
  const start = new Date(`${datePart}T${appointment.appointmentTime}:00`);

  return Number.isNaN(start.getTime()) ? null : start;
};

const canJoinAppointment = (appointment) => {
  const start = getAppointmentStart(appointment);
  if (!start) return false;

  const now = Date.now();
  const opensAt = start.getTime() - 10 * 60 * 1000;
  const closesAt = start.getTime() + 60 * 60 * 1000;

  return now >= opensAt && now <= closesAt;
};

const getJoinHelpText = (appointment) => {
  const start = getAppointmentStart(appointment);
  if (!start) return "Meeting time is not set.";
  const opensAt = new Date(start.getTime() - 10 * 60 * 1000);

  if (Date.now() < opensAt.getTime()) {
    return `Join opens at ${opensAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`;
  }

  return "Meeting window has ended.";
};

const getOsmUrl = (item) => {
  if (!Number.isFinite(item?.lat) || !Number.isFinite(item?.lng)) return null;
  return `https://www.openstreetmap.org/?mlat=${item.lat}&mlon=${item.lng}#map=16/${item.lat}/${item.lng}`;
};

const matchesWords = (text = "", words = []) => {
  const normalized = text.toLowerCase();
  return words.some((word) => normalized.includes(word.toLowerCase()));
};

// const weeklyVitals = [
//   { day: "Mon", heart: 72, oxygen: 98, temp: 36.7 },
//   { day: "Tue", heart: 75, oxygen: 97, temp: 36.8 },
//   { day: "Wed", heart: 70, oxygen: 98, temp: 36.6 },
//   { day: "Thu", heart: 76, oxygen: 96, temp: 37.2 },
//   { day: "Fri", heart: 73, oxygen: 98, temp: 36.9 },
//   { day: "Sat", heart: 71, oxygen: 99, temp: 36.8 },
//   { day: "Sun", heart: 72, oxygen: 98, temp: 36.8 },
// ];

// const recoveryTrend = [
//   { month: "Jan", symptoms: 18, visits: 3 },
//   { month: "Feb", symptoms: 15, visits: 2 },
//   { month: "Mar", symptoms: 12, visits: 3 },
//   { month: "Apr", symptoms: 9, visits: 1 },
//   { month: "May", symptoms: 7, visits: 2 },
//   { month: "Jun", symptoms: 5, visits: 1 },
// ];

// const departmentMix = [
//   { name: "General", value: 36, color: "#0891B2", dot: "bg-[#0891B2]" },
//   { name: "Cardio", value: 24, color: "#C8102E", dot: "bg-[#C8102E]" },
//   { name: "Lab", value: 22, color: "#059669", dot: "bg-[#059669]" },
//   { name: "Other", value: 18, color: "#F59E0B", dot: "bg-[#F59E0B]" },
// ];

// const records = [
//   { title: "Cardiology consultation", date: "May 18, 2026", doctor: "Dr. Sarah Chen", status: "Completed" },
//   { title: "CBC blood test", date: "May 12, 2026", doctor: "MediCare Lab", status: "Reviewed" },
//   { title: "Fever and cough follow-up", date: "April 30, 2026", doctor: "Dr. Ahmed Raza", status: "Completed" },
// ];

// const prescriptions = [
//   { medicine: "Paracetamol 500mg", schedule: "After meal, twice daily", days: "3 days" },
//   { medicine: "Vitamin D3", schedule: "Once weekly", days: "4 weeks" },
//   { medicine: "ORS Sachet", schedule: "As needed with fluids", days: "2 days" },
// ];

// const vitals = [
//   { label: "Heart Rate", value: "72 bpm", tone: "text-[#C8102E]" },
//   { label: "Blood Pressure", value: "118/76", tone: "text-[#0891B2]" },
//   { label: "O2 Saturation", value: "98%", tone: "text-[#059669]" },
//   { label: "Temperature", value: "36.8 C", tone: "text-[#F59E0B]" },
// ];

// const statCards = [
//   ["Care Score", "86", "+4.8%", "heart", "bg-[#C8102E]/10 text-[#C8102E]"],
//   ["Appointments", "12", "2 upcoming", "doctor", "bg-[#0891B2]/10 text-[#0891B2]"],
//   ["Reports", "28", "5 reviewed", "file", "bg-[#059669]/10 text-[#059669]"],
//   ["Emergency ETA", "5m", "nearest unit", "ambulance", "bg-[#F59E0B]/10 text-[#F59E0B]"],
// ];

const chartTooltip = (theme) => ({
  contentStyle: {
    background: theme.tooltip,
    border: `1px solid ${theme.line}`,
    borderRadius: 8,
    boxShadow: "0 16px 40px rgba(10, 22, 40, 0.12)",
  },
  labelStyle: { color: "#64748B", fontSize: 12 },
});

const VitalsScene = ({ darkMode }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const width = mount.clientWidth || 320;
    const height = mount.clientHeight || 220;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.05, 3),
      new THREE.MeshStandardMaterial({
        color: darkMode ? "#0891B2" : "#C8102E",
        roughness: 0.26,
        metalness: 0.18,
        transparent: true,
        opacity: 0.9,
      })
    );
    group.add(core);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: darkMode ? "#94A3B8" : "#0891B2",
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
    });

    [0, 1, 2].forEach((index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.38 + index * 0.22, 0.01, 16, 96), ringMaterial);
      ring.rotation.x = index * 0.74;
      ring.rotation.y = index * 0.48;
      group.add(ring);
    });

    const points = new THREE.Points(
      new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 80 }, () => {
          const radius = 1.7 + Math.random() * 0.55;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          return new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
          );
        })
      ),
      new THREE.PointsMaterial({ color: "#C8102E", size: 0.025, transparent: true, opacity: 0.8 })
    );
    group.add(points);

    scene.add(new THREE.AmbientLight("#ffffff", 1.6));
    const keyLight = new THREE.DirectionalLight("#ffffff", 1.2);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    camera.position.z = 4.6;

    let frameId;
    const animate = () => {
      group.rotation.y += 0.006;
      group.rotation.x = Math.sin(Date.now() * 0.001) * 0.08;
      points.rotation.y -= 0.002;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      const nextWidth = mount.clientWidth || width;
      const nextHeight = mount.clientHeight || height;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [darkMode]);

  return <div ref={mountRef} className="h-[220px] w-full" data-testid="patient-vitals-3d" />;
};

const PatientDashboard = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("medicore-theme") !== "light");
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [selectedSpec, setSelectedSpec] = useState("All");
  const [symptomText, setSymptomText] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "ai", text: "Describe symptoms or ask about prescriptions. I will help you prepare for care." },
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModels, setAiModels] = useState(fallbackAiModels);
  const [selectedAiModel, setSelectedAiModel] = useState(fallbackAiModels[0].id);
  const [aiUsage, setAiUsage] = useState({ used: 0, limit: 20, remaining: 20, resetAt: "" });
  const [careFocus, setCareFocus] = useState(null);
  const [careFilterMode, setCareFilterMode] = useState("all");
  const [isListening, setIsListening] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [providers, setProviders] = useState({ doctors: [], ambulanceDrivers: [] });
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState(defaultLocation);
  const [nearbyLoading, setNearbyLoading] = useState(true);
  const [providerError, setProviderError] = useState("");
  const [locationStatus, setLocationStatus] = useState("Allow browser location to find care near you.");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [bookingForm, setBookingForm] = useState({ appointmentDate: "", appointmentTime: "", patientNotes: "" });
  const [pendingAppointment, setPendingAppointment] = useState(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotAvailability, setSlotAvailability] = useState({ allTimeSlots: [], bookedTimes: [], availableTimeSlots: [], availableDay: true });
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [paymentActionError, setPaymentActionError] = useState("");
  const [paymentLoadingId, setPaymentLoadingId] = useState("");
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [ambulanceRequest, setAmbulanceRequest] = useState(null);
  const [ambulanceForm, setAmbulanceForm] = useState({ pickupLocation: "", contactNumber: "", notes: "" });
  const [ambulanceMessage, setAmbulanceMessage] = useState("");
  const [ambulanceError, setAmbulanceError] = useState("");
  const [ambulanceLoading, setAmbulanceLoading] = useState(false);
  const [ambulanceJobs, setAmbulanceJobs] = useState([]);
  const [healthSummary, setHealthSummary] = useState({
    latestVital: null,
    vitalsTrend: [],
    medicalRecords: [],
    prescriptions: [],
    departmentMix: [],
  });
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState("");

  const theme = darkMode ? DARK : LIGHT;
  const user = useMemo(
    () =>
      JSON.parse(
        localStorage.getItem("user") ||
          '{"name":"Patient","fullName":"Patient","email":"patient@example.com","role":"patient"}'
      ),
    []
  );

  useEffect(() => {
    localStorage.setItem("medicore-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const loadAmbulanceJobs = useCallback(async () => {
    try {
      const response = await getPatientAmbulanceRequests();
      setAmbulanceJobs(response.data.jobs || []);
    } catch {
      setAmbulanceJobs([]);
    }
  }, []);

  const loadPatientAppointments = useCallback(async () => {
    try {
      const response = await getPatientAppointments();
      setPatientAppointments(response.data.appointments || []);
    } catch {
      setPatientAppointments([]);
    }
  }, []);

  useEffect(() => {
    const loadNearbyCare = async (coords = defaultLocation) => {
      setNearbyLoading(true);
      try {
        const response = await getNearbyCare({ lat: coords.lat, lng: coords.lng, radius: 15000 });
        setUserLocation(coords);
        setNearbyPlaces(response.data.places || []);
        setProviders({
          doctors: response.data.doctors || [],
          ambulanceDrivers: response.data.ambulanceDrivers || [],
        });
        setNearbyHospitals(response.data.hospitals || []);
        setProviderError("");
      } catch (error) {
        setNearbyPlaces([]);
        setNearbyHospitals([]);
        setProviderError(getApiError(error, "Nearby care service is temporarily unavailable. Please try again shortly."));
        try {
          const response = await getPatientProviders();
          setProviders({
            doctors: response.data.doctors || [],
            ambulanceDrivers: response.data.ambulanceDrivers || [],
          });
        } catch {
          setProviders({ doctors: [], ambulanceDrivers: [] });
        }
      } finally {
        setNearbyLoading(false);
      }
    };

    if (!navigator.geolocation) {
      loadNearbyCare();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus("Using your current location for nearby care.");
        loadNearbyCare({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => loadNearbyCare(),
      { enableHighAccuracy: true, timeout: 7000 }
    );
  }, []);

  useEffect(() => {
    loadAmbulanceJobs();
    const intervalId = window.setInterval(loadAmbulanceJobs, 8000);

    return () => window.clearInterval(intervalId);
  }, [loadAmbulanceJobs]);

  useEffect(() => {
    loadPatientAppointments();
    const intervalId = window.setInterval(loadPatientAppointments, 12000);

    return () => window.clearInterval(intervalId);
  }, [loadPatientAppointments]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!bookingDoctor?._id || !bookingForm.appointmentDate || pendingAppointment) {
        setSlotAvailability({ allTimeSlots: [], bookedTimes: [], availableTimeSlots: [], availableDay: true });
        return;
      }

      setSlotLoading(true);
      try {
        const response = await getDoctorAvailability(bookingDoctor._id, bookingForm.appointmentDate);
        setSlotAvailability({
          allTimeSlots: response.data.allTimeSlots || [],
          bookedTimes: response.data.bookedTimes || [],
          availableTimeSlots: response.data.availableTimeSlots || [],
          availableDay: response.data.availableDay !== false,
        });
      } catch (error) {
        setSlotAvailability({ allTimeSlots: [], bookedTimes: [], availableTimeSlots: [], availableDay: true });
        setBookingError(getApiError(error, "Could not load available time slots."));
      } finally {
        setSlotLoading(false);
      }
    };

    loadSlots();
  }, [bookingDoctor, bookingForm.appointmentDate, pendingAppointment]);

  useEffect(() => {
    const loadAiModels = async () => {
      try {
        const response = await getAiModels();
        const models = response.data.models || [];
        if (!models.length) return;

        setAiModels(models);
        setSelectedAiModel(models[0].id);
        if (response.data.usage) setAiUsage(response.data.usage);
      } catch {
        setAiModels(fallbackAiModels);
      }
    };

    loadAiModels();
  }, []);

  useEffect(() => {
    const loadHealthSummary = async () => {
      setHealthLoading(true);
      setHealthError("");
      try {
        const response = await getPatientHealthSummary();
        setHealthSummary({
          latestVital: response.data.latestVital || null,
          vitalsTrend: response.data.vitalsTrend || [],
          medicalRecords: response.data.medicalRecords || [],
          prescriptions: response.data.prescriptions || [],
          departmentMix: response.data.departmentMix || [],
        });
      } catch (error) {
        setHealthError(getApiError(error, "Could not load health records."));
      } finally {
        setHealthLoading(false);
      }
    };

    loadHealthSummary();
  }, []);

  const doctorSpecs = useMemo(() => {
    const specs = providers.doctors.map((doctor) => doctor.specialization || "General Medicine");
    return ["All", ...new Set(specs)];
  }, [providers.doctors]);

  const filteredDoctors = providers.doctors.filter((doctor) => {
    const spec = doctor.specialization || "General Medicine";
    return selectedSpec === "All" || spec === selectedSpec;
  });

  const nearbyDoctors = providers.doctors.filter((doctor) => (doctor.distance || 7) <= 15);
  const nearbyDrivers = providers.ambulanceDrivers.filter((driver) => (driver.distance || 7) <= 15);
  const visibleHospitals = nearbyHospitals.filter((hospital) => (hospital.distanceMeters || 0) <= 15000);
  const hospitalPlaces = nearbyPlaces.filter((place) =>
    ["hospital", "clinic", "emergency"].includes(place.type)
  );
  const focusWords = careFocus?.hospitalKeywords || [];
  const recommendedDoctors = careFocus
    ? nearbyDoctors.filter((doctor) =>
        matchesWords(doctor.specialization || doctor.name || doctor.fullName, [
          careFocus.specialty,
          ...focusWords,
        ])
      )
    : [];
  const recommendedHospitals = careFocus
    ? hospitalPlaces.filter((place) =>
        matchesWords(`${place.name} ${place.category} ${place.address}`, focusWords)
      )
    : [];
  const displayedHospitalPlaces =
    careFilterMode === "recommended" && recommendedHospitals.length
      ? recommendedHospitals
      : hospitalPlaces;
  const nearestByType = (types) =>
    nearbyPlaces.find((place) => types.includes(place.type)) || null;
  const nearbySummary = [
    ["Nearest Hospital", nearestByType(["hospital", "emergency"])],
    ["Nearest Clinic", nearestByType(["clinic"])],
    ["Nearest Pharmacy", nearestByType(["pharmacy"])],
    ["Total Places", { name: `${nearbyPlaces.length} found`, distanceMeters: null }],
  ];

  const latestVital = healthSummary.latestVital;
  const weeklyVitals = healthSummary.vitalsTrend.filter(
    (item) => item.heart !== null || item.oxygen !== null || item.temp !== null
  );
  const records = healthSummary.medicalRecords.map((record) => ({
    id: record._id,
    title: record.title,
    date: new Date(record.recordDate).toLocaleDateString(),
    doctor: record.doctorId?.fullName || record.doctorId?.name || record.department || "Medical record",
    status: record.status,
    summary: record.summary,
  }));
  const prescriptions = healthSummary.prescriptions.map((item) => ({
    id: item._id,
    medicine: item.medicine,
    dosage: item.dosage,
    schedule: item.schedule,
    days: item.duration || item.status,
    instructions: item.instructions,
    doctor: item.doctorId?.fullName || item.doctorId?.name || "Doctor",
  }));
  const departmentMix = healthSummary.departmentMix.map((item, index) => ({
    ...item,
    color: ["#0891B2", "#C8102E", "#059669", "#F59E0B", "#6366F1"][index % 5],
    dot: ["bg-[#0891B2]", "bg-[#C8102E]", "bg-[#059669]", "bg-[#F59E0B]", "bg-[#6366F1]"][index % 5],
  }));
  const recoveryTrend = records
    .slice()
    .reverse()
    .map((record, index) => ({
      month: record.date,
      symptoms: Math.max(records.length - index, 0),
      visits: 1,
    }));
  const vitals = [
    { label: "Heart Rate", value: latestVital?.heartRate ? `${latestVital.heartRate} bpm` : "Not recorded", tone: "text-[#C8102E]" },
    {
      label: "Blood Pressure",
      value:
        latestVital?.bloodPressureSystolic && latestVital?.bloodPressureDiastolic
          ? `${latestVital.bloodPressureSystolic}/${latestVital.bloodPressureDiastolic}`
          : "Not recorded",
      tone: "text-[#0891B2]",
    },
    { label: "O2 Saturation", value: latestVital?.oxygenSaturation ? `${latestVital.oxygenSaturation}%` : "Not recorded", tone: "text-[#059669]" },
    { label: "Temperature", value: latestVital?.temperatureCelsius ? `${latestVital.temperatureCelsius} C` : "Not recorded", tone: "text-[#F59E0B]" },
  ];
  const statCards = [
    ["Care Score", latestVital ? "Active" : "New", healthLoading ? "loading records" : `${weeklyVitals.length} vitals`, "heart", "bg-[#C8102E]/10 text-[#C8102E]"],
    ["Appointments", patientAppointments.length, `${patientAppointments.filter((item) => item.paymentStatus === "paid").length} paid`, "doctor", "bg-[#0891B2]/10 text-[#0891B2]"],
    ["Reports", records.length, `${records.filter((record) => record.status === "reviewed").length} reviewed`, "file", "bg-[#059669]/10 text-[#059669]"],
    ["Emergency ETA", nearbyDrivers.length ? "Ready" : "N/A", `${nearbyDrivers.length} drivers`, "ambulance", "bg-[#F59E0B]/10 text-[#F59E0B]"],
  ];
  const nextAppointment = patientAppointments
    .filter((appointment) => ["requested", "accepted"].includes(appointment.appointmentStatus))
    .slice()
    .sort((a, b) => {
      const first = getAppointmentStart(a)?.getTime() || 0;
      const second = getAppointmentStart(b)?.getTime() || 0;
      return first - second;
    })[0];
  const latestPrescription = prescriptions[0];
  const latestRecord = records[0];
  const activeAmbulanceJob = ambulanceJobs.find((job) =>
    ["requested", "accepted", "active"].includes(job.status)
  );
  const activeAmbulanceDriver = activeAmbulanceJob?.driverId;
  const trackingLatitude = Number.isFinite(activeAmbulanceJob?.driverLatitude)
    ? activeAmbulanceJob.driverLatitude
    : activeAmbulanceDriver?.latitude;
  const trackingLongitude = Number.isFinite(activeAmbulanceJob?.driverLongitude)
    ? activeAmbulanceJob.driverLongitude
    : activeAmbulanceDriver?.longitude;
  const driverTrackingPlace =
    activeAmbulanceJob &&
    ["accepted", "active"].includes(activeAmbulanceJob.status) &&
    Number.isFinite(trackingLatitude) &&
    Number.isFinite(trackingLongitude)
      ? {
          id: `driver-${activeAmbulanceDriver._id}`,
          name: activeAmbulanceDriver.fullName || activeAmbulanceDriver.name || "Ambulance driver",
          category: activeAmbulanceJob.status === "active" ? "Live ambulance location" : "Driver accepted",
          lat: trackingLatitude,
          lng: trackingLongitude,
          phone: activeAmbulanceDriver.mobileNumber || "",
          distanceMeters: null,
        }
      : null;

  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;
  const softClass = `rounded-lg border ${theme.border} ${theme.panelMuted}`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleAIMessage = async () => {
    const text = symptomText.trim();
    if (!text) return;

    setChatMessages((messages) => [...messages, { sender: "patient", text }]);
    setSymptomText("");
    setAiLoading(true);

    try {
      const response = await analyzeSymptoms({ message: text, model: selectedAiModel });
      const modelName =
        aiModels.find((model) => model.id === response.data.model)?.name || response.data.model;
      if (response.data.usage) setAiUsage(response.data.usage);
      if (response.data.careFocus) {
        setCareFocus(response.data.careFocus);
        setCareFilterMode("recommended");
      }
      setChatMessages((messages) => [
        ...messages,
        { sender: "ai", text: response.data.answer, model: modelName },
      ]);
    } catch (error) {
      if (error.response?.data?.usage) setAiUsage(error.response.data.usage);
      setChatMessages((messages) => [
        ...messages,
        { sender: "ai", text: getApiError(error, "Could not analyze symptoms right now.") },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSymptomText("My browser does not support voice recognition, so I am typing my symptoms.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => setSymptomText(event.results[0][0].transcript);
    recognition.start();
  };

  const openBooking = (doctor) => {
    const existingAppointment = patientAppointments.find(
      (appointment) =>
        appointment.doctorId?._id === doctor._id &&
        ["requested", "accepted"].includes(appointment.appointmentStatus) &&
        ["pending", "paid"].includes(appointment.paymentStatus)
    );

    setBookingDoctor(doctor);
    setPendingAppointment(existingAppointment || null);
    setBookingMessage(
      existingAppointment
        ? existingAppointment.paymentStatus === "paid"
          ? "You already have a paid open appointment with this doctor."
          : "You already requested this doctor. Please complete Stripe payment."
        : ""
    );
    setBookingError("");
    setSlotAvailability({ allTimeSlots: [], bookedTimes: [], availableTimeSlots: [], availableDay: true });
    setBookingForm({
      appointmentDate: existingAppointment?.appointmentDate
        ? new Date(existingAppointment.appointmentDate).toISOString().slice(0, 10)
        : "",
      appointmentTime: existingAppointment?.appointmentTime || "",
      patientNotes: existingAppointment?.patientNotes || "",
    });
  };

  const closeBooking = () => {
    setBookingDoctor(null);
    setPendingAppointment(null);
    setBookingMessage("");
    setBookingError("");
    setSlotAvailability({ allTimeSlots: [], bookedTimes: [], availableTimeSlots: [], availableDay: true });
  };

  const handleAppointmentRequest = async (event) => {
    event.preventDefault();
    if (!bookingDoctor) return;

    setBookingLoading(true);
    setBookingError("");
    setBookingMessage("");

    try {
      const res = await requestAppointment({
        doctorId: bookingDoctor._id,
        ...bookingForm,
      });
      setPendingAppointment(res.data.appointment);
      setPatientAppointments((items) => [
        res.data.appointment,
        ...items.filter((item) => item._id !== res.data.appointment?._id),
      ]);
      setBookingMessage(
        res.data.alreadyExists
          ? res.data.message
          : "Appointment requested. Please complete Stripe payment."
      );
    } catch (error) {
      setBookingError(getApiError(error, "Could not request appointment"));
    } finally {
      setBookingLoading(false);
    }
  };

 const handleAppointmentPayment = async (appointment = pendingAppointment) => {
  if (!appointment?._id) return;
  setBookingLoading(true);
  setPaymentLoadingId(appointment._id);
  setBookingError("");
  setPaymentActionError("");
  try {
    const res = await createAppointmentCheckout(appointment._id);
    if (!res?.url) {
      throw new Error("Stripe checkout URL was not returned by the server.");
    }
    window.location.href = res.url;
  } catch (error) {
    const message = getApiError(error, "Could not initiate payment");
    setBookingError(message);
    setPaymentActionError(message);
    setBookingLoading(false);
    setPaymentLoadingId("");
  }
};

  const openReview = (targetType, item) => {
    setReviewTarget({ type: targetType, item });
    setReviewForm({ rating: 5, comment: "" });
    setReviewError("");
    setReviewMessage("");
  };

  const closeReview = () => {
    setReviewTarget(null);
    setReviewError("");
    setReviewMessage("");
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!reviewTarget?.item?._id) return;

    setReviewLoading(true);
    setReviewError("");
    setReviewMessage("");

    try {
      if (reviewTarget.type === "doctor") {
        await createReview({
          appointmentId: reviewTarget.item._id,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        });
        await loadPatientAppointments();
      } else {
        await createAmbulanceReview({
          ambulanceJobId: reviewTarget.item._id,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        });
        await loadAmbulanceJobs();
      }

      setReviewMessage("Review submitted successfully.");
      window.setTimeout(closeReview, 900);
    } catch (error) {
      setReviewError(getApiError(error, "Could not submit review."));
    } finally {
      setReviewLoading(false);
    }
  };

  const openAmbulanceRequest = (driver) => {
    setAmbulanceRequest(driver);
    setAmbulanceForm({ pickupLocation: "", contactNumber: user.mobileNumber || "", notes: "" });
    setAmbulanceMessage("");
    setAmbulanceError("");
  };

  const closeAmbulanceRequest = () => {
    setAmbulanceRequest(null);
    setAmbulanceMessage("");
    setAmbulanceError("");
  };

  const handleAmbulanceRequest = async (event) => {
    event.preventDefault();
    if (!ambulanceRequest) return;

    setAmbulanceLoading(true);
    setAmbulanceMessage("");
    setAmbulanceError("");
    try {
      const response = await requestAmbulance({
        driverId: ambulanceRequest._id,
        patientName: user.fullName || user.name || "Patient",
        contactNumber: ambulanceForm.contactNumber,
        pickupLocation: ambulanceForm.pickupLocation,
        pickupLatitude: userLocation?.lat,
        pickupLongitude: userLocation?.lng,
        destination: "Nearest hospital",
        notes: ambulanceForm.notes || "Emergency ambulance request from patient dashboard.",
      });
      setAmbulanceJobs((jobs) => [response.data.job, ...jobs.filter((job) => job._id !== response.data.job?._id)]);
      setAmbulanceMessage("Ambulance request sent to driver.");
      loadAmbulanceJobs();
    } catch (error) {
      setAmbulanceError(getApiError(error, "Could not request ambulance"));
    } finally {
      setAmbulanceLoading(false);
    }
  };

  const navItems = [
    ["Dashboard", "dashboard"],
    ["AI Chat", "brain"],
    ["Doctors", "doctor"],
    ["Emergency", "ambulance"],
    ["Appointments", "calendar"],
    ["Hospitals", "hospital"],
    ["Records", "file"],
    ["Payments", "card"],
    ["Settings", "settings"],
  ];

  return (
    <div className={`min-h-screen ${theme.bg} font-sans transition-colors duration-300`}>
      {mobileNavOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-[#020617]/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-[#1E2D45] bg-[#0A1628] shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#1E2D45] px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C8102E] text-white">
              <Icon name="heart" />
            </div>
            <div>
              <p className="text-sm font-black text-white">MediCore</p>
              <p className="text-[11px] font-semibold text-[#94A3B8]">Patient console</p>
            </div>
          </div>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1E2D45] text-[#CBD5E1]"
            aria-label="Close menu"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
          {navItems.map(([label, icon]) => (
            <button
              key={label}
              onClick={() => {
                setActiveNav(label);
                setMobileNavOpen(false);
              }}
              className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                activeNav === label
                  ? "bg-white text-[#0A1628]"
                  : "text-[#94A3B8] hover:bg-[#15243A] hover:text-white"
              }`}
            >
              <Icon name={icon} />
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-[#1E2D45] p-3">
          <button
            onClick={handleLogout}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#C8102E] text-sm font-bold text-white transition hover:bg-[#A30D26]"
          >
            <Icon name="close" size={15} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[228px] shrink-0 border-r border-[#1E2D45] bg-[#0A1628] lg:flex lg:flex-col">
          <div className="flex h-16 items-center gap-3 border-b border-[#1E2D45] px-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C8102E] text-white">
              <Icon name="heart" />
            </div>
            <div>
              <p className="text-sm font-black text-white">MediCore</p>
              <p className="text-[11px] font-semibold text-[#94A3B8]">Patient console</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 p-3">
            {navItems.map(([label, icon]) => (
              <button
                key={label}
                onClick={() => setActiveNav(label)}
                className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                  activeNav === label
                    ? "bg-white text-[#0A1628]"
                    : "text-[#94A3B8] hover:bg-[#15243A] hover:text-white"
                }`}
              >
                <Icon name={icon} />
                {label}
              </button>
            ))}
          </nav>

          <div className="border-t border-[#1E2D45] p-3">
            <button
              onClick={handleLogout}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#C8102E] text-sm font-bold text-white transition hover:bg-[#A30D26]"
            >
              <Icon name="close" size={15} /> Logout
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header
            className={`sticky top-0 z-20 border-b ${theme.border} ${
              darkMode ? "bg-[#0D1F35]/90" : "bg-white/90"
            } backdrop-blur-xl`}
          >
            <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  onClick={() => setMobileNavOpen(true)}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${theme.border} ${theme.panel} ${theme.text} lg:hidden`}
                  aria-label="Open menu"
                >
                  <Icon name="menu" size={16} />
                </button>
                <div className="min-w-0">
                  <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.subtext}`}>
                    Patient dashboard
                  </p>
                  <h1 className={`truncate text-lg font-black tracking-tight ${theme.text} sm:text-xl`}>
                    {user.fullName || user.name || "Patient"} care overview
                  </h1>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <div className={`hidden h-10 items-center gap-2 rounded-lg border ${theme.border} ${theme.panelMuted} px-3 md:flex`}>
                  <Icon name="search" className={theme.subtext} size={15} />
                  <input
                    className={`w-64 bg-transparent text-sm outline-none ${theme.text} placeholder:text-slate-400`}
                    placeholder="Search records, doctors, hospitals"
                  />
                </div>
                <ThemeToggle
                  darkMode={darkMode}
                  onToggle={() => setDarkMode(!darkMode)}
                  theme={theme}
                />
                <button className={`flex h-10 w-10 items-center justify-center rounded-lg border ${theme.border} ${theme.panel} ${theme.text}`}>
                  <Icon name="bell" size={16} />
                </button>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C8102E] text-xs font-black text-white">
                  {(user.fullName || user.name || "PT").slice(0, 2).toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          <section className="space-y-5 p-4 lg:p-6">
            {providerError && (
              <div className="rounded-lg border border-[#FEF3C7] bg-[#FFFBEB] px-4 py-2 text-sm font-semibold text-[#92400E]">
                {providerError}
              </div>
            )}
            <div className={`rounded-lg border ${theme.border} ${theme.panel} px-4 py-2 text-xs font-bold ${theme.subtext}`}>
              {locationStatus} Nearby results are limited to 10-15 km.
            </div>

            {activeNav === "AI Chat" && (
              <section className={`${cardClass} mx-auto w-full max-w-6xl p-4 lg:p-5`}>
                <PanelTitle title="AI Health Chat" subtitle="Text or voice symptom support" theme={theme} />
                <div className={`mt-3 grid gap-3 rounded-lg border ${theme.border} ${theme.panelMuted} p-3 md:grid-cols-[1fr_auto]`}>
                  <div>
                    <label className={`mb-1 block text-xs font-black ${theme.subtext}`}>AI Model</label>
                    <select
                      value={selectedAiModel}
                      onChange={(event) => setSelectedAiModel(event.target.value)}
                      className={`h-10 w-full rounded-lg border ${theme.border} ${theme.panel} px-3 text-sm font-bold ${theme.text} outline-none`}
                    >
                      {aiModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                    <p className={`mt-1 text-xs ${theme.subtext}`}>
                      {aiModels.find((model) => model.id === selectedAiModel)?.description}
                    </p>
                  </div>
                  <AIUsageRing usage={aiUsage} theme={theme} />
                </div>
                <div className={`mt-3 max-h-[62vh] min-h-[430px] space-y-3 overflow-y-auto rounded-lg border ${theme.border} ${theme.panelMuted} p-3 lg:p-4`}>
                  {chatMessages.map((message, index) => (
                    <div
                      key={`${message.sender}-${index}`}
                      className={`max-w-[96%] whitespace-pre-line rounded-lg px-4 py-3 text-sm leading-7 md:max-w-[82%] ${
                        message.sender === "patient"
                          ? "ml-auto bg-[#C8102E] text-white"
                          : `${theme.panel} ${theme.text} border ${theme.border}`
                      }`}
                    >
                      {message.model && (
                        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.12em] opacity-70">
                          {message.model}
                        </p>
                      )}
                      {message.text}
                    </div>
                  ))}
                  {aiLoading && <p className={`text-xs font-bold ${theme.subtext}`}>AI is reviewing...</p>}
                </div>
                <div className={`mt-3 rounded-lg border ${theme.border} ${theme.panelMuted} p-3`}>
                  <textarea
                    value={symptomText}
                    onChange={(event) => setSymptomText(event.target.value)}
                    className={`h-24 w-full resize-none bg-transparent px-1 text-sm leading-6 outline-none ${theme.text} placeholder:text-slate-400`}
                    placeholder="Describe symptoms or ask about your prescription..."
                  />
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={handleVoiceInput}
                      className={`flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold ${
                        isListening ? "bg-[#C8102E] text-white" : `border ${theme.border} ${theme.text}`
                      }`}
                    >
                      <Icon name="mic" size={14} /> {isListening ? "Listening" : "Voice"}
                    </button>
                    <button
                      onClick={handleAIMessage}
                      disabled={!symptomText.trim() || aiLoading}
                      className="flex h-9 items-center gap-2 rounded-lg bg-[#0A1628] px-4 text-xs font-black text-white transition hover:bg-[#C8102E] disabled:opacity-50"
                    >
                      <Icon name="send" size={14} /> Send
                    </button>
                  </div>
                </div>
                <CareMatchPanel
                  careFocus={careFocus}
                  doctors={recommendedDoctors}
                  hospitals={recommendedHospitals}
                  drivers={nearbyDrivers}
                  theme={theme}
                  onBook={openBooking}
                  onRequestAmbulance={openAmbulanceRequest}
                  onShowRecommended={() => {
                    setCareFilterMode("recommended");
                    setActiveNav("Hospitals");
                  }}
                  onShowAll={() => {
                    setCareFilterMode("all");
                    setActiveNav("Hospitals");
                  }}
                />
              </section>
            )}

            {activeNav === "Doctors" && (
              <section className={`${cardClass} overflow-hidden`}>
                <div className={`border-b ${theme.border} p-4`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <PanelTitle title="Platform Doctors" subtitle="Approved doctors registered on MediCore" theme={theme} />
                    <div className="flex flex-wrap gap-2">
                      {doctorSpecs.map((spec) => (
                        <button
                          key={spec}
                          onClick={() => setSelectedSpec(spec)}
                          className={`h-8 rounded-lg px-3 text-xs font-bold transition ${
                            selectedSpec === spec ? "bg-[#C8102E] text-white" : `border ${theme.border} ${theme.text}`
                          }`}
                        >
                          {spec}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <ProviderTable providers={filteredDoctors} type="doctor" theme={theme} onBook={openBooking} />
              </section>
            )}

            {activeNav === "Emergency" && (
              <EmergencyPanel
                active
                doctors={nearbyDoctors}
                hospitals={visibleHospitals}
                drivers={nearbyDrivers}
                activeAmbulanceJob={activeAmbulanceJob}
                driverTrackingPlace={driverTrackingPlace}
                userLocation={userLocation}
                onRequestAmbulance={openAmbulanceRequest}
                theme={theme}
              />
            )}

            {activeNav === "Hospitals" && (
              <section className={`${cardClass} p-4`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <PanelTitle title="Nearby Care" subtitle="OpenStreetMap hospitals and clinics within 15 km" theme={theme} />
                    {careFocus && (
                      <p className={`mt-1 text-xs font-semibold ${theme.subtext}`}>
                        Current focus: {careFocus.specialty}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setCareFilterMode("all")}
                      className={`h-8 rounded-lg px-3 text-xs font-black ${
                        careFilterMode === "all" ? "bg-[#0A1628] text-white" : `border ${theme.border} ${theme.text}`
                      }`}
                    >
                      All hospitals
                    </button>
                    <button
                      onClick={() => setCareFilterMode("recommended")}
                      disabled={!careFocus}
                      className={`h-8 rounded-lg px-3 text-xs font-black disabled:opacity-50 ${
                        careFilterMode === "recommended" ? "bg-[#C8102E] text-white" : `border ${theme.border} ${theme.text}`
                      }`}
                    >
                      Recommended
                    </button>
                    <span className={`rounded-md border ${theme.border} px-2 py-1 text-[11px] font-black ${theme.subtext}`}>
                      {nearbyLoading ? "Scanning..." : locationStatus}
                    </span>
                  </div>
                </div>

                {providerError && (
                  <div className="mt-4 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-sm font-bold text-[#991B1B]">
                    {providerError}
                  </div>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {nearbySummary.map(([label, place]) => (
                    <div key={label} className={`rounded-lg border ${theme.border} ${theme.panelMuted} p-3`}>
                      <p className={`text-[11px] font-black uppercase tracking-[0.12em] ${theme.subtext}`}>{label}</p>
                      <p className={`mt-2 truncate text-sm font-black ${theme.text}`}>{place?.name || "Not found"}</p>
                      <p className={`mt-1 text-xs ${theme.subtext}`}>
                        {place?.distanceMeters ? formatDistance(place) : "OpenStreetMap"}
                      </p>
                    </div>
                  ))}
                </div>

                <div className={`mt-4 overflow-hidden rounded-lg border ${theme.border}`}>
                  <NearbyCareMap userLocation={userLocation} places={displayedHospitalPlaces} />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {displayedHospitalPlaces.map((place) => {
                    const osmUrl = getOsmUrl(place);
                    return (
                      <div key={place.id || place.name} className={`rounded-lg border ${theme.border} ${theme.panelMuted} p-3`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className={`truncate text-sm font-black ${theme.text}`}>{place.name}</p>
                            <p className={`mt-1 text-xs ${theme.subtext}`}>{place.address || place.category}</p>
                          </div>
                          <span className="shrink-0 rounded-md bg-[#E0F2FE] px-2 py-1 text-[11px] font-black text-[#075985]">
                            {place.category}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <span className="rounded-md bg-[#DCFCE7] px-2 py-1 text-[11px] font-black text-[#166534]">
                            {formatDistance(place)}
                          </span>
                          <div className="flex items-center gap-3">
                            {place.phone && (
                              <a href={`tel:${place.phone}`} className="text-xs font-black text-[#C8102E]">
                                Call
                              </a>
                            )}
                            {place.website && (
                              <a href={place.website} target="_blank" rel="noreferrer" className="text-xs font-black text-[#0891B2]">
                                Website
                              </a>
                            )}
                            {osmUrl && (
                              <a href={osmUrl} target="_blank" rel="noreferrer" className="text-xs font-black text-[#0891B2]">
                                Map
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {careFilterMode === "recommended" && careFocus && !recommendedHospitals.length && (
                  <div className="mt-4 rounded-lg border border-[#FEF3C7] bg-[#FFFBEB] px-3 py-2 text-sm font-bold text-[#92400E]">
                    No hospital name in OpenStreetMap matched {careFocus.specialty}; showing all nearby hospitals instead.
                  </div>
                )}

                {!nearbyLoading && displayedHospitalPlaces.length === 0 && !providerError && (
                  <div className={`${softClass} mt-4 p-6 text-sm font-bold ${theme.subtext}`}>
                    No nearby healthcare places were found in OpenStreetMap for this radius.
                  </div>
                )}
              </section>
            )}

            {activeNav === "Appointments" && (
              <section className={`${cardClass} p-4`}>
                <PanelTitle title="My Appointments" subtitle="Consultation status, payment, and meeting links" theme={theme} />
                <div className="mt-4 space-y-3">
                  {patientAppointments.map((appointment) => (
                    <AppointmentPaymentCard
                      key={appointment._id}
                      appointment={appointment}
                      onPay={() => handleAppointmentPayment(appointment)}
                      onReview={() => openReview("doctor", appointment)}
                      loading={paymentLoadingId === appointment._id}
                      theme={theme}
                    />
                  ))}
                  {!patientAppointments.length && (
                    <div className={`${softClass} p-6 text-sm font-bold ${theme.subtext}`}>
                      Your consultation requests and meeting links will appear here.
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeNav === "Records" && (
              <section className={`${cardClass} p-4`}>
                <PanelTitle title="History & Prescriptions" subtitle="Latest records and medication" theme={theme} />
                {healthError && (
                  <div className="mt-4 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-sm font-bold text-[#991B1B]">
                    {healthError}
                  </div>
                )}
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {records.map((record) => (
                    <div key={record.id} className={`${softClass} p-3`}>
                      <p className={`text-sm font-black ${theme.text}`}>{record.title}</p>
                      <p className={`text-xs ${theme.subtext}`}>{record.doctor} - {record.date}</p>
                    </div>
                  ))}
                  {!records.length && (
                    <div className={`${softClass} p-4 text-sm font-semibold ${theme.subtext}`}>
                      {healthLoading ? "Loading medical records..." : "No medical records saved yet."}
                    </div>
                  )}
                </div>
                <div className={`mt-4 border-t ${theme.border} pt-4`}>
                  {prescriptions.map((item) => (
                    <PrescriptionCard key={item.id} item={item} theme={theme} />
                  ))}
                  {!prescriptions.length && (
                    <p className={`py-3 text-sm font-semibold ${theme.subtext}`}>
                      {healthLoading ? "Loading prescriptions..." : "No prescriptions saved yet."}
                    </p>
                  )}
                </div>
              </section>
            )}

            {activeNav === "Payments" && (
              <section className={`${cardClass} p-4`}>
                <PanelTitle title="Payments" subtitle="Appointment payment history" theme={theme} />
                {paymentActionError && (
                  <div className="mt-4 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-sm font-bold text-[#991B1B]">
                    {paymentActionError}
                  </div>
                )}
                <div className="mt-4 space-y-3">
                  {patientAppointments.map((appointment) => (
                    <AppointmentPaymentCard
                      key={appointment._id}
                      appointment={appointment}
                      onPay={() => handleAppointmentPayment(appointment)}
                      onReview={() => openReview("doctor", appointment)}
                      loading={paymentLoadingId === appointment._id}
                      theme={theme}
                    />
                  ))}
                  {ambulanceJobs
                    .filter((job) => job.status === "completed")
                    .map((job) => (
                      <AmbulancePaymentCard
                        key={job._id}
                        job={job}
                        onReview={() => openReview("ambulance", job)}
                        theme={theme}
                      />
                    ))}
                  {!patientAppointments.length && !ambulanceJobs.some((job) => job.status === "completed") && (
                    <div className={`${softClass} p-6 text-sm font-bold ${theme.subtext}`}>
                      Appointment and ambulance payment records will appear here after activity.
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeNav === "Settings" && (
              <section className={`${cardClass} p-4`}>
                <PanelTitle title="Settings" subtitle="Patient account information" theme={theme} />
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {[
                    ["Name", user.fullName || user.name],
                    ["Email", user.email],
                    ["Role", user.role],
                  ].map(([label, value]) => (
                    <div key={label} className={`${softClass} p-3`}>
                      <p className={`text-[11px] font-black uppercase tracking-wider ${theme.subtext}`}>{label}</p>
                      <p className={`mt-1 text-sm font-black ${theme.text}`}>{value || "Not set"}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className={`${activeNav === "Dashboard" ? "grid" : "hidden"} gap-5 xl:grid-cols-[1.7fr_1fr]`}>
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {statCards.map(([title, value, sub, icon, colorClass], index) => (
                    <motion.div
                      key={title}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className={`${cardClass} p-4`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorClass}`}>
                          <Icon name={icon} size={15} />
                        </div>
                        <Icon name="trend" size={15} className="text-[#059669]" />
                      </div>
                      <p className={`text-2xl font-black ${theme.text}`}>{value}</p>
                      <p className={`mt-1 text-xs font-bold ${theme.text}`}>{title}</p>
                      <p className={`text-xs ${theme.subtext}`}>{sub}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                  <section className={`${cardClass} p-4`}>
                    <PanelTitle title="Weekly Vitals" subtitle="Heart, oxygen, and temperature trend" theme={theme} />
                    <div className="h-[268px]">
                      {weeklyVitals.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={weeklyVitals} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                            <CartesianGrid stroke={theme.line} strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="day" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip {...chartTooltip(theme)} />
                            <Line type="monotone" dataKey="heart" stroke="#C8102E" strokeWidth={2.4} dot={false} />
                            <Line type="monotone" dataKey="oxygen" stroke="#0891B2" strokeWidth={2.4} dot={false} />
                            <Line type="monotone" dataKey="temp" stroke="#059669" strokeWidth={2.4} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className={`flex h-full items-center justify-center rounded-lg border ${theme.border} ${theme.panelMuted} p-4 text-center text-sm font-semibold ${theme.subtext}`}>
                          {healthLoading ? "Loading vitals..." : "No vitals recorded yet. Add vitals through the patient vitals API."}
                        </div>
                      )}
                    </div>
                  </section>

                  <section className={`${cardClass} p-4`}>
                    <PanelTitle title="3D Health Signal" subtitle="Live visual health telemetry" theme={theme} />
                    <div className={`mt-3 overflow-hidden rounded-lg border ${theme.border} ${theme.panelMuted}`}>
                      <VitalsScene darkMode={darkMode} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {vitals.map((vital) => (
                        <div key={vital.label} className={`${softClass} px-3 py-2`}>
                          <p className={`text-[11px] font-semibold ${theme.subtext}`}>{vital.label}</p>
                          <p className={`text-sm font-black ${vital.tone}`}>{vital.value}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="grid items-start gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                  <CareCommandCenter
                    nextAppointment={nextAppointment}
                    latestPrescription={latestPrescription}
                    latestRecord={latestRecord}
                    aiUsage={aiUsage}
                    theme={theme}
                    cardClass={cardClass}
                    softClass={softClass}
                    onOpenAi={() => setActiveNav("AI Chat")}
                    onOpenDoctors={() => setActiveNav("Doctors")}
                    onOpenEmergency={() => {
                      setEmergencyMode(true);
                      setActiveNav("Emergency");
                    }}
                  />

                  <WellnessOrbitPanel
                    darkMode={darkMode}
                    weeklyVitals={weeklyVitals}
                    records={records}
                    prescriptions={prescriptions}
                    theme={theme}
                    cardClass={cardClass}
                    softClass={softClass}
                  />
                </div>

                <section className={`${cardClass} overflow-hidden`}>
                  <div className={`border-b ${theme.border} p-4`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <PanelTitle title="Platform Doctors" subtitle="Approved doctors registered on MediCore" theme={theme} />
                      <div className="flex flex-wrap gap-2">
                        {doctorSpecs.map((spec) => (
                          <button
                            key={spec}
                            onClick={() => setSelectedSpec(spec)}
                            className={`h-8 rounded-lg px-3 text-xs font-bold transition ${
                              selectedSpec === spec ? "bg-[#C8102E] text-white" : `border ${theme.border} ${theme.text}`
                            }`}
                          >
                            {spec}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <ProviderTable providers={filteredDoctors} type="doctor" theme={theme} onBook={openBooking} />
                </section>

                <EmergencyPanel
                  active={emergencyMode}
                  doctors={nearbyDoctors}
                  hospitals={visibleHospitals}
                  drivers={nearbyDrivers}
                  activeAmbulanceJob={activeAmbulanceJob}
                  driverTrackingPlace={driverTrackingPlace}
                  userLocation={userLocation}
                  onRequestAmbulance={openAmbulanceRequest}
                  theme={theme}
                />
              </div>

              <aside className="space-y-5">
                <section className={`${cardClass} p-4`}>
                  <div className="flex items-start justify-between">
                    <PanelTitle title="Emergency Access" subtitle="Scan within 15 km" theme={theme} />
                    <span className="rounded-md bg-[#FEE2E2] px-2 py-1 text-[11px] font-black text-[#991B1B]">
                      Ready
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setEmergencyMode(true);
                      setActiveNav("Emergency");
                    }}
                    className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#C8102E] text-sm font-black text-white transition hover:bg-[#A30D26]"
                  >
                    <Icon name="phone" /> Emergency Button
                  </button>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <MiniCount label="Doctors" value={nearbyDoctors.length} theme={theme} />
                    <MiniCount label="Hospitals" value={visibleHospitals.length} theme={theme} />
                    <MiniCount label="Drivers" value={nearbyDrivers.length} theme={theme} />
                  </div>
                </section>

                <section className={`${cardClass} p-4`}>
                  <PanelTitle title="Department Mix" subtitle="Recent care categories" theme={theme} />
                  <div className="mt-2 h-[210px]">
                    {departmentMix.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={departmentMix}
                            innerRadius={56}
                            outerRadius={78}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {departmentMix.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip {...chartTooltip(theme)} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className={`flex h-full items-center justify-center rounded-lg border ${theme.border} ${theme.panelMuted} p-4 text-center text-sm font-semibold ${theme.subtext}`}>
                        {healthLoading ? "Loading categories..." : "No care categories yet."}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {departmentMix.map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-xs">
                        <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                        <span className={theme.subtext}>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={`${cardClass} p-4`}>
                  <PanelTitle title="Ambulance Drivers" subtitle="Platform registered drivers" theme={theme} />
                  <div className="mt-3 space-y-2">
                    {providers.ambulanceDrivers.map((driver) => (
                      <ProviderRow key={driver._id || driver.vehicleNumber} provider={driver} type="driver" theme={theme} />
                    ))}
                  </div>
                </section>

                <section className={`${cardClass} p-4`}>
                  <PanelTitle title="History & Prescriptions" subtitle="Latest records and medication" theme={theme} />
                  <div className="mt-3 space-y-2">
                    {records.map((record) => (
                      <div key={record.id} className={`${softClass} p-3`}>
                        <p className={`text-sm font-black ${theme.text}`}>{record.title}</p>
                        <p className={`text-xs ${theme.subtext}`}>{record.doctor} - {record.date}</p>
                      </div>
                    ))}
                    {!records.length && (
                      <p className={`py-3 text-sm font-semibold ${theme.subtext}`}>
                        {healthLoading ? "Loading records..." : "No medical records saved yet."}
                      </p>
                    )}
                  </div>
                  <div className={`mt-3 border-t ${theme.border} pt-3`}>
                    {prescriptions.map((item) => (
                      <PrescriptionCard key={item.id} item={item} theme={theme} compact />
                    ))}
                    {!prescriptions.length && (
                      <p className={`py-3 text-sm font-semibold ${theme.subtext}`}>
                        {healthLoading ? "Loading prescriptions..." : "No prescriptions saved yet."}
                      </p>
                    )}
                  </div>
                </section>
              </aside>
            </div>
          </section>
        </main>
      </div>
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          form={bookingForm}
          setForm={setBookingForm}
          pendingAppointment={pendingAppointment}
          slotAvailability={slotAvailability}
          slotLoading={slotLoading}
          message={bookingMessage}
          error={bookingError}
          loading={bookingLoading}
          onClose={closeBooking}
          onRequest={handleAppointmentRequest}
          onPay={handleAppointmentPayment}
          theme={theme}
        />
      )}
      {ambulanceRequest && (
        <AmbulanceRequestModal
          driver={ambulanceRequest}
          form={ambulanceForm}
          setForm={setAmbulanceForm}
          message={ambulanceMessage}
          error={ambulanceError}
          loading={ambulanceLoading}
          onSubmit={handleAmbulanceRequest}
          onClose={closeAmbulanceRequest}
          theme={theme}
        />
      )}
      {reviewTarget && (
        <ReviewModal
          target={reviewTarget}
          form={reviewForm}
          setForm={setReviewForm}
          message={reviewMessage}
          error={reviewError}
          loading={reviewLoading}
          onSubmit={handleReviewSubmit}
          onClose={closeReview}
          theme={theme}
        />
      )}
    </div>
  );
};

const PanelTitle = ({ title, subtitle, theme }) => (
  <div>
    <h2 className={`text-base font-black tracking-tight ${theme.text}`}>{title}</h2>
    <p className={`mt-0.5 text-xs font-medium ${theme.subtext}`}>{subtitle}</p>
  </div>
);

const MiniCount = ({ label, value, theme }) => (
  <div className={`rounded-lg border ${theme.border} ${theme.panelMuted} p-2 text-center`}>
    <p className={`text-lg font-black ${theme.text}`}>{value}</p>
    <p className={`text-[11px] font-semibold ${theme.subtext}`}>{label}</p>
  </div>
);

const CareCommandCenter = ({
  nextAppointment,
  latestPrescription,
  latestRecord,
  aiUsage,
  theme,
  cardClass,
  softClass,
  onOpenAi,
  onOpenDoctors,
  onOpenEmergency,
}) => {
  const appointmentTime = nextAppointment
    ? `${new Date(nextAppointment.appointmentDate).toLocaleDateString()} at ${nextAppointment.appointmentTime}`
    : "No active appointment";

  return (
    <section className={`${cardClass} overflow-hidden`}>
      <div className="border-b border-[#C8102E]/20 bg-[#C8102E] px-4 py-4 text-white">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/70">Care Command</p>
        <h2 className="mt-1 text-lg font-black">Today&apos;s Care Snapshot</h2>
      </div>
      <div className="p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className={`${softClass} p-3`}>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[#0891B2]/10 text-[#0891B2]">
              <Icon name="calendar" size={16} />
            </div>
            <p className={`text-xs font-black uppercase tracking-wider ${theme.subtext}`}>Next Visit</p>
            <p className={`mt-1 text-sm font-black ${theme.text}`}>
              {nextAppointment?.doctorId?.fullName || nextAppointment?.doctorId?.name || "Appointment"}
            </p>
            <p className={`mt-1 text-xs leading-5 ${theme.subtext}`}>{appointmentTime}</p>
          </div>
          <div className={`${softClass} p-3`}>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[#059669]/10 text-[#059669]">
              <Icon name="file" size={16} />
            </div>
            <p className={`text-xs font-black uppercase tracking-wider ${theme.subtext}`}>Medication</p>
            <p className={`mt-1 text-sm font-black ${theme.text}`}>{latestPrescription?.medicine || "No active prescription"}</p>
            <p className={`mt-1 text-xs leading-5 ${theme.subtext}`}>
              {latestPrescription?.schedule || "Prescriptions from doctors appear here."}
            </p>
          </div>
          <div className={`${softClass} p-3`}>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
              <Icon name="heart" size={16} />
            </div>
            <p className={`text-xs font-black uppercase tracking-wider ${theme.subtext}`}>Latest Record</p>
            <p className={`mt-1 text-sm font-black ${theme.text}`}>{latestRecord?.title || "No record yet"}</p>
            <p className={`mt-1 text-xs leading-5 ${theme.subtext}`}>
              {latestRecord?.date || "Medical history will build as care continues."}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <div className={`${softClass} p-3`}>
            <p className={`text-sm font-black ${theme.text}`}>AI support is available in its own workspace</p>
            <p className={`mt-1 text-xs leading-5 ${theme.subtext}`}>
              {aiUsage?.remaining ?? 0}/{aiUsage?.limit ?? 0} AI checks remaining. Open the AI Chat tab when you need symptom guidance.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 md:w-[270px]">
            <button onClick={onOpenDoctors} className="h-10 rounded-lg bg-[#0A1628] px-3 text-xs font-black text-white transition hover:bg-[#C8102E]">
              Doctors
            </button>
            <button onClick={onOpenAi} className={`h-10 rounded-lg border ${theme.border} px-3 text-xs font-black ${theme.text}`}>
              AI Chat
            </button>
            <button onClick={onOpenEmergency} className="h-10 rounded-lg bg-[#C8102E] px-3 text-xs font-black text-white transition hover:bg-[#a50d25]">
              Emergency
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const WellnessOrbitPanel = ({ darkMode, weeklyVitals, records, prescriptions, theme, cardClass, softClass }) => {
  const readiness = [
    ["Vitals", weeklyVitals.length ? "Tracked" : "Pending"],
    ["Records", records.length],
    ["Meds", prescriptions.length],
  ];

  return (
    <section className={`${cardClass} p-4`}>
      <PanelTitle title="Wellness Orbit" subtitle="General health activity overview" theme={theme} />
      <div className={`mt-3 overflow-hidden rounded-lg border ${theme.border} ${theme.panelMuted}`}>
        <VitalsScene darkMode={darkMode} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {readiness.map(([label, value]) => (
          <div key={label} className={`${softClass} p-2 text-center`}>
            <p className={`text-sm font-black ${theme.text}`}>{value}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${theme.subtext}`}>{label}</p>
          </div>
        ))}
      </div>
      <div className={`mt-3 rounded-lg border ${theme.border} ${theme.panelMuted} p-3`}>
        <p className={`text-xs font-black uppercase tracking-wider ${theme.subtext}`}>Care rhythm</p>
        <div className="mt-3 flex items-center gap-2">
          {[weeklyVitals.length, records.length, prescriptions.length].map((value, index) => (
            <div key={index} className="h-2 flex-1 overflow-hidden rounded-full bg-slate-500/20">
              <div
                className="h-full rounded-full bg-[#C8102E]"
                style={{ width: `${Math.min(100, Math.max(18, value * 18))}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AIUsageRing = ({ usage, theme }) => {
  const used = usage?.used || 0;
  const limit = usage?.limit || 1;
  const percent = Math.min(Math.round((used / limit) * 100), 100);
  const resetText = usage?.resetAt
    ? new Date(usage.resetAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "soon";

  return (
    <div className="flex min-w-[150px] items-center gap-3">
      <div
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full sm:h-14 sm:w-14"
        style={{ background: `conic-gradient(#C8102E ${percent}%, #DDE6EE ${percent}% 100%)` }}
      >
        <div className={`grid h-9 w-9 place-items-center rounded-full sm:h-10 sm:w-10 ${theme.panel}`}>
          <span className={`text-xs font-black ${theme.text}`}>{usage?.remaining ?? 0}</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className={`text-xs font-black ${theme.text}`}>{used}/{limit} used</p>
        <p className={`text-[11px] font-semibold ${theme.subtext}`}>Resets {resetText}</p>
      </div>
    </div>
  );
};

const CareMatchPanel = ({
  careFocus,
  doctors,
  hospitals,
  drivers,
  theme,
  onShowRecommended,
  onShowAll,
  onBook,
  onRequestAmbulance,
}) => {
  if (!careFocus) return null;

  const shownDoctors = doctors.length ? doctors : [];
  const shownHospitals = hospitals.length ? hospitals : [];

  return (
    <section className={`mt-4 rounded-lg border ${theme.border} ${theme.panelMuted} p-4`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className={`text-base font-black ${theme.text}`}>{careFocus.specialty} focus</p>
          <p className={`mt-1 text-sm font-semibold leading-6 ${theme.subtext}`}>{careFocus.note}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
          <button onClick={onShowRecommended} className="h-9 rounded-lg bg-[#C8102E] px-4 text-xs font-black text-white transition hover:bg-[#a50d25]">
            Recommended
          </button>
          <button onClick={onShowAll} className={`h-9 rounded-lg border ${theme.border} px-4 text-xs font-black ${theme.text}`}>
            All hospitals
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto pb-2">
        <div className="flex w-max items-start gap-3 min-[1180px]:grid min-[1180px]:w-full min-[1180px]:grid-cols-3">
          <CareMiniList title="Platform Doctors" items={shownDoctors} empty="No matching platform doctor yet." theme={theme} onAction={onBook} actionLabel="Book" />
          <CareMiniList title="Nearby Hospitals" items={shownHospitals} empty="No specialty-tagged hospital found, use all hospitals." theme={theme} />
          <CareMiniList title="Ambulances" items={drivers.slice(0, 3)} empty="No ambulance drivers nearby." theme={theme} onAction={onRequestAmbulance} actionLabel="Request" />
        </div>
      </div>
    </section>
  );
};

const CareMiniList = ({ title, items, empty, theme, onAction, actionLabel }) => (
  <div className={`h-fit w-[280px] shrink-0 rounded-lg border ${theme.border} ${theme.panel} p-3 sm:w-[320px] min-[1180px]:w-auto min-[1180px]:shrink`}>
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className={`min-w-0 text-[11px] font-black uppercase tracking-[0.12em] ${theme.subtext}`}>{title}</p>
      <span className={`shrink-0 rounded-md border ${theme.border} px-2 py-1 text-[10px] font-black ${theme.subtext}`}>
        {items.length}
      </span>
    </div>
    <div className="grid gap-2">
      {items.slice(0, 3).map((item) => (
        <div key={item.id || item._id || item.name} className={`min-w-0 rounded-lg border ${theme.border} ${theme.panelMuted} p-3`}>
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C8102E]/10 text-[#C8102E]">
              <Icon name={actionLabel === "Request" ? "ambulance" : "doctor"} size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`whitespace-normal break-words text-sm font-black leading-5 ${theme.text}`}>{item.name || item.fullName}</p>
              <p className={`mt-1 whitespace-normal break-words text-xs leading-5 ${theme.subtext}`}>
                {item.specialization || item.category || item.vehicleNumber || "Available"}
              </p>
              <p className={`mt-0.5 text-xs font-bold ${theme.subtext}`}>{formatDistance(item)}</p>
            </div>
          </div>
          {onAction && (
            <button onClick={() => onAction(item)} className="mt-3 h-9 w-full rounded-lg bg-[#C8102E] px-3 text-xs font-black text-white transition hover:bg-[#a50d25]">
              {actionLabel}
            </button>
          )}
        </div>
      ))}
      {!items.length && (
        <div className={`rounded-lg border border-dashed ${theme.border} ${theme.panelMuted} p-4 text-sm font-semibold leading-6 ${theme.subtext}`}>
          {empty}
        </div>
      )}
    </div>
  </div>
);

const ProviderTable = ({ providers, type, theme, onBook }) => (
  <div>
    <div className="space-y-3 p-3 md:hidden">
      {providers.map((provider) => (
        <div key={provider._id || provider.email || provider.name} className={`rounded-lg border ${theme.border} ${theme.panelMuted} p-3`}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0891B2]/10 text-[#0891B2]">
              <Icon name={type === "doctor" ? "doctor" : "ambulance"} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-black ${theme.text}`}>{provider.name || provider.fullName}</p>
              <p className={`mt-0.5 text-xs font-semibold ${theme.subtext}`}>
                {provider.specialization || "General Medicine"} - {formatDistance(provider)}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[#DCFCE7] px-2 py-1 text-[11px] font-black text-[#166534]">
                  {(provider.status || "active").toUpperCase()}
                </span>
                <span className={`rounded-md border ${theme.border} px-2 py-1 text-[11px] font-black ${theme.text}`}>
                  Rating {provider.rating || "Not rated"}
                </span>
              </div>
            </div>
          </div>
          <button onClick={() => onBook?.(provider)} className="mt-3 h-9 w-full rounded-lg bg-[#0A1628] px-3 text-xs font-black text-white transition hover:bg-[#C8102E]">
            Book
          </button>
        </div>
      ))}
      {!providers.length && (
        <p className={`rounded-lg border ${theme.border} ${theme.panelMuted} p-4 text-sm font-semibold ${theme.subtext}`}>
          No verified subscribed doctors are available yet.
        </p>
      )}
    </div>

    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[680px] text-left">
      <thead className={`${theme.panelMuted} ${theme.subtext}`}>
        <tr className="text-[11px] uppercase tracking-[0.12em]">
          <th className="px-4 py-3 font-black">Provider</th>
          <th className="px-4 py-3 font-black">Specialty</th>
          <th className="px-4 py-3 font-black">Distance</th>
          <th className="px-4 py-3 font-black">Rating</th>
          <th className="px-4 py-3 font-black">Status</th>
          <th className="px-4 py-3 font-black">Action</th>
        </tr>
      </thead>
      <tbody>
        {providers.map((provider) => (
          <tr key={provider._id || provider.email || provider.name} className={`border-t ${theme.border}`}>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0891B2]/10 text-[#0891B2]">
                  <Icon name={type === "doctor" ? "doctor" : "ambulance"} />
                </div>
                <div>
                  <p className={`text-sm font-black ${theme.text}`}>{provider.name || provider.fullName}</p>
                  <p className={`text-xs ${theme.subtext}`}>{provider.email || "Verified provider"}</p>
                </div>
              </div>
            </td>
            <td className={`px-4 py-3 text-sm font-semibold ${theme.text}`}>
              {provider.specialization || "General Medicine"}
            </td>
            <td className={`px-4 py-3 text-sm ${theme.subtext}`}>{formatDistance(provider)}</td>
            <td className={`px-4 py-3 text-sm font-bold ${theme.text}`}>{provider.rating || "Not rated"}</td>
            <td className="px-4 py-3">
              <span className="rounded-md bg-[#DCFCE7] px-2 py-1 text-[11px] font-black text-[#166534]">
                {(provider.status || "active").toUpperCase()}
              </span>
            </td>
            <td className="px-4 py-3">
              <button onClick={() => onBook?.(provider)} className="h-8 rounded-lg bg-[#0A1628] px-3 text-xs font-black text-white transition hover:bg-[#C8102E]">
                Book
              </button>
            </td>
          </tr>
        ))}
      </tbody>
      </table>
      {!providers.length && (
        <p className={`border-t ${theme.border} px-4 py-6 text-sm font-semibold ${theme.subtext}`}>
          No verified subscribed doctors are available yet.
        </p>
      )}
    </div>
  </div>
);

const AppointmentPaymentCard = ({ appointment, onPay, onReview, loading, theme }) => {
  const isPaid = appointment.paymentStatus === "paid";
  const canReview = appointment.appointmentStatus === "completed";
  const doctor = appointment.doctorId || {};
  const joinEnabled = appointment.zoomLink && canJoinAppointment(appointment);

  return (
    <div className={`rounded-lg border ${theme.border} ${theme.panelMuted} p-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-black ${theme.text}`}>
            Dr. {doctor.fullName || doctor.name || "Doctor"}
          </p>
          <p className={`mt-1 text-xs font-semibold ${theme.subtext}`}>
            {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-md px-2 py-1 text-[11px] font-black ${
            isPaid ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEF3C7] text-[#92400E]"
          }`}>
            {isPaid ? "PAID" : "PAYMENT PENDING"}
          </span>
          <span className={`rounded-md border ${theme.border} ${theme.panel} px-2 py-1 text-[11px] font-black ${theme.text}`}>
            {(appointment.appointmentStatus || "requested").toUpperCase()}
          </span>
        </div>
      </div>

      {appointment.patientNotes && (
        <p className={`mt-3 text-sm ${theme.subtext}`}>{appointment.patientNotes}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className={`text-sm font-black ${theme.text}`}>
          Rs. {Number(appointment.consultationFee || 0).toLocaleString()}
        </p>
        <div className="flex flex-wrap gap-2">
          {appointment.zoomLink && (
            joinEnabled ? (
              <a
                href={appointment.zoomLink}
                target="_blank"
                rel="noreferrer"
                className="h-9 rounded-lg bg-[#0891B2] px-3 py-2 text-xs font-black text-white"
              >
                Join Meeting
              </a>
            ) : (
              <button
                type="button"
                disabled
                title={getJoinHelpText(appointment)}
                className="h-9 rounded-lg bg-[#94A3B8] px-3 text-xs font-black text-white opacity-70"
              >
                Join Meeting
              </button>
            )
          )}
          {!isPaid && (
            <button
              type="button"
              onClick={onPay}
              disabled={loading}
              className="h-9 rounded-lg bg-[#C8102E] px-3 text-xs font-black text-white transition hover:bg-[#a50d25] disabled:opacity-60"
            >
              {loading ? "Redirecting..." : "Pay Now"}
            </button>
          )}
          {canReview && (
            <button
              type="button"
              onClick={onReview}
              className="h-9 rounded-lg border border-[#C8102E] px-3 text-xs font-black text-[#C8102E] transition hover:bg-[#C8102E] hover:text-white"
            >
              Review Doctor
            </button>
          )}
        </div>
      </div>
      {appointment.zoomLink && !joinEnabled && (
        <p className={`mt-2 text-xs font-semibold ${theme.subtext}`}>{getJoinHelpText(appointment)}</p>
      )}
    </div>
  );
};

const PrescriptionCard = ({ item, theme, compact = false }) => (
  <div className={`rounded-lg border ${theme.border} ${theme.panelMuted} ${compact ? "p-2.5" : "p-3"} ${compact ? "mb-2" : "mb-2"}`}>
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <p className={`${compact ? "text-xs" : "text-sm"} font-black ${theme.text}`}>
          {item.medicine}{item.dosage ? ` - ${item.dosage}` : ""}
        </p>
        <p className={`${compact ? "text-[11px]" : "text-xs"} ${theme.subtext}`}>
          {item.schedule}
        </p>
      </div>
      <span className="rounded-md bg-[#DCFCE7] px-2 py-1 text-[11px] font-black text-[#166534]">
        {item.days}
      </span>
    </div>
    <p className={`mt-1 ${compact ? "text-[11px]" : "text-xs"} font-semibold ${theme.subtext}`}>
      Prescribed by {item.doctor}
    </p>
    {item.instructions && (
      <p className={`mt-1 ${compact ? "text-[11px]" : "text-xs"} ${theme.subtext}`}>
        {item.instructions}
      </p>
    )}
  </div>
);

const AmbulancePaymentCard = ({ job, onReview, theme }) => {
  const driver = job.driverId || {};

  return (
    <div className={`rounded-lg border ${theme.border} ${theme.panelMuted} p-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-black ${theme.text}`}>
            {driver.fullName || driver.name || "Ambulance driver"}
          </p>
          <p className={`mt-1 text-xs font-semibold ${theme.subtext}`}>
            {job.pickupLocation || "Pickup"} - {new Date(job.updatedAt || job.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className="rounded-md bg-[#DCFCE7] px-2 py-1 text-[11px] font-black text-[#166534]">
          COMPLETED
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className={`text-sm font-black ${theme.text}`}>
          Rs. {Number(job.fare || 0).toLocaleString()}
        </p>
        <button
          type="button"
          onClick={onReview}
          className="h-9 rounded-lg border border-[#C8102E] px-3 text-xs font-black text-[#C8102E] transition hover:bg-[#C8102E] hover:text-white"
        >
          Review Driver
        </button>
      </div>
    </div>
  );
};

const BookingModal = ({
  doctor,
  form,
  setForm,
  pendingAppointment,
  slotAvailability,
  slotLoading,
  message,
  error,
  loading,
  onClose,
  onRequest,
  onPay,
  theme,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/60 p-4 backdrop-blur-sm">
    <section className={`w-full max-w-lg rounded-lg border ${theme.border} ${theme.panel} p-4 shadow-2xl`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className={`text-lg font-black ${theme.text}`}>Request consultation</h2>
          <p className={`text-sm font-semibold ${theme.subtext}`}>
            {doctor.fullName || doctor.name} - Rs. {Number(doctor.consultationFee || 0).toLocaleString()}
          </p>
        </div>
        <button onClick={onClose} className={`h-9 rounded-lg border ${theme.border} px-3 text-sm font-bold ${theme.text}`}>
          Close
        </button>
      </div>

      {message && <div className="mt-4 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-sm font-bold text-[#166534]">{message}</div>}
      {error && <div className="mt-4 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-sm font-bold text-[#991B1B]">{error}</div>}

      <form onSubmit={onRequest} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={`mb-1 block text-xs font-black ${theme.subtext}`}>Date</label>
            <input
              type="date"
              required
              min={new Date().toISOString().slice(0, 10)}
              value={form.appointmentDate}
              onChange={(event) => setForm({ ...form, appointmentDate: event.target.value, appointmentTime: "" })}
              className={`h-10 w-full rounded-lg border ${theme.border} ${theme.panelMuted} px-3 text-sm ${theme.text} outline-none`}
            />
          </div>
          <div>
            <label className={`mb-1 block text-xs font-black ${theme.subtext}`}>Time</label>
            {slotAvailability.allTimeSlots.length ? (
              <div className={`min-h-10 rounded-lg border ${theme.border} ${theme.panelMuted} p-2`}>
                <div className="flex flex-wrap gap-2">
                  {slotAvailability.allTimeSlots.map((slot) => {
                    const isBooked = slotAvailability.bookedTimes.includes(slot);
                    const isUnavailable = !slotAvailability.availableDay;
                    const isSelected = form.appointmentTime === slot;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isBooked || isUnavailable || pendingAppointment}
                        onClick={() => setForm({ ...form, appointmentTime: slot })}
                        className={`h-8 rounded-lg px-3 text-xs font-black transition ${
                          isBooked || isUnavailable
                            ? "cursor-not-allowed bg-[#FEE2E2] text-[#991B1B] opacity-70"
                            : isSelected
                              ? "bg-[#C8102E] text-white"
                              : `border ${theme.border} ${theme.text}`
                        }`}
                      >
                        {slot} {isUnavailable ? "Unavailable" : isBooked ? "Booked" : ""}
                      </button>
                    );
                  })}
                </div>
                {slotLoading && <p className={`mt-2 text-xs font-semibold ${theme.subtext}`}>Checking slots...</p>}
                {!slotAvailability.availableDay && !slotLoading && (
                  <p className="mt-2 text-xs font-bold text-[#991B1B]">Doctor is not available on this date.</p>
                )}
                {slotAvailability.availableDay && !slotAvailability.availableTimeSlots.length && !slotLoading && (
                  <p className="mt-2 text-xs font-bold text-[#991B1B]">All configured slots are booked for this date.</p>
                )}
              </div>
            ) : (
              <input
                type="time"
                required
                value={form.appointmentTime}
                onChange={(event) => setForm({ ...form, appointmentTime: event.target.value })}
                className={`h-10 w-full rounded-lg border ${theme.border} ${theme.panelMuted} px-3 text-sm ${theme.text} outline-none`}
              />
            )}
          </div>
        </div>
        <div>
          <label className={`mb-1 block text-xs font-black ${theme.subtext}`}>Notes</label>
          <textarea
            value={form.patientNotes}
            onChange={(event) => setForm({ ...form, patientNotes: event.target.value })}
            maxLength={1000}
            className={`h-20 w-full resize-none rounded-lg border ${theme.border} ${theme.panelMuted} px-3 py-2 text-sm ${theme.text} outline-none`}
            placeholder="Briefly describe your concern"
          />
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="submit"
            disabled={loading || Boolean(pendingAppointment) || (slotAvailability.allTimeSlots.length > 0 && !form.appointmentTime)}
            className="h-10 rounded-lg bg-[#0A1628] px-4 text-sm font-black text-white disabled:opacity-50"
          >
            {loading ? "Working..." : pendingAppointment ? "Already Requested" : "Request"}
          </button>
          {pendingAppointment?.paymentStatus !== "paid" && (
            <button
              type="button"
              onClick={() => onPay(pendingAppointment)}
              disabled={loading || !pendingAppointment}
              className="h-10 rounded-lg bg-[#C8102E] px-4 text-sm font-black text-white disabled:opacity-50"
            >
              {loading ? "Redirecting..." : "Pay with Stripe"}
            </button>
          )}
        </div>
      </form>
    </section>
  </div>
);

const AmbulanceRequestModal = ({
  driver,
  form,
  setForm,
  message,
  error,
  loading,
  onSubmit,
  onClose,
  theme,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/60 p-4">
    <section className={`w-full max-w-lg rounded-lg border ${theme.border} ${theme.panel} p-5 shadow-2xl`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className={`text-lg font-black ${theme.text}`}>Request ambulance</h2>
          <p className={`text-sm font-semibold ${theme.subtext}`}>
            {driver.fullName || driver.name} - {driver.vehicleNumber || "Ambulance"}
          </p>
        </div>
        <button onClick={onClose} className={`h-9 rounded-lg border ${theme.border} px-3 text-sm font-bold ${theme.text}`}>
          Close
        </button>
      </div>

      {message && <div className="mt-4 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-sm font-bold text-[#166534]">{message}</div>}
      {error && <div className="mt-4 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-sm font-bold text-[#991B1B]">{error}</div>}

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div>
          <label className={`mb-1 block text-xs font-black ${theme.subtext}`}>Pickup Location</label>
          <input
            required
            value={form.pickupLocation}
            onChange={(event) => setForm({ ...form, pickupLocation: event.target.value })}
            className={`h-10 w-full rounded-lg border ${theme.border} ${theme.panelMuted} px-3 text-sm ${theme.text} outline-none`}
            placeholder="Street, area, or nearby landmark"
          />
        </div>
        <div>
          <label className={`mb-1 block text-xs font-black ${theme.subtext}`}>Contact Number</label>
          <input
            required
            value={form.contactNumber}
            onChange={(event) => setForm({ ...form, contactNumber: event.target.value })}
            className={`h-10 w-full rounded-lg border ${theme.border} ${theme.panelMuted} px-3 text-sm ${theme.text} outline-none`}
            placeholder="03xx xxxxxxx"
          />
        </div>
        <div>
          <label className={`mb-1 block text-xs font-black ${theme.subtext}`}>Notes</label>
          <textarea
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            maxLength={1000}
            className={`h-20 w-full resize-none rounded-lg border ${theme.border} ${theme.panelMuted} px-3 py-2 text-sm ${theme.text} outline-none`}
            placeholder="Optional emergency details"
          />
        </div>
        <div className="flex justify-end">
          <button disabled={loading || Boolean(message)} className="h-10 rounded-lg bg-[#C8102E] px-4 text-sm font-black text-white disabled:opacity-50">
            {loading ? "Sending..." : "Send Request"}
          </button>
        </div>
      </form>
    </section>
  </div>
);

const ReviewModal = ({
  target,
  form,
  setForm,
  message,
  error,
  loading,
  onSubmit,
  onClose,
  theme,
}) => {
  const isDoctor = target.type === "doctor";
  const item = target.item || {};
  const doctor = item.doctorId || {};
  const driver = item.driverId || {};
  const title = isDoctor ? "Review doctor" : "Review ambulance driver";
  const subtitle = isDoctor
    ? `Dr. ${doctor.fullName || doctor.name || "Doctor"}`
    : `${driver.fullName || driver.name || "Ambulance driver"} - ${item.vehicleNumber || driver.vehicleNumber || "Ambulance"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/60 p-4">
      <section className={`w-full max-w-lg rounded-lg border ${theme.border} ${theme.panel} p-5 shadow-2xl`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className={`text-lg font-black ${theme.text}`}>{title}</h2>
            <p className={`text-sm font-semibold ${theme.subtext}`}>{subtitle}</p>
          </div>
          <button onClick={onClose} className={`h-9 rounded-lg border ${theme.border} px-3 text-sm font-bold ${theme.text}`}>
            Close
          </button>
        </div>

        {message && <div className="mt-4 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-sm font-bold text-[#166534]">{message}</div>}
        {error && <div className="mt-4 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-sm font-bold text-[#991B1B]">{error}</div>}

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <div>
            <label className={`mb-1 block text-xs font-black ${theme.subtext}`}>Rating</label>
            <select
              value={form.rating}
              onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })}
              className={`h-10 w-full rounded-lg border ${theme.border} ${theme.panelMuted} px-3 text-sm ${theme.text} outline-none`}
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>{rating} / 5</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`mb-1 block text-xs font-black ${theme.subtext}`}>Comment</label>
            <textarea
              value={form.comment}
              onChange={(event) => setForm({ ...form, comment: event.target.value })}
              maxLength={1000}
              className={`h-24 w-full resize-none rounded-lg border ${theme.border} ${theme.panelMuted} px-3 py-2 text-sm ${theme.text} outline-none`}
              placeholder="Share your experience"
            />
          </div>
          <div className="flex justify-end">
            <button disabled={loading || Boolean(message)} className="h-10 rounded-lg bg-[#C8102E] px-4 text-sm font-black text-white disabled:opacity-50">
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

const ProviderRow = ({ provider, type, theme }) => {
  const isDoctor = type === "doctor";
  return (
    <div className={`flex items-center justify-between rounded-lg border ${theme.border} ${theme.panelMuted} p-3`}>
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isDoctor ? "bg-[#0891B2]/10 text-[#0891B2]" : "bg-[#C8102E]/10 text-[#C8102E]"}`}>
          <Icon name={isDoctor ? "doctor" : "ambulance"} size={15} />
        </div>
        <div className="min-w-0">
          <p className={`truncate text-sm font-black ${theme.text}`}>{provider.name || provider.fullName}</p>
          <p className={`truncate text-xs ${theme.subtext}`}>
            {provider.vehicleNumber || provider.specialization || "Available"} - {provider.distance || 4.5} km
          </p>
        </div>
      </div>
      <a
        href={`tel:${provider.mobileNumber || "03001234567"}`}
        className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C8102E] text-white"
      >
        <Icon name="phone" size={14} />
      </a>
    </div>
  );
};

const AmbulanceTrackingCard = ({ job, driverTrackingPlace, userLocation, theme }) => {
  if (!job) return null;

  const driver = job.driverId || {};
  const canTrack = Boolean(driverTrackingPlace);
  const statusText = {
    requested: "Waiting for driver response",
    accepted: "Driver accepted your request",
    active: "Ambulance is on the way",
  }[job.status] || "Ambulance request active";

  return (
    <div className={`m-4 rounded-lg border ${theme.border} ${theme.panelMuted} p-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-black ${theme.text}`}>{statusText}</p>
          <p className={`mt-1 text-xs font-semibold ${theme.subtext}`}>
            {driver.fullName || driver.name || "Ambulance driver"} - {job.pickupLocation}
          </p>
        </div>
        <span className="rounded-md bg-[#DCFCE7] px-2 py-1 text-[11px] font-black uppercase text-[#166534]">
          {job.status}
        </span>
      </div>

      {canTrack ? (
        <div className={`mt-4 overflow-hidden rounded-lg border ${theme.border}`}>
          <NearbyCareMap userLocation={userLocation} places={[driverTrackingPlace]} />
        </div>
      ) : (
        <div className={`mt-4 rounded-lg border ${theme.border} ${theme.panel} p-4 text-sm font-semibold ${theme.subtext}`}>
          Driver location will appear here after the driver accepts and has latitude/longitude saved in profile.
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {driver.mobileNumber && (
          <a href={`tel:${driver.mobileNumber}`} className="rounded-lg bg-[#C8102E] px-3 py-2 text-xs font-black text-white">
            Call Driver
          </a>
        )}
        <span className={`text-xs font-semibold ${theme.subtext}`}>
          Vehicle: {driver.vehicleNumber || "Not set"} - {driver.ambulanceType || "Ambulance"}
        </span>
      </div>
    </div>
  );
};

const EmergencyPanel = ({
  active,
  doctors,
  hospitals,
  drivers,
  activeAmbulanceJob,
  driverTrackingPlace,
  userLocation,
  onRequestAmbulance,
  theme,
}) => (
  <section className={`rounded-lg border ${active ? "border-[#C8102E]" : theme.border} ${theme.panel} overflow-hidden shadow-[0_14px_34px_rgba(10,22,40,0.06)]`}>
    <div className="border-b border-[#C8102E]/20 bg-[#C8102E] px-4 py-3 text-white">
      <h2 className="text-base font-black">Emergency Nearby Results</h2>
      <p className="text-xs font-medium text-white/80">Doctors, hospitals, and ambulance drivers within 10 to 15 km.</p>
    </div>
    <AmbulanceTrackingCard
      job={activeAmbulanceJob}
      driverTrackingPlace={driverTrackingPlace}
      userLocation={userLocation}
      theme={theme}
    />
    <div className="grid gap-3 p-4 lg:grid-cols-3">
      <EmergencyColumn title="Nearby Doctors" icon="doctor" items={doctors} theme={theme} />
      <EmergencyColumn title="Nearby Hospitals" icon="hospital" items={hospitals} theme={theme} />
      <EmergencyColumn
        title="Nearby Ambulances"
        icon="ambulance"
        items={drivers}
        onRequestAmbulance={onRequestAmbulance}
        theme={theme}
      />
    </div>
  </section>
);

const EmergencyColumn = ({ title, icon, items, onRequestAmbulance, theme }) => (
  <div className={`rounded-lg border ${theme.border} ${theme.panelMuted} p-3`}>
    <div className="mb-3 flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C8102E]/10 text-[#C8102E]">
        <Icon name={icon} size={15} />
      </div>
      <h3 className={`text-sm font-black ${theme.text}`}>{title}</h3>
    </div>
    <div className="space-y-2">
      {items.map((item) => {
        const osmUrl = getOsmUrl(item);
        return (
          <div key={item.id || item._id || item.name} className={`rounded-lg border ${theme.border} ${theme.panel} p-3`}>
            <p className={`text-sm font-black ${theme.text}`}>{item.name || item.fullName}</p>
            <p className={`text-xs ${theme.subtext}`}>
              {item.specialization || item.category || item.type || item.vehicleNumber || "Available"} - {formatDistance(item)}
            </p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="rounded-md bg-[#DCFCE7] px-2 py-1 text-[11px] font-black text-[#166534]">
                {item.eta || (item.emergency ? "24/7" : "Open")}
              </span>
              <div className="flex items-center gap-2">
                {onRequestAmbulance && item._id && (
                  <button
                    onClick={() => onRequestAmbulance(item)}
                    className="text-xs font-black text-[#0A1628]"
                  >
                    Request
                  </button>
                )}
                {osmUrl && (
                  <a href={osmUrl} target="_blank" rel="noreferrer" className="text-xs font-black text-[#0891B2]">
                    Map
                  </a>
                )}
                <a href={`tel:${item.phone || item.mobileNumber || "03001234567"}`} className="text-xs font-black text-[#C8102E]">
                  Call
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default PatientDashboard;
