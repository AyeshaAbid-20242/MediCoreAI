import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const money = (amount = 0) => `Rs. ${Number(amount).toLocaleString()}`;

const OperationsSignal = ({ darkMode }) => {
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

    // Cross/Plus shape for medical
    const crossH = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.6, 0.6),
      new THREE.MeshStandardMaterial({
        color: "#C8102E",
        roughness: 0.2,
        metalness: 0.3,
        transparent: true,
        opacity: 0.9,
      })
    );
    group.add(crossH);

    const crossV = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 2.2, 0.6),
      new THREE.MeshStandardMaterial({
        color: "#C8102E",
        roughness: 0.2,
        metalness: 0.3,
        transparent: true,
        opacity: 0.9,
      })
    );
    group.add(crossV);

    // Orbit rings
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: darkMode ? "#94A3B8" : "#0891B2",
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });

    [0, 1, 2].forEach((i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.6 + i * 0.25, 0.012, 16, 96),
        orbitMaterial
      );
      ring.rotation.x = i * 0.8;
      ring.rotation.y = 0.5 + i * 0.4;
      group.add(ring);
    });

    // Particles
    const particles = new THREE.Points(
      new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 100 }, () => {
          const r = 1.8 + Math.random() * 0.7;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          return new THREE.Vector3(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
          );
        })
      ),
      new THREE.PointsMaterial({ color: "#0891B2", size: 0.028, transparent: true, opacity: 0.75 })
    );
    group.add(particles);

    scene.add(new THREE.AmbientLight("#ffffff", 1.5));
    const keyLight = new THREE.DirectionalLight("#ffffff", 1.3);
    keyLight.position.set(4, 3, 5);
    scene.add(keyLight);
    camera.position.z = 5;

    let frameId;
    const animate = () => {
      group.rotation.y += 0.006;
      group.rotation.x = Math.sin(Date.now() * 0.001) * 0.07;
      particles.rotation.y -= 0.002;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const w = mount.clientWidth || width;
      const h = mount.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
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

const PanelTitle = ({ title, subtitle, theme }) => (
  <div>
    <h2 className={`text-base font-black tracking-tight ${theme.text}`}>{title}</h2>
    <p className={`mt-0.5 text-xs font-medium ${theme.subtext}`}>{subtitle}</p>
  </div>
);

const Overview = ({ stats, setActiveTab, allUsers, appointments, payments, theme }) => {
  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;
  const softClass = `rounded-lg border ${theme.border} ${theme.panelMuted}`;

  const recentAppointments = appointments?.slice(0, 4) || [];
  const recentPayments = payments?.slice(0, 4) || [];

  const statCards = [
    ["Total Doctors", stats.totalDoctors || 0, "bg-[#0891B2]/10 text-[#0891B2]", "Active doctors"],
    ["Total Patients", stats.totalPatients || 0, "bg-[#059669]/10 text-[#059669]", "Registered patients"],
    ["Ambulance Drivers", stats.totalDrivers || 0, "bg-[#F59E0B]/10 text-[#F59E0B]", "Active drivers"],
    ["Pending Approvals", stats.pendingApprovals || 0, "bg-[#C8102E]/10 text-[#C8102E]", "Needs review"],
    ["Total Users", stats.totalUsers || 0, "bg-[#6366F1]/10 text-[#6366F1]", "All registered"],
  ];

  return (
    <div className="space-y-5">

      {/* Hero Section */}
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  className={`${cardClass} overflow-hidden`}
>
  <div className="grid min-h-[280px] gap-4 p-5 lg:grid-cols-[1fr_320px]">
    <div className="flex flex-col justify-between">
      <div>
        <p className={`text-[11px] font-black uppercase tracking-[0.22em] ${theme.subtext}`}>
          Live Operations Center
        </p>
        <h2 className={`mt-3 max-w-2xl text-3xl font-black tracking-tight ${theme.text} sm:text-4xl`}>
          Healthcare command & control dashboard
        </h2>
        <p className={`mt-3 max-w-xl text-sm font-medium leading-6 ${theme.subtext}`}>
          Monitor all system activity, manage users, track appointments, and oversee platform health from one unified admin console.
        </p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["Platform Status", "Operational"],
          ["Total Users", stats.totalUsers || 0],
          ["Pending", stats.pendingApprovals || 0],
        ].map(([label, value]) => (
          <div key={label} className={`rounded-lg border ${theme.border} ${theme.panelMuted} p-3`}>
            <p className={`text-[11px] font-black uppercase tracking-[0.14em] ${theme.subtext}`}>{label}</p>
            <p className={`mt-1 truncate text-sm font-black ${theme.text}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
    <div className={`rounded-lg border ${theme.border} ${theme.panelMuted}`}>
      <OperationsSignal darkMode={theme.darkMode} />
    </div>
  </div>
</motion.div>

        {/* Pending Alert */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`${cardClass} p-4`}
        >
          <PanelTitle title="Approval Queue" subtitle="Pending doctor & driver applications" theme={theme} />
          <div className={`mt-4 rounded-lg border p-4 ${stats.pendingApprovals > 0 ? "border-[#FED7AA] bg-[#FFF7ED]" : "border-[#BBF7D0] bg-[#F0FDF4]"}`}>
            <p className={`text-sm font-black ${stats.pendingApprovals > 0 ? "text-[#9A3412]" : "text-[#166534]"}`}>
              {stats.pendingApprovals > 0
                ? `${stats.pendingApprovals} application${stats.pendingApprovals > 1 ? "s" : ""} waiting`
                : "All applications reviewed"}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#64748B]">
              Doctors and ambulance drivers pending approval
            </p>
          </div>
          {stats.pendingApprovals > 0 && (
            <button
              onClick={() => setActiveTab("pending")}
              className="mt-4 h-10 w-full rounded-lg bg-[#C8102E] text-sm font-black text-white hover:bg-[#a50d25] transition"
            >
              Review Applications →
            </button>
          )}

          {/* User breakdown */}
          <div className="mt-4 space-y-2">
            {[
              ["Patients", stats.totalPatients || 0, "bg-[#059669]"],
              ["Doctors", stats.totalDoctors || 0, "bg-[#0891B2]"],
              ["Drivers", stats.totalDrivers || 0, "bg-[#F59E0B]"],
            ].map(([label, value, color]) => (
              <div key={label} className="flex items-center gap-3">
                <span className={`text-xs font-bold ${theme.subtext} w-16`}>{label}</span>
                <div className={`flex-1 h-1.5 rounded-full ${theme.darkMode ? "bg-[#1E2D45]" : "bg-gray-200"}`}>
                  <div
                    className={`h-1.5 rounded-full ${color}`}
                    style={{ width: `${Math.round((value / (stats.totalUsers || 1)) * 100)}%` }}
                  />
                </div>
                <span className={`text-xs font-black ${theme.text} w-6 text-right`}>{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stat Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map(([label, value, tone, caption], i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`${cardClass} p-4`}
          >
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
              <span className="text-xs font-black">{i + 1}</span>
            </div>
            <p className={`text-2xl font-black ${theme.text}`}>{value}</p>
            <p className={`mt-1 text-xs font-bold ${theme.text}`}>{label}</p>
            <p className={`text-xs ${theme.subtext}`}>{caption}</p>
          </motion.div>
        ))}
      </section>

      {/* Recent Activity */}
      <section className="grid gap-5 xl:grid-cols-2">

        {/* Recent Appointments */}
        <div className={`${cardClass} p-4`}>
          <PanelTitle title="Recent Appointments" subtitle="Latest booking activity" theme={theme} />
          <div className="mt-3 space-y-2">
            {recentAppointments.length === 0 ? (
              <p className={`py-4 text-sm font-semibold ${theme.subtext}`}>No appointments yet.</p>
            ) : recentAppointments.map((a) => (
              <div key={a._id} className={`${softClass} flex items-center justify-between p-3`}>
                <div>
                  <p className={`text-sm font-black ${theme.text}`}>
                    {a.patientId?.name || "Patient"} → Dr. {a.doctorId?.name || "Doctor"}
                  </p>
                  <p className={`text-xs ${theme.subtext}`}>
                    {new Date(a.appointmentDate).toLocaleDateString()} at {a.appointmentTime}
                  </p>
                </div>
                <span className={`rounded-md px-2 py-1 text-xs font-black
                  ${a.appointmentStatus === "completed" ? "bg-[#DCFCE7] text-[#166534]" :
                    a.appointmentStatus === "accepted" ? "bg-[#DBEAFE] text-[#1E40AF]" :
                    a.appointmentStatus === "cancelled" ? "bg-[#FEE2E2] text-[#991B1B]" :
                    "bg-[#FEF9C3] text-[#854D0E]"}`}>
                  {a.appointmentStatus}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className={`${cardClass} p-4`}>
          <PanelTitle title="Recent Payments" subtitle="Latest paid consultations" theme={theme} />
          <div className="mt-3 space-y-2">
            {recentPayments.length === 0 ? (
              <p className={`py-4 text-sm font-semibold ${theme.subtext}`}>No payments yet.</p>
            ) : recentPayments.map((p) => (
              <div key={p._id} className={`${softClass} flex items-center justify-between p-3`}>
                <div>
                  <p className={`text-sm font-black ${theme.text}`}>
                    {p.patientId?.name || "Patient"}
                  </p>
                  <p className={`text-xs ${theme.subtext}`}>
                    Dr. {p.doctorId?.name || "Doctor"} • {new Date(p.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-md bg-[#DCFCE7] px-2 py-1 text-xs font-black text-[#166534]">
                  {money(p.consultationFee)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Overview;