import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Link from "next/link";
import { notFound } from "next/navigation";

const gameMap = {
  cs: { name: "CS 1.6", fullName: "Counter-Strike 1.6", emoji: "🎯", color: "#FF6B35", dbValue: "CS 1.6" },
  dota: { name: "Dota", fullName: "Dota Allstars", emoji: "⚔️", color: "#00D9FF", dbValue: "Dota Allstars" },
};

type Params = Promise<{ game: string }>;

function getRankBadge(rank: number) {
  if (rank === 1) return { emoji: "🥇", label: "#1", color: "#FFD700" };
  if (rank === 2) return { emoji: "🥈", label: "#2", color: "#C0C0C0" };
  if (rank === 3) return { emoji: "🥉", label: "#3", color: "#CD7F32" };
  return { emoji: "", label: "#" + rank, color: "#8B92A8" };
}

export default async function GamePlayersPage({ params }: { params: Params }) {
  const { game } = await params;

  if (game !== "cs" && game !== "dota") {
    notFound();
  }

  const gameInfo = gameMap[game as "cs" | "dota"];
  const ratingColumn = game === "cs" ? "cs_rating" : "dota_rating";

  const { data: players, error } = await supabase
    .from("players")
    .select(`
      *,
      team_memberships(
        id,
        is_current,
        position,
        jersey_number,
        teams(id, name, short_name, game)
      ),
      national_memberships(
        id,
        is_current,
        role,
        national_teams(id, name, region, game)
      )
    `)
    .contains("games", [gameInfo.dbValue])
    .order(ratingColumn, { ascending: false });

  return (
    <main className="min-h-screen bg-[#0A0E1A] text-white">
      <Header />

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-2 text-sm text-[#8B92A8] mb-4 mt-4">
          <Link href="/" className="hover:text-white transition-colors">Bosh sahifa</Link>
          <span>/</span>
          <span style={{ color: gameInfo.color }}>{gameInfo.name}</span>
          <span>/</span>
          <span className="text-white">O&apos;yinchilar</span>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{gameInfo.emoji}</span>
            <h1 className="text-4xl font-bold">
              <span style={{ color: gameInfo.color }}>{gameInfo.fullName}</span>
              <span className="text-white"> reyting</span>
            </h1>
          </div>
          <p className="text-[#8B92A8]">
            {players?.length || 0} ta o&apos;yinchi · reyting bo&apos;yicha tartiblangan
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-300 mb-6">
            <div className="font-bold mb-2">⚠️ Database xato:</div>
            <div className="text-sm font-mono">{error.message}</div>
            <div className="text-xs mt-2 opacity-70">
              Bu xatoni Claude'ga yuboring
            </div>
          </div>
        )}

        {!error && (!players || players.length === 0) && (
          <div className="bg-[#131929] rounded-xl p-12 text-center">
            <div className="text-5xl mb-4">{gameInfo.emoji}</div>
            <h3 className="text-xl font-bold mb-2">
              Hozircha {gameInfo.name} o&apos;yinchilari yo&apos;q
            </h3>
            <p className="text-[#8B92A8]">Database&apos;da o&apos;yinchi topilmadi yoki ulanish muammosi</p>
          </div>
        )}

        {!error && players && players.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player, index) => {
              const rank = index + 1;
              const badge = getRankBadge(rank);
              const rating = (player[ratingColumn] as number) || 0;

              const currentClubs = (player.team_memberships || [])
                .filter((m: { is_current: boolean; teams: { game: string } | null }) => m.is_current && m.teams?.game === gameInfo.dbValue);

              const currentNationals = (player.national_memberships || [])
                .filter((m: { is_current: boolean; national_teams: { game: string } | null }) => m.is_current && m.national_teams?.game === gameInfo.dbValue);

              return (
                <Link
                  key={player.id}
                  href={"/" + game + "/players/" + player.id}
                  className="bg-[#131929] border rounded-xl p-6 transition-all hover:-translate-y-1 block relative overflow-hidden"
                  style={{
                    borderColor: rank <= 3 ? badge.color + "40" : "rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    className="absolute top-0 left-0 px-3 py-1 rounded-br-xl font-bold text-sm flex items-center gap-1"
                    style={{
                      backgroundColor: rank <= 3 ? badge.color : "rgba(255,255,255,0.05)",
                      color: rank <= 3 ? "#0A0E1A" : "#8B92A8",
                    }}
                  >
                    {badge.emoji && <span>{badge.emoji}</span>}
                    <span>{badge.label}</span>
                  </div>

                  <div
                    className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl font-bold text-sm flex items-center gap-1"
                    style={{
                      backgroundColor: gameInfo.color + "20",
                      color: gameInfo.color,
                    }}
                  >
                    ⭐ {rating}
                  </div>

                  <div className="flex items-center gap-3 mb-4 mt-6">
                    <div
                      className="w-14 h-14 rounded-full bg-[#0A0E1A] border-2 flex items-center justify-center font-bold text-lg"
                      style={{ borderColor: gameInfo.color, color: gameInfo.color }}
                    >
                      {player.nickname.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-lg">{player.nickname}</span>
                        {player.is_verified && (
                          <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-md">
                            ✓
                          </span>
                        )}
                      </div>
                      {player.real_name && (
                        <p className="text-xs text-[#8B92A8] mt-1">{player.real_name}</p>
                      )}
                    </div>
                  </div>

                  {currentClubs.length > 0 && (
                    <div className="mb-3 pb-3 border-b border-white/5">
                      <div className="text-xs text-[#8B92A8] mb-1">🏆 Klub</div>
                      {currentClubs.map((m: { id: string; position: string | null; jersey_number: number | null; teams: { name: string; short_name: string | null; game: string } | null }) => (
                        <div key={m.id} className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold" style={{ color: gameInfo.color }}>
                            {m.teams?.name}
                          </span>
                          {m.position && (
                            <span className="text-xs text-[#8B92A8]">
                              {m.position}
                              {m.jersey_number && " #" + m.jersey_number}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {currentNationals.length > 0 && (
                    <div className="mb-3 pb-3 border-b border-white/5">
                      <div className="text-xs text-[#8B92A8] mb-1">🇺🇿 Terma</div>
                      {currentNationals.map((m: { id: string; role: string; national_teams: { name: string; region: string } | null }) => (
                        <div key={m.id} className="flex items-center gap-1 text-sm">
                          <span>{m.national_teams?.region === "national" ? "🇺🇿" : "🏙️"}</span>
                          <span className="text-white">{m.national_teams?.name}</span>
                          {m.role === "captain" && <span title="Kapitan">👑</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {player.city && (
                    <p className="text-sm text-[#8B92A8] mb-2 flex items-center gap-1">
                      <span>📍</span> {player.city}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
