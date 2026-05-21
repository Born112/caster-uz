import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "../LogoutButton";
import TeamsTable from "./TeamsTable";

export default async function AdminTeamsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/");

  const { data: teams, error } = await supabase
    .from("teams")
    .select("*, team_memberships(count)")
    .order("rating", { ascending: false });

  return (
    <main className="min-h-screen bg-[#0A0E1A] text-white">
      <header className="bg-[#131929] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-[#FF6B35] rounded-lg flex items-center justify-center group-hover:bg-[#FF8557] transition-colors">
                <span className="text-xl">🎮</span>
              </div>
              <span className="text-lg font-bold tracking-wider">CASTER.UZ</span>
            </Link>
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            <Link href="/admin" className="text-[#FF6B35] hover:text-[#FF8557] font-bold transition-colors">Admin Panel</Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#8B92A8]">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-2 text-sm text-[#8B92A8] mb-4 mt-4">
          <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
          <span>/</span>
          <span className="text-white">Jamoalar</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-[#FF6B35]">🏆</span> Jamoalarni boshqarish
            </h1>
            <p className="text-[#8B92A8]">Jami {teams?.length || 0} ta klub</p>
          </div>
          <Link
            href="/admin/teams/new"
            className="bg-[#FF6B35] hover:bg-[#FF8557] text-[#0A0E1A] font-bold px-5 py-3 rounded-md transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            <span>Yangi jamoa</span>
          </Link>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-300 mb-6">
            Xatolik: {error.message}
          </div>
        )}

        <TeamsTable teams={teams || []} />
      </div>
    </main>
  );
}
