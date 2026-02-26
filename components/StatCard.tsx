interface StatCardProps {
  icon: string;
  number: number;
  title: string;
  description: string;
}

export default function StatCard({
  icon,
  number,
  title,
  description,
}: StatCardProps) {
  return (
    <div className="flex flex-col justify-start border bg-white border-zinc-200 rounded-xl p-6 mt-10 shadow-md">
      <span className="text-2xl mb-2">{icon}</span>
      <span className="text-2xl font-bold">{number}</span>
      <span className="text-md font-medium">{title}</span>
      <span className="text-sm text-zinc-500">{description}</span>
    </div>
  );
}
