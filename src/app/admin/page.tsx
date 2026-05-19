import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  const { count: playersCount } = await supabase
    .from("players")
    .select("*", { count: "exact", head: true });

  const { count: castersCount } = await supabase
    .from("casters")
    .select("*", { count: "exact", head: true });

  const { count: liveCastersCount } = await supabase
    .from("casters")
    .select("*", { count: "exact", head: true })
    .eq("is_live", true);

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
            <span className="text-[#FF6B35] font-bold">Admin Panel</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-[#8B92A8]">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8 mt-4">
          <h1 className="text-3xl font-bold mb-2">
            Salom, <span className="text-[#FF6B35]">Admin</span>! 👋
          </h1>
          <p className="text-[#8B92A8]">
            Caster.uz boshqaruv paneli
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#131929] border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎮</span>
              <p className="text-sm text-[#8B92A8]">O&apos;yinchilar</p>
            </div>
            <p className="text-4xl font-bold text-[#FF6B35]">{playersCount || 0}</p>
            <Link
              href="/admin/players"
              className="text-xs text-[#00D9FF] hover:underline mt-2 inline-block"
            >
              Boshqarish →
            </Link>
          </div>

          <div className="bg-[#131929] border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎙️</span>
              <p className="text-sm text-[#8B92A8]">Casterlar</p>
            </div>
            <p className="text-4xl font-bold text-[#00D9FF]">{castersCount || 0}</p>
            <Link
              href="/admin/casters"
              className="text-xs text-[#00D9FF] hover:underline mt-2 inline-block"
            >
              Boshqarish →
            </Link>
          </div>

          <div className="bg-[#131929] border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔴</span>
              <p className="text-sm text-[#8B92A8]">Hozir LIVE</p>
            </div>
            <p className="text-4xl font-bold text-red-400">{liveCastersCount || 0}</p>
            <p className="text-xs text-[#5A6178] mt-2">caster efirda</p>
          </div>

          <div className="bg-[#131929] border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏆</span>
              <p className="text-sm text-[#8B92A8]">Turnirlar</p>
            </div>
            <p className="text-4xl font-bold text-[#AFA9EC]">0</p>
            <p className="text-xs text-[#5A6178] mt-2">Tezda qo&apos;shamiz</p>
          </div>
        </div>

        <div className="bg-[#131929] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Tezkor harakatlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/players/new"
              className="bg-[#FF6B35] hover:bg-[#FF8557] text-[#0A0E1A] font-bold p-4 rounded-md transition-colors flex items-center gap-3"
            >
              <span className="text-2xl">🎮</span>
              <div>
                <div>Yangi o&apos;yinchi qo&apos;shish</div>
                <div className="text-xs font-normal opacity-80">CS yoki Dota uchun</div>
              </div>
            </Link>
            <Link
              href="/admin/casters/new"
              className="bg-[#00D9FF] hover:bg-[#33E0FF] text-[#0A0E1A] font-bold p-4 rounded-md transition-colors flex items-center gap-3"
            >
              <span className="text-2xl">🎙️</span>
              <div>
                <div>Yangi caster qo&apos;shish</div>
                <div className="text-xs font-normal opacity-80">Stream linklar bilan</div>
              </div>
            </Link>
            <Link
              href="/admin/players"
              className="bg-[#131929] border border-white/10 hover:border-[#FF6B35]/50 text-white p-4 rounded-md transition-colors flex items-center gap-3"
            >
              <span className="text-2xl">📋</span>
              <div>
                <div>O&apos;yinchilarni boshqarish</div>
                <div className="text-xs text-[#8B92A8]">Tahrirlash, o&apos;chirish</div>
              </div>
            </Link>
            <Link
              href="/admin/casters"
              className="bg-[#131929] border border-white/10 hover:border-[#00D9FF]/50 text-white p-4 rounded-md transition-colors flex items-center gap-3"
            >
              <span className="text-2xl">📺</span>
              <div>
                <div>Casterlarni boshqarish</div>
                <div className="text-xs text-[#8B92A8]">Stream, statistika</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
