import { motion } from "framer-motion";
import { useState } from "react";
import NearbyCareMap from "../../../components/NearbyCareMap";

const AmbulanceJobs = ({ driver, jobs, onRefresh, onUpdateStatus, theme }) => {
  const [fares, setFares] = useState({});
  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;
  const activeRide = jobs.find((job) => ["accepted", "active"].includes(job.status));

  const handleComplete = (job) => {
    const fare = Number(fares[job._id] || job.fare || 1500);
    onUpdateStatus(job._id, "completed", { fare });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-black tracking-tight ${theme.text}`}>Active Jobs</h2>
          <p className={`mt-0.5 text-sm font-medium ${theme.subtext}`}>
            {jobs.length} total assignments
          </p>
        </div>
        <button
          onClick={onRefresh}
          className={`h-9 rounded-lg border ${theme.border} ${theme.panel} px-4 text-sm font-black ${theme.subtext} transition hover:border-[#C8102E] hover:text-[#C8102E]`}
        >
          Refresh
        </button>
      </div>

      {activeRide && (
        <ActiveRideCard
          driver={driver}
          job={activeRide}
          theme={theme}
          fare={fares[activeRide._id] || activeRide.fare || ""}
          setFare={(value) => setFares((current) => ({ ...current, [activeRide._id]: value }))}
          onStart={() => onUpdateStatus(activeRide._id, "active")}
          onCancel={() => onUpdateStatus(activeRide._id, "cancelled")}
          onComplete={() => handleComplete(activeRide)}
        />
      )}

      {jobs.length === 0 ? (
        <div className={`${cardClass} p-16 text-center`}>
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border ${theme.border} ${theme.panelMuted}`}>
            <svg className={`h-8 w-8 ${theme.subtext}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className={`font-black text-lg ${theme.text}`}>No jobs assigned yet</p>
          <p className={`text-sm font-medium ${theme.subtext} mt-1`}>
            Jobs will appear here once assigned by dispatch
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job, i) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`${cardClass} p-5`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`rounded-md px-2 py-1 text-[10px] font-black
                      ${job.status === "completed" ? "bg-[#DCFCE7] text-[#166534]" :
                        job.status === "active" ? "bg-[#DBEAFE] text-[#1E40AF]" :
                        job.status === "cancelled" ? "bg-[#FEE2E2] text-[#991B1B]" :
                        "bg-[#FEF9C3] text-[#854D0E]"}`}>
                      {(job.status || "pending").toUpperCase()}
                    </span>
                  </div>
                  <p className={`font-black ${theme.text}`}>{job.patientName || "Patient"}</p>
                  <div className="mt-2 space-y-1">
                    {[
                      ["Location", job.location],
                      ["Pickup", job.pickupLocation],
                      ["Destination", job.destination],
                      ["Contact", job.contactNumber],
                      ["Notes", job.notes],
                    ].map(([label, value]) => value && (
                      <p key={label} className={`text-xs font-medium ${theme.subtext}`}>
                        <span className="font-black">{label}:</span> {value}
                      </p>
                    ))}
                  </div>
                </div>
                <p className={`text-xs font-semibold ${theme.subtext}`}>
                  {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
              {job.status === "requested" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    ["Accept", "accepted"],
                    ["Cancel", "cancelled"],
                  ].map(([label, status]) => (
                    <button
                      key={status}
                      onClick={() => onUpdateStatus(job._id, status)}
                      className={`h-9 rounded-lg px-4 text-xs font-black text-white ${
                        status === "cancelled" ? "bg-[#991B1B]" : "bg-[#C8102E]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              {job.status === "accepted" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => onUpdateStatus(job._id, "active")} className="h-9 rounded-lg bg-[#C8102E] px-4 text-xs font-black text-white">
                    Start Ride
                  </button>
                  <button onClick={() => onUpdateStatus(job._id, "cancelled")} className="h-9 rounded-lg bg-[#991B1B] px-4 text-xs font-black text-white">
                    Cancel
                  </button>
                </div>
              )}
              {job.status === "active" && (
                <div className="mt-4 flex flex-wrap items-end gap-2">
                  <label className={`text-xs font-black ${theme.subtext}`}>
                    Fare
                    <input
                      type="number"
                      min="0"
                      value={fares[job._id] || job.fare || ""}
                      onChange={(event) => setFares((current) => ({ ...current, [job._id]: event.target.value }))}
                      placeholder="1500"
                      className={`mt-1 h-9 w-28 rounded-lg border ${theme.border} ${theme.panel} px-3 text-xs ${theme.text} outline-none`}
                    />
                  </label>
                  <button onClick={() => handleComplete(job)} className="h-9 rounded-lg bg-[#059669] px-4 text-xs font-black text-white">
                    Complete Ride
                  </button>
                </div>
              )}
              {Number.isFinite(job.pickupLatitude) && Number.isFinite(job.pickupLongitude) && (
                <div className={`mt-4 overflow-hidden rounded-lg border ${theme.border}`}>
                  <NearbyCareMap
                    userLocation={{ lat: job.pickupLatitude, lng: job.pickupLongitude }}
                    places={getDriverMarker(driver, job)}
                    userLabel="Patient pickup location"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const ActiveRideCard = ({ driver, job, theme, fare, setFare, onStart, onCancel, onComplete }) => {
  const driverMarker = getDriverMarker(driver, job);

  return (
    <section className={`rounded-lg border border-[#C8102E] ${theme.panel} p-5 shadow-[0_18px_44px_rgba(200,16,46,0.12)]`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#C8102E]">Live Ride</p>
          <h3 className={`mt-1 text-xl font-black ${theme.text}`}>{job.patientName || "Patient"}</h3>
          <p className={`mt-1 text-sm font-semibold ${theme.subtext}`}>{job.pickupLocation}</p>
        </div>
        <span className="rounded-lg bg-[#C8102E] px-3 py-2 text-xs font-black text-white">
          {job.status === "active" ? "IN PROGRESS" : "ACCEPTED"}
        </span>
      </div>

      {Number.isFinite(job.pickupLatitude) && Number.isFinite(job.pickupLongitude) && (
        <div className={`mt-4 overflow-hidden rounded-lg border ${theme.border}`}>
          <NearbyCareMap
            userLocation={{ lat: job.pickupLatitude, lng: job.pickupLongitude }}
            places={driverMarker}
            userLabel="Patient pickup location"
          />
        </div>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[
          ["Contact", job.contactNumber],
          ["Destination", job.destination || "Nearest hospital"],
          ["Vehicle", driver?.vehicleNumber || "Not set"],
        ].map(([label, value]) => (
          <div key={label} className={`rounded-lg border ${theme.border} ${theme.panelMuted} p-3`}>
            <p className={`text-[11px] font-black uppercase tracking-wider ${theme.subtext}`}>{label}</p>
            <p className={`mt-1 text-sm font-black ${theme.text}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-2">
        {job.status === "accepted" && (
          <>
            <button onClick={onStart} className="h-10 rounded-lg bg-[#C8102E] px-5 text-sm font-black text-white">
              Start Ride
            </button>
            <button onClick={onCancel} className="h-10 rounded-lg bg-[#991B1B] px-5 text-sm font-black text-white">
              Cancel
            </button>
          </>
        )}
        {job.status === "active" && (
          <>
            <label className={`text-xs font-black ${theme.subtext}`}>
              Final fare
              <input
                type="number"
                min="0"
                value={fare}
                onChange={(event) => setFare(event.target.value)}
                placeholder="1500"
                className={`mt-1 h-10 w-32 rounded-lg border ${theme.border} ${theme.panelMuted} px-3 text-sm ${theme.text} outline-none`}
              />
            </label>
            <button onClick={onComplete} className="h-10 rounded-lg bg-[#059669] px-5 text-sm font-black text-white">
              Complete Ride
            </button>
          </>
        )}
        {job.contactNumber && (
          <a href={`tel:${job.contactNumber}`} className="h-10 rounded-lg border border-[#C8102E] px-5 py-2.5 text-sm font-black text-[#C8102E]">
            Call Patient
          </a>
        )}
      </div>
    </section>
  );
};

const getDriverMarker = (driver, job) => {
  const latitude = Number.isFinite(job?.driverLatitude) ? job.driverLatitude : driver?.latitude;
  const longitude = Number.isFinite(job?.driverLongitude) ? job.driverLongitude : driver?.longitude;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];

  return [{
    id: `driver-${driver?._id || job?._id}`,
    name: driver?.name || driver?.fullName || "Your ambulance",
    category: job?.status === "active" ? "Live ambulance location" : "Accepted location",
    lat: latitude,
    lng: longitude,
  }];
};

export default AmbulanceJobs;
