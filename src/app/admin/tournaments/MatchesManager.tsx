"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createMatch,
  updateMatch,
  deleteMatch,
  addMatchMap,
  updateMatchMap,
  deleteMatchMap,
} from "./match-actions";

// CS 1.6 kartalari
const CS_MAPS = ["de_dust2", "de_nuke", "de_train", "de_inferno", "de_tuscan"];
const CS_SIDES = ["CT", "T"];
const DOTA_SIDES = ["Sentinel", "Scourge"];

type Roster = {
  id: string;
  seed: number | null;
  teams: { id: string; name: string; short_name: string | null } | null;
};

type MatchMap = {
  id: string;
  map_number: number;
  map_name: string;
  team1_side: string | null;
  team2_side: string | null;
  team1_score: number;
  team2_score: number;
  winner_roster_id: string | null;
  status: string;
};

type Match = {
  id: string;
  team1_roster_id: string;
  team2_roster_id: string;
  best_of: number;
  status: string;
  stage: string | null;
  scheduled_at: string | null;
  team1_score: number;
  team2_score: number;
  winner_roster_id: string | null;
  match_maps: MatchMap[];
};

type Props = {
  tournamentId: string;
  tournamentGame: string;
  rosters: Roster[];
  matches: Match[];
};

function getRoster(rosters: Roster[], id: string) {
  return rosters.find((r) => r.id === id);
}

function getTeamName(rosters: Roster[], id: string) {
  const r = getRoster(rosters, id);
  return r?.teams?.short_name || r?.teams?.name || "—";
}

export default function MatchesManager({ tournamentId, tournamentGame, rosters, matches }: Props) {
  const router = useRouter();
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  if (rosters.length < 2) {
    return (
      <div className="bg-[#131929] border border-yellow-500/30 rounded-xl p-4">
        <p className="text-yellow-300 text-sm">
          ⚠️ Avval kamida 2 ta jamoa qo&apos;shing (Ishtirokchilar tab)
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#131929] border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold flex items-center gap-2">
          <span>⚔️</span> Matchlar
          <span className="text-xs font-normal text-[#8B92A8]">({matches.length})</span>
        </h3>
        {!showAddMatch && (
          <button
            onClick={() => setShowAddMatch(true)}
            className="bg-[#FF6B35] hover:bg-[#FF8557] text-[#0A0E1A] text-sm font-bold px-3 py-1.5 rounded-md transition-colors"
          >
            ➕ Match qo&apos;shish
          </button>
        )}
      </div>

      {showAddMatch && (
        <AddMatchForm
          tournamentId={tournamentId}
          rosters={rosters}
          onClose={() => {
            setShowAddMatch(false);
            router.refresh();
          }}
        />
      )}

      {matches.length === 0 && !showAddMatch && (
        <div className="text-center py-8 text-[#8B92A8] text-sm">
          <div className="text-4xl mb-2">⚔️</div>
          <p>Hozircha matchlar yo&apos;q</p>
          <p className="text-xs mt-1">Yuqoridagi tugma bilan qo&apos;shing</p>
        </div>
      )}

      <div className="space-y-3 mt-3">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            rosters={rosters}
            tournamentGame={tournamentGame}
            expanded={expandedMatchId === match.id}
            onToggle={() => setExpandedMatchId(expandedMatchId === match.id ? null : match.id)}
            onRefresh={() => router.refresh()}
          />
        ))}
      </div>
    </div>
  );
}

