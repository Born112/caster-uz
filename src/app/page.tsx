import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";

export default async function Home() {
  const { data: players, error } = await supabase
    .from("players")
    .select("*")
    .order("created_at", { ascending: false });

  const csCount = players?.filter((p) => p.games?.includes("CS 1.6")).length || 0;
  const dotaCount = players?.filter((p) => p.games?.includes("Dota Allstars")).length || 0;

  return (
    <main className="min-h-screen bg-[#0A0E1A] text-white">
      <Header />

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-12 mt-8">
          <h1 className="text-5xl font-bold mb-4">
            O&apos;zbekiston <span className="text-[#FF6B35]">Kibersport</span> Portali
          </h1>
          <p className="text-lg text-[#8B92A8]">
            Casterlar · O&apos;yinchilar · Turnirlar · Tarix
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatCard label="Jami o'yinchilar" value={players?.length || 0} color="#FF6B35" />
          <StatCard label="CS 1.6" value={csCount} color="#FF6B35" emoji="🎯" />
          <StatCard label="Dota Allstars" value={dotaCount} color="#00D9FF" emoji="⚔️" />
          <StatCard label="Casterlar" value={0} color="#AFA9EC" emoji="🎙️" />
        </div>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              <span className="text-[#FF6B35]">●</span> So&apos;nggi qo&apos;shilgan o&apos;yinchilar
            </h2>
            <span className="text-sm text-[#8B92A8]">
              {players?.length || 0} ta o&apos;yinchi
            </span>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-300">
              Xatolik: {error.message}
            </div>
          )}

          {!error && players && players.length === 0 && (
            <p className="text-[#8B92A8]">Hozircha o&apos;yinchilar yo&apos;q</p>
          )}

          {!error && players && players.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((player) => {
                const telegramLink = player.telegram_username
                  ? "https://t.me/" + player.telegram_username
                  : null;
                
                const primaryGame = player.games?.[0] || "CS 1.6";
                const isPrimaryCS = primaryGame === "CS 1.6";
                const primaryColor = isPrimaryCS ? "#FF6B35" : "#00D9FF";

                return (
                  <div
                    key={player.id}
                    className="bg-[#131929] border border-white/10 hover:border-white/20 rounded-xl p-6 transition-all hover:-translate-y-1"
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

                    {player.city && (
                      <p className="text-sm text-[#8B92A8] mb-2 flex items-center gap-1">
                        <span>📍</span> {player.city}
                      </p>
                    )}

                    {player.bio && (
                      <p className="text-sm text-gray-300 mb-3 line-clamp-2">{player.bio}</p>
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

                      {telegramLink && (
                        <a
                          href={telegramLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#00D9FF] hover:underline"
                        >
                          @{player.telegram_username}
                        </a>
                      )}
                    </div>
                  </div>
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
  label,
  value,
  color,
  emoji,
}: {
  label: string;
  value: number;
  color: string;
  emoji?: string;
}) {
  return (
    <div className="bg-[#131929] border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {emoji && <span className="text-lg">{emoji}</span>}
        <p className="text-xs text-[#8B92A8]">{label}</p>
      </div>
      <p className="text-3xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
