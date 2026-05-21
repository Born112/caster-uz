"use client";

import { useState } from "react";
import Link from "next/link";
import { createNationalTeam, updateNationalTeam, type NationalTeamFormData } from "./actions";

type NationalTeam = {
  id: string;
  name: string;
  region: string;
  description: string | null;
  game: string;
  is_active: boolean;
  total_tournaments: number;
};

type Props = { mode: "create" | "edit"; team?: NationalTeam };

export default function NationalTeamForm({ mode, team }: Props) {
  const [name, setName] = useState(team?.name || "");
  const [region, setRegion] = useState(team?.region || "national");
  const [description, setDescription] = useState(team?.description || "");
  const [game, setGame] = useState(team?.game || "CS 1.6");
  const [isActive, setIsActive] = useState(team?.is_active ?? true);
  const [totalTournaments, setTotalTournaments] = useState(team?.total_tournaments || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data: NationalTeamFormData = {
      name, region, description, game,
      is_active: isActive, total_tournaments: totalTournaments,
    };

    const result = mode === "create" ? await createNationalTeam(data) : await updateNationalTeam(team!.id, data);
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
          <Field label="Terma jamoa nomi" required>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Masalan: O'zbekiston Milliy jamoa" className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors" />
          </Field>

          <Field label="Tavsif">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Terma jamoa haqida..." className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors resize-none" />
          </Field>
        </div>
      </div>

      <div className="bg-[#131929] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-[#FF6B35]">●</span> Tur
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setRegion("national")} className="p-4 rounded-xl border transition-all text-left"
            style={{
              backgroundColor: region === "national" ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.02)",
              borderColor: region === "national" ? "#FF6B35" : "rgba(255,255,255,0.1)",
            }}>
            <div className="text-2xl mb-1">🇺🇿</div>
            <div className="font-bold">Milliy terma</div>
            <div className="text-xs text-[#8B92A8]">Butun mamlakat</div>
          </button>

          <button type="button" onClick={() => setRegion("regional")} className="p-4 rounded-xl border transition-all text-left"
            style={{
              backgroundColor: region === "regional" ? "rgba(0,217,255,0.15)" : "rgba(255,255,255,0.02)",
              borderColor: region === "regional" ? "#00D9FF" : "rgba(255,255,255,0.1)",
            }}>
            <div className="text-2xl mb-1">🏙️</div>
            <div className="font-bold">Hududiy terma</div>
            <div className="text-xs text-[#8B92A8]">Shahar yoki viloyat</div>
          </button>
        </div>
      </div>

      <div className="bg-[#131929] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-[#FF6B35]">●</span> O&apos;yin
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setGame("CS 1.6")} className="p-4 rounded-xl border transition-all text-left"
            style={{
              backgroundColor: game === "CS 1.6" ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.02)",
              borderColor: game === "CS 1.6" ? "#FF6B35" : "rgba(255,255,255,0.1)",
            }}>
            <div className="text-2xl mb-1">🎯</div>
            <div className="font-bold">CS 1.6</div>
          </button>
          <button type="button" onClick={() => setGame("Dota Allstars")} className="p-4 rounded-xl border transition-all text-left"
            style={{
              backgroundColor: game === "Dota Allstars" ? "rgba(0,217,255,0.15)" : "rgba(255,255,255,0.02)",
              borderColor: game === "Dota Allstars" ? "#00D9FF" : "rgba(255,255,255,0.1)",
            }}>
            <div className="text-2xl mb-1">⚔️</div>
            <div className="font-bold">Dota Allstars</div>
          </button>
        </div>
      </div>

      <div className="bg-[#131929] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-[#FF6B35]">●</span> Statistika va holat
        </h2>
        <div className="space-y-4">
          <Field label="Qatnashgan turnirlar soni">
            <input type="number" value={totalTournaments} onChange={(e) => setTotalTournaments(Number(e.target.value))} min={0} className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white outline-none transition-colors" />
          </Field>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="mt-1 w-5 h-5 accent-[#FF6B35] cursor-pointer" />
            <div>
              <div className="font-medium">Faol terma jamoa</div>
              <p className="text-sm text-[#8B92A8] mt-1">Hozir faol ishlaydimi?</p>
            </div>
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="flex-1 bg-[#FF6B35] hover:bg-[#FF8557] disabled:bg-[#FF6B35]/50 disabled:cursor-not-allowed text-[#0A0E1A] font-bold py-3 rounded-md transition-colors flex items-center justify-center gap-2">
          {loading ? "Saqlanmoqda..." : (<><span>{mode === "create" ? "➕" : "💾"}</span><span>{mode === "create" ? "Terma qo'shish" : "Saqlash"}</span></>)}
        </button>
        <Link href="/admin/national-teams" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-md transition-colors flex items-center">
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
