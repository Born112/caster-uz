import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Link from "next/link";

export default async function Home() {
  const { data: players } = await supabase
    .from("players")
    .select(`
      *,
      team_memberships(
        id,
        is_current,
        position,
        teams(id, name, short_name, game)
      ),
      national_memberships(
        id,
        is_current,
        role,
        national_teams(id, name, region, game)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(6);

  const { data: casters } = await supabase
    .from("casters")
    .select("*")
    .order("rating", { ascending: false })
    .limit(4);

  const { count: totalPlayers } = await supabase
    .from("players")
    .select("*", { count: "exact", head: true });

  const { count: totalCasters } = await supabase
    .from("casters")
    .select("*", { count: "exact", head: true });

  const { count: totalTeams } = await supabase
    .from("teams")
    .select("*", { count: "exact", head: true });

  const liveCasters = casters?.filter((c) => c.is_live) || [];

  return (
    <main className="min-h-screen bg-[#0A0E1A] text-white">
      <Header />

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-12 mt-8">
          <h1 className="text-5xl font-bold mb-4">
            O&apos;zbekiston <span className="text-[#FF6B35]">Kibersport</span> Portali
          </h1>
          <p className="text-lg text-[#8B92A8]">
            Casterlar · O&apos;yinchilar · Jamoalar · Turnirlar
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatCard label="O'yinchilar" value={totalPlayers || 0} color="#FF6B35" emoji="🎮" />
          <StatCard label="Jamoalar" value={totalTeams || 0} color="#AFA9EC" emoji="🏆" />
          <StatCard label="Casterlar" value={totalCasters || 0} color="#00D9FF" emoji="🎙️" />
          <StatCard label="Hozir LIVE" value={liveCasters.length} color="#FF3D71" emoji="🔴" pulse />
        </div>

        {liveCasters.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                Hozir jonli efirda
              </h2>
              <span className="text-sm text-[#8B92A8]">
                {liveCasters.length} ta caster
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveCasters.map((caster) => {
                const primaryGame = caster.games[0];
                const isPrimaryCS = primaryGame === "CS 1.6";
                const primaryColor = isPrimaryCS ? "#FF6B35" : "#00D9FF";
                return (
                  <div
                    key={caster.id}
                    className="bg-[#131929] border border-red-500/30 rounded-xl p-5 flex items-center gap-4"
                  >
                    <div className="relative shrink-0">
                      <div
                        className="w-14 h-14 rounded-full bg-[#0A0E1A] border-2 flex items-center justify-center font-bold text-lg"
                        style={{ borderColor: primaryColor, color: primaryColor }}
                      >
                        {caster.nickname.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 border-2 border-[#131929] rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">{caster.nickname}</span>
                        {caster.is_verified && (
                          <span className="text-green-400 text-xs">✓</span>
                        )}
                      </div>
                      <div className="inline-flex items-center gap-1 bg-red-500/20 text-red-300 text-xs font-bold px-2 py-0.5 rounded-md">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                        JONLI EFIRDA
                      </div>
                    </div>
                    {caster.twitch_url && (
                      <a
                        href={caster.twitch_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold px-4 py-2 rounded-md transition-colors shrink-0"
                      >
                        📺 Tomosha
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              <span className="text-[#FF6B35]">●</span> So&apos;nggi qo&apos;shilgan o&apos;yinchilar
            </h2>
            <span className="text-sm text-[#8B92A8]">
              {totalPlayers || 0} ta o&apos;yinchi
            </span>
          </div>

          {players && players.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((player) => {
                const primaryGame = player.games?.[0] || "CS 1.6";
                const isPrimaryCS = primaryGame === "CS 1.6";
                const primaryColor = isPrimaryCS ? "#FF6B35" : "#00D9FF";
                const gameSlug = isPrimaryCS ? "cs" : "dota";

                // Hozirgi klub (primary game uchun)
                const currentClub = (player.team_memberships || [])
                  .find((m: { is_current: boolean; teams: { game: string } | null }) => m.is_current && m.teams?.game === primaryGame);

                // Hozirgi terma jamoa
                const currentNationals = (player.national_memberships || [])
                  .filter((m: { is_current: boolean; national_teams: { game: string } | null }) => m.is_current && m.national_teams?.game === primaryGame);

                return (
                  <Link
                    key={player.id}
                    href={"/" + gameSlug + "/players/" + player.id}
                    className="bg-[#131929] border border-white/10 hover:border-white/20 rounded-xl p-6 transition-all hover:-translate-y-1 block"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-14 h-14 rounded-full bg-[#0A0E1A] border-2 flex items-center justify-center font-bold text-lg"
                        style={{ borderColor: primaryColor, color: primaryColor }}
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

                    {currentClub && (
                      <div className="mb-2 text-sm">
                        <span className="text-[#8B92A8]">🏆 </span>
                        <span className="font-bold" style={{ color: primaryColor }}>
                          {/* @ts-expect-error - teams is joined */}
                          {currentClub.teams?.name}
                        </span>
                        {/* @ts-expect-error - position is in db */}
                        {currentClub.position && (
                          <span className="text-xs text-[#8B92A8] ml-1">
                            {/* @ts-expect-error - position is in db */}
                            ({currentClub.position})
                          </span>
                        )}
                      </div>
                    )}

                    {currentNationals.length > 0 && (
                      <div className="mb-2 text-xs">
                        {currentNationals.map((m: { id: string; role: string; national_teams: { name: string; region: string } | null }) => (
                          <div key={m.id} className="flex items-center gap-1">
                            <span>{m.national_teams?.region === "national" ? "🇺🇿" : "🏙️"}</span>
                            <span className="text-white">{m.national_teams?.name}</span>
                            {m.role === "captain" && <span>👑</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {player.city && (
                      <p className="text-sm text-[#8B92A8] mb-2 flex items-center gap-1">
                        <span>📍</span> {player.city}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                      <div className="flex gap-1 flex-wrap">
                        {player.games && player.games.map((g: string) => (
                          <span
                            key={g}
                            className="text-xs px-2 py-0.5 rounded-md"
                            style={{
                              backgroundColor:
                                g === "CS 1.6"
                                  ? "rgba(255,107,53,0.15)"
                                  : "rgba(0,217,255,0.15)",
                              color: g === "CS 1.6" ? "#FF6B35" : "#00D9FF",
                            }}
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <footer className="border-t border-white/10 pt-6 mt-12">
          <p className="text-xs text-[#8B92A8] text-center">
            © 2026 Caster.uz · O&apos;zbekiston Kibersport Portali · Made with ❤️ in Uzbekistan
          </p>
        </footer>
      </div>
    </main>
  );
}

function StatCard({
  label, value, color, emoji, pulse,
}: { label: string; value: number; color: string; emoji: string; pulse?: boolean; }) {
  return (
    <div className="bg-[#131929] border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{emoji}</span>
        <p className="text-xs text-[#8B92A8]">{label}</p>
      </div>
      <p
        className={"text-3xl font-bold " + (pulse && value > 0 ? "animate-pulse" : "")}
        style={{ color }}
      >
        {value}
      </p>
    </div>
  );
}
