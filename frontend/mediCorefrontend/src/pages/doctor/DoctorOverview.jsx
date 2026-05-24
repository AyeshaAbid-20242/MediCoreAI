import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";

const money = (amount = 0) => `Rs. ${Number(amount).toLocaleString()}`;

const PracticeSignal = ({ darkMode }) => {
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

    const capsule = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.72, 1.25, 12, 24),
      new THREE.MeshStandardMaterial({
        color: darkMode ? "#0891B2" : "#C8102E",
        roughness: 0.22,
        metalness: 0.24,
        transparent: true,
        opacity: 0.92,
      })
    );
    capsule.rotation.z = Math.PI / 2;
    group.add(capsule);

    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: darkMode ? "#94A3B8" : "#0891B2",
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
    });

    [0, 1, 2].forEach((index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.45 + index * 0.2, 0.012, 16, 96), orbitMaterial);
      ring.rotation.x = index * 0.72;
      ring.rotation.y = 0.6 + index * 0.46;
      group.add(ring);
    });

    const pulse = new THREE.Points(
      new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 90 }, () => {
          const radius = 1.6 + Math.random() * 0.6;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          return new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
          );
        })
      ),
      new THREE.PointsMaterial({ color: "#C8102E", size: 0.026, transparent: true, opacity: 0.78 })
    );
    group.add(pulse);

    scene.add(new THREE.AmbientLight("#ffffff", 1.55));
    const keyLight = new THREE.DirectionalLight("#ffffff", 1.35);
    keyLight.position.set(4, 3, 5);
    scene.add(keyLight);
    camera.position.z = 4.7;

    let frameId;
    const animate = () => {
      group.rotation.y += 0.0065;
      group.rotation.x = Math.sin(Date.now() * 0.001) * 0.08;
      pulse.rotation.y -= 0.002;
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

  return <div ref={mountRef} className="h-[230px] w-full" />;
};

