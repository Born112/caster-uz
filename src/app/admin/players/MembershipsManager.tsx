"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addTeamMembership,
  updateTeamMembership,
  deleteTeamMembership,
  addNationalMembership,
  updateNationalMembership,
  deleteNationalMembership,
} from "./memberships-actions";

type TeamMembership = {
  id: string;
  team_id: string;
  position: string | null;
  jersey_number: number | null;
  role: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  notes: string | null;
  teams?: { id: string; name: string; short_name: string | null; game: string };
};

type NationalMembership = {
  id: string;
  national_team_id: string;
  position: string | null;
  role: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  notes: string | null;
  national_teams?: { id: string; name: string; region: string; game: string };
};

type Team = { id: string; name: string; short_name: string | null; game: string };
type NationalTeam = { id: string; name: string; region: string; game: string };

type Props = {
  playerId: string;
  teamMemberships: TeamMembership[];
  nationalMemberships: NationalMembership[];
  allTeams: Team[];
  allNationalTeams: NationalTeam[];
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric" });
}

export default function MembershipsManager({
  playerId,
  teamMemberships,
  nationalMemberships,
  allTeams,
  allNationalTeams,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"team" | "national">("team");
  const [editingTeam, setEditingTeam] = useState<TeamMembership | null>(null);
  const [editingNational, setEditingNational] = useState<NationalMembership | null>(null);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showNationalForm, setShowNationalForm] = useState(false);

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Ushbu a'zolikni o'chirmoqchimisiz?")) return;
    const result = await deleteTeamMembership(id);
    if (result && "error" in result) {
      alert("Xatolik: " + result.error);
      return;
    }
    router.refresh();
  };

  const handleDeleteNational = async (id: string) => {
    if (!confirm("Ushbu a'zolikni o'chirmoqchimisiz?")) return;
    const result = await deleteNationalMembership(id);
    if (result && "error" in result) {
      alert("Xatolik: " + result.error);
      return;
    }
    router.refresh();
  };

  const sortedTeam = [...teamMemberships].sort((a, b) => {
    if (a.is_current && !b.is_current) return -1;
    if (!a.is_current && b.is_current) return 1;
    return b.start_date.localeCompare(a.start_date);
  });

  const sortedNational = [...nationalMemberships].sort((a, b) => {
    if (a.is_current && !b.is_current) return -1;
    if (!a.is_current && b.is_current) return 1;
    return b.start_date.localeCompare(a.start_date);
  });

  return (
    <div className="bg-[#131929] border border-white/10 rounded-xl overflow-hidden">
      <div className="flex border-b border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab("team")}
          className={"flex-1 px-4 py-3 text-sm font-medium transition-colors " + (activeTab === "team" ? "bg-white/5 text-white border-b-2 border-[#FF6B35]" : "text-[#8B92A8] hover:text-white")}
        >
          🏆 Klub tarixi ({teamMemberships.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("national")}
          className={"flex-1 px-4 py-3 text-sm font-medium transition-colors " + (activeTab === "national" ? "bg-white/5 text-white border-b-2 border-[#FF6B35]" : "text-[#8B92A8] hover:text-white")}
        >
          🇺🇿 Terma jamoa ({nationalMemberships.length})
        </button>
      </div>

      <div className="p-4">
        {activeTab === "team" && (
          <>
            {sortedTeam.length === 0 && !showTeamForm && (
              <div className="text-center py-8 text-[#8B92A8]">
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-sm">Klub a&apos;zoligi yo&apos;q</p>
              </div>
            )}

            <div className="space-y-2 mb-4">
              {sortedTeam.map((m) => (
                <div key={m.id} className={"rounded-md p-3 " + (m.is_current ? "bg-[#FF6B35]/10 border border-[#FF6B35]/30" : "bg-white/5 border border-white/10")}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {m.is_current && <span className="bg-[#FF6B35] text-[#0A0E1A] text-xs font-bold px-2 py-0.5 rounded">HOZIRGI</span>}
                      <span className="font-bold">{m.teams?.name || "Noma'lum"}</span>
                      {m.teams?.short_name && <span className="text-xs text-[#8B92A8]">({m.teams.short_name})</span>}
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setEditingTeam(m)} className="text-xs text-[#00D9FF] hover:underline">✏️</button>
                      <button type="button" onClick={() => handleDeleteTeam(m.id)} className="text-xs text-red-400 hover:underline">🗑️</button>
                    </div>
                  </div>
                  <div className="text-xs text-[#8B92A8]">
                    {m.position && <span>{m.position}</span>}
                    {m.jersey_number && <span> · #{m.jersey_number}</span>}
                    {m.role !== "main" && <span> · {m.role}</span>}
                  </div>
                  <div className="text-xs text-[#8B92A8] mt-1">
                    📅 {formatDate(m.start_date)}
                    {m.end_date ? " — " + formatDate(m.end_date) : " — hozirgacha"}
                  </div>
                </div>
              ))}
            </div>

            {!showTeamForm && !editingTeam && (
              <button type="button" onClick={() => setShowTeamForm(true)} className="w-full bg-[#FF6B35]/10 hover:bg-[#FF6B35]/20 border border-[#FF6B35]/30 text-[#FF6B35] text-sm font-medium py-2 rounded-md transition-colors">
                ➕ Klub qo&apos;shish
              </button>
            )}

            {(showTeamForm || editingTeam) && (
              <TeamMembershipForm
                playerId={playerId}
                allTeams={allTeams}
                existing={editingTeam}
                onClose={() => {
                  setShowTeamForm(false);
                  setEditingTeam(null);
                  router.refresh();
                }}
              />
            )}
          </>
        )}

        {activeTab === "national" && (
          <>
            {sortedNational.length === 0 && !showNationalForm && (
              <div className="text-center py-8 text-[#8B92A8]">
                <div className="text-4xl mb-2">🇺🇿</div>
                <p className="text-sm">Terma jamoa a&apos;zoligi yo&apos;q</p>
              </div>
            )}

            <div className="space-y-2 mb-4">
              {sortedNational.map((m) => (
                <div key={m.id} className={"rounded-md p-3 " + (m.is_current ? "bg-[#00D9FF]/10 border border-[#00D9FF]/30" : "bg-white/5 border border-white/10")}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {m.is_current && <span className="bg-[#00D9FF] text-[#0A0E1A] text-xs font-bold px-2 py-0.5 rounded">HOZIRGI</span>}
                      <span>{m.national_teams?.region === "national" ? "🇺🇿" : "🏙️"}</span>
                      <span className="font-bold">{m.national_teams?.name || "Noma'lum"}</span>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setEditingNational(m)} className="text-xs text-[#00D9FF] hover:underline">✏️</button>
                      <button type="button" onClick={() => handleDeleteNational(m.id)} className="text-xs text-red-400 hover:underline">🗑️</button>
                    </div>
                  </div>
                  <div className="text-xs text-[#8B92A8]">
                    {m.position && <span>{m.position}</span>}
                    {m.role !== "main" && <span> · {m.role === "captain" ? "👑 Kapitan" : m.role}</span>}
                  </div>
                  <div className="text-xs text-[#8B92A8] mt-1">
                    📅 {formatDate(m.start_date)}
                    {m.end_date ? " — " + formatDate(m.end_date) : " — hozirgacha"}
                  </div>
                </div>
              ))}
            </div>

            {!showNationalForm && !editingNational && (
              <button type="button" onClick={() => setShowNationalForm(true)} className="w-full bg-[#00D9FF]/10 hover:bg-[#00D9FF]/20 border border-[#00D9FF]/30 text-[#00D9FF] text-sm font-medium py-2 rounded-md transition-colors">
                ➕ Terma jamoa qo&apos;shish
              </button>
            )}

            {(showNationalForm || editingNational) && (
              <NationalMembershipForm
                playerId={playerId}
                allNationalTeams={allNationalTeams}
                existing={editingNational}
                onClose={() => {
                  setShowNationalForm(false);
                  setEditingNational(null);
                  router.refresh();
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TeamMembershipForm({
  playerId,
  allTeams,
  existing,
  onClose,
}: {
  playerId: string;
  allTeams: Team[];
  existing: TeamMembership | null;
  onClose: () => void;
}) {
  const [teamId, setTeamId] = useState(existing?.team_id || "");
  const [position, setPosition] = useState(existing?.position || "");
  const [jerseyNumber, setJerseyNumber] = useState(existing?.jersey_number?.toString() || "");
  const [role, setRole] = useState(existing?.role || "main");
  const [startDate, setStartDate] = useState(existing?.start_date || "");
  const [endDate, setEndDate] = useState(existing?.end_date || "");
  const [isCurrent, setIsCurrent] = useState(existing?.is_current ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!teamId) {
      setError("Jamoa tanlang");
      return;
    }
    if (!startDate) {
      setError("Boshlanish sanasi kerak");
      return;
    }

    setLoading(true);
    setError(null);

    const data = {
      player_id: playerId,
      team_id: teamId,
      position,
      jersey_number: jerseyNumber ? parseInt(jerseyNumber) : null,
      role,
      start_date: startDate,
      end_date: isCurrent ? null : (endDate || null),
      is_current: isCurrent,
      notes: "",
    };

    const result = existing
      ? await updateTeamMembership(existing.id, data)
      : await addTeamMembership(data);

    if (result && "error" in result) {
      setError(result.error ?? "Xatolik");
      setLoading(false);
      return;
    }

    onClose();
  };

  return (
    <div className="bg-[#0A0E1A] border border-white/10 rounded-md p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold">{existing ? "Tahrirlash" : "Yangi klub"}</span>
        <button type="button" onClick={onClose} className="text-[#8B92A8] hover:text-white text-xs">✕</button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-md p-2 text-red-300 text-xs">{error}</div>
      )}

      <div>
        <label className="block text-xs text-[#8B92A8] mb-1">Klub *</label>
        <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className="w-full bg-[#131929] border border-white/10 rounded-md px-3 py-2 text-sm text-white outline-none">
          <option value="">— Tanlang —</option>
          {allTeams.map((t) => (
            <option key={t.id} value={t.id}>{t.name} ({t.game})</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-[#8B92A8] mb-1">Pozitsiya</label>
          <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="AWPer, Mid..." className="w-full bg-[#131929] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-[#5A6178] outline-none" />
        </div>
        <div>
          <label className="block text-xs text-[#8B92A8] mb-1">Raqam</label>
          <input type="number" value={jerseyNumber} onChange={(e) => setJerseyNumber(e.target.value)} min={1} max={99} className="w-full bg-[#131929] border border-white/10 rounded-md px-3 py-2 text-sm text-white outline-none" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-[#8B92A8] mb-1">Rol</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-[#131929] border border-white/10 rounded-md px-3 py-2 text-sm text-white outline-none">
          <option value="main">Asosiy o&apos;yinchi</option>
          <option value="substitute">Zaxira</option>
          <option value="coach">Trener</option>
          <option value="analyst">Analitik</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-[#8B92A8] mb-1">Boshlandi *</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-[#131929] border border-white/10 rounded-md px-3 py-2 text-sm text-white outline-none" />
        </div>
        <div>
          <label className="block text-xs text-[#8B92A8] mb-1">Tugadi</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={isCurrent} className="w-full bg-[#131929] border border-white/10 rounded-md px-3 py-2 text-sm text-white outline-none disabled:opacity-50" />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} className="w-4 h-4 accent-[#FF6B35]" />
        <span className="text-sm">🟢 Hozirgi a&apos;zolik</span>
      </label>

      <div className="flex gap-2">
        <button type="button" onClick={handleSave} disabled={loading} className="flex-1 bg-[#FF6B35] hover:bg-[#FF8557] disabled:opacity-50 text-[#0A0E1A] font-bold text-sm py-2 rounded-md">
          {loading ? "Saqlanyapti..." : (existing ? "💾 Saqlash" : "➕ Qo'shish")}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white rounded-md">
          Bekor
        </button>
      </div>
    </div>
  );
}

function NationalMembershipForm({
  playerId,
  allNationalTeams,
  existing,
  onClose,
}: {
  playerId: string;
  allNationalTeams: NationalTeam[];
  existing: NationalMembership | null;
  onClose: () => void;
}) {
  const [teamId, setTeamId] = useState(existing?.national_team_id || "");
  const [position, setPosition] = useState(existing?.position || "");
  const [role, setRole] = useState(existing?.role || "main");
  const [startDate, setStartDate] = useState(existing?.start_date || "");
  const [endDate, setEndDate] = useState(existing?.end_date || "");
  const [isCurrent, setIsCurrent] = useState(existing?.is_current ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!teamId) {
      setError("Terma jamoa tanlang");
      return;
    }
    if (!startDate) {
      setError("Boshlanish sanasi kerak");
      return;
    }

    setLoading(true);
    setError(null);

    const data = {
      player_id: playerId,
      national_team_id: teamId,
      position,
      role,
      start_date: startDate,
      end_date: isCurrent ? null : (endDate || null),
      is_current: isCurrent,
      notes: "",
    };

    const result = existing
      ? await updateNationalMembership(existing.id, data)
      : await addNationalMembership(data);

    if (result && "error" in result) {
      setError(result.error ?? "Xatolik");
      setLoading(false);
      return;
    }

    onClose();
  };

  return (
    <div className="bg-[#0A0E1A] border border-white/10 rounded-md p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold">{existing ? "Tahrirlash" : "Yangi terma"}</span>
        <button type="button" onClick={onClose} className="text-[#8B92A8] hover:text-white text-xs">✕</button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-md p-2 text-red-300 text-xs">{error}</div>
      )}

      <div>
        <label className="block text-xs text-[#8B92A8] mb-1">Terma jamoa *</label>
        <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className="w-full bg-[#131929] border border-white/10 rounded-md px-3 py-2 text-sm text-white outline-none">
          <option value="">— Tanlang —</option>
          {allNationalTeams.map((t) => (
            <option key={t.id} value={t.id}>{t.region === "national" ? "🇺🇿" : "🏙️"} {t.name} ({t.game})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-[#8B92A8] mb-1">Pozitsiya</label>
        <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="AWPer, Mid..." className="w-full bg-[#131929] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-[#5A6178] outline-none" />
      </div>

      <div>
        <label className="block text-xs text-[#8B92A8] mb-1">Rol</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-[#131929] border border-white/10 rounded-md px-3 py-2 text-sm text-white outline-none">
          <option value="main">Asosiy o&apos;yinchi</option>
          <option value="substitute">Zaxira</option>
          <option value="captain">👑 Kapitan</option>
          <option value="coach">Trener</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-[#8B92A8] mb-1">Boshlandi *</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-[#131929] border border-white/10 rounded-md px-3 py-2 text-sm text-white outline-none" />
        </div>
        <div>
          <label className="block text-xs text-[#8B92A8] mb-1">Tugadi</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={isCurrent} className="w-full bg-[#131929] border border-white/10 rounded-md px-3 py-2 text-sm text-white outline-none disabled:opacity-50" />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} className="w-4 h-4 accent-[#00D9FF]" />
        <span className="text-sm">🟢 Hozirgi a&apos;zolik</span>
      </label>

      <div className="flex gap-2">
        <button type="button" onClick={handleSave} disabled={loading} className="flex-1 bg-[#00D9FF] hover:bg-[#33E0FF] disabled:opacity-50 text-[#0A0E1A] font-bold text-sm py-2 rounded-md">
          {loading ? "Saqlanyapti..." : (existing ? "💾 Saqlash" : "➕ Qo'shish")}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white rounded-md">
          Bekor
        </button>
      </div>
    </div>
  );
}
