"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteCaster } from "./actions";

type Caster = {
  id: string;
  nickname: string;
  real_name: string | null;
  city: string | null;
  bio: string | null;
  is_verified: boolean;
  is_live: boolean;
  twitch_url: string | null;
  youtube_url: string | null;
  telegram_username: string | null;
  games: string[];
  broadcasts_count: number;
  subscribers_count: number;
  rating: number;
};

type Props = {
  casters: Caster[];
};

export default function CastersTable({ casters }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "CS 1.6" | "Dota Allstars" | "live">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredCasters = useMemo(() => {
    return casters.filter((caster) => {
      const matchesSearch =
        search === "" ||
        caster.nickname.toLowerCase().includes(search.toLowerCase()) ||
        (caster.real_name?.toLowerCase().includes(search.toLowerCase()) ?? false);

      let matchesFilter = true;
      if (filter === "live") {
        matchesFilter = caster.is_live;
      } else if (filter !== "all") {
        matchesFilter = caster.games.includes(filter);
      }

      return matchesSearch && matchesFilter;
    });
  }, [casters, search, filter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);

    const result = await deleteCaster(deleteId);

    if (result && "error" in result) {
      alert("Xatolik: " + result.error);
      setDeleting(false);
      return;
    }

    setDeleteId(null);
    setDeleting(false);
    router.refresh();
  };

  const casterToDelete = casters.find((c) => c.id === deleteId);

  return (
    <>
      <div className="bg-[#131929] border border-white/10 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Caster nomi yoki ism bo'yicha qidiring..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-2 text-white placeholder-[#5A6178] outline-none transition-colors"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <FilterButton
              active={filter === "all"}
              onClick={() => setFilter("all")}
              label="Hammasi"
              count={casters.length}
            />
            <FilterButton
              active={filter === "live"}
              onClick={() => setFilter("live")}
              label="🔴 LIVE"
              count={casters.filter((c) => c.is_live).length}
              color="#FF3D71"
            />
            <FilterButton
              active={filter === "CS 1.6"}
              onClick={() => setFilter("CS 1.6")}
              label="🎯 CS 1.6"
              count={casters.filter((c) => c.games.includes("CS 1.6")).length}
              color="#FF6B35"
            />
            <FilterButton
              active={filter === "Dota Allstars"}
              onClick={() => setFilter("Dota Allstars")}
              label="⚔️ Dota"
              count={casters.filter((c) => c.games.includes("Dota Allstars")).length}
              color="#00D9FF"
            />
          </div>
        </div>
      </div>

      {filteredCasters.length === 0 ? (
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
                  <th className="text-left text-xs uppercase text-[#8B92A8] font-medium px-4 py-3">Caster</th>
                  <th className="text-left text-xs uppercase text-[#8B92A8] font-medium px-4 py-3 hidden md:table-cell">Stream</th>
                  <th className="text-left text-xs uppercase text-[#8B92A8] font-medium px-4 py-3 hidden lg:table-cell">O&apos;yinlar</th>
                  <th className="text-left text-xs uppercase text-[#8B92A8] font-medium px-4 py-3 hidden lg:table-cell">Statistika</th>
                  <th className="text-left text-xs uppercase text-[#8B92A8] font-medium px-4 py-3 hidden md:table-cell">Holat</th>
                  <th className="text-right text-xs uppercase text-[#8B92A8] font-medium px-4 py-3">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredCasters.map((caster) => {
                  const primaryGame = caster.games[0] || "CS 1.6";
                  const isPrimaryCS = primaryGame === "CS 1.6";
                  const primaryColor = isPrimaryCS ? "#FF6B35" : "#00D9FF";

                  return (
                    <tr key={caster.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div
                              className="w-10 h-10 rounded-full bg-[#0A0E1A] border-2 flex items-center justify-center font-bold text-sm"
                              style={{ borderColor: primaryColor, color: primaryColor }}
                            >
                              {caster.nickname.substring(0, 2).toUpperCase()}
                            </div>
                            {caster.is_live && (
                              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#FF3D71] border-2 border-[#131929] rounded-full animate-pulse"></div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{caster.nickname}</span>
                              {caster.is_verified && (
                                <span className="text-green-400 text-xs">✓</span>
                              )}
                            </div>
                            {caster.real_name && (
                              <div className="text-xs text-[#8B92A8]">{caster.real_name}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex gap-2">
                          {caster.twitch_url && (
                            <a
                              href={caster.twitch_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Twitch"
                              className="text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              <span className="text-lg">📺</span>
                            </a>
                          )}
                          {caster.youtube_url && (
                            <a
                              href={caster.youtube_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="YouTube"
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <span className="text-lg">▶️</span>
                            </a>
                          )}
                          {!caster.twitch_url && !caster.youtube_url && (
                            <span className="text-sm text-[#5A6178]">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex gap-1 flex-wrap">
                          {caster.games.map((g) => (
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
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="text-xs space-y-0.5">
                          <div className="text-[#8B92A8]">
                            📡 {caster.broadcasts_count} translyatsiya
                          </div>
                          <div className="text-[#8B92A8]">
                            👥 {caster.subscribers_count.toLocaleString()} obunachi
                          </div>
                          <div className="text-[#FF6B35] font-bold">
                            ⭐ {caster.rating.toFixed(1)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="space-y-1">
                          {caster.is_live ? (
                            <span className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded-md inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                              LIVE
                            </span>
                          ) : (
                            <span className="bg-white/5 text-[#8B92A8] text-xs px-2 py-1 rounded-md">
                              Offline
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={"/admin/casters/" + caster.id + "/edit"}
                            className="bg-[#00D9FF]/10 hover:bg-[#00D9FF]/20 border border-[#00D9FF]/30 text-[#00D9FF] text-xs px-3 py-1.5 rounded-md transition-colors"
                          >
                            ✏️ Tahrirlash
                          </Link>
                          <button
                            onClick={() => setDeleteId(caster.id)}
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

      {deleteId && casterToDelete && (
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
              <span className="text-white font-bold">{casterToDelete.nickname}</span> casterini o&apos;chirmoqchimisiz?
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
