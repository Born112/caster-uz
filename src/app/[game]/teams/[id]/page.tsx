import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Link from "next/link";
import { notFound } from "next/navigation";

const gameMap = {
  cs: { name: "CS 1.6", fullName: "Counter-Strike 1.6", emoji: "🎯", color: "#FF6B35", dbValue: "CS 1.6" },
  dota: { name: "Dota", fullName: "Dota Allstars", emoji: "⚔️", color: "#00D9FF", dbValue: "Dota Allstars" },
};

type Params = Promise<{ game: string; id: string }>;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric" });
}

function getRankEmoji(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "";
}

export default async function TeamProfilePage({ params }: { params: Params }) {
  const { game, id } = await params;

  if (game !== "cs" && game !== "dota") notFound();

  const gameInfo = gameMap[game as "cs" | "dota"];
  const ratingColumn = game === "cs" ? "cs_rating" : "dota_rating";

  // Jamoa ma'lumotlari
  const { data: team, error } = await supabase
    .from("teams")
    .select(`
      *,
      team_memberships(
        id,
        is_current,
        position,
        jersey_number,
        role,
        start_date,
        end_date,
        players(
          id,
          nickname,
          real_name,
          is_verified,
          city,
          cs_rating,
          dota_rating
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !team) notFound();

  if (team.game !== gameInfo.dbValue) notFound();

  // Jamoaning shu o'yindagi o'rinini hisoblash
  const { data: allTeams } = await supabase
    .from("teams")
    .select("id, rating")
    .eq("game", gameInfo.dbValue)
    .order("rating", { ascending: false });

  const teamRank = (allTeams || []).findIndex((t) => t.id === id) + 1;
  const totalTeams = (allTeams || []).length;
  const teamRankEmoji = getRankEmoji(teamRank);

  // Barcha o'yinchilarni olamiz (o'rinni hisoblash uchun)
  const { data: allPlayers } = await supabase
    .from("players")
    .select("id, cs_rating, dota_rating")
    .contains("games", [gameInfo.dbValue])
    .order(ratingColumn, { ascending: false });

  // O'yinchilar uchun o'rin ma'lumotlari
  const playerRanks: Record<string, { rank: number; total: number }> = {};
  (allPlayers || []).forEach((p, idx) => {
    playerRanks[p.id] = { rank: idx + 1, total: allPlayers?.length || 0 };
  });

  const winRate = team.total_matches > 0 
    ? Math.round((team.wins / team.total_matches) * 100) 
    : 0;

  const allMemberships = team.team_memberships || [];
  
  const currentMembers = allMemberships
    .filter((m: { is_current: boolean }) => m.is_current)
    .sort((a: { role: string }, b: { role: string }) => {
      const order = { main: 1, substitute: 2, coach: 3, analyst: 4 };
      return (order[a.role as keyof typeof order] || 5) - (order[b.role as keyof typeof order] || 5);
    });

  const formerMembers = allMemberships
    .filter((m: { is_current: boolean }) => !m.is_current)
    .sort((a: { start_date: string }, b: { start_date: string }) => 
      b.start_date.localeCompare(a.start_date)
    );

  return (
    <main className="min-h-screen bg-[#0A0E1A] text-white">
      <Header />

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-2 text-sm text-[#8B92A8] mb-4 mt-4">
          <Link href="/" className="hover:text-white transition-colors">Bosh sahifa</Link>
          <span>/</span>
          <span style={{ color: gameInfo.color }}>{gameInfo.name}</span>
          <span>/</span>
          <Link href={"/" + game + "/teams"} className="hover:text-white transition-colors">Jamoalar</Link>
          <span>/</span>
          <span className="text-white">{team.name}</span>
        </div>

        {/* HERO QISMI */}
        <div className="bg-gradient-to-br from-[#131929] to-[#0A0E1A] border border-white/10 rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div
              className="w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center font-bold text-3xl md:text-4xl shrink-0"
              style={{
                backgroundColor: gameInfo.color + "20",
                color: gameInfo.color,
                border: "4px solid " + gameInfo.color + "40",
              }}
            >
              {team.short_name || team.name.substring(0, 2).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{team.name}</h1>
                {team.short_name && (
                  <span className="text-2xl text-[#8B92A8]">({team.short_name})</span>
                )}
              </div>

              {/* O'rin va reyting */}
              <div className="flex items-center gap-3 flex-wrap mb-4">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold"
                  style={{
                    backgroundColor: teamRank <= 3 ? gameInfo.color : "rgba(255,255,255,0.05)",
                    color: teamRank <= 3 ? "#0A0E1A" : "#FFFFFF",
                  }}
                >
                  {teamRankEmoji && <span className="text-xl">{teamRankEmoji}</span>}
                  <span>#{teamRank}</span>
                  <span className="text-xs opacity-70">/ {totalTeams} jamoa</span>
                </div>

                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold"
                  style={{
                    backgroundColor: gameInfo.color + "20",
                    color: gameInfo.color,
                  }}
                >
                  <span>⭐</span>
                  <span>{team.rating.toFixed(1)} reyting</span>
                </div>
              </div>

              {team.description && (
                <p className="text-[#8B92A8] mb-4">{team.description}</p>
              )}

              <div className="flex flex-wrap gap-3 mb-4">
                <span className="text-sm font-bold px-3 py-1 rounded"
                  style={{ backgroundColor: gameInfo.color + "20", color: gameInfo.color }}>
                  {gameInfo.emoji} {gameInfo.name}
                </span>

                {!team.is_active && (
                  <span className="bg-red-500/20 text-red-300 text-xs font-bold px-3 py-1 rounded">
                    Faolsiz
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-[#8B92A8] mb-4">
                {team.city && (
                  <span className="flex items-center gap-1">
                    <span>📍</span> {team.city}, {team.country}
                  </span>
                )}
                {team.founded_year && (
                  <span className="flex items-center gap-1">
                    <span>📅</span> {team.founded_year} yildan beri
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {team.website && (
                  <a href={team.website} target="_blank" rel="noopener noreferrer"
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm px-3 py-1.5 rounded-md transition-colors inline-flex items-center gap-1">
                    🌐 Veb-sayt
                  </a>
                )}
                {team.telegram_url && (
                  <a href={team.telegram_url} target="_blank" rel="noopener noreferrer"
                    className="bg-[#00D9FF]/10 hover:bg-[#00D9FF]/20 border border-[#00D9FF]/30 text-[#00D9FF] text-sm px-3 py-1.5 rounded-md transition-colors inline-flex items-center gap-1">
                    📱 Telegram
                  </a>
                )}
                {team.instagram_url && (
                  <a href={team.instagram_url} target="_blank" rel="noopener noreferrer"
                    className="bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 text-sm px-3 py-1.5 rounded-md transition-colors inline-flex items-center gap-1">
                    📷 Instagram
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Hozirgi roster */}
            <div className="bg-[#131929] border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span style={{ color: gameInfo.color }}>●</span>
                👥 Hozirgi roster
                <span className="text-sm font-normal text-[#8B92A8]">
                  ({currentMembers.length} ta o&apos;yinchi)
                </span>
              </h2>

              {currentMembers.length === 0 ? (
                <p className="text-[#8B92A8] text-sm py-4 text-center">
                  Hozircha o&apos;yinchilar yo&apos;q
                </p>
              ) : (
                <div className="space-y-2">
                  {currentMembers.map((m: { id: string; position: string | null; jersey_number: number | null; role: string; start_date: string; players: { id: string; nickname: string; real_name: string | null; is_verified: boolean; city: string | null; cs_rating: number; dota_rating: number } | null }) => {
                    if (!m.players) return null;
                    const playerRating = game === "cs" ? m.players.cs_rating : m.players.dota_rating;
                    const playerRankInfo = playerRanks[m.players.id];
                    const playerRank = playerRankInfo?.rank;
                    const playerRankEmoji = playerRank ? getRankEmoji(playerRank) : "";
                    
                    return (
                      <Link
                        key={m.id}
                        href={"/" + game + "/players/" + m.players.id}
                        className="flex items-center gap-3 p-3 bg-[#0A0E1A] hover:bg-white/5 border border-white/5 rounded-md transition-colors"
                      >
                        {/* O'rin belgisi */}
                        {playerRank && (
                          <div
                            className="w-12 text-center shrink-0"
                            style={{ color: playerRank <= 3 ? gameInfo.color : "#8B92A8" }}
                          >
                            {playerRankEmoji ? (
                              <div className="text-2xl">{playerRankEmoji}</div>
                            ) : (
                              <div className="text-sm font-bold">#{playerRank}</div>
                            )}
                          </div>
                        )}

                        <div
                          className="w-12 h-12 rounded-full bg-[#0A0E1A] border-2 flex items-center justify-center font-bold text-sm shrink-0"
                          style={{ borderColor: gameInfo.color, color: gameInfo.color }}
                        >
                          {m.players.nickname.substring(0, 2).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold">{m.players.nickname}</span>
                            {m.players.is_verified && (
                              <span className="text-green-400 text-xs">✓</span>
                            )}
                            {m.role === "coach" && (
                              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">Trener</span>
                            )}
                            {m.role === "analyst" && (
                              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">Analitik</span>
                            )}
                            {m.role === "substitute" && (
                              <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded">Zaxira</span>
                            )}
                          </div>
                          {m.players.real_name && (
                            <div className="text-xs text-[#8B92A8]">{m.players.real_name}</div>
                          )}
                          <div className="text-xs text-[#8B92A8]">
                            {m.position && <span>{m.position}</span>}
                            {m.jersey_number && <span> · #{m.jersey_number}</span>}
                            <span> · {formatDate(m.start_date)}dan</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-bold text-sm" style={{ color: gameInfo.color }}>
                            ⭐ {playerRating}
                          </div>
                          {playerRankInfo && (
                            <div className="text-xs text-[#8B92A8] mt-0.5">
                              / {playerRankInfo.total}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Eski o'yinchilar */}
            {formerMembers.length > 0 && (
              <div className="bg-[#131929] border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span style={{ color: gameInfo.color }}>●</span>
                  📜 Eski o&apos;yinchilar
                  <span className="text-sm font-normal text-[#8B92A8]">
                    ({formerMembers.length})
                  </span>
                </h2>

                <div className="space-y-2">
                  {formerMembers.map((m: { id: string; position: string | null; jersey_number: number | null; role: string; start_date: string; end_date: string | null; players: { id: string; nickname: string; real_name: string | null; is_verified: boolean } | null }) => {
                    if (!m.players) return null;
                    const playerRankInfo = playerRanks[m.players.id];
                    
                    return (
                      <Link
                        key={m.id}
                        href={"/" + game + "/players/" + m.players.id}
                        className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-md transition-colors opacity-75 hover:opacity-100"
                      >
                        <div
                          className="w-10 h-10 rounded-full bg-[#0A0E1A] border-2 border-white/20 flex items-center justify-center font-bold text-xs shrink-0 text-white/60"
                        >
                          {m.players.nickname.substring(0, 2).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{m.players.nickname}</span>
                            {m.players.is_verified && (
                              <span className="text-green-400 text-xs">✓</span>
                            )}
                            {playerRankInfo && playerRankInfo.rank <= 3 && (
                              <span className="text-xs">{getRankEmoji(playerRankInfo.rank)}</span>
                            )}
                          </div>
                          <div className="text-xs text-[#8B92A8]">
                            {m.position && <span>{m.position}</span>}
                            {m.jersey_number && <span> · #{m.jersey_number}</span>}
                          </div>
                          <div className="text-xs text-[#8B92A8]">
                            📅 {formatDate(m.start_date)}
                            {m.end_date && " — " + formatDate(m.end_date)}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* O'NG - Statistika */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-[#131929] border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span style={{ color: gameInfo.color }}>●</span>
                📊 Statistika
              </h2>

              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-xs text-[#8B92A8] mb-1">O&apos;rin</div>
                  <div className="font-bold flex items-center gap-2">
                    {teamRankEmoji && <span className="text-xl">{teamRankEmoji}</span>}
                    <span>#{teamRank} <span className="text-[#8B92A8] text-xs">/ {totalTeams}</span></span>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[#8B92A8] mb-1">Reyting</div>
                  <div className="font-bold text-2xl" style={{ color: gameInfo.color }}>
                    ⭐ {team.rating.toFixed(1)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[#8B92A8] mb-1">Jami matchlar</div>
                  <div className="font-bold text-xl">{team.total_matches}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-green-500/10 border border-green-500/20 rounded p-2 text-center">
                    <div className="text-xs text-green-400">G&apos;alaba</div>
                    <div className="font-bold text-green-300">{team.wins}</div>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded p-2 text-center">
                    <div className="text-xs text-red-400">Mag&apos;lub</div>
                    <div className="font-bold text-red-300">{team.losses}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[#8B92A8] mb-1">G&apos;alaba foizi</div>
                  <div className="bg-[#0A0E1A] rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: winRate + "%",
                        backgroundColor: gameInfo.color,
                      }}
                    />
                  </div>
                  <div className="text-right text-xs mt-1 font-bold" style={{ color: gameInfo.color }}>
                    {winRate}%
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[#8B92A8] mb-1">Hozirgi a&apos;zolar</div>
                  <div className="font-medium">{currentMembers.length} ta o&apos;yinchi</div>
                </div>

                <div>
                  <div className="text-xs text-[#8B92A8] mb-1">Holat</div>
                  <div className="font-medium">
                    {team.is_active ? (
                      <span className="text-green-400">🟢 Faol</span>
                    ) : (
                      <span className="text-red-400">🔴 Tarqalgan</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
