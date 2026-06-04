"use client";

import { useState } from "react";
import Link from "next/link";
import { createTournament, updateTournament, type TournamentFormData } from "./actions";

type Tournament = {
  id: string;
  name: string;
  description: string | null;
  game: string;
  status: string;
  start_date: string;
  end_date: string | null;
  location: string | null;
  is_online: boolean;
  prize_fund: number;
  teams_count: number;
  max_teams: number | null;
  organizer: string | null;
  stream_url: string | null;
  winner: string | null;
  runner_up: string | null;
  third_place: string | null;
  match_format?: string;
};

type Props = { mode: "create" | "edit"; tournament?: Tournament };

export default function TournamentForm({ mode, tournament }: Props) {
  const [name, setName] = useState(tournament?.name || "");
  const [description, setDescription] = useState(tournament?.description || "");
  const [game, setGame] = useState(tournament?.game || "CS 1.6");
  const [status, setStatus] = useState(tournament?.status || "upcoming");
  const [matchFormat, setMatchFormat] = useState(tournament?.match_format || "5v5");
  const [startDate, setStartDate] = useState(tournament?.start_date || "");
  const [endDate, setEndDate] = useState(tournament?.end_date || "");
  const [location, setLocation] = useState(tournament?.location || "");
  const [isOnline, setIsOnline] = useState(tournament?.is_online || false);
  const [prizeFund, setPrizeFund] = useState(tournament?.prize_fund || 0);
  const [teamsCount, setTeamsCount] = useState(tournament?.teams_count || 0);
  const [maxTeams, setMaxTeams] = useState(tournament?.max_teams || 0);
  const [organizer, setOrganizer] = useState(tournament?.organizer || "");
  const [streamUrl, setStreamUrl] = useState(tournament?.stream_url || "");
  const [winner, setWinner] = useState(tournament?.winner || "");
  const [runnerUp, setRunnerUp] = useState(tournament?.runner_up || "");
  const [thirdPlace, setThirdPlace] = useState(tournament?.third_place || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data: TournamentFormData = {
      name, description, game, status,
      match_format: matchFormat,
      start_date: startDate,
      end_date: endDate,
      location, is_online: isOnline,
      prize_fund: prizeFund,
      teams_count: teamsCount,
      max_teams: maxTeams,
      organizer,
      stream_url: streamUrl,
      winner, runner_up: runnerUp, third_place: thirdPlace,
    };

    const result = mode === "create" 
      ? await createTournament(data) 
      : await updateTournament(tournament!.id, data);

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
          <Field label="Turnir nomi" required>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Masalan: Toshkent Cup 2026" className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors" />
          </Field>

          <Field label="Tavsif (ixtiyoriy)">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Turnir haqida..." rows={3} className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors resize-none" />
          </Field>

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
      </div>

      <div className="bg-[#131929] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-[#FF6B35]">●</span> Match formati
        </h2>
        <p className="text-sm text-[#8B92A8] mb-3">
          Har jamoada nechta o&apos;yinchi ishtirok etadi?
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: "5v5", label: "5v5", desc: "Klassik" },
            { value: "3v3", label: "3v3", desc: "Mini" },
            { value: "2v2", label: "2v2", desc: "Duo" },
            { value: "1v1", label: "1v1", desc: "Show match" },
          ].map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setMatchFormat(f.value)}
              className="p-3 rounded-md border text-sm font-medium transition-all"
              style={{
                backgroundColor: matchFormat === f.value ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.02)",
                borderColor: matchFormat === f.value ? "#FF6B35" : "rgba(255,255,255,0.1)",
                color: matchFormat === f.value ? "#FF6B35" : "#8B92A8",
              }}
            >
              <div className="font-bold">{f.label}</div>
              <div className="text-xs opacity-70 mt-0.5">{f.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#131929] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-[#FF6B35]">●</span> Holat
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { value: "upcoming", label: "🟢 Kelajak", color: "#00E676" },
            { value: "live", label: "🔴 LIVE", color: "#FF3D71" },
            { value: "completed", label: "⚫ Tugagan", color: "#8B92A8" },
            { value: "cancelled", label: "❌ Bekor", color: "#FF6B35" },
          ].map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStatus(s.value)}
              className="p-3 rounded-md border text-sm font-medium transition-all"
              style={{
                backgroundColor: status === s.value ? s.color + "20" : "rgba(255,255,255,0.02)",
                borderColor: status === s.value ? s.color : "rgba(255,255,255,0.1)",
                color: status === s.value ? s.color : "#8B92A8",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#131929] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-[#FF6B35]">●</span> Sana va joy
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Boshlanish sanasi" required>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white outline-none transition-colors" />
            </Field>
            <Field label="Tugash sanasi (ixtiyoriy)">
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white outline-none transition-colors" />
            </Field>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} className="w-5 h-5 accent-[#FF6B35] cursor-pointer" />
            <span className="font-medium">🌐 Onlayn turnir</span>
          </label>

          {!isOnline && (
            <Field label="Shahar">
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Toshkent" className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors" />
            </Field>
          )}

          <Field label="Tashkilotchi (ixtiyoriy)">
            <input type="text" value={organizer} onChange={(e) => setOrganizer(e.target.value)} placeholder="Vega Esports" className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors" />
          </Field>
        </div>
      </div>

      <div className="bg-[#131929] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-[#FF6B35]">●</span> Statistika
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Prize fund (so'm)">
            <input type="number" value={prizeFund} onChange={(e) => setPrizeFund(Number(e.target.value))} min={0} step={100000} className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white outline-none transition-colors" />
          </Field>
          <Field label="Joriy jamoalar">
            <input type="number" value={teamsCount} onChange={(e) => setTeamsCount(Number(e.target.value))} min={0} className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white outline-none transition-colors" />
          </Field>
          <Field label="Max jamoalar">
            <input type="number" value={maxTeams} onChange={(e) => setMaxTeams(Number(e.target.value))} min={0} className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white outline-none transition-colors" />
          </Field>
        </div>
      </div>

      <div className="bg-[#131929] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-[#FF6B35]">●</span> Stream linki
        </h2>
        <Field label="Stream URL (LIVE bo'lganda)" hint="Twitch yoki YouTube">
          <input type="url" value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} placeholder="https://twitch.tv/..." className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors" />
        </Field>
      </div>

      {status === "completed" && (
        <div className="bg-[#131929] border border-yellow-500/30 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>🏆</span> G&apos;oliblar
          </h2>
          <div className="space-y-3">
            <Field label="🥇 1-o'rin">
              <input type="text" value={winner} onChange={(e) => setWinner(e.target.value)} placeholder="Jamoa nomi" className="w-full bg-[#0A0E1A] border border-yellow-500/30 focus:border-yellow-500 rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors" />
            </Field>
            <Field label="🥈 2-o'rin">
              <input type="text" value={runnerUp} onChange={(e) => setRunnerUp(e.target.value)} placeholder="Jamoa nomi" className="w-full bg-[#0A0E1A] border border-white/10 focus:border-gray-400 rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors" />
            </Field>
            <Field label="🥉 3-o'rin">
              <input type="text" value={thirdPlace} onChange={(e) => setThirdPlace(e.target.value)} placeholder="Jamoa nomi" className="w-full bg-[#0A0E1A] border border-orange-500/30 focus:border-orange-500 rounded-md px-4 py-2.5 text-white placeholder-[#5A6178] outline-none transition-colors" />
            </Field>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="flex-1 bg-[#FF6B35] hover:bg-[#FF8557] disabled:bg-[#FF6B35]/50 disabled:cursor-not-allowed text-[#0A0E1A] font-bold py-3 rounded-md transition-colors flex items-center justify-center gap-2">
          {loading ? "Saqlanmoqda..." : (<><span>{mode === "create" ? "➕" : "💾"}</span><span>{mode === "create" ? "Turnir qo'shish" : "Saqlash"}</span></>)}
        </button>
        <Link href="/admin/tournaments" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-md transition-colors flex items-center">
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
