import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Link from "next/link";

export default async function Home() {
  // Top 5 CS o'yinchilari
  const { data: topCS } = await supabase
    .from("players")
    .select("id, nickname, real_name, is_verified, cs_rating, games, team_memberships(is_current, teams(name, game))")
    .contains("games", ["CS 1.6"])
    .order("cs_rating", { ascending: false })
    .limit(5);

  // Top 5 Dota o'yinchilari
  const { data: topDota } = await supabase
    .from("players")
    .select("id, nickname, real_name, is_verified, dota_rating, games, team_memberships(is_current, teams(name, game))")
    .contains("games", ["Dota Allstars"])
    .order("dota_rating", { ascending: false })
    .limit(5);

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
            Reyting · O&apos;yinchilar · Jamoalar · Turnirlar
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
              <span className="text-sm text-[#8B92A8]">{liveCasters.length} ta caster</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveCasters.map((caster) => {
                const primaryGame = caster.games[0];
                const isPrimaryCS = primaryGame === "CS 1.6";
                const primaryColor = isPrimaryCS ? "#FF6B35" : "#00D9FF";
                return (
                  <div key={caster.id} className="bg-[#131929] border border-red-500/30 rounded-xl p-5 flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-full bg-[#0A0E1A] border-2 flex items-center justify-center font-bold text-lg"
                        style={{ borderColor: primaryColor, color: primaryColor }}>
                        {caster.nickname.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 border-2 border-[#131929] rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">{caster.nickname}</span>
                        {caster.is_verified && <span className="text-green-400 text-xs">✓</span>}
                      </div>
                      <div className="inline-flex items-center gap-1 bg-red-500/20 text-red-300 text-xs font-bold px-2 py-0.5 rounded-md">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                        JONLI EFIRDA
                      </div>
                    </div>
                    {caster.twitch_url && (
                      <a href={caster.twitch_url} target="_blank" rel="noopener noreferrer"
                        className="bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold px-4 py-2 rounded-md transition-colors shrink-0">
                        📺 Tomosha
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <TopPlayers 
            title="🎯 CS 1.6 Top 5"
            players={topCS || []}
            game="cs"
            color="#FF6B35"
            ratingKey="cs_rating"
          />
          <TopPlayers 
            title="⚔️ Dota Top 5"
            players={topDota || []}
            game="dota"
            color="#00D9FF"
            ratingKey="dota_rating"
          />
        </div>

        <footer className="border-t border-white/10 pt-6 mt-12">
          <p className="text-xs text-[#8B92A8] text-center">
            © 2026 Caster.uz · O&apos;zbekiston Kibersport Portali · Made with ❤️ in Uzbekistan
          </p>
        </footer>
      </div>
    </main>
  );
}

function TopPlayers({ 
  title, players, game, color, ratingKey 
}: { 
  title: string; 
  players: { id: string; nickname: string; real_name: string | null; is_verified: boolean; cs_rating?: number; dota_rating?: number; team_memberships?: { is_current: boolean; teams: { name: string; game: string } | null }[] }[]; 
  game: string; 
  color: string;
  ratingKey: "cs_rating" | "dota_rating";
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <Link href={"/" + game + "/players"} className="text-xs text-[#8B92A8] hover:text-white transition-colors">
          Hammasi →
        </Link>
      </div>

      {players.length === 0 ? (
        <div className="bg-[#131929] border border-white/10 rounded-xl p-8 text-center text-[#8B92A8] text-sm">
          Hozircha o&apos;yinchi yo&apos;q
        </div>
      ) : (
        <div className="bg-[#131929] border border-white/10 rounded-xl overflow-hidden">
          {players.map((player, index) => {
            const rank = index + 1;
            const rating = player[ratingKey] || 0;
            const dbGame = game === "cs" ? "CS 1.6" : "Dota Allstars";
            const currentClub = (player.team_memberships || [])
              .find((m) => m.is_current && m.teams?.game === dbGame);

            let rankEmoji = "";
            if (rank === 1) rankEmoji = "🥇";
            else if (rank === 2) rankEmoji = "🥈";
            else if (rank === 3) rankEmoji = "🥉";

            return (
              <Link
                key={player.id}
                href={"/" + game + "/players/" + player.id}
                className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
              >
                <div className="w-8 text-center font-bold" style={{ color: rank <= 3 ? color : "#8B92A8" }}>
                  {rankEmoji || "#" + rank}
                </div>

                <div
                  className="w-10 h-10 rounded-full bg-[#0A0E1A] border-2 flex items-center justify-center font-bold text-sm shrink-0"
                  style={{ borderColor: color, color: color }}
                >
                  {player.nickname.substring(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold truncate">{player.nickname}</span>
                    {player.is_verified && <span className="text-green-400 text-xs">✓</span>}
                  </div>
                  {currentClub && (
                    <div className="text-xs text-[#8B92A8] truncate">
                      {currentClub.teams?.name}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-sm" style={{ color }}>⭐ {rating}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function StatCard({ label, value, color, emoji, pulse }: { label: string; value: number; color: string; emoji: string; pulse?: boolean; }) {
  return (
    <div className="bg-[#131929] border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{emoji}</span>
        <p className="text-xs text-[#8B92A8]">{label}</p>
      </div>
      <p className={"text-3xl font-bold " + (pulse && value > 0 ? "animate-pulse" : "")} style={{ color }}>
        {value}
      </p>
    </div>
  );
}