function AddMatchForm({
  tournamentId,
  rosters,
  onClose,
}: {
  tournamentId: string;
  rosters: Roster[];
  onClose: () => void;
}) {
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [bestOf, setBestOf] = useState(3);
  const [stage, setStage] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!team1 || !team2) {
      setError("Ikkala jamoani tanlang");
      return;
    }
    if (team1 === team2) {
      setError("Jamoalar bir xil bo'la olmaydi");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await createMatch({
      tournament_id: tournamentId,
      team1_roster_id: team1,
      team2_roster_id: team2,
      best_of: bestOf,
      stage,
      scheduled_at: scheduledAt,
    });

    if (result && "error" in result) {
      setError(result.error ?? "Xato");
      setLoading(false);
      return;
    }

    onClose();
  };

  return (
    <div className="bg-[#0A0E1A] border border-white/10 rounded-md p-3 mb-3 space-y-3">
      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded p-2 text-red-300 text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-[#8B92A8] mb-1">1-jamoa *</label>
          <select
            value={team1}
            onChange={(e) => setTeam1(e.target.value)}
            className="w-full bg-[#131929] border border-white/10 rounded px-2 py-2 text-sm text-white outline-none"
          >
            <option value="">— Tanlang —</option>
            {rosters.map((r) => (
              <option key={r.id} value={r.id} disabled={r.id === team2}>
                {r.teams?.name || "Noma'lum"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#8B92A8] mb-1">2-jamoa *</label>
          <select
            value={team2}
            onChange={(e) => setTeam2(e.target.value)}
            className="w-full bg-[#131929] border border-white/10 rounded px-2 py-2 text-sm text-white outline-none"
          >
            <option value="">— Tanlang —</option>
            {rosters.map((r) => (
              <option key={r.id} value={r.id} disabled={r.id === team1}>
                {r.teams?.name || "Noma'lum"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-[#8B92A8] mb-1">Format</label>
        <div className="grid grid-cols-4 gap-1">
          {[1, 3, 5, 7].map((bo) => (
            <button
              key={bo}
              type="button"
              onClick={() => setBestOf(bo)}
              className="py-1.5 rounded text-sm font-bold transition-colors"
              style={{
                backgroundColor: bestOf === bo ? "#FF6B35" : "rgba(255,255,255,0.05)",
                color: bestOf === bo ? "#0A0E1A" : "#8B92A8",
              }}
            >
              BO{bo}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-[#8B92A8] mb-1">Bosqich (ixtiyoriy)</label>
        <input
          type="text"
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          placeholder="Group A, Quarterfinal, Final..."
          className="w-full bg-[#131929] border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-[#5A6178] outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-[#8B92A8] mb-1">Sana va vaqt (ixtiyoriy)</label>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="w-full bg-[#131929] border border-white/10 rounded px-3 py-2 text-sm text-white outline-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={loading}
          className="flex-1 bg-[#FF6B35] hover:bg-[#FF8557] disabled:opacity-50 text-[#0A0E1A] font-bold text-sm py-2 rounded-md"
        >
          {loading ? "..." : "➕ Yaratish"}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white rounded-md"
        >
          Bekor
        </button>
      </div>
    </div>
  );
}

function MatchCard({
  match,
  rosters,
  tournamentGame,
  expanded,
  onToggle,
  onRefresh,
}: {
  match: Match;
  rosters: Roster[];
  tournamentGame: string;
  expanded: boolean;
  onToggle: () => void;
  onRefresh: () => void;
}) {
  const team1Name = getTeamName(rosters, match.team1_roster_id);
  const team2Name = getTeamName(rosters, match.team2_roster_id);

  const statusColor = {
    upcoming: "#00E676",
    live: "#FF3D71",
    completed: "#8B92A8",
    cancelled: "#FF6B35",
  }[match.status] || "#8B92A8";

  const statusLabel = {
    upcoming: "🟢 Kelajak",
    live: "🔴 LIVE",
    completed: "⚫ Tugagan",
    cancelled: "❌ Bekor",
  }[match.status] || match.status;

  const handleDelete = async () => {
    if (!confirm(team1Name + " vs " + team2Name + " match'ini o'chirmoqchimisiz?")) return;
    const result = await deleteMatch(match.id);
    if (result && "error" in result) {
      alert("Xato: " + result.error);
      return;
    }
    onRefresh();
  };

  return (
    <div className="bg-[#0A0E1A] border border-white/10 rounded-md overflow-hidden">
      <div
        className="p-3 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded"
            style={{ backgroundColor: statusColor + "20", color: statusColor }}
          >
            {statusLabel}
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/5 text-white">
            BO{match.best_of}
          </span>
          {match.stage && (
            <span className="text-xs text-[#8B92A8]">{match.stage}</span>
          )}
          <div className="flex-1"></div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="text-xs text-red-400 hover:underline"
          >
            🗑️
          </button>
          <span className="text-[#8B92A8] text-sm">{expanded ? "▼" : "▶"}</span>
        </div>

        <div className="grid grid-cols-3 items-center gap-2">
          <div className="text-right">
            <div className="font-bold truncate">{team1Name}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: match.status === "completed" ? "#FF6B35" : "#FFFFFF" }}>
              {match.team1_score} : {match.team2_score}
            </div>
          </div>
          <div className="text-left">
            <div className="font-bold truncate">{team2Name}</div>
          </div>
        </div>

        {match.scheduled_at && (
          <div className="text-xs text-[#8B92A8] text-center mt-1">
            📅 {new Date(match.scheduled_at).toLocaleString("uz-UZ", {
              day: "2-digit", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </div>
        )}
      </div>

      {expanded && (
        <MatchMapsManager
          match={match}
          rosters={rosters}
          tournamentGame={tournamentGame}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}

function MatchMapsManager({
  match,
  rosters,
  tournamentGame,
  onRefresh,
}: {
  match: Match;
  rosters: Roster[];
  tournamentGame: string;
  onRefresh: () => void;
}) {
  const [showAddMap, setShowAddMap] = useState(false);
  const sortedMaps = [...match.match_maps].sort((a, b) => a.map_number - b.map_number);
  const nextMapNumber = sortedMaps.length + 1;
  const canAddMore = sortedMaps.length < match.best_of;

  return (
    <div className="border-t border-white/5 p-3 space-y-2">
      {sortedMaps.length === 0 && !showAddMap && (
        <div className="text-center py-3 text-[#8B92A8] text-xs">
          Hozircha kartalar qo&apos;shilmagan
        </div>
      )}

      {sortedMaps.map((map) => (
        <MapRow
          key={map.id}
          map={map}
          match={match}
          rosters={rosters}
          tournamentGame={tournamentGame}
          onRefresh={onRefresh}
        />
      ))}

      {showAddMap ? (
        <AddMapForm
          matchId={match.id}
          mapNumber={nextMapNumber}
          team1RosterId={match.team1_roster_id}
          team2RosterId={match.team2_roster_id}
          rosters={rosters}
          tournamentGame={tournamentGame}
          onClose={() => {
            setShowAddMap(false);
            onRefresh();
          }}
        />
      ) : (
        canAddMore && (
          <button
            onClick={() => setShowAddMap(true)}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium py-2 rounded transition-colors"
          >
            + Karta qo&apos;shish ({sortedMaps.length + 1}/{match.best_of})
          </button>
        )
      )}
    </div>
  );
}

function MapRow({
  map,
  match,
  rosters,
  tournamentGame,
  onRefresh,
}: {
  map: MatchMap;
  match: Match;
  rosters: Roster[];
  tournamentGame: string;
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState(false);

  const team1Name = getTeamName(rosters, match.team1_roster_id);
  const team2Name = getTeamName(rosters, match.team2_roster_id);

  const handleDelete = async () => {
    if (!confirm("Bu kartani o'chirmoqchimisiz?")) return;
    const result = await deleteMatchMap(map.id);
    if (result && "error" in result) {
      alert("Xato: " + result.error);
      return;
    }
    onRefresh();
  };

  if (editing) {
    return (
      <EditMapForm
        map={map}
        match={match}
        rosters={rosters}
        tournamentGame={tournamentGame}
        onClose={() => {
          setEditing(false);
          onRefresh();
        }}
      />
    );
  }

  const winnerName = map.winner_roster_id === match.team1_roster_id ? team1Name :
                     map.winner_roster_id === match.team2_roster_id ? team2Name : null;

  return (
    <div className="bg-[#131929] border border-white/10 rounded p-2 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="bg-white/5 text-xs px-2 py-0.5 rounded">#{map.map_number}</span>
        <span className="font-bold">{map.map_name}</span>
        <div className="flex-1"></div>
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-[#00D9FF] hover:underline"
        >
          ✏️
        </button>
        <button onClick={handleDelete} className="text-xs text-red-400 hover:underline">
          🗑️
        </button>
      </div>

      <div className="grid grid-cols-3 items-center gap-2 text-xs">
        <div className="text-right">
          <div className="font-medium">{team1Name}</div>
          {map.team1_side && <div className="text-[#8B92A8]">({map.team1_side})</div>}
        </div>
        <div className="text-center">
          <div className="text-xl font-bold">
            {map.team1_score} : {map.team2_score}
          </div>
        </div>
        <div className="text-left">
          <div className="font-medium">{team2Name}</div>
          {map.team2_side && <div className="text-[#8B92A8]">({map.team2_side})</div>}
        </div>
      </div>

      {winnerName && (
        <div className="text-center text-xs mt-1" style={{ color: "#00E676" }}>
          🏆 G&apos;olib: {winnerName}
        </div>
      )}
    </div>
  );
}

function AddMapForm({
  matchId,
  mapNumber,
  team1RosterId,
  team2RosterId,
  rosters,
  tournamentGame,
  onClose,
}: {
  matchId: string;
  mapNumber: number;
  team1RosterId: string;
  team2RosterId: string;
  rosters: Roster[];
  tournamentGame: string;
  onClose: () => void;
}) {
  const isCS = tournamentGame === "CS 1.6";
  const sides = isCS ? CS_SIDES : DOTA_SIDES;

  const [mapName, setMapName] = useState(isCS ? CS_MAPS[0] : "");
  const [team1Side, setTeam1Side] = useState(sides[0]);
  const [team2Side, setTeam2Side] = useState(sides[1]);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [status, setStatus] = useState("completed");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const team1Name = getTeamName(rosters, team1RosterId);
  const team2Name = getTeamName(rosters, team2RosterId);

  const handleAdd = async () => {
    if (!mapName.trim()) {
      setError("Karta nomi kerak");
      return;
    }

    setLoading(true);
    setError(null);

    let winnerRosterId: string | null = null;
    if (status === "completed") {
      if (team1Score > team2Score) winnerRosterId = team1RosterId;
      else if (team2Score > team1Score) winnerRosterId = team2RosterId;
    }

    const result = await addMatchMap({
      match_id: matchId,
      map_number: mapNumber,
      map_name: mapName,
      team1_side: team1Side,
      team2_side: team2Side,
      team1_score: team1Score,
      team2_score: team2Score,
      winner_roster_id: winnerRosterId,
      status,
    });

    if (result && "error" in result) {
      setError(result.error ?? "Xato");
      setLoading(false);
      return;
    }

    onClose();
  };

  return (
    <div className="bg-[#0A0E1A] border border-[#FF6B35]/30 rounded p-3 space-y-2">
      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded p-2 text-red-300 text-xs">
          {error}
        </div>
      )}

      <div className="text-xs text-[#8B92A8]">Karta #{mapNumber}</div>

      <div>
        <label className="block text-xs text-[#8B92A8] mb-1">Karta nomi</label>
        {isCS ? (
          <select
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
            className="w-full bg-[#131929] border border-white/10 rounded px-2 py-1.5 text-sm text-white outline-none"
          >
            {CS_MAPS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
            placeholder="Dota Allstars 6.71"
            className="w-full bg-[#131929] border border-white/10 rounded px-2 py-1.5 text-sm text-white outline-none"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-[#8B92A8] mb-1">{team1Name} tomon</label>
          <select
            value={team1Side}
            onChange={(e) => setTeam1Side(e.target.value)}
            className="w-full bg-[#131929] border border-white/10 rounded px-2 py-1.5 text-sm text-white outline-none"
          >
            {sides.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#8B92A8] mb-1">{team2Name} tomon</label>
          <select
            value={team2Side}
            onChange={(e) => setTeam2Side(e.target.value)}
            className="w-full bg-[#131929] border border-white/10 rounded px-2 py-1.5 text-sm text-white outline-none"
          >
            {sides.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-[#8B92A8] mb-1">{team1Name} hisob</label>
          <input
            type="number"
            value={team1Score}
            onChange={(e) => setTeam1Score(parseInt(e.target.value) || 0)}
            min={0}
            className="w-full bg-[#131929] border border-white/10 rounded px-2 py-1.5 text-sm text-white outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-[#8B92A8] mb-1">{team2Name} hisob</label>
          <input
            type="number"
            value={team2Score}
            onChange={(e) => setTeam2Score(parseInt(e.target.value) || 0)}
            min={0}
            className="w-full bg-[#131929] border border-white/10 rounded px-2 py-1.5 text-sm text-white outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-[#8B92A8] mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full bg-[#131929] border border-white/10 rounded px-2 py-1.5 text-sm text-white outline-none"
        >
          <option value="upcoming">🟢 Kelajakdagi</option>
          <option value="live">🔴 LIVE (o&apos;ynalmoqda)</option>
          <option value="completed">⚫ Tugagan</option>
        </select>
      </div>

      <div className="flex gap-2 pt-1">
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

function EditMapForm({
  map,
  match,
  rosters,
  tournamentGame,
  onClose,
}: {
  map: MatchMap;
  match: Match;
  rosters: Roster[];
  tournamentGame: string;
  onClose: () => void;
}) {
  const isCS = tournamentGame === "CS 1.6";
  const sides = isCS ? CS_SIDES : DOTA_SIDES;

  const [mapName, setMapName] = useState(map.map_name);
  const [team1Side, setTeam1Side] = useState(map.team1_side || sides[0]);
  const [team2Side, setTeam2Side] = useState(map.team2_side || sides[1]);
  const [team1Score, setTeam1Score] = useState(map.team1_score);
  const [team2Score, setTeam2Score] = useState(map.team2_score);
  const [status, setStatus] = useState(map.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const team1Name = getTeamName(rosters, match.team1_roster_id);
  const team2Name = getTeamName(rosters, match.team2_roster_id);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    let winnerRosterId: string | null = null;
    if (status === "completed") {
      if (team1Score > team2Score) winnerRosterId = match.team1_roster_id;
      else if (team2Score > team1Score) winnerRosterId = match.team2_roster_id;
    }

    const result = await updateMatchMap(map.id, {
      map_name: mapName,
      team1_side: team1Side,
      team2_side: team2Side,
      team1_score: team1Score,
      team2_score: team2Score,
      winner_roster_id: winnerRosterId,
      status,
    });

    if (result && "error" in result) {
      setError(result.error ?? "Xato");
      setLoading(false);
      return;
    }

    onClose();
  };

  return (
    <div className="bg-[#0A0E1A] border border-[#00D9FF]/30 rounded p-3 space-y-2">
      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded p-2 text-red-300 text-xs">
          {error}
        </div>
      )}

      <div className="text-xs text-[#8B92A8]">Tahrirlash: Karta #{map.map_number}</div>

      <div>
        <label className="block text-xs text-[#8B92A8] mb-1">Karta nomi</label>
        {isCS ? (
          <select
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
            className="w-full bg-[#131929] border border-white/10 rounded px-2 py-1.5 text-sm text-white outline-none"
          >
            {CS_MAPS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
            className="w-full bg-[#131929] border border-white/10 rounded px-2 py-1.5 text-sm text-white outline-none"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select
          value={team1Side}
          onChange={(e) => setTeam1Side(e.target.value)}
          className="w-full bg-[#131929] border border-white/10 rounded px-2 py-1.5 text-sm text-white outline-none"
        >
          {sides.map((s) => (
            <option key={s} value={s}>{team1Name}: {s}</option>
          ))}
        </select>
        <select
          value={team2Side}
          onChange={(e) => setTeam2Side(e.target.value)}
          className="w-full bg-[#131929] border border-white/10 rounded px-2 py-1.5 text-sm text-white outline-none"
        >
          {sides.map((s) => (
            <option key={s} value={s}>{team2Name}: {s}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          value={team1Score}
          onChange={(e) => setTeam1Score(parseInt(e.target.value) || 0)}
          min={0}
          placeholder={team1Name + " hisob"}
          className="w-full bg-[#131929] border border-white/10 rounded px-2 py-1.5 text-sm text-white outline-none"
        />
        <input
          type="number"
          value={team2Score}
          onChange={(e) => setTeam2Score(parseInt(e.target.value) || 0)}
          min={0}
          placeholder={team2Name + " hisob"}
          className="w-full bg-[#131929] border border-white/10 rounded px-2 py-1.5 text-sm text-white outline-none"
        />
      </div>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full bg-[#131929] border border-white/10 rounded px-2 py-1.5 text-sm text-white outline-none"
      >
        <option value="upcoming">🟢 Kelajakdagi</option>
        <option value="live">🔴 LIVE</option>
        <option value="completed">⚫ Tugagan</option>
      </select>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 bg-[#00D9FF] hover:bg-[#33E0FF] disabled:opacity-50 text-[#0A0E1A] font-bold text-sm py-1.5 rounded"
        >
          {loading ? "..." : "💾 Saqlash"}
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
