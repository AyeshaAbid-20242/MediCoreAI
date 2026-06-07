const AmbulanceReviews = ({ reviews = [], stats = {}, theme }) => {
  const cardClass = `rounded-lg border ${theme.border} ${theme.panel} shadow-[0_14px_34px_rgba(10,22,40,0.06)]`;
  const softClass = `rounded-lg border ${theme.border} ${theme.panelMuted}`;

  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2">
        <div className={`${cardClass} p-4`}>
          <p className={`text-3xl font-black ${theme.text}`}>{stats.averageRating || "0.0"}</p>
          <p className={`text-sm font-bold ${theme.subtext}`}>Average Rating</p>
        </div>
        <div className={`${cardClass} p-4`}>
          <p className={`text-3xl font-black ${theme.text}`}>{stats.totalReviews || 0}</p>
          <p className={`text-sm font-bold ${theme.subtext}`}>Total Reviews</p>
        </div>
      </section>

      <section className={`${cardClass} p-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={`text-lg font-black ${theme.text}`}>Patient Feedback</h2>
            <p className={`text-xs font-semibold ${theme.subtext}`}>Reviews from completed ambulance rides</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {reviews.map((review) => (
            <article key={review._id} className={`${softClass} p-3`}>
              <div className="flex items-center justify-between gap-3">
                <p className={`text-sm font-black ${theme.text}`}>{review.rating}/5</p>
                <p className={`text-xs font-bold ${theme.subtext}`}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className={`mt-2 text-sm ${theme.subtext}`}>{review.comment || "No comment added."}</p>
              <p className="mt-3 text-xs font-black text-[#C8102E]">
                {review.patientId?.fullName || review.patientId?.name || "Patient"}
              </p>
              {review.ambulanceJobId?.pickupLocation && (
                <p className={`mt-1 text-xs font-semibold ${theme.subtext}`}>
                  Pickup: {review.ambulanceJobId.pickupLocation}
                </p>
              )}
            </article>
          ))}
          {!reviews.length && (
            <div className={`${softClass} p-6 text-sm font-bold ${theme.subtext}`}>
              Ambulance ride reviews will appear here after patients submit feedback.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AmbulanceReviews;
