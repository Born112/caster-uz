import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Link from "next/link";
import { notFound } from "next/navigation";

const gameMap = {
  cs: { name: "CS 1.6", fullName: "Counter-Strike 1.6", emoji: "🎯", color: "#FF6B35", dbValue: "CS 1.6" },
  dota: { name: "Dota", fullName: "Dota Allstars", emoji: "⚔️", color: "#00D9FF", dbValue: "Dota Allstars" },
};

type Params = Promise<{ game: string }>;

export default async function GameTeamsPage({ params }: { params: Params }) {
  const { game } = await params;

  if (game !== "cs" && game !== "dota") {
    notFound();
  }

  const gameInfo = gameMap[game as "cs" | "dota"];

  const { data: teams, error } = await supabase
    .from("teams")
    .select(`
      *,
      team_memberships(
        id,
        is_current,
        teams(id)
      )
    `)
    .eq("game", gameInfo.dbValue)
    .order("rating", { ascending: false });

  return (
    <main className="min-h-screen bg-[#0A0E1A] text-white">
      <Header />

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-2 text-sm text-[#8B92A8] mb-4 mt-4">
          <Link href="/" className="hover:text-white transition-colors">Bosh sahifa</Link>
          <span>/</span>
          <span style={{ color: gameInfo.color }}>{gameInfo.name}</span>
          <span>/</span>
          <span className="text-white">Jamoalar</span>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🏆</span>
            <h1 className="text-4xl font-bold">
              <span style={{ color: gameInfo.color }}>{gameInfo.fullName}</span>
              <span className="text-white"> jamoalari</span>
            </h1>
          </div>
          <p className="text-[#8B92A8]">
            {teams?.length || 0} ta jamoa · reyting bo&apos;yicha tartiblangan
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-300 mb-6">
            <div className="font-bold mb-2">⚠️ Database xato:</div>
            <div className="text-sm font-mono">{error.message}</div>
          </div>
        )}

        {!error && (!teams || teams.length === 0) && (
          <div className="bg-[#131929] rounded-xl p-12 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-2">Hozircha jamoalar yo&apos;q</h3>
            <p className="text-[#8B92A8]">Tez orada qo&apos;shamiz!</p>
          </div>
        )}

        {!error && teams && teams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team, index) => {
              const rank = index + 1;
              const winRate = team.total_matches > 0 
                ? Math.round((team.wins / team.total_matches) * 100) 
                : 0;
              
              // Hozirgi o'yinchilar soni
              const currentPlayersCount = (team.team_memberships || [])
                .filter((m: { is_current: boolean }) => m.is_current).length;

              let rankEmoji = "";
              if (rank === 1) rankEmoji = "🥇";
              else if (rank === 2) rankEmoji = "🥈";
              else if (rank === 3) rankEmoji = "🥉";

              return (
                <Link
                  key={team.id}
                  href={"/" + game + "/teams/" + team.id}
                  className="bg-[#131929] border rounded-xl p-6 transition-all hover:-translate-y-1 block relative overflow-hidden"
                  style={{
                    borderColor: rank <= 3 
                      ? gameInfo.color + "40" 
                      : "rgba(255,255,255,0.1)",
                  }}
                >
                  {/* O'rin belgisi */}
                  {rank <= 3 && (
                    <div
                      className="absolute top-0 left-0 px-3 py-1 rounded-br-xl font-bold text-sm flex items-center gap-1"
                      style={{
                        backgroundColor: gameInfo.color,
                        color: "#0A0E1A",
                      }}
                    >
                      <span>{rankEmoji}</span>
                      <span>#{rank}</span>
                    </div>
                  )}

                  {/* Faolsiz belgi */}
                  {!team.is_active && (
                    <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-red-500/20 text-red-300 text-xs font-bold">
                      Faolsiz
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4 mt-6">
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center font-bold text-xl shrink-0"
                      style={{
                        backgroundColor: gameInfo.color + "20",
                        color: gameInfo.color,
                        border: "2px solid " + gameInfo.color + "40",
                      }}
                    >
                      {team.short_name || team.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-lg truncate">{team.name}</div>
                      <div className="text-xs text-[#8B92A8] flex items-center gap-2 flex-wrap">
                        {team.city && <span>📍 {team.city}</span>}
                        {team.founded_year && <span>📅 {team.founded_year}</span>}
                      </div>
                    </div>
                  </div>

                  {team.description && (
                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                      {team.description}
                    </p>
                  )}

                  {/* Statistika */}
                  <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b border-white/5">
                    <div className="text-center">
                      <div className="text-xs text-[#8B92A8]">Matchlar</div>
                      <div className="font-bold">{team.total_matches}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-green-400">W</div>
                      <div className="font-bold text-green-300">{team.wins}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-red-400">L</div>
                      <div className="font-bold text-red-300">{team.losses}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="text-[#8B92A8]">
                      G&apos;alaba: <span className="font-bold" style={{ color: gameInfo.color }}>{winRate}%</span>
                    </div>
                    <div className="text-[#8B92A8]">
                      👥 <span className="font-bold text-white">{currentPlayersCount}</span> o&apos;yinchi
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div
                      className="inline-flex items-center gap-1 text-sm font-bold"
                      style={{ color: gameInfo.color }}
                    >
                      ⭐ {team.rating.toFixed(1)}
                    </div>
                    <div className="text-xs text-[#8B92A8]">
                      Batafsil →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
