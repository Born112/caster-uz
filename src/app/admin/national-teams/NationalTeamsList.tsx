"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteNationalTeam } from "./actions";

type NationalTeam = {
  id: string;
  name: string;
  region: string;
  description: string | null;
  game: string;
  is_active: boolean;
  total_tournaments: number;
  national_memberships?: { count: number }[];
};

type Props = { teams: NationalTeam[] };

export default function NationalTeamsList({ teams }: Props) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteNationalTeam(deleteId);
    if (result && "error" in result) {
      alert("Xatolik: " + result.error);
      setDeleting(false);
      return;
    }
    setDeleteId(null);
    setDeleting(false);
    router.refresh();
  };

  const teamToDelete = teams.find((t) => t.id === deleteId);

  if (teams.length === 0) {
    return (
      <div className="bg-[#131929] border border-white/10 rounded-xl p-12 text-center">
        <div className="text-5xl mb-4">🇺🇿</div>
        <h3 className="text-xl font-bold mb-2">Hozircha terma jamoalar yo&apos;q</h3>
        <p className="text-[#8B92A8]">&quot;Yangi terma&quot; tugmasini bosing</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => {
          const isCS = team.game === "CS 1.6";
          const color = isCS ? "#FF6B35" : "#00D9FF";
          const emoji = isCS ? "🎯" : "⚔️";
          const isNational = team.region === "national";
          const memberCount = team.national_memberships?.[0]?.count || 0;

          return (
            <div
              key={team.id}
              className="bg-[#131929] border border-white/10 hover:border-white/20 rounded-xl p-5 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: color + "20" }}
                >
                  {isNational ? "🇺🇿" : "🏙️"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold">{team.name}</div>
                  <div className="text-xs text-[#8B92A8] flex items-center gap-2 flex-wrap">
                    <span>{emoji} {team.game}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-xs"
                      style={{
                        backgroundColor: isNational ? "rgba(255,107,53,0.15)" : "rgba(0,217,255,0.15)",
                        color: isNational ? "#FF6B35" : "#00D9FF",
                      }}
                    >
                      {isNational ? "Milliy" : "Hududiy"}
                    </span>
                    {!team.is_active && (
                      <span className="bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded">Faolsiz</span>
                    )}
                  </div>
                </div>
              </div>

              {team.description && (
                <p className="text-sm text-gray-300 mb-3 line-clamp-2">{team.description}</p>
              )}

              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div>
                  <div className="text-[#8B92A8]">👥 A&apos;zolar</div>
                  <div className="font-bold">{memberCount}</div>
                </div>
                <div>
                  <div className="text-[#8B92A8]">🏆 Turnirlar</div>
                  <div className="font-bold">{team.total_tournaments}</div>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-white/5">
                <Link
                  href={"/admin/national-teams/" + team.id + "/edit"}
                  className="flex-1 bg-[#00D9FF]/10 hover:bg-[#00D9FF]/20 border border-[#00D9FF]/30 text-[#00D9FF] text-xs px-3 py-1.5 rounded-md transition-colors text-center"
                >
                  ✏️ Tahrirlash
                </Link>
                <button
                  onClick={() => setDeleteId(team.id)}
                  className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs px-3 py-1.5 rounded-md transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {deleteId && teamToDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => !deleting && setDeleteId(null)}
        >
          <div className="bg-[#131929] border border-red-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-5xl mb-4 text-center">⚠️</div>
            <h2 className="text-xl font-bold mb-2 text-center">O&apos;chirishni tasdiqlang</h2>
            <p className="text-[#8B92A8] mb-6 text-center">
              <span className="text-white font-bold">{teamToDelete.name}</span> ni o&apos;chirmoqchimisiz?
            </p>
            <p className="text-yellow-300 text-xs text-center mb-6">
              ⚠️ Diqqat! Barcha a&apos;zoliklar ham o&apos;chiriladi
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
