export default function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 text-sm">
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}
