"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type TeamFormData = {
  name: string;
  short_name: string;
  description: string;
  game: string;
  city: string;
  country: string;
  founded_year: number;
  is_active: boolean;
  website: string;
  telegram_url: string;
  instagram_url: string;
  total_matches: number;
  wins: number;
  losses: number;
  rating: number;
};

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tizimga kirish kerak" };

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return { error: "Sizda admin huquqi yo'q" };

  return { supabase };
}

export async function createTeam(data: TeamFormData) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  if (!data.name.trim()) return { error: "Jamoa nomi kerak" };
  if (!data.game) return { error: "O'yin tanlang" };

  const { error } = await supabase.from("teams").insert({
    name: data.name.trim(),
    short_name: data.short_name.trim() || null,
    description: data.description.trim() || null,
    game: data.game,
    city: data.city.trim() || null,
    country: data.country.trim() || "Uzbekistan",
    founded_year: data.founded_year || null,
    is_active: data.is_active,
    website: data.website.trim() || null,
    telegram_url: data.telegram_url.trim() || null,
    instagram_url: data.instagram_url.trim() || null,
    total_matches: data.total_matches,
    wins: data.wins,
    losses: data.losses,
    rating: data.rating,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/teams");
  revalidatePath("/");
  redirect("/admin/teams");
}

export async function updateTeam(id: string, data: TeamFormData) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  if (!data.name.trim()) return { error: "Jamoa nomi kerak" };

  const { error } = await supabase
    .from("teams")
    .update({
      name: data.name.trim(),
      short_name: data.short_name.trim() || null,
      description: data.description.trim() || null,
      game: data.game,
      city: data.city.trim() || null,
      country: data.country.trim() || "Uzbekistan",
      founded_year: data.founded_year || null,
      is_active: data.is_active,
      website: data.website.trim() || null,
      telegram_url: data.telegram_url.trim() || null,
      instagram_url: data.instagram_url.trim() || null,
      total_matches: data.total_matches,
      wins: data.wins,
      losses: data.losses,
      rating: data.rating,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/teams");
  revalidatePath("/");
  redirect("/admin/teams");
}

export async function deleteTeam(id: string) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/teams");
  revalidatePath("/");
  return { success: true };
}
