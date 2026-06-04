import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const game = searchParams.get("game");
  const teamId = searchParams.get("team");

  if (!game) {
    return NextResponse.json({ error: "Game parameter required" }, { status: 400 });
  }

  // Avval shu jamoaning hozirgi o'yinchilarini olamiz
  let players: { id: string; nickname: string; real_name: string | null; games: string[] }[] = [];

  if (teamId) {
    const { data: teamMembers } = await supabase
      .from("team_memberships")
      .select("players(id, nickname, real_name, games)")
      .eq("team_id", teamId)
      .eq("is_current", true);

    if (teamMembers) {
      players = teamMembers
        .map((m) => m.players)
        .filter(Boolean)
        .flat() as typeof players;
    }
  }

  // Agar jamoa o'yinchilari yetarli emas yoki yo'q bo'lsa - barcha o'yinchilarni olamiz
  // (stand-in uchun boshqa jamoadan o'yinchi olish mumkin)
  const { data: allPlayers } = await supabase
    .from("players")
    .select("id, nickname, real_name, games")
    .contains("games", [game])
    .order("nickname");

  // Birlashtirish (jamoa o'yinchilari avval, keyin boshqalar)
  const playerIds = new Set(players.map((p) => p.id));
  const otherPlayers = (allPlayers || []).filter((p) => !playerIds.has(p.id));

  return NextResponse.json({
    players: [...players, ...otherPlayers],
  });
}