const DoctorOverview = ({ doctor, stats, appointments, payments, reviews, setActiveTab, theme }) => {
  const upcoming = appointments.filter((item) => item.appointmentStatus === "accepted").slice(0, 4);
  const requests = appointments.filter((item) => item.appointmentStatus === "requested").slice(0, 4);
  const isVisible = ["approved", "active"].includes(doctor?.status) && doctor?.subscriptionStatus === "active";
  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;
  const softClass = `rounded-lg border ${theme.border} ${theme.panelMuted}`;

  const cards = [
    ["Total Appointments", stats.totalAppointments || 0, "bg-[#0891B2]/10 text-[#0891B2]", "Patient flow"],
    ["Pending Requests", stats.pendingRequests || 0, "bg-[#C8102E]/10 text-[#C8102E]", "Needs action"],
    ["Completed", stats.completedConsultations || 0, "bg-[#059669]/10 text-[#059669]", "Consultations"],
    ["Total Earnings", money(stats.totalEarnings), "bg-[#F59E0B]/10 text-[#F59E0B]", "Paid visits"],
    ["Average Rating", stats.averageRating || "0.0", "bg-[#6366F1]/10 text-[#6366F1]", "Patient trust"],
  ];

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardClass} overflow-hidden bg-[#0A1628] text-white`}
        >
          <div className="grid min-h-[280px] gap-4 p-5 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#94A3B8]">Live practice command</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
                  {doctor?.specialization || "Clinical"} care desk for today
                </h2>
                <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-[#CBD5E1]">
                  Track consultation requests, paid sessions, patient feedback, and profile readiness from one focused doctor console.
                </p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <HeroMetric label="Visibility" value={isVisible ? "Public" : "Private"} />
                <HeroMetric label="Fee" value={money(doctor?.consultationFee || 0)} />
                <HeroMetric label="Subscription" value={doctor?.subscriptionStatus || "none"} />
              </div>
            </div>
            <div className="rounded-lg border border-[#1E2D45] bg-[#071224]">
              <PracticeSignal darkMode={theme.darkMode} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={`${cardClass} p-4`}>
          <PanelTitle title="Profile Visibility" subtitle="Public patient discovery status" theme={theme} />
          <div className={`mt-4 rounded-lg border p-4 ${isVisible ? "border-[#BBF7D0] bg-[#F0FDF4]" : "border-[#FED7AA] bg-[#FFF7ED]"}`}>
            <p className={`text-sm font-black ${isVisible ? "text-[#166534]" : "text-[#9A3412]"}`}>
              {isVisible ? "Visible to patients" : "Hidden from patients"}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#64748B]">
              Status: {doctor?.status || "pending"} | Subscription: {doctor?.subscriptionStatus || "none"}
            </p>
          </div>
          {doctor?.subscriptionStatus !== "active" && (
            <button onClick={() => setActiveTab("subscription")} className="mt-4 h-10 w-full rounded-lg bg-[#C8102E] text-sm font-black text-white">
              Activate Subscription
            </button>
          )}
        </motion.div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value, tone, caption], index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className={`${cardClass} p-4`}
          >
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
              <span className="text-xs font-black">{index + 1}</span>
            </div>
            <p className={`text-2xl font-black ${theme.text}`}>{value}</p>
            <p className={`mt-1 text-xs font-bold ${theme.text}`}>{label}</p>
            <p className={`text-xs ${theme.subtext}`}>{caption}</p>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className={`${cardClass} p-4`}>
          <PanelTitle title="New Appointment Requests" subtitle="Patients waiting for your decision" theme={theme} />
          <List items={requests} empty="No new requests yet." theme={theme} />
        </div>
        <div className={`${cardClass} p-4`}>
          <PanelTitle title="Revenue Pulse" subtitle="Latest paid consultation records" theme={theme} />
          <div className="mt-3 space-y-2">
            {payments.slice(0, 4).map((payment) => (
              <div key={payment._id} className={`${softClass} flex items-center justify-between p-3`}>
                <div>
                  <p className={`text-sm font-black ${theme.text}`}>{payment.patient?.fullName || payment.patient?.name || "Patient"}</p>
                  <p className={`text-xs ${theme.subtext}`}>{new Date(payment.date).toLocaleDateString()}</p>
                </div>
                <span className="rounded-md bg-[#DCFCE7] px-2 py-1 text-xs font-black text-[#166534]">{money(payment.amount)}</span>
              </div>
            ))}
            {!payments.length && <p className={`py-4 text-sm font-semibold ${theme.subtext}`}>No paid appointments yet.</p>}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <div className={`${cardClass} p-4 xl:col-span-2`}>
          <PanelTitle title="Upcoming Appointments" subtitle="Accepted consultations" theme={theme} />
          <List items={upcoming} empty="No accepted appointments yet." theme={theme} />
        </div>
        <div className={`${cardClass} p-4`}>
          <PanelTitle title="Latest Reviews" subtitle={`${reviews.length} total reviews`} theme={theme} />
          <div className="mt-3 space-y-3">
            {reviews.slice(0, 3).map((review) => (
              <div key={review._id} className={`${softClass} p-3`}>
                <p className={`text-sm font-black ${theme.text}`}>{review.rating}/5 rating</p>
                <p className={`text-xs ${theme.subtext}`}>{review.comment || "No comment added."}</p>
              </div>
            ))}
            {!reviews.length && <p className={`py-4 text-sm font-semibold ${theme.subtext}`}>No reviews yet.</p>}
          </div>
        </div>
      </section>
    </div>
  );
};

const HeroMetric = ({ label, value }) => (
  <div className="rounded-lg border border-[#1E2D45] bg-white/5 p-3">
    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">{label}</p>
    <p className="mt-1 truncate text-sm font-black text-white">{value}</p>
  </div>
);

const PanelTitle = ({ title, subtitle, theme }) => (
  <div>
    <h2 className={`text-base font-black tracking-tight ${theme.text}`}>{title}</h2>
    <p className={`mt-0.5 text-xs font-medium ${theme.subtext}`}>{subtitle}</p>
  </div>
);

const List = ({ items, empty, theme }) => (
  <div className="mt-3 space-y-3">
    {items.map((item) => (
      <div key={item._id} className={`rounded-lg border ${theme.border} ${theme.panelMuted} p-3`}>
        <p className={`text-sm font-black ${theme.text}`}>{item.patientId?.fullName || item.patientId?.name || "Patient"}</p>
        <p className={`text-xs font-semibold ${theme.subtext}`}>
          {new Date(item.appointmentDate).toLocaleDateString()} at {item.appointmentTime}
        </p>
        <p className={`mt-1 text-xs ${theme.subtext}`}>{item.patientNotes || "No notes provided."}</p>
      </div>
    ))}
    {!items.length && <p className={`py-4 text-sm font-semibold ${theme.subtext}`}>{empty}</p>}
  </div>
);

export default DoctorOverview;
