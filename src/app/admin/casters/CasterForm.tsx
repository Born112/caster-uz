"use client";

import { useState } from "react";
import Link from "next/link";
import { createCaster, updateCaster, type CasterFormData } from "./actions";

type Caster = {
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

type Props = {
  mode: "create" | "edit";
  caster?: Caster;
};

export default function CasterForm({ mode, caster }: Props) {
  const [nickname, setNickname] = useState(caster?.nickname || "");
  const [realName, setRealName] = useState(caster?.real_name || "");
  const [city, setCity] = useState(caster?.city || "");
  const [bio, setBio] = useState(caster?.bio || "");
  const [games, setGames] = useState<string[]>(caster?.games || []);
  const [isVerified, setIsVerified] = useState(caster?.is_verified || false);
  const [isLive, setIsLive] = useState(caster?.is_live || false);
  const [twitchUrl, setTwitchUrl] = useState(caster?.twitch_url || "");
  const [youtubeUrl, setYoutubeUrl] = useState(caster?.youtube_url || "");
  const [telegramUsername, setTelegramUsername] = useState(caster?.telegram_username || "");
  const [broadcastsCount, setBroadcastsCount] = useState(caster?.broadcasts_count || 0);
  const [subscribersCount, setSubscribersCount] = useState(caster?.subscribers_count || 0);
  const [rating, setRating] = useState(caster?.rating || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleGame = (game: string) => {
    if (games.includes(game)) {
      setGames(games.filter((g) => g !== game));
    } else {
      setGames([...games, game]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data: CasterFormData = {
      nickname,
      real_name: realName,
      city,
      bio,
      games,
      is_verified: isVerified,
      is_live: isLive,
      twitch_url: twitchUrl,
      youtube_url: youtubeUrl,
      telegram_username: telegramUsername,
      broadcasts_count: broadcastsCount,
      subscribers_count: subscribersCount,
      rating: rating,
    };

    const result =
      mode === "create"
        ? await createCaster(data)
        : await updateCaster(caster!.id, data);

    if (result && "error" in result) {
      setError(result.error ?? "Xatolik yuz berdi");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-md p-4 text-red-300 mb-6 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-[#131929] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-[#FF6B35]">●</span>
          Asosiy ma&apos;lumotlar
        </h2>

        <div className="space-y-4">
          <FormField label="Nickname" required hint="Caster nick'i">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              placeholder="Masalan: MrRashid"
              className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors"
            />
          </FormField>

          <FormField label="Real ism (ixtiyoriy)" hint="Ism va familya">
            <input
              type="text"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              placeholder="Masalan: Rashid Karimov"
              className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors"
            />
          </FormField>

          <FormField label="Shahar (ixtiyoriy)">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Masalan: Toshkent"
              className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors"
            />
          </FormField>

          <FormField label="Bio (ixtiyoriy)" hint="Caster haqida qisqacha">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Masalan: CS 1.6 sharhlovchisi, 5 yil tajriba"
              rows={3}
              className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors resize-none"
            />
          </FormField>
        </div>
      </div>

      <div className="bg-[#131929] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-[#FF6B35]">●</span>
          O&apos;yinlar
        </h2>
        <p className="text-sm text-[#8B92A8] mb-4">
          Caster qaysi o&apos;yinlarga sharh beradi?
        </p>

        <div className="grid grid-cols-2 gap-3">
          <GameToggle
            active={games.includes("CS 1.6")}
            onClick={() => toggleGame("CS 1.6")}
            label="CS 1.6"
            description="Counter-Strike"
            emoji="🎯"
            color="#FF6B35"
          />
          <GameToggle
            active={games.includes("Dota Allstars")}
            onClick={() => toggleGame("Dota Allstars")}
            label="Dota Allstars"
            description="Dota"
            emoji="⚔️"
            color="#00D9FF"
          />
        </div>
      </div>

      <div className="bg-[#131929] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-[#FF6B35]">●</span>
          Stream linklari
        </h2>

        <div className="space-y-4">
          <FormField label="Twitch (ixtiyoriy)" hint="To'liq URL">
            <div className="flex items-center">
              <span className="bg-[#0A0E1A] border border-white/10 border-r-0 rounded-l-md px-3 py-2.5 text-purple-400">
                📺
              </span>
              <input
                type="url"
                value={twitchUrl}
                onChange={(e) => setTwitchUrl(e.target.value)}
                placeholder="https://twitch.tv/mrrashid"
                className="flex-1 bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-r-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors"
              />
            </div>
          </FormField>

          <FormField label="YouTube (ixtiyoriy)" hint="To'liq URL">
            <div className="flex items-center">
              <span className="bg-[#0A0E1A] border border-white/10 border-r-0 rounded-l-md px-3 py-2.5 text-red-400">
                ▶️
              </span>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/@mrrashid"
                className="flex-1 bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-r-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors"
              />
            </div>
          </FormField>

          <FormField label="Telegram username (ixtiyoriy)" hint="@ belgisisiz">
            <div className="flex items-center">
              <span className="bg-[#0A0E1A] border border-white/10 border-r-0 rounded-l-md px-3 py-2.5 text-[#00D9FF]">
                @
              </span>
              <input
                type="text"
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value.replace("@", ""))}
                placeholder="mrrashid"
                className="flex-1 bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-r-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors"
              />
            </div>
          </FormField>
        </div>
      </div>

      <div className="bg-[#131929] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-[#FF6B35]">●</span>
          Statistika
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Translyatsiyalar" hint="Soni">
            <input
              type="number"
              value={broadcastsCount}
              onChange={(e) => setBroadcastsCount(Number(e.target.value))}
              min={0}
              className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white outline-none transition-colors"
            />
          </FormField>

          <FormField label="Obunachilar" hint="Soni">
            <input
              type="number"
              value={subscribersCount}
              onChange={(e) => setSubscribersCount(Number(e.target.value))}
              min={0}
              className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white outline-none transition-colors"
            />
          </FormField>

          <FormField label="Reyting" hint="0-10">
            <input
              type="number"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              min={0}
              max={10}
              step={0.1}
              className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white outline-none transition-colors"
            />
          </FormField>
        </div>
      </div>

      <div className="bg-[#131929] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-[#FF6B35]">●</span>
          Holat
        </h2>

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isVerified}
              onChange={(e) => setIsVerified(e.target.checked)}
              className="mt-1 w-5 h-5 accent-[#FF6B35] cursor-pointer"
            />
            <div>
              <div className="font-medium flex items-center gap-2">
                Tasdiqlangan caster
                {isVerified && <span className="text-green-400 text-xs">✓</span>}
              </div>
              <p className="text-sm text-[#8B92A8] mt-1">
                Rasmiy tasdiqlangan casterlar uchun yashil belgi
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isLive}
              onChange={(e) => setIsLive(e.target.checked)}
              className="mt-1 w-5 h-5 accent-red-500 cursor-pointer"
            />
            <div>
              <div className="font-medium flex items-center gap-2">
                Hozir LIVE
                {isLive && <span className="text-red-400 text-xs">🔴</span>}
              </div>
              <p className="text-sm text-[#8B92A8] mt-1">
                Caster hozir jonli efirdami?
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#FF6B35] hover:bg-[#FF8557] disabled:bg-[#FF6B35]/50 disabled:cursor-not-allowed text-[#0A0E1A] font-bold py-3 rounded-md transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Saqlanmoqda...</span>
          ) : (
            <>
              <span>{mode === "create" ? "➕" : "💾"}</span>
              <span>
                {mode === "create" ? "Caster qo'shish" : "O'zgarishlarni saqlash"}
              </span>
            </>
          )}
        </button>

        <Link
          href="/admin/casters"
          className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-md transition-colors flex items-center"
        >
          Bekor qilish
        </Link>
      </div>
    </form>
  );
}

function FormField({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block mb-2">
        <span className="text-sm font-medium text-white">
          {label}
          {required && <span className="text-[#FF6B35] ml-1">*</span>}
        </span>
        {hint && <span className="block text-xs text-[#8B92A8] mt-0.5">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function GameToggle({
  active,
  onClick,
  label,
  description,
  emoji,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  description: string;
  emoji: string;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-4 rounded-xl border transition-all text-left"
      style={{
        backgroundColor: active ? color + "15" : "rgba(255,255,255,0.02)",
        borderColor: active ? color : "rgba(255,255,255,0.1)",
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-2xl">{emoji}</span>
        {active && (
          <span style={{ color }} className="text-sm font-bold">
            ✓ Tanlangan
          </span>
        )}
      </div>
      <div className="font-bold text-white">{label}</div>
      <div className="text-xs text-[#8B92A8]">{description}</div>
    </button>
  );
}
