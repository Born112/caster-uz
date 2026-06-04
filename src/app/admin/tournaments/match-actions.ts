"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tizimga kirish kerak" };

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return { error: "Sizda admin huquqi yo'q" };

  return { supabase };
}

// ============================================
// MATCH YARATISH/O'CHIRISH
// ============================================

export async function createMatch(data: {
  tournament_id: string;
  team1_roster_id: string;
  team2_roster_id: string;
  best_of: number;
  stage: string;
  scheduled_at: string;
}) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  if (data.team1_roster_id === data.team2_roster_id) {
    return { error: "Jamoalar bir xil bo'la olmaydi" };
  }

  const { data: match, error } = await supabase
    .from("matches")
    .insert({
      tournament_id: data.tournament_id,
      team1_roster_id: data.team1_roster_id,
      team2_roster_id: data.team2_roster_id,
      best_of: data.best_of,
      stage: data.stage.trim() || null,
      scheduled_at: data.scheduled_at || null,
      status: "upcoming",
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/tournaments");
  revalidatePath("/");
  return { success: true, match };
}

export async function updateMatch(id: string, data: {
  best_of: number;
  status: string;
  stage: string;
  scheduled_at: string;
  team1_score: number;
  team2_score: number;
  winner_roster_id: string | null;
}) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  const { error } = await supabase
    .from("matches")
    .update({
      best_of: data.best_of,
      status: data.status,
      stage: data.stage.trim() || null,
      scheduled_at: data.scheduled_at || null,
      team1_score: data.team1_score,
      team2_score: data.team2_score,
      winner_roster_id: data.winner_roster_id,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/tournaments");
  revalidatePath("/");
  return { success: true };
}

export async function deleteMatch(id: string) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  const { error } = await supabase.from("matches").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/tournaments");
  revalidatePath("/");
  return { success: true };
}

// ============================================
// MAP NATIJALARI
// ============================================

export async function addMatchMap(data: {
  match_id: string;
  map_number: number;
  map_name: string;
  team1_side: string;
  team2_side: string;
  team1_score: number;
  team2_score: number;
  winner_roster_id: string | null;
  status: string;
}) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  const { error } = await supabase.from("match_maps").insert({
    match_id: data.match_id,
    map_number: data.map_number,
    map_name: data.map_name.trim(),
    team1_side: data.team1_side || null,
    team2_side: data.team2_side || null,
    team1_score: data.team1_score,
    team2_score: data.team2_score,
    winner_roster_id: data.winner_roster_id,
    status: data.status,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu karta raqami allaqachon bor" };
    }
    return { error: error.message };
  }

  await recalculateMatchScore(data.match_id);

  revalidatePath("/admin/tournaments");
  revalidatePath("/");
  return { success: true };
}

export async function updateMatchMap(id: string, data: {
  map_name: string;
  team1_side: string;
  team2_side: string;
  team1_score: number;
  team2_score: number;
  winner_roster_id: string | null;
  status: string;
}) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  // Avval match_id ni olamiz
  const { data: mapData } = await supabase
    .from("match_maps")
    .select("match_id")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("match_maps")
    .update({
      map_name: data.map_name.trim(),
      team1_side: data.team1_side || null,
      team2_side: data.team2_side || null,
      team1_score: data.team1_score,
      team2_score: data.team2_score,
      winner_roster_id: data.winner_roster_id,
      status: data.status,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  if (mapData) {
    await recalculateMatchScore(mapData.match_id);
  }

  revalidatePath("/admin/tournaments");
  revalidatePath("/");
  return { success: true };
}

export async function deleteMatchMap(id: string) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  const { data: mapData } = await supabase
    .from("match_maps")
    .select("match_id")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("match_maps").delete().eq("id", id);
  if (error) return { error: error.message };

  if (mapData) {
    await recalculateMatchScore(mapData.match_id);
  }

  revalidatePath("/admin/tournaments");
  revalidatePath("/");
  return { success: true };
}

// Match hisobini avtomatik hisoblash
async function recalculateMatchScore(matchId: string) {
  const supabase = (await checkAdmin()).supabase;
  if (!supabase) return;

  // Match va uning teams'larini olamiz
  const { data: match } = await supabase
    .from("matches")
    .select("team1_roster_id, team2_roster_id, best_of")
    .eq("id", matchId)
    .single();

  if (!match) return;

  // Barcha mapları olamiz
  const { data: maps } = await supabase
    .from("match_maps")
    .select("winner_roster_id, status")
    .eq("match_id", matchId);

  if (!maps) return;

  let team1Wins = 0;
  let team2Wins = 0;

  maps.forEach((m) => {
    if (m.status === "completed" && m.winner_roster_id) {
      if (m.winner_roster_id === match.team1_roster_id) team1Wins++;
      if (m.winner_roster_id === match.team2_roster_id) team2Wins++;
    }
  });

  // G'olibni aniqlash (BO3 da 2 ta yutuq kerak, BO5 da 3 ta)
  const winsNeeded = Math.ceil(match.best_of / 2);
  let winnerRosterId: string | null = null;
  let newStatus = "live";

  if (team1Wins >= winsNeeded) {
    winnerRosterId = match.team1_roster_id;
    newStatus = "completed";
  } else if (team2Wins >= winsNeeded) {
    winnerRosterId = match.team2_roster_id;
    newStatus = "completed";
  }

  // Match'ni yangilash
  await supabase
    .from("matches")
    .update({
      team1_score: team1Wins,
      team2_score: team2Wins,
      winner_roster_id: winnerRosterId,
      status: newStatus,
    })
    .eq("id", matchId);
}
