import { motion } from "framer-motion";

const Reviews = ({ reviews, onDelete, theme }) => {
  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;
  const softClass = `rounded-lg border ${theme.border} ${theme.panelMuted}`;

  return (
    <div className="space-y-5">
      <div>
        <h2 className={`text-xl font-black tracking-tight ${theme.text}`}>Reviews</h2>
        <p className={`mt-0.5 text-sm font-medium ${theme.subtext}`}>{reviews.length} total reviews</p>
      </div>

      {reviews.length === 0 ? (
        <div className={`${cardClass} p-16 text-center`}>
          <p className="text-5xl mb-4">⭐</p>
          <p className={`font-black text-lg ${theme.text}`}>No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r, i) => (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`${cardClass} p-5`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F3E8FF] text-sm font-black text-[#6B21A8]">
                    {r.patientId?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-black ${theme.text}`}>{r.patientId?.name || "Patient"}</p>
                      <span className={`text-xs font-semibold ${theme.subtext}`}>reviewed</span>
                      <p className={`font-black ${theme.text}`}>Dr. {r.doctorId?.name || "Doctor"}</p>
                      {r.doctorId?.specialization && (
                        <span className="rounded-md bg-[#DBEAFE] px-2 py-0.5 text-[10px] font-black text-[#1E40AF]">
                          {r.doctorId.specialization}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={s <= r.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                        ))}
                      </div>
                      <span className={`text-xs font-black ${theme.subtext}`}>{r.rating}/5</span>
                    </div>
                    {r.comment && (
                      <p className={`mt-2 text-sm font-medium ${theme.subtext}`}>{r.comment}</p>
                    )}
                    <p className={`mt-1 text-xs font-semibold ${theme.subtext}`}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(r._id)}
                  className="h-8 shrink-0 rounded-lg border border-[#C8102E]/30 px-3 text-xs font-black text-[#C8102E] transition hover:bg-[#C8102E] hover:text-white"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;