"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addTeamToTournament,
  removeTeamFromTournament,
  addPlayerToRoster,
  updateRosterPlayerRole,
  removePlayerFromRoster,
  updateRosterSeed,
} from "./roster-actions";

type Team = {
  id: string;
  name: string;
  short_name: string | null;
  game: string;
};

type Player = {
  id: string;
  nickname: string;
  real_name: string | null;
  games: string[];
};

type RosterPlayer = {
  id: string;
  role: string;
  position: string | null;
  players: Player | null;
};

type Roster = {
  id: string;
  seed: number | null;
  status: string;
  teams: Team | null;
  tournament_roster_players: RosterPlayer[];
};

type Props = {
  tournamentId: string;
  tournamentGame: string;
  matchFormat: string;
  rosters: Roster[];
  allTeams: Team[];
};

export default function TournamentRostersManager({
  tournamentId,
  tournamentGame,
  matchFormat,
  rosters,
  allTeams,
}: Props) {
  const router = useRouter();
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedSeed, setSelectedSeed] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Maksimal o'yinchilar (format'ga qarab)
  const maxMainPlayers = matchFormat === "1v1" ? 1 : matchFormat === "2v2" ? 2 : matchFormat === "3v3" ? 3 : 5;

  // Hozir turnirda bo'lmagan jamoalar
  const usedTeamIds = new Set(rosters.map((r) => r.teams?.id).filter(Boolean));
  const availableTeams = allTeams.filter((t) => !usedTeamIds.has(t.id));

  const handleAddTeam = async () => {
    if (!selectedTeamId) {
      setError("Jamoa tanlang");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await addTeamToTournament(tournamentId, selectedTeamId, selectedSeed || undefined);

    if (result && "error" in result) {
      setError(result.error ?? "Xato");
      setLoading(false);
      return;
    }

    setSelectedTeamId("");
    setSelectedSeed(null);
    setShowAddTeam(false);
    setLoading(false);
    router.refresh();
  };

  const handleRemoveTeam = async (rosterId: string, teamName: string) => {
    if (!confirm(teamName + " ni turnirdan olib tashlashni xohlaysizmi?")) return;

    const result = await removeTeamFromTournament(rosterId);
    if (result && "error" in result) {
      alert("Xato: " + result.error);
      return;
    }
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#131929] border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold flex items-center gap-2">
              <span>👥</span> Ishtirokchi jamoalar
            </h3>
            <p className="text-xs text-[#8B92A8] mt-1">
              Format: {matchFormat} · Asosiy: {maxMainPlayers} o&apos;yinchi
            </p>
          </div>
          {!showAddTeam && availableTeams.length > 0 && (
            <button
              onClick={() => setShowAddTeam(true)}
              className="bg-[#FF6B35] hover:bg-[#FF8557] text-[#0A0E1A] text-sm font-bold px-3 py-1.5 rounded-md transition-colors"
            >
              ➕ Jamoa qo&apos;shish
            </button>
          )}
        </div>

        {showAddTeam && (
          <div className="bg-[#0A0E1A] border border-white/10 rounded-md p-3 mb-3 space-y-3">
            {error && (
              <div className="bg-red-900/30 border border-red-500/30 rounded p-2 text-red-300 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs text-[#8B92A8] mb-1">Jamoa *</label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full bg-[#131929] border border-white/10 rounded px-3 py-2 text-sm text-white outline-none"
              >
                <option value="">— Tanlang —</option>
                {availableTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}{t.short_name ? " (" + t.short_name + ")" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#8B92A8] mb-1">Seed (ixtiyoriy)</label>
              <input
                type="number"
                value={selectedSeed || ""}
                onChange={(e) => setSelectedSeed(e.target.value ? parseInt(e.target.value) : null)}
                min={1}
                placeholder="1, 2, 3..."
                className="w-full bg-[#131929] border border-white/10 rounded px-3 py-2 text-sm text-white outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddTeam}
                disabled={loading}
                className="flex-1 bg-[#FF6B35] hover:bg-[#FF8557] disabled:opacity-50 text-[#0A0E1A] font-bold text-sm py-2 rounded-md"
              >
                {loading ? "Qo'shilmoqda..." : "➕ Qo'shish"}
              </button>
              <button
                onClick={() => {
                  setShowAddTeam(false);
                  setSelectedTeamId("");
                  setSelectedSeed(null);
                  setError(null);
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white rounded-md"
              >
                Bekor
              </button>
            </div>
          </div>
        )}

        {rosters.length === 0 ? (
          <div className="text-center py-8 text-[#8B92A8] text-sm">
            <div className="text-4xl mb-2">👥</div>
            <p>Hozircha ishtirokchilar yo&apos;q</p>
            <p className="text-xs mt-1">Yuqoridagi tugma bilan jamoa qo&apos;shing</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rosters
              .sort((a, b) => (a.seed || 999) - (b.seed || 999))
              .map((roster) => (
                <RosterTeamCard
                  key={roster.id}
                  roster={roster}
                  tournamentGame={tournamentGame}
                  maxMainPlayers={maxMainPlayers}
                  onRemove={() => handleRemoveTeam(roster.id, roster.teams?.name || "")}
                  onRefresh={() => router.refresh()}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RosterTeamCard({
  roster,
  tournamentGame,
  maxMainPlayers,
  onRemove,
  onRefresh,
}: {
  roster: Roster;
  tournamentGame: string;
  maxMainPlayers: number;
  onRemove: () => void;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const mainPlayers = roster.tournament_roster_players.filter((p) => p.role === "main");
  const subs = roster.tournament_roster_players.filter((p) => p.role === "substitute");
  const others = roster.tournament_roster_players.filter((p) => p.role === "coach" || p.role === "analyst");

  const teamColor = tournamentGame === "CS 1.6" ? "#FF6B35" : "#00D9FF";

  return (
    <div className="bg-[#0A0E1A] border border-white/10 rounded-md overflow-hidden">
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {roster.seed && (
          <div
            className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: teamColor + "20", color: teamColor }}
          >
            #{roster.seed}
          </div>
        )}

        <div
          className="w-10 h-10 rounded flex items-center justify-center font-bold text-sm shrink-0"
          style={{ backgroundColor: teamColor + "20", color: teamColor, border: "2px solid " + teamColor + "40" }}
        >
          {roster.teams?.short_name || roster.teams?.name?.substring(0, 2)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-bold">{roster.teams?.name}</div>
          <div className="text-xs text-[#8B92A8]">
            {mainPlayers.length}/{maxMainPlayers} asosiy
            {subs.length > 0 && " · " + subs.length + " stand-in"}
            {others.length > 0 && " · " + others.length + " coach/analyst"}
          </div>
        </div>

        <span className="text-[#8B92A8] text-sm">{expanded ? "▼" : "▶"}</span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs px-2 py-1 rounded transition-colors"
        >
          🗑️
        </button>
      </div>

      {expanded && (
        <RosterPlayersManager
          roster={roster}
          tournamentGame={tournamentGame}
          maxMainPlayers={maxMainPlayers}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}

function RosterPlayersManager({
  roster,
  tournamentGame,
  maxMainPlayers,
  onRefresh,
}: {
  roster: Roster;
  tournamentGame: string;
  maxMainPlayers: number;
  onRefresh: () => void;
}) {
  const [showAdd, setShowAdd] = useState(false);

  const mainPlayers = roster.tournament_roster_players.filter((p) => p.role === "main");
  const subs = roster.tournament_roster_players.filter((p) => p.role === "substitute");
  const others = roster.tournament_roster_players.filter((p) => p.role === "coach" || p.role === "analyst");

  return (
    <div className="border-t border-white/5 p-3 space-y-2">
      {mainPlayers.length > 0 && (
        <div>
          <div className="text-xs text-[#8B92A8] mb-1 font-medium">🟢 Asosiy o&apos;yinchilar</div>
          {mainPlayers.map((rp) => (
            <RosterPlayerRow key={rp.id} rosterPlayer={rp} onRefresh={onRefresh} />
          ))}
        </div>
      )}

      {subs.length > 0 && (
        <div>
          <div className="text-xs text-yellow-400 mb-1 font-medium">🟡 Stand-in (zaxira)</div>
          {subs.map((rp) => (
            <RosterPlayerRow key={rp.id} rosterPlayer={rp} onRefresh={onRefresh} />
          ))}
        </div>
      )}

      {others.length > 0 && (
        <div>
          <div className="text-xs text-purple-400 mb-1 font-medium">👨‍🏫 Coach / Analitik</div>
          {others.map((rp) => (
            <RosterPlayerRow key={rp.id} rosterPlayer={rp} onRefresh={onRefresh} />
          ))}
        </div>
      )}

      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium py-2 rounded transition-colors mt-2"
        >
          + O&apos;yinchi qo&apos;shish
        </button>
      ) : (
        <AddPlayerForm
          rosterId={roster.id}
          teamId={roster.teams?.id || ""}
          tournamentGame={tournamentGame}
          existingPlayerIds={roster.tournament_roster_players.map((p) => p.players?.id).filter(Boolean) as string[]}
          mainPlayersCount={mainPlayers.length}
          maxMainPlayers={maxMainPlayers}
          onClose={() => {
            setShowAdd(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

function RosterPlayerRow({
  rosterPlayer,
  onRefresh,
}: {
  rosterPlayer: RosterPlayer;
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState(rosterPlayer.role);
  const [position, setPosition] = useState(rosterPlayer.position || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateRosterPlayerRole(rosterPlayer.id, role, position);
    if (result && "error" in result) {
      alert("Xato: " + result.error);
      setSaving(false);
      return;
    }
    setEditing(false);
    setSaving(false);
    onRefresh();
  };

  const handleRemove = async () => {
    if (!confirm(rosterPlayer.players?.nickname + " ni rosterdan olib tashlash?")) return;
    const result = await removePlayerFromRoster(rosterPlayer.id);
    if (result && "error" in result) {
      alert("Xato: " + result.error);
      return;
    }
    onRefresh();
  };

  if (!rosterPlayer.players) return null;

  if (editing) {
    return (
      <div className="bg-[#131929] border border-white/10 rounded p-2 my-1 space-y-2">
        <div className="font-bold text-sm">{rosterPlayer.players.nickname}</div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full bg-[#0A0E1A] border border-white/10 rounded px-2 py-1 text-xs text-white outline-none"
        >
          <option value="main">🟢 Asosiy o&apos;yinchi</option>
          <option value="substitute">🟡 Stand-in (zaxira)</option>
          <option value="coach">👨‍🏫 Trener</option>
          <option value="analyst">📊 Analitik</option>
        </select>
        <input
          type="text"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="Pozitsiya (AWPer, Mid...)"
          className="w-full bg-[#0A0E1A] border border-white/10 rounded px-2 py-1 text-xs text-white outline-none"
        />
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#FF6B35] hover:bg-[#FF8557] disabled:opacity-50 text-[#0A0E1A] font-bold text-xs py-1 rounded"
          >
            {saving ? "..." : "💾"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white rounded"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-1 px-2 hover:bg-white/5 rounded text-sm">
      <span className="font-medium">{rosterPlayer.players.nickname}</span>
      {rosterPlayer.position && (
        <span className="text-xs text-[#8B92A8]">({rosterPlayer.position})</span>
      )}
      <div className="flex-1"></div>
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-[#00D9FF] hover:underline"
      >
        ✏️
      </button>
      <button
        onClick={handleRemove}
        className="text-xs text-red-400 hover:underline"
      >
        🗑️
      </button>
    </div>
  );
}

function AddPlayerForm({
  rosterId,
  teamId,
  tournamentGame,
  existingPlayerIds,
  mainPlayersCount,
  maxMainPlayers,
  onClose,
}: {
  rosterId: string;
  teamId: string;
  tournamentGame: string;
  existingPlayerIds: string[];
  mainPlayersCount: number;
  maxMainPlayers: number;
  onClose: () => void;
}) {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [role, setRole] = useState(mainPlayersCount >= maxMainPlayers ? "substitute" : "main");
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // O'yinchilarni yuklash
  if (!loaded) {
    setLoaded(true);
    fetch("/api/players?game=" + encodeURIComponent(tournamentGame) + "&team=" + teamId)
      .then((r) => r.json())
      .then((data) => {
        setAllPlayers(data.players || []);
      })
      .catch(() => {
        // fallback - barcha o'yinchilarni olamiz
      });
  }

  const availablePlayers = allPlayers.filter((p) => !existingPlayerIds.includes(p.id));

  const handleAdd = async () => {
    if (!selectedPlayerId) {
      setError("O'yinchi tanlang");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await addPlayerToRoster(rosterId, selectedPlayerId, role, position);
    if (result && "error" in result) {
      setError(result.error ?? "Xato");
      setLoading(false);
      return;
    }

    onClose();
  };

  return (
    <div className="bg-[#131929] border border-[#FF6B35]/30 rounded p-3 mt-2 space-y-2">
      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded p-2 text-red-300 text-xs">
          {error}
        </div>
      )}

      <select
        value={selectedPlayerId}
        onChange={(e) => setSelectedPlayerId(e.target.value)}
        className="w-full bg-[#0A0E1A] border border-white/10 rounded px-2 py-1.5 text-sm text-white outline-none"
      >
        <option value="">— O&apos;yinchini tanlang —</option>
        {availablePlayers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nickname}{p.real_name ? " (" + p.real_name + ")" : ""}
          </option>
        ))}
      </select>

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full bg-[#0A0E1A] border border-white/10 rounded px-2 py-1.5 text-sm text-white outline-none"
      >
        <option value="main" disabled={mainPlayersCount >= maxMainPlayers}>
          🟢 Asosiy ({mainPlayersCount}/{maxMainPlayers})
        </option>
        <option value="substitute">🟡 Stand-in (zaxira)</option>
        <option value="coach">👨‍🏫 Trener</option>
        <option value="analyst">📊 Analitik</option>
      </select>

      <input
        type="text"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        placeholder="Pozitsiya (AWPer, Mid...)"
        className="w-full bg-[#0A0E1A] border border-white/10 rounded px-2 py-1.5 text-sm text-white outline-none"
      />

      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={loading}
          className="flex-1 bg-[#FF6B35] hover:bg-[#FF8557] disabled:opacity-50 text-[#0A0E1A] font-bold text-sm py-1.5 rounded"
        >
          {loading ? "..." : "➕ Qo'shish"}
        </button>
        <button
          onClick={onClose}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white rounded"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
