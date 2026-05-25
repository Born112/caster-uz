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

export default async function PlayerProfilePage({ params }: { params: Params }) {
  const { game, id } = await params;

  if (game !== "cs" && game !== "dota") {
    notFound();
  }

  const gameInfo = gameMap[game as "cs" | "dota"];

  // O'yinchini barcha ma'lumotlari bilan olamiz
  const { data: player, error } = await supabase
    .from("players")
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
        teams(id, name, short_name, game, city)
      ),
      national_memberships(
        id,
        is_current,
        position,
        role,
        start_date,
        end_date,
        national_teams(id, name, region, game)
      )
    `)
    .eq("id", id)
    .single();

  if (error || !player) {
    notFound();
  }

  // O'yinchi shu o'yinda o'ynaydimi tekshiramiz
  if (!player.games?.includes(gameInfo.dbValue)) {
    notFound();
  }

  // Klub tarixi (faqat shu o'yin uchun)
  const teamMemberships = (player.team_memberships || [])
    .filter((m: { teams: { game: string } | null }) => m.teams?.game === gameInfo.dbValue)
    .sort((a: { is_current: boolean; start_date: string }, b: { is_current: boolean; start_date: string }) => {
      if (a.is_current && !b.is_current) return -1;
      if (!a.is_current && b.is_current) return 1;
      return b.start_date.localeCompare(a.start_date);
    });

  // Terma jamoa tarixi (faqat shu o'yin uchun)
  const nationalMemberships = (player.national_memberships || [])
    .filter((m: { national_teams: { game: string } | null }) => m.national_teams?.game === gameInfo.dbValue)
    .sort((a: { is_current: boolean; start_date: string }, b: { is_current: boolean; start_date: string }) => {
      if (a.is_current && !b.is_current) return -1;
      if (!a.is_current && b.is_current) return 1;
      return b.start_date.localeCompare(a.start_date);
    });

  const currentClub = teamMemberships.find((m: { is_current: boolean }) => m.is_current);
  const currentNationals = nationalMemberships.filter((m: { is_current: boolean }) => m.is_current);

  // Boshqa o'yinlar (UzKing kabi)
  const otherGames = (player.games || []).filter((g: string) => g !== gameInfo.dbValue);

  return (
    <main className="min-h-screen bg-[#0A0E1A] text-white">
      <Header />

      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-2 text-sm text-[#8B92A8] mb-4 mt-4">
          <Link href="/" className="hover:text-white transition-colors">Bosh sahifa</Link>
          <span>/</span>
          <span style={{ color: gameInfo.color }}>{gameInfo.name}</span>
          <span>/</span>
          <Link href={"/" + game + "/players"} className="hover:text-white transition-colors">O&apos;yinchilar</Link>
          <span>/</span>
          <span className="text-white">{player.nickname}</span>
        </div>

        {/* HERO QISMI */}
        <div className="bg-gradient-to-br from-[#131929] to-[#0A0E1A] border border-white/10 rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div
              className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#0A0E1A] border-4 flex items-center justify-center font-bold text-3xl md:text-4xl shrink-0"
              style={{ borderColor: gameInfo.color, color: gameInfo.color }}
            >
              {player.nickname.substring(0, 2).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{player.nickname}</h1>
                {player.is_verified && (
                  <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                    ✓ Tasdiqlangan
                  </span>
                )}
              </div>

              {player.real_name && (
                <p className="text-lg text-[#8B92A8] mb-3">{player.real_name}</p>
              )}

              <div className="flex flex-wrap gap-3 mb-4">
                {player.city && (
                  <span className="text-sm text-[#8B92A8] flex items-center gap-1">
                    <span>📍</span> {player.city}
                  </span>
                )}
                <span
                  className="text-sm font-bold px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: gameInfo.color + "20",
                    color: gameInfo.color,
                  }}
                >
                  {gameInfo.emoji} {gameInfo.name}
                </span>
              </div>

              {/* Boshqa o'yinlar */}
              {otherGames.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-[#8B92A8] mb-2">Boshqa o&apos;yinlardagi profillari:</p>
                  <div className="flex gap-2">
                    {otherGames.map((g: string) => {
                      const otherSlug = g === "CS 1.6" ? "cs" : "dota";
                      const otherInfo = gameMap[otherSlug as "cs" | "dota"];
                      return (
                        <Link
                          key={g}
                          href={"/" + otherSlug + "/players/" + player.id}
                          className="text-sm px-3 py-1 rounded-md border transition-colors hover:bg-white/5"
                          style={{
                            backgroundColor: otherInfo.color + "10",
                            borderColor: otherInfo.color + "40",
                            color: otherInfo.color,
                          }}
                        >
                          {otherInfo.emoji} {otherInfo.name} →
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Telegram */}
              {player.telegram_username && (
                <a
                  href={"https://t.me/" + player.telegram_username}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#00D9FF]/10 hover:bg-[#00D9FF]/20 border border-[#00D9FF]/30 text-[#00D9FF] text-sm font-medium px-4 py-2 rounded-md transition-colors"
                >
                  <span>📱</span>
                  <span>@{player.telegram_username}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CHAP - Asosiy ma'lumotlar */}
          <div className="md:col-span-2 space-y-6">
            {/* Hozirgi holat */}
            {(currentClub || currentNationals.length > 0) && (
              <div className="bg-[#131929] border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span style={{ color: gameInfo.color }}>●</span>
                  Hozirgi holat
                </h2>

                {currentClub && (
                  <div className="mb-4">
                    <div className="text-xs text-[#8B92A8] mb-1">🏆 Klub</div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center font-bold"
                        style={{
                          backgroundColor: gameInfo.color + "20",
                          color: gameInfo.color,
                        }}
                      >
                        {/* @ts-expect-error - teams is joined */}
                        {currentClub.teams?.short_name || currentClub.teams?.name?.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-lg" style={{ color: gameInfo.color }}>
                          {/* @ts-expect-error - teams is joined */}
                          {currentClub.teams?.name}
                        </div>
                        <div className="text-xs text-[#8B92A8]">
                          {/* @ts-expect-error - position in db */}
                          {currentClub.position && <span>{currentClub.position}</span>}
                          {/* @ts-expect-error - jersey_number in db */}
                          {currentClub.jersey_number && <span> · #{currentClub.jersey_number}</span>}
                          {/* @ts-expect-error - role in db */}
                          {currentClub.role && currentClub.role !== "main" && <span> · {currentClub.role}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentNationals.length > 0 && (
                  <div>
                    <div className="text-xs text-[#8B92A8] mb-2">🇺🇿 Terma jamoa</div>
                    <div className="space-y-2">
                      {currentNationals.map((m: { id: string; role: string; position: string | null; national_teams: { name: string; region: string } | null }) => (
                        <div key={m.id} className="flex items-center gap-2">
                          <span className="text-2xl">{m.national_teams?.region === "national" ? "🇺🇿" : "🏙️"}</span>
                          <div>
                            <div className="font-medium flex items-center gap-1">
                              {m.national_teams?.name}
                              {m.role === "captain" && <span title="Kapitan">👑</span>}
                            </div>
                            <div className="text-xs text-[#8B92A8]">
                              {m.position && <span>{m.position}</span>}
                              {m.role !== "main" && m.role !== "captain" && <span> · {m.role}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bio */}
            {player.bio && (
              <div className="bg-[#131929] border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span style={{ color: gameInfo.color }}>●</span>
                  Tavsif
                </h2>
                <p className="text-gray-300 leading-relaxed">{player.bio}</p>
              </div>
            )}

            {/* Klub tarixi */}
            {teamMemberships.length > 0 && (
              <div className="bg-[#131929] border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span style={{ color: gameInfo.color }}>●</span>
                  🏆 Klub tarixi
                </h2>
                <div className="space-y-3">
                  {teamMemberships.map((m: { id: string; is_current: boolean; position: string | null; jersey_number: number | null; role: string; start_date: string; end_date: string | null; teams: { name: string; short_name: string | null } | null }) => (
                    <div
                      key={m.id}
                      className="rounded-md p-3 border"
                      style={{
                        backgroundColor: m.is_current ? gameInfo.color + "10" : "rgba(255,255,255,0.02)",
                        borderColor: m.is_current ? gameInfo.color + "40" : "rgba(255,255,255,0.05)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                        <div className="flex items-center gap-2">
                          {m.is_current && (
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded"
                              style={{ backgroundColor: gameInfo.color, color: "#0A0E1A" }}
                            >
                              HOZIRGI
                            </span>
                          )}
                          <span className="font-bold">{m.teams?.name}</span>
                          {m.teams?.short_name && (
                            <span className="text-xs text-[#8B92A8]">({m.teams.short_name})</span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-[#8B92A8] mb-1">
                        {m.position && <span>{m.position}</span>}
                        {m.jersey_number && <span> · #{m.jersey_number}</span>}
                        {m.role !== "main" && <span> · {m.role}</span>}
                      </div>
                      <div className="text-xs text-[#8B92A8]">
                        📅 {formatDate(m.start_date)}
                        {m.end_date ? " — " + formatDate(m.end_date) : " — hozirgacha"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terma jamoa tarixi */}
            {nationalMemberships.length > 0 && (
              <div className="bg-[#131929] border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span style={{ color: gameInfo.color }}>●</span>
                  🇺🇿 Terma jamoa tarixi
                </h2>
                <div className="space-y-3">
                  {nationalMemberships.map((m: { id: string; is_current: boolean; position: string | null; role: string; start_date: string; end_date: string | null; national_teams: { name: string; region: string } | null }) => (
                    <div
                      key={m.id}
                      className="rounded-md p-3 border"
                      style={{
                        backgroundColor: m.is_current ? "rgba(0,217,255,0.1)" : "rgba(255,255,255,0.02)",
                        borderColor: m.is_current ? "rgba(0,217,255,0.4)" : "rgba(255,255,255,0.05)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                        <div className="flex items-center gap-2">
                          {m.is_current && (
                            <span className="bg-[#00D9FF] text-[#0A0E1A] text-xs font-bold px-2 py-0.5 rounded">
                              HOZIRGI
                            </span>
                          )}
                          <span>{m.national_teams?.region === "national" ? "🇺🇿" : "🏙️"}</span>
                          <span className="font-bold">{m.national_teams?.name}</span>
                          {m.role === "captain" && <span title="Kapitan">👑</span>}
                        </div>
                      </div>
                      <div className="text-xs text-[#8B92A8] mb-1">
                        {m.position && <span>{m.position}</span>}
                        {m.role !== "main" && <span> · {m.role === "captain" ? "Kapitan" : m.role}</span>}
                      </div>
                      <div className="text-xs text-[#8B92A8]">
                        📅 {formatDate(m.start_date)}
                        {m.end_date ? " — " + formatDate(m.end_date) : " — hozirgacha"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* O'NG - Statistika */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-[#131929] border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span style={{ color: gameInfo.color }}>●</span>
                📊 Tezkor ma&apos;lumot
              </h2>

              <div className="space-y-3 text-sm">
                {currentClub && (
                  <>
                    <div>
                      <div className="text-xs text-[#8B92A8]">Hozirgi klub</div>
                      <div className="font-medium" style={{ color: gameInfo.color }}>
                        {/* @ts-expect-error - teams is joined */}
                        {currentClub.teams?.name}
                      </div>
                    </div>

                    {/* @ts-expect-error - position is in db */}
                    {currentClub.position && (
                      <div>
                        <div className="text-xs text-[#8B92A8]">Pozitsiya</div>
                        {/* @ts-expect-error - position is in db */}
                        <div className="font-medium">{currentClub.position}</div>
                      </div>
                    )}

                    {/* @ts-expect-error - jersey_number is in db */}
                    {currentClub.jersey_number && (
                      <div>
                        <div className="text-xs text-[#8B92A8]">Raqam</div>
                        {/* @ts-expect-error - jersey_number is in db */}
                        <div className="font-medium">#{currentClub.jersey_number}</div>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <div className="text-xs text-[#8B92A8]">Klub tarixi</div>
                  <div className="font-medium">{teamMemberships.length} ta jamoa</div>
                </div>

                {nationalMemberships.length > 0 && (
                  <div>
                    <div className="text-xs text-[#8B92A8]">Terma jamoa</div>
                    <div className="font-medium">{nationalMemberships.length} ta</div>
                  </div>
                )}

                <div>
                  <div className="text-xs text-[#8B92A8]">Holat</div>
                  <div className="font-medium">
                    {player.is_verified ? (
                      <span className="text-green-400">✓ Tasdiqlangan</span>
                    ) : (
                      <span className="text-yellow-400">Kutilmoqda</span>
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
