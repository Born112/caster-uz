"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteTournament } from "./actions";

type Tournament = {
  id: string;
  name: string;
  description: string | null;
  game: string;
  status: string;
  start_date: string;
  end_date: string | null;
  location: string | null;
  is_online: boolean;
  prize_fund: number;
  teams_count: number;
  max_teams: number | null;
  organizer: string | null;
  stream_url: string | null;
  winner: string | null;
};

type Props = { tournaments: Tournament[] };

const statusConfig = {
  upcoming: { label: "🟢 Kelajakdagi", color: "#00E676", bgColor: "rgba(0,230,118,0.15)" },
  live: { label: "🔴 LIVE", color: "#FF3D71", bgColor: "rgba(255,61,113,0.15)" },
  completed: { label: "⚫ Tugagan", color: "#8B92A8", bgColor: "rgba(139,146,168,0.15)" },
  cancelled: { label: "❌ Bekor", color: "#FF6B35", bgColor: "rgba(255,107,53,0.15)" },
};

function formatPrize(amount: number) {
  if (amount >= 1000000) return (amount / 1000000).toFixed(0) + "M so'm";
  if (amount >= 1000) return (amount / 1000).toFixed(0) + "K so'm";
  return amount.toLocaleString() + " so'm";
}

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric" });
}

export default function TournamentsTable({ tournaments }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "live" | "upcoming" | "completed" | "CS 1.6" | "Dota Allstars">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    return tournaments.filter((t) => {
      const matchesSearch =
        search === "" ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.organizer?.toLowerCase().includes(search.toLowerCase()) ?? false);

      let matchesFilter = true;
      if (filter === "live") matchesFilter = t.status === "live";
      else if (filter === "upcoming") matchesFilter = t.status === "upcoming";
      else if (filter === "completed") matchesFilter = t.status === "completed";
      else if (filter === "CS 1.6") matchesFilter = t.game === "CS 1.6";
      else if (filter === "Dota Allstars") matchesFilter = t.game === "Dota Allstars";

      return matchesSearch && matchesFilter;
    });
  }, [tournaments, search, filter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteTournament(deleteId);
    if (result && "error" in result) {
      alert("Xatolik: " + result.error);
      setDeleting(false);
      return;
    }
    setDeleteId(null);
    setDeleting(false);
    router.refresh();
  };

  const tournamentToDelete = tournaments.find((t) => t.id === deleteId);

  return (
    <>
      <div className="bg-[#131929] border border-white/10 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Turnir nomi yoki tashkilotchi bo'yicha..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2 text-white placeholder-[#5A6178] outline-none transition-colors"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="Hammasi" count={tournaments.length} />
            <FilterButton active={filter === "live"} onClick={() => setFilter("live")} label="🔴 LIVE" count={tournaments.filter((t) => t.status === "live").length} color="#FF3D71" />
            <FilterButton active={filter === "upcoming"} onClick={() => setFilter("upcoming")} label="🟢 Kelajak" count={tournaments.filter((t) => t.status === "upcoming").length} color="#00E676" />
            <FilterButton active={filter === "completed"} onClick={() => setFilter("completed")} label="⚫ Tugagan" count={tournaments.filter((t) => t.status === "completed").length} />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#131929] border border-white/10 rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="text-xl font-bold mb-2">Turnirlar topilmadi</h3>
          <p className="text-[#8B92A8]">Filter yoki qidiruvni o&apos;zgartiring</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((tournament) => {
            const status = statusConfig[tournament.status as keyof typeof statusConfig] || statusConfig.upcoming;
            const isPrimaryCS = tournament.game === "CS 1.6";
            const gameColor = isPrimaryCS ? "#FF6B35" : "#00D9FF";
            const gameEmoji = isPrimaryCS ? "🎯" : "⚔️";

            return (
              <div
                key={tournament.id}
                className="bg-[#131929] border border-white/10 hover:border-white/20 rounded-xl p-5 transition-all"
              >
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <span
                        className="text-xs font-bold px-2 py-1 rounded-md"
                        style={{ backgroundColor: status.bgColor, color: status.color }}
                      >
                        {status.label}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: isPrimaryCS ? "rgba(255,107,53,0.15)" : "rgba(0,217,255,0.15)",
                          color: gameColor,
                        }}
                      >
                        {gameEmoji} {tournament.game}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{tournament.name}</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <div className="text-[#8B92A8]">📅 Sana</div>
                        <div className="font-medium">{formatDate(tournament.start_date)}</div>
                      </div>
                      <div>
                        <div className="text-[#8B92A8]">📍 Joy</div>
                        <div className="font-medium">{tournament.is_online ? "🌐 Onlayn" : (tournament.location || "—")}</div>
                      </div>
                      <div>
                        <div className="text-[#8B92A8]">💰 Prize</div>
                        <div className="font-bold text-[#FF6B35]">{formatPrize(tournament.prize_fund)}</div>
                      </div>
                      <div>
                        <div className="text-[#8B92A8]">👥 Jamoalar</div>
                        <div className="font-medium">{tournament.teams_count}{tournament.max_teams ? "/" + tournament.max_teams : ""}</div>
                      </div>
                    </div>

                    {tournament.status === "completed" && tournament.winner && (
                      <div className="mt-3 inline-flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs px-2 py-1 rounded-md">
                        🏆 G&apos;olib: <span className="font-bold">{tournament.winner}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {tournament.status === "live" && tournament.stream_url && (
                      <a
                        href={tournament.stream_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs px-3 py-1.5 rounded-md transition-colors"
                      >
                        📺 Stream
                      </a>
                    )}
                    <Link
                      href={"/admin/tournaments/" + tournament.id + "/edit"}
                      className="bg-[#00D9FF]/10 hover:bg-[#00D9FF]/20 border border-[#00D9FF]/30 text-[#00D9FF] text-xs px-3 py-1.5 rounded-md transition-colors"
                    >
                      ✏️ Tahrirlash
                    </Link>
                    <button
                      onClick={() => setDeleteId(tournament.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs px-3 py-1.5 rounded-md transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteId && tournamentToDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => !deleting && setDeleteId(null)}
        >
          <div className="bg-[#131929] border border-red-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-5xl mb-4 text-center">⚠️</div>
            <h2 className="text-xl font-bold mb-2 text-center">O&apos;chirishni tasdiqlang</h2>
            <p className="text-[#8B92A8] mb-6 text-center">
              <span className="text-white font-bold">{tournamentToDelete.name}</span> turnirini o&apos;chirmoqchimisiz?
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
