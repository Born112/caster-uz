"use client";

import { useState } from "react";
import Link from "next/link";
import { createTeam, updateTeam, type TeamFormData } from "./actions";

type Team = {
  id: string;
  name: string;
  short_name: string | null;
  description: string | null;
  game: string;
  city: string | null;
  country: string;
  founded_year: number | null;
  is_active: boolean;
  website: string | null;
  telegram_url: string | null;
  instagram_url: string | null;
  total_matches: number;
  wins: number;
  losses: number;
  rating: number;
};

type Props = { mode: "create" | "edit"; team?: Team };

export default function TeamForm({ mode, team }: Props) {
  const [name, setName] = useState(team?.name || "");
  const [shortName, setShortName] = useState(team?.short_name || "");
  const [description, setDescription] = useState(team?.description || "");
  const [game, setGame] = useState(team?.game || "CS 1.6");
  const [city, setCity] = useState(team?.city || "");
  const [country, setCountry] = useState(team?.country || "Uzbekistan");
  const [foundedYear, setFoundedYear] = useState(team?.founded_year || new Date().getFullYear());
  const [isActive, setIsActive] = useState(team?.is_active ?? true);
  const [website, setWebsite] = useState(team?.website || "");
  const [telegramUrl, setTelegramUrl] = useState(team?.telegram_url || "");
  const [instagramUrl, setInstagramUrl] = useState(team?.instagram_url || "");
  const [totalMatches, setTotalMatches] = useState(team?.total_matches || 0);
  const [wins, setWins] = useState(team?.wins || 0);
  const [losses, setLosses] = useState(team?.losses || 0);
  const [rating, setRating] = useState(team?.rating || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data: TeamFormData = {
      name, short_name: shortName, description, game,
      city, country, founded_year: foundedYear, is_active: isActive,
      website, telegram_url: telegramUrl, instagram_url: instagramUrl,
      total_matches: totalMatches, wins, losses, rating,
    };

    const result = mode === "create" ? await createTeam(data) : await updateTeam(team!.id, data);
    if (result && "error" in result) {
      setError(result.error ?? "Xatolik yuz berdi");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-md p-4 text-red-300 mb-6 flex items-center gap-2">
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      <div className="bg-[#131929] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-[#FF6B35]">●</span> Asosiy ma&apos;lumotlar
        </h2>
        <div className="space-y-4">
          <Field label="Jamoa nomi" required>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Masalan: Vega Squadron" className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors" />
          </Field>

          <Field label="Qisqartma" hint="3-5 harf, masalan: VEGA">
            <input type="text" value={shortName} onChange={(e) => setShortName(e.target.value.toUpperCase())} maxLength={6} placeholder="VEGA" className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors uppercase" />
          </Field>

          <Field label="Tavsif">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Jamoa haqida qisqacha..." className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors resize-none" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setGame("CS 1.6")} className="p-4 rounded-xl border transition-all text-left"
              style={{ backgroundColor: game === "CS 1.6" ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.02)", borderColor: game === "CS 1.6" ? "#FF6B35" : "rgba(255,255,255,0.1)" }}>
              <div className="text-2xl mb-1">🎯</div>
              <div className="font-bold">CS 1.6</div>
            </button>
            <button type="button" onClick={() => setGame("Dota Allstars")} className="p-4 rounded-xl border transition-all text-left"
              style={{ backgroundColor: game === "Dota Allstars" ? "rgba(0,217,255,0.15)" : "rgba(255,255,255,0.02)", borderColor: game === "Dota Allstars" ? "#00D9FF" : "rgba(255,255,255,0.1)" }}>
              <div className="text-2xl mb-1">⚔️</div>
              <div className="font-bold">Dota Allstars</div>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#131929] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-[#FF6B35]">●</span> Joy va asoschilik
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Shahar">
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Toshkent" className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors" />
          </Field>
          <Field label="Davlat">
            <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white outline-none transition-colors" />
          </Field>
          <Field label="Asoschilik yili">
            <input type="number" value={foundedYear} onChange={(e) => setFoundedYear(Number(e.target.value))} min={1990} max={new Date().getFullYear()} className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white outline-none transition-colors" />
          </Field>
        </div>
      </div>

      <div className="bg-[#131929] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-[#FF6B35]">●</span> Statistika
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Field label="Matchlar">
            <input type="number" value={totalMatches} onChange={(e) => setTotalMatches(Number(e.target.value))} min={0} className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white outline-none transition-colors" />
          </Field>
          <Field label="G'alaba">
            <input type="number" value={wins} onChange={(e) => setWins(Number(e.target.value))} min={0} className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white outline-none transition-colors" />
          </Field>
          <Field label="Mag'lubiyat">
            <input type="number" value={losses} onChange={(e) => setLosses(Number(e.target.value))} min={0} className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white outline-none transition-colors" />
          </Field>
          <Field label="Reyting (0-100)">
            <input type="number" value={rating} onChange={(e) => setRating(Number(e.target.value))} min={0} max={100} step={0.1} className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white outline-none transition-colors" />
          </Field>
        </div>
      </div>

      <div className="bg-[#131929] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-[#FF6B35]">●</span> Aloqalar (ixtiyoriy)
        </h2>
        <div className="space-y-3">
          <Field label="Veb-sayt">
            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors" />
          </Field>
          <Field label="Telegram kanal">
            <input type="url" value={telegramUrl} onChange={(e) => setTelegramUrl(e.target.value)} placeholder="https://t.me/..." className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors" />
          </Field>
          <Field label="Instagram">
            <input type="url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/..." className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors" />
          </Field>
        </div>
      </div>

      <div className="bg-[#131929] border border-white/10 rounded-xl p-6 mb-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="mt-1 w-5 h-5 accent-[#FF6B35] cursor-pointer" />
          <div>
            <div className="font-medium">Faol jamoa</div>
            <p className="text-sm text-[#8B92A8] mt-1">Jamoa hozir faolmi yoki tarqalganmi?</p>
          </div>
        </label>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="flex-1 bg-[#FF6B35] hover:bg-[#FF8557] disabled:bg-[#FF6B35]/50 disabled:cursor-not-allowed text-[#0A0E1A] font-bold py-3 rounded-md transition-colors flex items-center justify-center gap-2">
          {loading ? "Saqlanmoqda..." : (<><span>{mode === "create" ? "➕" : "💾"}</span><span>{mode === "create" ? "Jamoa qo'shish" : "Saqlash"}</span></>)}
        </button>
        <Link href="/admin/teams" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-md transition-colors flex items-center">
          Bekor qilish
        </Link>
      </div>
    </form>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
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
