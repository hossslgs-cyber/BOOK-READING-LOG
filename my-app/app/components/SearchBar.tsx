"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { debounce } from "@/lib/utils";

interface SearchBarProps {
  onSearchChange: (searchTerm: string) => void;
  onClearFilters: () => void;
}

export default function SearchBar({ onSearchChange, onClearFilters }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") ?? "");

  useEffect(() => {
    const handler = debounce(() => {
      onSearchChange(searchTerm);
      const params = new URLSearchParams(searchParams);
      if (searchTerm) {
        params.set("search", searchTerm);
      } else {
        params.delete("search");
      }
      router.push(`${pathname}?${params.toString()}`);
    }, 300);

    handler();

    return () => {
      handler.cancel();
    };
  }, [searchTerm, pathname, searchParams, onSearchChange]);

  const handleClearFilters = () => {
    setSearchTerm("");
    onClearFilters();
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    params.delete("status");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-3 w-full">
          <input
            type="text"
            placeholder="Search by title, author, genre, or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            onClick={handleClearFilters}
            className="flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:ml-2"
          >
            Clear all filters
          </button>
        </div>
      </div>
    </div>
  );
}