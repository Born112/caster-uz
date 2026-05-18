"use client";

import { useState } from "react";
import Link from "next/link";
import { createPlayer, updatePlayer, type PlayerFormData } from "./actions";

type Player = {
  id: string;
  nickname: string;
  real_name: string | null;
  city: string | null;
  bio: string | null;
  is_verified: boolean;
  telegram_username: string | null;
  games: string[] | null;
};

type Props = {
  mode: "create" | "edit";
  player?: Player;
};

export default function PlayerForm({ mode, player }: Props) {
  const [nickname, setNickname] = useState(player?.nickname || "");
  const [realName, setRealName] = useState(player?.real_name || "");
  const [city, setCity] = useState(player?.city || "");
  const [bio, setBio] = useState(player?.bio || "");
  const [telegramUsername, setTelegramUsername] = useState(player?.telegram_username || "");
  const [games, setGames] = useState<string[]>(player?.games || []);
  const [isVerified, setIsVerified] = useState(player?.is_verified || false);
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

    const data: PlayerFormData = {
      nickname,
      real_name: realName,
      city,
      bio,
      telegram_username: telegramUsername,
      games,
      is_verified: isVerified,
    };

    const result =
      mode === "create"
        ? await createPlayer(data)
        : await updatePlayer(player!.id, data);

    if (result && "error" in result) {
      setError(result.error);
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
          <FormField label="Nickname" required hint="Asosiy o'yindagi nick">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              placeholder="Masalan: Shadow"
              className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors"
            />
          </FormField>

          <FormField label="Real ism (ixtiyoriy)" hint="Ism va familya">
            <input
              type="text"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              placeholder="Masalan: Doniyor Karimov"
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

          <FormField label="Bio (ixtiyoriy)" hint="O'yinchi haqida qisqacha">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Masalan: CS 1.6 AWPer, Vega Squadron jamoasi"
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
          O&apos;yinchi qaysi o&apos;yinda ishtirok etadi? (Birini yoki ikkalasini tanlang)
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
          Aloqa
        </h2>

        <FormField
          label="Telegram username (ixtiyoriy)"
          hint="@ belgisisiz yozing. Masalan: shadow_uz"
        >
          <div className="flex items-center">
            <span className="bg-[#0A0E1A] border border-white/10 border-r-0 rounded-l-md px-3 py-2.5 text-[#8B92A8]">
              @
            </span>
            <input
              type="text"
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value.replace("@", ""))}
              placeholder="shadow_uz"
              className="flex-1 bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-r-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors"
            />
          </div>
        </FormField>
      </div>

      <div className="bg-[#131929] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-[#FF6B35]">●</span>
          Holat
        </h2>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isVerified}
            onChange={(e) => setIsVerified(e.target.checked)}
            className="mt-1 w-5 h-5 accent-[#FF6B35] cursor-pointer"
          />
          <div>
            <div className="font-medium flex items-center gap-2">
              Tasdiqlangan o&apos;yinchi
              {isVerified && <span className="text-green-400 text-xs">✓</span>}
            </div>
            <p className="text-sm text-[#8B92A8] mt-1">
              Rasmiy tasdiqlangan o&apos;yinchilar uchun yashil belgi ko&apos;rinadi
            </p>
          </div>
        </label>
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
                {mode === "create" ? "O'yinchi qo'shish" : "O'zgarishlarni saqlash"}
              </span>
            </>
          )}
        </button>

        <Link
          href="/admin/players"
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
