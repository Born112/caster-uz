import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Link from "next/link";
import { notFound } from "next/navigation";

const gameMap = {
  cs: { name: "CS 1.6", fullName: "Counter-Strike 1.6", emoji: "🎯", color: "#FF6B35", dbValue: "CS 1.6" },
  dota: { name: "Dota", fullName: "Dota Allstars", emoji: "⚔️", color: "#00D9FF", dbValue: "Dota Allstars" },
};

const statusConfig = {
  upcoming: { label: "🟢 Kelajakdagi", color: "#00E676" },
  live: { label: "🔴 LIVE", color: "#FF3D71" },
  completed: { label: "⚫ Tugagan", color: "#8B92A8" },
  cancelled: { label: "❌ Bekor", color: "#FF6B35" },
};

type Params = Promise<{ game: string; id: string }>;

function formatPrize(amount: number) {
  if (amount >= 1000000) return (amount / 1000000).toFixed(0) + "M";
  if (amount >= 1000) return (amount / 1000).toFixed(0) + "K";
  return amount.toLocaleString();
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function TournamentProfilePage({ params }: { params: Params }) {
  const { game, id } = await params;

  if (game !== "cs" && game !== "dota") notFound();

  const gameInfo = gameMap[game as "cs" | "dota"];

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !tournament) notFound();
  if (tournament.game !== gameInfo.dbValue) notFound();

  // Rosterlar (jamoalar + o'yinchilar)
  const { data: rosters } = await supabase
    .from("tournament_rosters")
    .select(`
      id, seed, status,
      teams(id, name, short_name, game, rating),
      tournament_roster_players(
        id, role, position,
        players(id, nickname, real_name, is_verified, cs_rating, dota_rating)
      )
    `)
    .eq("tournament_id", id);

  const status = statusConfig[tournament.status as keyof typeof statusConfig];
  const sortedRosters = (rosters || []).sort((a, b) => (a.seed || 999) - (b.seed || 999));

  return (
    <main className="min-h-screen bg-[#0A0E1A] text-white">
      <Header />

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-2 text-sm text-[#8B92A8] mb-4 mt-4">
          <Link href="/" className="hover:text-white transition-colors">Bosh sahifa</Link>
          <span>/</span>
          <span style={{ color: gameInfo.color }}>{gameInfo.name}</span>
          <span>/</span>
          <Link href={"/" + game + "/tournaments"} className="hover:text-white transition-colors">Turnirlar</Link>
          <span>/</span>
          <span className="text-white">{tournament.name}</span>
        </div>

        {/* HERO QISMI */}
        <div className="bg-gradient-to-br from-[#131929] to-[#0A0E1A] border rounded-2xl p-6 md:p-8 mb-6"
          style={{
            borderColor: tournament.status === "live" ? "rgba(255,61,113,0.3)" : "rgba(255,255,255,0.1)",
          }}>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span
              className="text-xs font-bold px-3 py-1 rounded inline-flex items-center gap-1"
              style={{ backgroundColor: status.color + "20", color: status.color }}
            >
              {tournament.status === "live" && (
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
              )}
              {status.label}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded"
              style={{ backgroundColor: gameInfo.color + "20", color: gameInfo.color }}>
              {gameInfo.emoji} {gameInfo.name}
            </span>
            {tournament.match_format && (
              <span className="text-xs font-bold px-3 py-1 rounded bg-white/5 text-white">
                Format: {tournament.match_format}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-3">{tournament.name}</h1>

          {tournament.description && (
            <p className="text-[#8B92A8] mb-4">{tournament.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-[#8B92A8] mb-1">📅 Sana</div>
              <div className="font-medium text-sm">{formatDate(tournament.start_date)}</div>
              {tournament.end_date && (
                <div className="text-xs text-[#8B92A8]">— {formatDate(tournament.end_date)}</div>
              )}
            </div>
            <div>
              <div className="text-xs text-[#8B92A8] mb-1">📍 Joy</div>
              <div className="font-medium text-sm">
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
              <div className="font-medium text-sm">
                {tournament.teams_count}{tournament.max_teams ? "/" + tournament.max_teams : ""}
              </div>
            </div>
          </div>

          {tournament.organizer && (
            <div className="mt-4 text-xs text-[#8B92A8]">
              🎭 Tashkilotchi: <span className="text-white font-medium">{tournament.organizer}</span>
            </div>
          )}

          {tournament.status === "live" && tournament.stream_url && (
            <a
              href={tournament.stream_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2 rounded-md transition-colors"
            >
              <span>📺</span> Jonli efirni tomosha qilish
            </a>
          )}
        </div>

        {/* G'OLIBLAR (agar tugagan bo'lsa) */}
        {tournament.status === "completed" && tournament.winner && (
          <div className="bg-[#131929] border border-yellow-500/30 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>🏆</span> G&apos;oliblar
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {tournament.winner && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-1">🥇</div>
                  <div className="text-xs text-[#8B92A8] mb-1">1-o&apos;rin</div>
                  <div className="font-bold text-yellow-300">{tournament.winner}</div>
                </div>
              )}
              {tournament.runner_up && (
                <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-1">🥈</div>
                  <div className="text-xs text-[#8B92A8] mb-1">2-o&apos;rin</div>
                  <div className="font-bold text-gray-300">{tournament.runner_up}</div>
                </div>
              )}
              {tournament.third_place && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-1">🥉</div>
                  <div className="text-xs text-[#8B92A8] mb-1">3-o&apos;rin</div>
                  <div className="font-bold text-orange-300">{tournament.third_place}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ISHTIROKCHI JAMOALAR */}
        <div className="bg-[#131929] border border-white/10 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>👥</span> Ishtirokchilar
            <span className="text-sm font-normal text-[#8B92A8]">
              ({sortedRosters.length} ta jamoa)
            </span>
          </h2>

          {sortedRosters.length === 0 ? (
            <div className="text-center py-12 text-[#8B92A8]">
              <div className="text-5xl mb-3">👥</div>
              <p>Hozircha ishtirokchilar e&apos;lon qilinmagan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedRosters.map((roster) => {
                const teams = roster.teams;
                const teamData = Array.isArray(teams) ? teams[0] : teams;
                if (!teamData) return null;

                const mainPlayers = roster.tournament_roster_players.filter((p) => p.role === "main");
                const subs = roster.tournament_roster_players.filter((p) => p.role === "substitute");
                const coaches = roster.tournament_roster_players.filter((p) => p.role === "coach" || p.role === "analyst");

                return (
                  <div
                    key={roster.id}
                    className="bg-[#0A0E1A] border rounded-lg overflow-hidden"
                    style={{
                      borderColor: gameInfo.color + "30",
                    }}
                  >
                    {/* Jamoa header */}
                    <Link
                      href={"/" + game + "/teams/" + teamData.id}
                      className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
                    >
                      {roster.seed && (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                          style={{
                            backgroundColor: gameInfo.color + "20",
                            color: gameInfo.color,
                          }}
                        >
                          #{roster.seed}
                        </div>
                      )}

                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
                        style={{
                          backgroundColor: gameInfo.color + "20",
                          color: gameInfo.color,
                          border: "2px solid " + gameInfo.color + "40",
                        }}
                      >
                        {teamData.short_name || teamData.name.substring(0, 2).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-lg">{teamData.name}</div>
                        <div className="text-xs text-[#8B92A8]">
                          ⭐ {teamData.rating?.toFixed(1) || "0.0"} reyting
                        </div>
                      </div>

                      <div className="text-xs text-[#8B92A8] text-right hidden md:block">
                        {mainPlayers.length} asosiy
                        {subs.length > 0 && " · " + subs.length + " stand-in"}
                      </div>
                    </Link>

                    {/* O'yinchilar */}
                    <div className="border-t border-white/5 p-4 space-y-3">
                      {mainPlayers.length > 0 && (
                        <div>
                          <div className="text-xs text-green-400 mb-2 font-medium flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            Asosiy o&apos;yinchilar
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {mainPlayers.map((rp) => {
                              const players = rp.players;
                              const playerData = Array.isArray(players) ? players[0] : players;
                              if (!playerData) return null;
                              const playerRating = game === "cs" ? playerData.cs_rating : playerData.dota_rating;

                              return (
                                <Link
                                  key={rp.id}
                                  href={"/" + game + "/players/" + playerData.id}
                                  className="flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded transition-colors"
                                >
                                  <div
                                    className="w-8 h-8 rounded-full bg-[#0A0E1A] border flex items-center justify-center font-bold text-xs shrink-0"
                                    style={{ borderColor: gameInfo.color, color: gameInfo.color }}
                                  >
                                    {playerData.nickname.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                      <span className="font-bold text-sm truncate">{playerData.nickname}</span>
                                      {playerData.is_verified && (
                                        <span className="text-green-400 text-xs">✓</span>
                                      )}
                                    </div>
                                    {rp.position && (
                                      <div className="text-xs text-[#8B92A8]">{rp.position}</div>
                                    )}
                                  </div>
                                  <div className="text-xs font-bold shrink-0" style={{ color: gameInfo.color }}>
                                    ⭐{playerRating}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {subs.length > 0 && (
                        <div>
                          <div className="text-xs text-yellow-400 mb-2 font-medium flex items-center gap-1">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                            Stand-in (zaxira)
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {subs.map((rp) => {
                              const players = rp.players;
                              const playerData = Array.isArray(players) ? players[0] : players;
                              if (!playerData) return null;

                              return (
                                <Link
                                  key={rp.id}
                                  href={"/" + game + "/players/" + playerData.id}
                                  className="flex items-center gap-2 p-2 bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/20 rounded transition-colors"
                                >
                                  <div className="w-8 h-8 rounded-full bg-[#0A0E1A] border border-yellow-500/40 flex items-center justify-center font-bold text-xs shrink-0 text-yellow-300">
                                    {playerData.nickname.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{playerData.nickname}</div>
                                    {rp.position && (
                                      <div className="text-xs text-[#8B92A8]">{rp.position}</div>
                                    )}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {coaches.length > 0 && (
                        <div>
                          <div className="text-xs text-purple-400 mb-2 font-medium flex items-center gap-1">
                            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                            Coach / Analitik
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {coaches.map((rp) => {
                              const players = rp.players;
                              const playerData = Array.isArray(players) ? players[0] : players;
                              if (!playerData) return null;

                              return (
                                <Link
                                  key={rp.id}
                                  href={"/" + game + "/players/" + playerData.id}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs rounded transition-colors"
                                >
                                  {rp.role === "coach" ? "👨‍🏫" : "📊"}
                                  <span>{playerData.nickname}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
