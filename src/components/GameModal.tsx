"use client";

import Link from "next/link";
import { useEffect } from "react";

type GameModalProps = {
  isOpen: boolean;
  onClose: () => void;
  section: "players" | "casters" | "tournaments" | "teams";
};

const sectionMap = {
  players: { label: "O'yinchilar", emoji: "🎮" },
  casters: { label: "Casterlar", emoji: "🎙️" },
  tournaments: { label: "Turnirlar", emoji: "🏆" },
  teams: { label: "Jamoalar", emoji: "🏅" },
};

export default function GameModal({ isOpen, onClose, section }: GameModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sectionInfo = sectionMap[section];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#131929] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8B92A8] hover:text-white text-2xl leading-none"
        >
          ×
        </button>

        <div className="text-5xl mb-4 text-center">{sectionInfo.emoji}</div>
        <h2 className="text-2xl font-bold text-center mb-2">
          {sectionInfo.label}
        </h2>
        <p className="text-sm text-[#8B92A8] text-center mb-6">
          Qaysi o&apos;yin uchun?
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href={"/cs/" + section}
            onClick={onClose}
            className="p-4 rounded-xl border-2 border-[#FF6B35]/30 hover:border-[#FF6B35] bg-[#FF6B35]/5 hover:bg-[#FF6B35]/10 transition-all text-center"
          >
            <div className="text-4xl mb-2">🎯</div>
            <div className="font-bold text-[#FF6B35]">CS 1.6</div>
            <div className="text-xs text-[#8B92A8] mt-1">Counter-Strike</div>
          </Link>

          <Link
            href={"/dota/" + section}
            onClick={onClose}
            className="p-4 rounded-xl border-2 border-[#00D9FF]/30 hover:border-[#00D9FF] bg-[#00D9FF]/5 hover:bg-[#00D9FF]/10 transition-all text-center"
          >
            <div className="text-4xl mb-2">⚔️</div>
            <div className="font-bold text-[#00D9FF]">Dota Allstars</div>
            <div className="text-xs text-[#8B92A8] mt-1">Dota</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
