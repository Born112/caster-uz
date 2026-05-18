"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-sm px-4 py-2 rounded-md transition-colors"
    >
      Chiqish
    </button>
  );
}
