"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type GameModalProps = {
  isOpen: boolean;
  onClose: () => void;
  section: "players" | "casters" | "tournaments";
};

const sectionLabels = {
  players: "O'yinchilar",
  casters: "Casterlar",
  tournaments: "Turnirlar",
};

export default function GameModal({ isOpen, onClose, section }: GameModalProps) {
  const router = useRouter();

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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (game: "cs" | "dota") => {
    onClose();
    router.push("/" + game + "/" + section);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#0A0E1A] border border-white/10 rounded-2xl max-w-md w-full p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Qaysi o&apos;yin?
            </h2>
            <p className="text-sm text-[#8B92A8]">
              {sectionLabels[section]} bo&apos;limini tanlang
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#8B92A8] hover:text-white transition-colors p-2 hover:bg-white/5 rounded-md"
            aria-label="Yopish"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleSelect("cs")}
            className="group bg-[#131929] border border-[#FF6B35]/30 hover:border-[#FF6B35] hover:bg-[#FF6B35]/10 rounded-xl p-6 transition-all hover:-translate-y-1"
          >
            <div className="text-4xl mb-3">🎯</div>
            <div className="text-lg font-bold text-white mb-1">CS 1.6</div>
            <div className="text-xs text-[#8B92A8]">Counter-Strike</div>
          </button>

          <button
            onClick={() => handleSelect("dota")}
            className="group bg-[#131929] border border-[#00D9FF]/30 hover:border-[#00D9FF] hover:bg-[#00D9FF]/10 rounded-xl p-6 transition-all hover:-translate-y-1"
          >
            <div className="text-4xl mb-3">⚔️</div>
            <div className="text-lg font-bold text-white mb-1">Dota</div>
            <div className="text-xs text-[#8B92A8]">Allstars</div>
          </button>
        </div>

        <p className="text-xs text-center text-[#8B92A8] mt-6">
          ESC tugmasini bosib yoping
        </p>
      </div>
    </div>
  );
}
