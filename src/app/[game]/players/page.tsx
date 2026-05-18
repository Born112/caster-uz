import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Link from "next/link";
import { notFound } from "next/navigation";

const gameMap = {
  cs: {
    name: "CS 1.6",
    fullName: "Counter-Strike 1.6",
    emoji: "🎯",
    color: "#FF6B35",
    dbValue: "CS 1.6",
  },
  dota: {
    name: "Dota",
    fullName: "Dota Allstars",
    emoji: "⚔️",
    color: "#00D9FF",
    dbValue: "Dota Allstars",
  },
};

type Params = Promise<{ game: string }>;

export default async function GamePlayersPage({ params }: { params: Params }) {
  const { game } = await params;

  if (game !== "cs" && game !== "dota") {
    notFound();
  }

  const gameInfo = gameMap[game as "cs" | "dota"];

  const { data: players, error } = await supabase
    .from("players")
    .select("*")
    .contains("games", [gameInfo.dbValue])
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#0A0E1A] text-white">
      <Header />

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-2 text-sm text-[#8B92A8] mb-4 mt-4">
          <Link href="/" className="hover:text-white transition-colors">
            Bosh sahifa
          </Link>
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
              <span className="text-white"> o&apos;yinchilari</span>
            </h1>
          </div>
          <p className="text-[#8B92A8]">
            {players?.length || 0} ta o&apos;yinchi ro&apos;yxatdan o&apos;tgan
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-300 mb-6">
            Xatolik: {error.message}
          </div>
        )}

        {!error && players && players.length === 0 && (
          <div className="bg-[#131929] rounded-xl p-12 text-center">
            <div className="text-5xl mb-4">{gameInfo.emoji}</div>
            <h3 className="text-xl font-bold mb-2">
              Hozircha {gameInfo.name} o&apos;yinchilari yo&apos;q
            </h3>
            <p className="text-[#8B92A8]">
              Tez orada qo&apos;shamiz!
            </p>
          </div>
        )}

        {!error && players && players.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => {
              const telegramLink = player.telegram_username
                ? "https://t.me/" + player.telegram_username
                : null;

              return (
                <div
                  key={player.id}
                  className="bg-[#131929] border border-white/10 rounded-xl p-6 transition-all hover:-translate-y-1"
                  style={{
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-14 h-14 rounded-full bg-[#0A0E1A] border-2 flex items-center justify-center font-bold text-lg"
                      style={{
                        borderColor: gameInfo.color,
                        color: gameInfo.color,
                      }}
                    >
                      {player.nickname.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-lg">{player.nickname}</span>
                        {player.is_verified && (
                          <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-md">
                            ✓ Tasdiqlangan
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
                    <p className="text-sm text-gray-300 mb-3">{player.bio}</p>
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
                        📱 @{player.telegram_username}
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
