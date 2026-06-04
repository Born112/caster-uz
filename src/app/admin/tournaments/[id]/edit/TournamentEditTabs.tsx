"use client";

import { useState } from "react";
import TournamentRostersManager from "../TournamentRostersManager";
import MatchesManager from "../MatchesManager";

type Roster = {
  id: string;
  seed: number | null;
  status: string;
  teams: { id: string; name: string; short_name: string | null; game: string } | null;
  tournament_roster_players: Array<{
    id: string;
    role: string;
    position: string | null;
    players: { id: string; nickname: string; real_name: string | null; games: string[] } | null;
  }>;
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
  match_maps: Array<{
    id: string;
    map_number: number;
    map_name: string;
    team1_side: string | null;
    team2_side: string | null;
    team1_score: number;
    team2_score: number;
    winner_roster_id: string | null;
    status: string;
  }>;
};

type Team = {
  id: string;
  name: string;
  short_name: string | null;
  game: string;
};

type Props = {
  tournamentId: string;
  tournamentGame: string;
  matchFormat: string;
  rosters: Roster[];
  allTeams: Team[];
  matches: Match[];
};

export default function TournamentEditTabs({
  tournamentId,
  tournamentGame,
  matchFormat,
  rosters,
  allTeams,
  matches,
}: Props) {
  const [activeTab, setActiveTab] = useState<"rosters" | "matches">("rosters");

  // Rosters'ni MatchesManager uchun moslashtirish
  const simplifiedRosters = rosters.map((r) => ({
    id: r.id,
    seed: r.seed,
    teams: r.teams ? { id: r.teams.id, name: r.teams.name, short_name: r.teams.short_name } : null,
  }));

  return (
    <div>
      <div className="bg-[#131929] border border-white/10 rounded-t-xl flex">
        <button
          onClick={() => setActiveTab("rosters")}
          className="flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2"
          style={{
            color: activeTab === "rosters" ? "#FFFFFF" : "#8B92A8",
            backgroundColor: activeTab === "rosters" ? "rgba(255,255,255,0.05)" : "transparent",
            borderBottomColor: activeTab === "rosters" ? "#FF6B35" : "transparent",
          }}
        >
          👥 Ishtirokchilar ({rosters.length})
        </button>
        <button
          onClick={() => setActiveTab("matches")}
          className="flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2"
          style={{
            color: activeTab === "matches" ? "#FFFFFF" : "#8B92A8",
            backgroundColor: activeTab === "matches" ? "rgba(255,255,255,0.05)" : "transparent",
            borderBottomColor: activeTab === "matches" ? "#FF6B35" : "transparent",
          }}
        >
          ⚔️ Matchlar ({matches.length})
        </button>
      </div>

      <div>
        {activeTab === "rosters" && (
          <TournamentRostersManager
            tournamentId={tournamentId}
            tournamentGame={tournamentGame}
            matchFormat={matchFormat}
            rosters={rosters}
            allTeams={allTeams}
          />
        )}

        {activeTab === "matches" && (
          <MatchesManager
            tournamentId={tournamentId}
            tournamentGame={tournamentGame}
            rosters={simplifiedRosters}
            matches={matches}
          />
        )}
      </div>
    </div>
  );
}
