"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Player = {
  id: string;
  nickname: string;
  real_name: string | null;
  city: string | null;
  bio: string | null;
  is_verified: boolean;
  is_claimed: boolean;
  telegram_username: string | null;
  games: string[] | null;
  created_at: string;
};

type Props = {
  players: Player[];
};

export default function PlayersTable({ players }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [gameFilter, setGameFilter] = useState<"all" | "CS 1.6" | "Dota Allstars">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesSearch =
        search === "" ||
        player.nickname.toLowerCase().includes(search.toLowerCase()) ||
        (player.real_name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (player.telegram_username?.toLowerCase().includes(search.toLowerCase()) ?? false);

      const matchesGame =
        gameFilter === "all" ||
        (player.games && player.games.includes(gameFilter));

      return matchesSearch && matchesGame;
    });
  }, [players, search, gameFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);

    const supabase = createClient();
    const { error } = await supabase.from("players").delete().eq("id", deleteId);

    if (error) {
      alert("Xatolik: " + error.message);
      setDeleting(false);
      return;
    }

    setDeleteId(null);
    setDeleting(false);
    router.refresh();
  };

  const playerToDelete = players.find((p) => p.id === deleteId);

  return (
    <>
      <div className="bg-[#131929] border border-white/10 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Nick, ism yoki Telegram bo'yicha qidiring..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2 text-white placeholder-[#5A6178] outline-none transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <FilterButton
              active={gameFilter === "all"}
              onClick={() => setGameFilter("all")}
              label="Hammasi"
              count={players.length}
            />
            <FilterButton
              active={gameFilter === "CS 1.6"}
              onClick={() => setGameFilter("CS 1.6")}
              label="🎯 CS 1.6"
              count={players.filter((p) => p.games?.includes("CS 1.6")).length}
              color="#FF6B35"
            />
            <FilterButton
              active={gameFilter === "Dota Allstars"}
              onClick={() => setGameFilter("Dota Allstars")}
              label="⚔️ Dota"
              count={players.filter((p) => p.games?.includes("Dota Allstars")).length}
              color="#00D9FF"
            />
          </div>
        </div>
      </div>

      {filteredPlayers.length === 0 ? (
        <div className="bg-[#131929] border border-white/10 rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">Hech narsa topilmadi</h3>
          <p className="text-[#8B92A8]">Qidiruv yoki filterni o&apos;zgartiring</p>
        </div>
      ) : (
        <div className="bg-[#131929] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0A0E1A] border-b border-white/10">
                <tr>
                  <th className="text-left text-xs uppercase text-[#8B92A8] font-medium px-4 py-3">O&apos;yinchi</th>
                  <th className="text-left text-xs uppercase text-[#8B92A8] font-medium px-4 py-3 hidden md:table-cell">Telegram</th>
                  <th className="text-left text-xs uppercase text-[#8B92A8] font-medium px-4 py-3 hidden lg:table-cell">Shahar</th>
                  <th className="text-left text-xs uppercase text-[#8B92A8] font-medium px-4 py-3 hidden lg:table-cell">O&apos;yinlar</th>
                  <th className="text-left text-xs uppercase text-[#8B92A8] font-medium px-4 py-3 hidden md:table-cell">Holat</th>
                  <th className="text-right text-xs uppercase text-[#8B92A8] font-medium px-4 py-3">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player) => {
                  const primaryGame = player.games?.[0] || "CS 1.6";
                  const isPrimaryCS = primaryGame === "CS 1.6";
                  const primaryColor = isPrimaryCS ? "#FF6B35" : "#00D9FF";

                  return (
                    <tr key={player.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full bg-[#0A0E1A] border-2 flex items-center justify-center font-bold text-sm shrink-0"
                            style={{ borderColor: primaryColor, color: primaryColor }}
                          >
                            {player.nickname.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{player.nickname}</span>
                              {player.is_verified && (
                                <span className="text-green-400 text-xs">✓</span>
                              )}
                            </div>
                            {player.real_name && (
                              <div className="text-xs text-[#8B92A8]">{player.real_name}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {player.telegram_username ? (
                          <a
                            href={"https://t.me/" + player.telegram_username}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-[#00D9FF] hover:underline"
                          >
                            <span>📱</span>
                            <span>@{player.telegram_username}</span>
                          </a>
                        ) : (
                          <span className="text-sm text-[#5A6178]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-sm text-[#8B92A8]">
                        {player.city || "—"}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex gap-1 flex-wrap">
                          {player.games?.map((g) => (
                            <span
                              key={g}
                              className="text-xs px-2 py-0.5 rounded-md"
                              style={{
                                backgroundColor:
                                  g === "CS 1.6"
                                    ? "rgba(255,107,53,0.15)"
                                    : "rgba(0,217,255,0.15)",
                                color: g === "CS 1.6" ? "#FF6B35" : "#00D9FF",
                              }}
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {player.is_verified ? (
                          <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-md">
                            Tasdiqlangan
                          </span>
                        ) : (
                          <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-md">
                            Kutilmoqda
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={"/admin/players/" + player.id + "/edit"}
                            className="bg-[#00D9FF]/10 hover:bg-[#00D9FF]/20 border border-[#00D9FF]/30 text-[#00D9FF] text-xs px-3 py-1.5 rounded-md transition-colors"
                          >
                            ✏️ Tahrirlash
                          </Link>
                          <button
                            onClick={() => setDeleteId(player.id)}
                            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs px-3 py-1.5 rounded-md transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteId && playerToDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => !deleting && setDeleteId(null)}
        >
          <div
            className="bg-[#131929] border border-red-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-4 text-center">⚠️</div>
            <h2 className="text-xl font-bold mb-2 text-center">
              O&apos;chirishni tasdiqlang
            </h2>
            <p className="text-[#8B92A8] mb-6 text-center">
              <span className="text-white font-bold">{playerToDelete.nickname}</span> o&apos;yinchisini o&apos;chirmoqchimisiz?
              Bu amal qaytarib bo&apos;lmaydi!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-md transition-colors disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-md transition-colors disabled:opacity-50"
              >
                {deleting ? "O'chirilmoqda..." : "🗑️ O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterButton({
  active,
  onClick,
  label,
  count,
  color = "#8B92A8",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "px-3 py-2 text-sm rounded-md border transition-colors flex items-center gap-2 " +
        (active
          ? "border-white/30 bg-white/10 text-white"
          : "border-white/10 text-[#8B92A8] hover:text-white hover:border-white/20")
      }
      style={active ? { borderColor: color, color } : undefined}
    >
      <span>{label}</span>
      <span className="bg-white/10 text-xs px-1.5 py-0.5 rounded">{count}</span>
    </button>
  );
}
