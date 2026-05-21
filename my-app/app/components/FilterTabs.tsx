"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface FilterTabsProps {
  onFilterChange: (status: "ALL" | "READING" | "FINISHED" | "DROPPED") => void;
}

export default function FilterTabs({ onFilterChange }: FilterTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<"ALL" | "READING" | "FINISHED" | "DROPPED">(
    (searchParams.get("status") as any) ?? "ALL"
  );

  const handleTabClick = (tab: "ALL" | "READING" | "FINISHED" | "DROPPED") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    if (tab === "ALL") {
      params.delete("status");
    } else {
      params.set("status", tab);
    }
    router.push(`${pathname}?${params.toString()}`);
    onFilterChange(tab);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => handleTabClick("ALL")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
          activeTab === "ALL"
            ? "bg-primary text-primary-foreground"
            : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        All
      </button>
      <button
        onClick={() => handleTabClick("READING")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
          activeTab === "READING"
            ? "bg-primary text-primary-foreground"
            : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        Reading
      </button>
      <button
        onClick={() => handleTabClick("FINISHED")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
          activeTab === "FINISHED"
            ? "bg-primary text-primary-foreground"
            : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        Finished
      </button>
      <button
        onClick={() => handleTabClick("DROPPED")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
          activeTab === "DROPPED"
            ? "bg-primary text-primary-foreground"
            : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        Dropped
      </button>
    </div>
  );
}