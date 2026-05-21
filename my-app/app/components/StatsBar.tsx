"use client";

import { BookStatusCounts } from "@/types";

interface StatsBarProps {
  stats: BookStatusCounts;
}

export default function StatsBar({ stats }: StatsBarProps) {
  const { total, reading, finished, dropped, finishedThisYear, totalPagesRead } = stats;

  return (
    <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-zinc-500">Total Books</h3>
        <p className="text-2xl font-bold text-zinc-900">{total}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-zinc-500">Currently Reading</h3>
        <p className="text-2xl font-bold text-blue-600">{reading}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-zinc-500">Finished</h3>
        <p className="text-2xl font-bold text-green-600">{finished}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-zinc-500">Dropped</h3>
        <p className="text-2xl font-bold text-zinc-500">{dropped}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-zinc-500">Finished This Year</h3>
        <p className="text-2xl font-bold text-emerald-600">{finishedThisYear}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-zinc-500">Total Pages Read</h3>
        <p className="text-2xl font-bold text-zinc-900">{totalPagesRead.toLocaleString()}</p>
      </div>
    </div>
  );
}
