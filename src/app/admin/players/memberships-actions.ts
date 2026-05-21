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
// KLUB A'ZOLIGI
// ============================================

export type TeamMembershipData = {
  player_id: string;
  team_id: string;
  position: string;
  jersey_number: number | null;
  role: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  notes: string;
};

export async function addTeamMembership(data: TeamMembershipData) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  if (!data.player_id || !data.team_id) return { error: "O'yinchi va jamoa kerak" };
  if (!data.start_date) return { error: "Boshlanish sanasi kerak" };

  // Klub uchun: yangi klub qo'shganda eski hozirgi klubni "tarixiy" qilamiz
  // (chunki o'yinchi bitta vaqtda faqat bitta klubda o'ynay oladi)
  if (data.is_current) {
    // Yangi qo'shilayotgan klubning o'yinini olamiz
    const { data: newTeam } = await supabase
      .from("teams")
      .select("game")
      .eq("id", data.team_id)
      .single();

    if (newTeam) {
      // Faqat shu o'yindagi eski "hozirgi" klubni tugatamiz
      const { data: oldMemberships } = await supabase
        .from("team_memberships")
        .select("id, teams(game)")
        .eq("player_id", data.player_id)
        .eq("is_current", true);

      if (oldMemberships) {
        for (const old of oldMemberships) {
          // @ts-expect-error - teams is joined
          if (old.teams?.game === newTeam.game) {
            await supabase
              .from("team_memberships")
              .update({ is_current: false, end_date: data.start_date })
              .eq("id", old.id);
          }
        }
      }
    }
  }

  const { error } = await supabase.from("team_memberships").insert({
    player_id: data.player_id,
    team_id: data.team_id,
    position: data.position.trim() || null,
    jersey_number: data.jersey_number,
    role: data.role,
    start_date: data.start_date,
    end_date: data.is_current ? null : data.end_date,
    is_current: data.is_current,
    notes: data.notes.trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/players");
  revalidatePath("/");
  return { success: true };
}

export async function updateTeamMembership(id: string, data: TeamMembershipData) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  if (data.is_current) {
    const { data: newTeam } = await supabase
      .from("teams")
      .select("game")
      .eq("id", data.team_id)
      .single();

    if (newTeam) {
      const { data: oldMemberships } = await supabase
        .from("team_memberships")
        .select("id, teams(game)")
        .eq("player_id", data.player_id)
        .eq("is_current", true)
        .neq("id", id);

      if (oldMemberships) {
        for (const old of oldMemberships) {
          // @ts-expect-error - teams is joined
          if (old.teams?.game === newTeam.game) {
            await supabase
              .from("team_memberships")
              .update({ is_current: false })
              .eq("id", old.id);
          }
        }
      }
    }
  }

  const { error } = await supabase
    .from("team_memberships")
    .update({
      team_id: data.team_id,
      position: data.position.trim() || null,
      jersey_number: data.jersey_number,
      role: data.role,
      start_date: data.start_date,
      end_date: data.is_current ? null : data.end_date,
      is_current: data.is_current,
      notes: data.notes.trim() || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/players");
  revalidatePath("/");
  return { success: true };
}

export async function deleteTeamMembership(id: string) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  const { error } = await supabase.from("team_memberships").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/players");
  revalidatePath("/");
  return { success: true };
}

// ============================================
// TERMA JAMOA A'ZOLIGI
// ============================================

export type NationalMembershipData = {
  player_id: string;
  national_team_id: string;
  position: string;
  role: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  notes: string;
};

export async function addNationalMembership(data: NationalMembershipData) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  if (!data.player_id || !data.national_team_id) return { error: "O'yinchi va terma kerak" };
  if (!data.start_date) return { error: "Boshlanish sanasi kerak" };

  // Terma jamoa uchun: bitta o'yinchi bir vaqtda
  // - 1 ta milliy termada (region='national')
  // - 1 ta hududiy termada (region='regional')
  // O'YNAY OLADI! Klub bilan ham, ikkala terma bilan ham.
  if (data.is_current) {
    // Yangi qo'shilayotgan terma jamoaning tur va o'yinini olamiz
    const { data: newTeam } = await supabase
      .from("national_teams")
      .select("region, game")
      .eq("id", data.national_team_id)
      .single();

    if (newTeam) {
      // Faqat SHU tur va SHU o'yindagi eski "hozirgi" terma jamoa tugaydi
      const { data: oldMemberships } = await supabase
        .from("national_memberships")
        .select("id, national_teams(region, game)")
        .eq("player_id", data.player_id)
        .eq("is_current", true);

      if (oldMemberships) {
        for (const old of oldMemberships) {
          // @ts-expect-error - national_teams is joined
          const oldRegion = old.national_teams?.region;
          // @ts-expect-error - national_teams is joined
          const oldGame = old.national_teams?.game;
          
          // Faqat bir xil tur (national/regional) va bir xil o'yin bo'lsa tugatamiz
          if (oldRegion === newTeam.region && oldGame === newTeam.game) {
            await supabase
              .from("national_memberships")
              .update({ is_current: false, end_date: data.start_date })
              .eq("id", old.id);
          }
        }
      }
    }
  }

  const { error } = await supabase.from("national_memberships").insert({
    player_id: data.player_id,
    national_team_id: data.national_team_id,
    position: data.position.trim() || null,
    role: data.role,
    start_date: data.start_date,
    end_date: data.is_current ? null : data.end_date,
    is_current: data.is_current,
    notes: data.notes.trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/players");
  revalidatePath("/");
  return { success: true };
}

export async function updateNationalMembership(id: string, data: NationalMembershipData) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  if (data.is_current) {
    const { data: newTeam } = await supabase
      .from("national_teams")
      .select("region, game")
      .eq("id", data.national_team_id)
      .single();

    if (newTeam) {
      const { data: oldMemberships } = await supabase
        .from("national_memberships")
        .select("id, national_teams(region, game)")
        .eq("player_id", data.player_id)
        .eq("is_current", true)
        .neq("id", id);

      if (oldMemberships) {
        for (const old of oldMemberships) {
          // @ts-expect-error - national_teams is joined
          const oldRegion = old.national_teams?.region;
          // @ts-expect-error - national_teams is joined
          const oldGame = old.national_teams?.game;
          
          if (oldRegion === newTeam.region && oldGame === newTeam.game) {
            await supabase
              .from("national_memberships")
              .update({ is_current: false })
              .eq("id", old.id);
          }
        }
      }
    }
  }

  const { error } = await supabase
    .from("national_memberships")
    .update({
      national_team_id: data.national_team_id,
      position: data.position.trim() || null,
      role: data.role,
      start_date: data.start_date,
      end_date: data.is_current ? null : data.end_date,
      is_current: data.is_current,
      notes: data.notes.trim() || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/players");
  revalidatePath("/");
  return { success: true };
}

export async function deleteNationalMembership(id: string) {
  const auth = await checkAdmin();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  const { error } = await supabase.from("national_memberships").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/players");
  revalidatePath("/");
  return { success: true };
}
