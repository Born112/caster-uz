"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type PlayerFormData = {
  nickname: string;
  real_name: string;
  city: string;
  bio: string;
  telegram_username: string;
  games: string[];
  is_verified: boolean;
};

async function checkAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tizimga kirish kerak" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: "Sizda admin huquqi yo'q" };
  }

  return { supabase };
}

export async function createPlayer(data: PlayerFormData) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };

  const { supabase } = auth;

  if (!data.nickname.trim()) {
    return { error: "Nickname kerak" };
  }

  if (data.games.length === 0) {
    return { error: "Kamida bitta o'yin tanlang" };
  }

  const { error } = await supabase.from("players").insert({
    nickname: data.nickname.trim(),
    real_name: data.real_name.trim() || null,
    city: data.city.trim() || null,
    bio: data.bio.trim() || null,
    telegram_username: data.telegram_username.trim() || null,
    games: data.games,
    is_verified: data.is_verified,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu Telegram username band - boshqasini tanlang" };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/players");
  revalidatePath("/");
  revalidatePath("/cs/players");
  revalidatePath("/dota/players");
  redirect("/admin/players");
}

export async function updatePlayer(id: string, data: PlayerFormData) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };

  const { supabase } = auth;

  if (!data.nickname.trim()) {
    return { error: "Nickname kerak" };
  }

  if (data.games.length === 0) {
    return { error: "Kamida bitta o'yin tanlang" };
  }

  const { error } = await supabase
    .from("players")
    .update({
      nickname: data.nickname.trim(),
      real_name: data.real_name.trim() || null,
      city: data.city.trim() || null,
      bio: data.bio.trim() || null,
      telegram_username: data.telegram_username.trim() || null,
      games: data.games,
      is_verified: data.is_verified,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu Telegram username band - boshqasini tanlang" };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/players");
  revalidatePath("/");
  revalidatePath("/cs/players");
  revalidatePath("/dota/players");
  redirect("/admin/players");
}
