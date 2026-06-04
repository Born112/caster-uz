"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type TournamentFormData = {
  name: string;
  description: string;
  game: string;
  status: string;
  match_format: string;
  start_date: string;
  end_date: string;
  location: string;
  is_online: boolean;
  prize_fund: number;
  teams_count: number;
  max_teams: number;
  organizer: string;
  stream_url: string;
  winner: string;
  runner_up: string;
  third_place: string;
};

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tizimga kirish kerak" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { error: "Sizda admin huquqi yo'q" };

  return { supabase };
}

export async function createTournament(data: TournamentFormData) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };

  const { supabase } = auth;

  if (!data.name.trim()) return { error: "Turnir nomi kerak" };
  if (!data.game) return { error: "O'yin tanlang" };
  if (!data.start_date) return { error: "Boshlanish sanasi kerak" };

  const { error } = await supabase.from("tournaments").insert({
    name: data.name.trim(),
    description: data.description.trim() || null,
    game: data.game,
    status: data.status,
    match_format: data.match_format,
    start_date: data.start_date,
    end_date: data.end_date || null,
    location: data.location.trim() || null,
    is_online: data.is_online,
    prize_fund: data.prize_fund,
    teams_count: data.teams_count,
    max_teams: data.max_teams || null,
    organizer: data.organizer.trim() || null,
    stream_url: data.stream_url.trim() || null,
    winner: data.winner.trim() || null,
    runner_up: data.runner_up.trim() || null,
    third_place: data.third_place.trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/tournaments");
  revalidatePath("/");
  revalidatePath("/cs/tournaments");
  revalidatePath("/dota/tournaments");
  redirect("/admin/tournaments");
}

export async function updateTournament(id: string, data: TournamentFormData) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };

  const { supabase } = auth;

  if (!data.name.trim()) return { error: "Turnir nomi kerak" };
  if (!data.start_date) return { error: "Boshlanish sanasi kerak" };

  const { error } = await supabase
    .from("tournaments")
    .update({
      name: data.name.trim(),
      description: data.description.trim() || null,
      game: data.game,
      status: data.status,
      match_format: data.match_format,
      start_date: data.start_date,
      end_date: data.end_date || null,
      location: data.location.trim() || null,
      is_online: data.is_online,
      prize_fund: data.prize_fund,
      teams_count: data.teams_count,
      max_teams: data.max_teams || null,
      organizer: data.organizer.trim() || null,
      stream_url: data.stream_url.trim() || null,
      winner: data.winner.trim() || null,
      runner_up: data.runner_up.trim() || null,
      third_place: data.third_place.trim() || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/tournaments");
  revalidatePath("/");
  revalidatePath("/cs/tournaments");
  revalidatePath("/dota/tournaments");
  redirect("/admin/tournaments");
}

export async function deleteTournament(id: string) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };

  const { supabase } = auth;

  const { error } = await supabase.from("tournaments").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/tournaments");
  revalidatePath("/");
  revalidatePath("/cs/tournaments");
  revalidatePath("/dota/tournaments");
  return { success: true };
}
