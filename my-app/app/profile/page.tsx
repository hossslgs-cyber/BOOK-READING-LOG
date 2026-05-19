"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) {
        router.replace("/");
        return;
      }
      setUser(u);
      setLoading(false);
    });
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-primary">
                {(user?.email ?? "?").charAt(0).toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {user?.user_metadata?.name ?? "User"}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">{user?.email}</p>
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Email</label>
              <p className="mt-1 text-zinc-900 dark:text-zinc-100">{user?.email}</p>
            </div>
            {user?.user_metadata?.name && (
              <div>
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</label>
                <p className="mt-1 text-zinc-900 dark:text-zinc-100">{user.user_metadata.name}</p>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Joined</label>
              <p className="mt-1 text-zinc-900 dark:text-zinc-100">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <a
              href="/dashboard"
              className="block w-full text-center py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
            >
              Back to Dashboard
            </a>
            <button
              onClick={handleSignOut}
              className="block w-full text-center py-2 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
