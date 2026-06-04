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
// JAMOA QO'SHISH/O'CHIRISH
// ============================================

export async function addTeamToTournament(tournamentId: string, teamId: string, seed?: number) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("tournament_rosters")
    .insert({
      tournament_id: tournamentId,
      team_id: teamId,
      seed: seed || null,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu jamoa allaqachon turnirda" };
    }
    return { error: error.message };
  }

  // Turnir jamoalar sonini yangilash
  const { count } = await supabase
    .from("tournament_rosters")
    .select("*", { count: "exact", head: true })
    .eq("tournament_id", tournamentId);

  if (count !== null) {
    await supabase
      .from("tournaments")
      .update({ teams_count: count })
      .eq("id", tournamentId);
  }

  revalidatePath("/admin/tournaments");
  revalidatePath("/");
  return { success: true, roster: data };
}

export async function removeTeamFromTournament(rosterId: string) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  // Tournament ID olish (count yangilash uchun)
  const { data: roster } = await supabase
    .from("tournament_rosters")
    .select("tournament_id")
    .eq("id", rosterId)
    .single();

  const { error } = await supabase.from("tournament_rosters").delete().eq("id", rosterId);
  if (error) return { error: error.message };

  if (roster) {
    const { count } = await supabase
      .from("tournament_rosters")
      .select("*", { count: "exact", head: true })
      .eq("tournament_id", roster.tournament_id);

    if (count !== null) {
      await supabase
        .from("tournaments")
        .update({ teams_count: count })
        .eq("id", roster.tournament_id);
    }
  }

  revalidatePath("/admin/tournaments");
  revalidatePath("/");
  return { success: true };
}

export async function updateRosterSeed(rosterId: string, seed: number | null) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  const { error } = await supabase
    .from("tournament_rosters")
    .update({ seed })
    .eq("id", rosterId);

  if (error) return { error: error.message };

  revalidatePath("/admin/tournaments");
  return { success: true };
}

// ============================================
// O'YINCHILAR QO'SHISH/O'CHIRISH
// ============================================

export async function addPlayerToRoster(
  rosterId: string,
  playerId: string,
  role: string = "main",
  position?: string
) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  const { error } = await supabase.from("tournament_roster_players").insert({
    roster_id: rosterId,
    player_id: playerId,
    role,
    position: position?.trim() || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu o'yinchi allaqachon ro'yxatda" };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/tournaments");
  return { success: true };
}

export async function updateRosterPlayerRole(
  rosterPlayerId: string,
  role: string,
  position?: string
) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  const { error } = await supabase
    .from("tournament_roster_players")
    .update({
      role,
      position: position?.trim() || null,
    })
    .eq("id", rosterPlayerId);

  if (error) return { error: error.message };

  revalidatePath("/admin/tournaments");
  return { success: true };
}

export async function removePlayerFromRoster(rosterPlayerId: string) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  const { error } = await supabase
    .from("tournament_roster_players")
    .delete()
    .eq("id", rosterPlayerId);

  if (error) return { error: error.message };

  revalidatePath("/admin/tournaments");
  return { success: true };
}
