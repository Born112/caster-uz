"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteTeam } from "./actions";

type Team = {
  id: string;
  name: string;
  short_name: string | null;
  description: string | null;
  game: string;
  city: string | null;
  country: string;
  founded_year: number | null;
  is_active: boolean;
  total_matches: number;
  wins: number;
  losses: number;
  rating: number;
  team_memberships?: { count: number }[];
};

type Props = { teams: Team[] };

export default function TeamsTable({ teams }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "CS 1.6" | "Dota Allstars">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    return teams.filter((t) => {
      const matchesSearch =
        search === "" ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.short_name?.toLowerCase().includes(search.toLowerCase()) ?? false);

      const matchesFilter = filter === "all" || t.game === filter;
      return matchesSearch && matchesFilter;
    });
  }, [teams, search, filter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteTeam(deleteId);
    if (result && "error" in result) {
      alert("Xatolik: " + result.error);
      setDeleting(false);
      return;
    }
    setDeleteId(null);
    setDeleting(false);
    router.refresh();
  };

  const teamToDelete = teams.find((t) => t.id === deleteId);

  return (
    <>
      <div className="bg-[#131929] border border-white/10 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Jamoa nomi yoki qisqartmasi bo'yicha..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2 text-white placeholder-[#5A6178] outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="Hammasi" count={teams.length} />
            <FilterButton active={filter === "CS 1.6"} onClick={() => setFilter("CS 1.6")} label="🎯 CS 1.6" count={teams.filter((t) => t.game === "CS 1.6").length} color="#FF6B35" />
            <FilterButton active={filter === "Dota Allstars"} onClick={() => setFilter("Dota Allstars")} label="⚔️ Dota" count={teams.filter((t) => t.game === "Dota Allstars").length} color="#00D9FF" />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#131929] border border-white/10 rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="text-xl font-bold mb-2">Jamoalar topilmadi</h3>
          <p className="text-[#8B92A8]">Filter yoki qidiruvni o&apos;zgartiring</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((team) => {
            const isCS = team.game === "CS 1.6";
            const color = isCS ? "#FF6B35" : "#00D9FF";
            const emoji = isCS ? "🎯" : "⚔️";
            const winRate = team.total_matches > 0 ? Math.round((team.wins / team.total_matches) * 100) : 0;
            const memberCount = team.team_memberships?.[0]?.count || 0;

            return (
              <div
                key={team.id}
                className="bg-[#131929] border border-white/10 hover:border-white/20 rounded-xl p-5 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center font-bold"
                      style={{ backgroundColor: color + "20", color }}
                    >
                      {team.short_name || team.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-lg">{team.name}</div>
                      <div className="text-xs text-[#8B92A8] flex items-center gap-2">
                        <span>{emoji} {team.game}</span>
                        {!team.is_active && (
                          <span className="bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded">Faolsiz</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {team.description && (
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">{team.description}</p>
                )}

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  {team.city && (
                    <div className="text-[#8B92A8]">📍 {team.city}</div>
                  )}
                  {team.founded_year && (
                    <div className="text-[#8B92A8]">📅 {team.founded_year}</div>
                  )}
                  <div className="text-[#8B92A8]">👥 {memberCount} a&apos;zo</div>
                  <div className="text-[#8B92A8]">⭐ {team.rating.toFixed(1)}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b border-white/5">
                  <div className="text-center">
                    <div className="text-xs text-[#8B92A8]">Matchlar</div>
                    <div className="font-bold">{team.total_matches}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-green-400">G&apos;alaba</div>
                    <div className="font-bold text-green-300">{team.wins}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-red-400">Mag&apos;lubiyat</div>
                    <div className="font-bold text-red-300">{team.losses}</div>
                  </div>
                </div>

                <div className="text-xs text-[#8B92A8] mb-3">
                  G&apos;alaba foizi: <span className="font-bold" style={{ color }}>{winRate}%</span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={"/admin/teams/" + team.id + "/edit"}
                    className="flex-1 bg-[#00D9FF]/10 hover:bg-[#00D9FF]/20 border border-[#00D9FF]/30 text-[#00D9FF] text-xs px-3 py-1.5 rounded-md transition-colors text-center"
                  >
                    ✏️ Tahrirlash
                  </Link>
                  <button
                    onClick={() => setDeleteId(team.id)}
                    className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs px-3 py-1.5 rounded-md transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteId && teamToDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => !deleting && setDeleteId(null)}
        >
          <div className="bg-[#131929] border border-red-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-5xl mb-4 text-center">⚠️</div>
            <h2 className="text-xl font-bold mb-2 text-center">O&apos;chirishni tasdiqlang</h2>
            <p className="text-[#8B92A8] mb-6 text-center">
              <span className="text-white font-bold">{teamToDelete.name}</span> jamoasini o&apos;chirmoqchimisiz?
            </p>
            <p className="text-yellow-300 text-xs text-center mb-6">
              ⚠️ Diqqat! Bu jamoa bilan bog&apos;liq barcha a&apos;zoliklar ham o&apos;chiriladi
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-md transition-colors disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-md transition-colors disabled:opacity-50"
              >
                {deleting ? "O'chirilmoqda..." : "🗑️ O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterButton({ active, onClick, label, count, color = "#8B92A8" }: { active: boolean; onClick: () => void; label: string; count: number; color?: string }) {
  return (
    <button
      onClick={onClick}
      className={"px-3 py-2 text-sm rounded-md border transition-colors flex items-center gap-2 " + (active ? "border-white/30 bg-white/10 text-white" : "border-white/10 text-[#8B92A8] hover:text-white hover:border-white/20")}
      style={active ? { borderColor: color, color } : undefined}
    >
      <span>{label}</span>
      <span className="bg-white/10 text-xs px-1.5 py-0.5 rounded">{count}</span>
    </button>
  );
}
