type StarRatingProps = {
  rating: number;
  count?: number;
};

export const StarRating = ({ rating, count }: StarRatingProps) => {
  const activeStars = Math.round(rating);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index} aria-hidden>
            {index < activeStars ? "★" : "☆"}
          </span>
        ))}
      </div>
      <span className="text-xs text-zinc-500">
        {rating.toFixed(1)}
        {typeof count === "number" ? ` (${count})` : ""}
      </span>
    </div>
  );
};
