import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Link from "next/link";
import { notFound } from "next/navigation";

const gameMap = {
  cs: { name: "CS 1.6", fullName: "Counter-Strike 1.6", emoji: "🎯", color: "#FF6B35", dbValue: "CS 1.6" },
  dota: { name: "Dota", fullName: "Dota Allstars", emoji: "⚔️", color: "#00D9FF", dbValue: "Dota Allstars" },
};

type Params = Promise<{ game: string }>;

const statusConfig = {
  upcoming: { label: "🟢 Kelajakdagi", color: "#00E676" },
  live: { label: "🔴 LIVE", color: "#FF3D71" },
  completed: { label: "⚫ Tugagan", color: "#8B92A8" },
  cancelled: { label: "❌ Bekor", color: "#FF6B35" },
};

function formatPrize(amount: number) {
  if (amount >= 1000000) return (amount / 1000000).toFixed(0) + "M";
  if (amount >= 1000) return (amount / 1000).toFixed(0) + "K";
  return amount.toLocaleString();
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function GameTournamentsPage({ params }: { params: Params }) {
  const { game } = await params;
  if (game !== "cs" && game !== "dota") notFound();

  const gameInfo = gameMap[game as "cs" | "dota"];

  const { data: tournaments, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("game", gameInfo.dbValue)
    .order("start_date", { ascending: false });

  const liveCount = tournaments?.filter((t) => t.status === "live").length || 0;

  return (
    <main className="min-h-screen bg-[#0A0E1A] text-white">
      <Header />

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-2 text-sm text-[#8B92A8] mb-4 mt-4">
          <Link href="/" className="hover:text-white transition-colors">Bosh sahifa</Link>
          <span>/</span>
          <span style={{ color: gameInfo.color }}>{gameInfo.name}</span>
          <span>/</span>
          <span className="text-white">Turnirlar</span>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🏆</span>
            <h1 className="text-4xl font-bold">
              <span style={{ color: gameInfo.color }}>{gameInfo.fullName}</span>
              <span className="text-white"> turnirlari</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-[#8B92A8]">{tournaments?.length || 0} ta turnir</p>
            {liveCount > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-300 text-xs font-bold px-3 py-1 rounded-md">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                {liveCount} ta LIVE
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-300 mb-6">
            Xatolik: {error.message}
          </div>
        )}

        {!error && tournaments && tournaments.length === 0 && (
          <div className="bg-[#131929] rounded-xl p-12 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-2">Hozircha turnirlar yo&apos;q</h3>
            <p className="text-[#8B92A8]">Tez orada qo&apos;shamiz!</p>
          </div>
        )}

        {!error && tournaments && tournaments.length > 0 && (
          <div className="space-y-4">
            {tournaments.map((tournament) => {
              const status = statusConfig[tournament.status as keyof typeof statusConfig];
              return (
                <div
                  key={tournament.id}
                  className="bg-[#131929] border rounded-xl p-6 transition-all hover:-translate-y-1"
                  style={{
                    borderColor: tournament.status === "live" ? "rgba(255,61,113,0.3)" : "rgba(255,255,255,0.1)",
                  }}
                >
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span
                          className="text-xs font-bold px-2 py-1 rounded-md inline-flex items-center gap-1"
                          style={{ backgroundColor: status.color + "20", color: status.color }}
                        >
                          {tournament.status === "live" && (
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                          )}
                          {status.label}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold mb-2">{tournament.name}</h3>

                      {tournament.description && (
                        <p className="text-sm text-gray-300 mb-4">{tournament.description}</p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <div className="text-xs text-[#8B92A8] mb-1">📅 Sana</div>
                          <div className="font-medium">{formatDate(tournament.start_date)}</div>
                          {tournament.end_date && (
                            <div className="text-xs text-[#8B92A8]">— {formatDate(tournament.end_date)}</div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-[#8B92A8] mb-1">📍 Joy</div>
                          <div className="font-medium">
                            {tournament.is_online ? "🌐 Onlayn" : (tournament.location || "—")}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-[#8B92A8] mb-1">💰 Prize fund</div>
                          <div className="font-bold" style={{ color: gameInfo.color }}>
                            {formatPrize(tournament.prize_fund)} so&apos;m
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-[#8B92A8] mb-1">👥 Jamoalar</div>
                          <div className="font-medium">
                            {tournament.teams_count}{tournament.max_teams ? "/" + tournament.max_teams : ""}
                          </div>
                        </div>
                      </div>

                      {tournament.organizer && (
                        <div className="mt-3 text-xs text-[#8B92A8]">
                          🎭 Tashkilotchi: <span className="text-white font-medium">{tournament.organizer}</span>
                        </div>
                      )}

                      {tournament.status === "completed" && tournament.winner && (
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          {tournament.winner && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-2 text-center">
                              <div className="text-xs text-[#8B92A8]">🥇 1-o&apos;rin</div>
                              <div className="font-bold text-yellow-300 text-sm">{tournament.winner}</div>
                            </div>
                          )}
                          {tournament.runner_up && (
                            <div className="bg-gray-500/10 border border-gray-500/30 rounded-md p-2 text-center">
                              <div className="text-xs text-[#8B92A8]">🥈 2-o&apos;rin</div>
                              <div className="font-bold text-gray-300 text-sm">{tournament.runner_up}</div>
                            </div>
                          )}
                          {tournament.third_place && (
                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-md p-2 text-center">
                              <div className="text-xs text-[#8B92A8]">🥉 3-o&apos;rin</div>
                              <div className="font-bold text-orange-300 text-sm">{tournament.third_place}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {tournament.status === "live" && tournament.stream_url && (
                      <a
                        href={tournament.stream_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-3 rounded-md transition-colors flex items-center gap-2 shrink-0"
                      >
                        <span>📺</span>
                        <span>Tomosha</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
