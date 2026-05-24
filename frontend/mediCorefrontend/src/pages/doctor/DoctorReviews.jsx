const DoctorReviews = ({ reviews, stats, theme }) => (
  <div className="space-y-5">
    <section className="grid gap-4 sm:grid-cols-2">
      <div className={`rounded-lg border ${theme.border} ${theme.panel} p-4 shadow-[0_14px_34px_rgba(10,22,40,0.06)]`}>
        <p className={`text-3xl font-black ${theme.text}`}>{stats.averageRating || "0.0"}</p>
        <p className={`text-sm font-bold ${theme.subtext}`}>Average Rating</p>
      </div>
      <div className={`rounded-lg border ${theme.border} ${theme.panel} p-4 shadow-[0_14px_34px_rgba(10,22,40,0.06)]`}>
        <p className={`text-3xl font-black ${theme.text}`}>{stats.totalReviews || 0}</p>
        <p className={`text-sm font-bold ${theme.subtext}`}>Total Reviews</p>
      </div>
    </section>
    <section className={`rounded-lg border ${theme.border} ${theme.panel} p-4 shadow-[0_14px_34px_rgba(10,22,40,0.06)]`}>
      <h2 className={`text-lg font-black ${theme.text}`}>Latest Reviews</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {reviews.map((review) => (
          <article key={review._id} className={`rounded-lg border ${theme.border} ${theme.panelMuted} p-3`}>
            <p className={`text-sm font-black ${theme.text}`}>{review.rating}/5</p>
            <p className={`mt-1 text-sm ${theme.subtext}`}>{review.comment || "No comment added."}</p>
            <p className="mt-2 text-xs font-bold text-[#94A3B8]">{review.patientId?.fullName || review.patientId?.name || "Patient"}</p>
          </article>
        ))}
        {!reviews.length && <p className={`text-sm font-semibold ${theme.subtext}`}>No reviews yet.</p>}
      </div>
    </section>
  </div>
);

export default DoctorReviews;
