"use client";

import Link from "next/link";
import { useState } from "react";
import GameModal from "./GameModal";

export default function Header() {
  const [modalSection, setModalSection] = useState<"players" | "casters" | "tournaments" | "teams" | null>(null);

  return (
    <>
      <header className="bg-[#131929] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 bg-[#FF6B35] rounded-lg flex items-center justify-center group-hover:bg-[#FF8557] transition-colors">
              <span className="text-xl">🎮</span>
            </div>
            <span className="text-lg font-bold tracking-wider">CASTER.UZ</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setModalSection("players")}
              className="px-3 py-2 text-sm text-[#8B92A8] hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              🎮 O&apos;yinchilar
            </button>
            <button
              onClick={() => setModalSection("teams")}
              className="px-3 py-2 text-sm text-[#8B92A8] hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              🏅 Jamoalar
            </button>
            <button
              onClick={() => setModalSection("casters")}
              className="px-3 py-2 text-sm text-[#8B92A8] hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              🎙️ Casterlar
            </button>
            <button
              onClick={() => setModalSection("tournaments")}
              className="px-3 py-2 text-sm text-[#8B92A8] hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              🏆 Turnirlar
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/login"
              className="text-xs text-[#8B92A8] hover:text-white transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        <nav className="md:hidden border-t border-white/5 px-6 py-2 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setModalSection("players")}
            className="px-3 py-1.5 text-xs text-[#8B92A8] hover:text-white whitespace-nowrap"
          >
            🎮 O&apos;yinchilar
          </button>
          <button
            onClick={() => setModalSection("teams")}
            className="px-3 py-1.5 text-xs text-[#8B92A8] hover:text-white whitespace-nowrap"
          >
            🏅 Jamoalar
          </button>
          <button
            onClick={() => setModalSection("casters")}
            className="px-3 py-1.5 text-xs text-[#8B92A8] hover:text-white whitespace-nowrap"
          >
            🎙️ Casterlar
          </button>
          <button
            onClick={() => setModalSection("tournaments")}
            className="px-3 py-1.5 text-xs text-[#8B92A8] hover:text-white whitespace-nowrap"
          >
            🏆 Turnirlar
          </button>
        </nav>
      </header>

      {modalSection && (
        <GameModal
          isOpen={true}
          onClose={() => setModalSection(null)}
          section={modalSection}
        />
      )}
    </>
  );
}
