"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type NationalTeamFormData = {
  name: string;
  region: string;
  description: string;
  game: string;
  is_active: boolean;
  total_tournaments: number;
};

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tizimga kirish kerak" };

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return { error: "Sizda admin huquqi yo'q" };

  return { supabase };
}

export async function createNationalTeam(data: NationalTeamFormData) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  if (!data.name.trim()) return { error: "Terma jamoa nomi kerak" };
  if (!data.game) return { error: "O'yin tanlang" };
  if (!data.region) return { error: "Tur tanlang (national/regional)" };

  const { error } = await supabase.from("national_teams").insert({
    name: data.name.trim(),
    region: data.region,
    description: data.description.trim() || null,
    game: data.game,
    is_active: data.is_active,
    total_tournaments: data.total_tournaments,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/national-teams");
  redirect("/admin/national-teams");
}

export async function updateNationalTeam(id: string, data: NationalTeamFormData) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  if (!data.name.trim()) return { error: "Terma jamoa nomi kerak" };

  const { error } = await supabase
    .from("national_teams")
    .update({
      name: data.name.trim(),
      region: data.region,
      description: data.description.trim() || null,
      game: data.game,
      is_active: data.is_active,
      total_tournaments: data.total_tournaments,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/national-teams");
  redirect("/admin/national-teams");
}

export async function deleteNationalTeam(id: string) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  const { error } = await supabase.from("national_teams").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/national-teams");
  return { success: true };
}
