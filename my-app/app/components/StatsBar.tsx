import { BookStatusCounts } from "@/types";

interface StatsBarProps {
  stats: BookStatusCounts;
}

export default function StatsBar({ stats }: StatsBarProps) {
  const { total, reading, finished, dropped } = stats;

  return (
    <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-zinc-500">Total Books</h3>
        <p className="text-2xl font-bold text-zinc-900">{total}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-zinc-500">Currently Reading</h3>
        <p className="text-2xl font-bold text-zinc-900">{reading}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-zinc-500">Finished</h3>
        <p className="text-2xl font-bold text-zinc-900">{finished}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-zinc-500">Dropped</h3>
        <p className="text-2xl font-bold text-zinc-900">{dropped}</p>
      </div>
    </div>
  );
}