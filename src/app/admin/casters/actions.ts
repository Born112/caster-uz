"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type CasterFormData = {
  nickname: string;
  real_name: string;
  city: string;
  bio: string;
  games: string[];
  is_verified: boolean;
  is_live: boolean;
  twitch_url: string;
  youtube_url: string;
  telegram_username: string;
  broadcasts_count: number;
  subscribers_count: number;
  rating: number;
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

export async function createCaster(data: CasterFormData) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };

  const { supabase } = auth;

  if (!data.nickname.trim()) {
    return { error: "Nickname kerak" };
  }

  if (data.games.length === 0) {
    return { error: "Kamida bitta o'yin tanlang" };
  }

  const { error } = await supabase.from("casters").insert({
    nickname: data.nickname.trim(),
    real_name: data.real_name.trim() || null,
    city: data.city.trim() || null,
    bio: data.bio.trim() || null,
    games: data.games,
    is_verified: data.is_verified,
    is_live: data.is_live,
    twitch_url: data.twitch_url.trim() || null,
    youtube_url: data.youtube_url.trim() || null,
    telegram_username: data.telegram_username.trim() || null,
    broadcasts_count: data.broadcasts_count,
    subscribers_count: data.subscribers_count,
    rating: data.rating,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu Telegram username band - boshqasini tanlang" };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/casters");
  revalidatePath("/");
  revalidatePath("/cs/casters");
  revalidatePath("/dota/casters");
  redirect("/admin/casters");
}

export async function updateCaster(id: string, data: CasterFormData) {
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
    .from("casters")
    .update({
      nickname: data.nickname.trim(),
      real_name: data.real_name.trim() || null,
      city: data.city.trim() || null,
      bio: data.bio.trim() || null,
      games: data.games,
      is_verified: data.is_verified,
      is_live: data.is_live,
      twitch_url: data.twitch_url.trim() || null,
      youtube_url: data.youtube_url.trim() || null,
      telegram_username: data.telegram_username.trim() || null,
      broadcasts_count: data.broadcasts_count,
      subscribers_count: data.subscribers_count,
      rating: data.rating,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu Telegram username band - boshqasini tanlang" };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/casters");
  revalidatePath("/");
  revalidatePath("/cs/casters");
  revalidatePath("/dota/casters");
  redirect("/admin/casters");
}

export async function deleteCaster(id: string) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };

  const { supabase } = auth;

  const { error } = await supabase.from("casters").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/casters");
  revalidatePath("/");
  revalidatePath("/cs/casters");
  revalidatePath("/dota/casters");
  return { success: true };
}
