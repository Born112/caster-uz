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

export default async function GameCastersPage({ params }: { params: Params }) {
  const { game } = await params;

  if (game !== "cs" && game !== "dota") {
    notFound();
  }

  const gameInfo = gameMap[game as "cs" | "dota"];

  const { data: casters, error } = await supabase
    .from("casters")
    .select("*")
    .contains("games", [gameInfo.dbValue])
    .order("rating", { ascending: false });

  const liveCount = casters?.filter((c) => c.is_live).length || 0;

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
          <span className="text-white">Casterlar</span>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{gameInfo.emoji}</span>
            <h1 className="text-4xl font-bold">
              <span style={{ color: gameInfo.color }}>{gameInfo.fullName}</span>
              <span className="text-white"> casterlari</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[#8B92A8]">
              {casters?.length || 0} ta caster
            </p>
            {liveCount > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-300 text-xs font-bold px-3 py-1 rounded-md">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                {liveCount} ta hozir LIVE
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-300 mb-6">
            Xatolik: {error.message}
          </div>
        )}

        {!error && casters && casters.length === 0 && (
          <div className="bg-[#131929] rounded-xl p-12 text-center">
            <div className="text-5xl mb-4">{gameInfo.emoji}</div>
            <h3 className="text-xl font-bold mb-2">
              Hozircha {gameInfo.name} casterlari yo&apos;q
            </h3>
            <p className="text-[#8B92A8]">Tez orada qo&apos;shamiz!</p>
          </div>
        )}

        {!error && casters && casters.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {casters.map((caster) => (
              <CasterCard key={caster.id} caster={caster} gameInfo={gameInfo} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function CasterCard({
  caster,
  gameInfo,
}: {
  caster: {
    id: string;
    nickname: string;
    real_name: string | null;
    city: string | null;
    bio: string | null;
    is_verified: boolean;
    is_live: boolean;
    twitch_url: string | null;
    youtube_url: string | null;
    telegram_username: string | null;
    games: string[];
    broadcasts_count: number;
    subscribers_count: number;
    rating: number;
  };
  gameInfo: { color: string };
}) {
  return (
    <div
      className="bg-[#131929] border rounded-xl p-6 transition-all hover:-translate-y-1"
      style={{
        borderColor: caster.is_live
          ? "rgba(255,61,113,0.3)"
          : "rgba(255,255,255,0.1)",
      }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="relative shrink-0">
          <div
            className="w-14 h-14 rounded-full bg-[#0A0E1A] border-2 flex items-center justify-center font-bold text-lg"
            style={{ borderColor: gameInfo.color, color: gameInfo.color }}
          >
            {caster.nickname.substring(0, 2).toUpperCase()}
          </div>
          {caster.is_live && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 border-2 border-[#131929] rounded-full animate-pulse"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-lg">{caster.nickname}</span>
            {caster.is_verified && (
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-md">
                ✓
              </span>
            )}
          </div>
          {caster.real_name && (
            <p className="text-xs text-[#8B92A8] mt-0.5">{caster.real_name}</p>
          )}
          {caster.is_live && (
            <div className="inline-flex items-center gap-1 bg-red-500/20 text-red-300 text-xs font-bold px-2 py-0.5 rounded-md mt-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
              JONLI EFIRDA
            </div>
          )}
        </div>
      </div>

      {caster.city && (
        <p className="text-sm text-[#8B92A8] mb-2 flex items-center gap-1">
          <span>📍</span> {caster.city}
        </p>
      )}

      {caster.bio && (
        <p className="text-sm text-gray-300 mb-4 line-clamp-2">{caster.bio}</p>
      )}

      <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-white/5">
        <div>
          <div className="text-xs text-[#8B92A8] mb-0.5">📡 Translyatsiya</div>
          <div className="text-sm font-bold">{caster.broadcasts_count}</div>
        </div>
        <div>
          <div className="text-xs text-[#8B92A8] mb-0.5">👥 Obunachi</div>
          <div className="text-sm font-bold">
            {caster.subscribers_count.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-xs text-[#8B92A8] mb-0.5">⭐ Reyting</div>
          <div className="text-sm font-bold" style={{ color: gameInfo.color }}>
            {caster.rating.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {caster.twitch_url && (
          <a
            href={caster.twitch_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs px-3 py-1.5 rounded-md transition-colors inline-flex items-center gap-1"
          >
            📺 Twitch
          </a>
        )}
        {caster.youtube_url && (
          <a
            href={caster.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs px-3 py-1.5 rounded-md transition-colors inline-flex items-center gap-1"
          >
            ▶️ YouTube
          </a>
        )}
        {caster.telegram_username && (
          <a
            href={"https://t.me/" + caster.telegram_username}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#00D9FF]/10 hover:bg-[#00D9FF]/20 border border-[#00D9FF]/30 text-[#00D9FF] text-xs px-3 py-1.5 rounded-md transition-colors inline-flex items-center gap-1"
          >
            📱 Telegram
          </a>
        )}
      </div>
    </div>
  );
}
