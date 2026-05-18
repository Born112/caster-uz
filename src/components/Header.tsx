"use client";

import Link from "next/link";
import { useState } from "react";
import GameModal from "./GameModal";

type Section = "players" | "casters" | "tournaments";

export default function Header() {
  const [lang, setLang] = useState<"uz" | "ru">("uz");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSection, setModalSection] = useState<Section>("players");

  const openModal = (section: Section) => {
    setModalSection(section);
    setModalOpen(true);
  };

  return (
    <>
      <header className="bg-[#0A0E1A] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-[#FF6B35] rounded-lg flex items-center justify-center group-hover:bg-[#FF8557] transition-colors">
                <span className="text-xl">🎮</span>
              </div>
              <span className="text-lg font-bold tracking-wider text-white">
                CASTER.UZ
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <NavLinkInternal href="/" label="Bosh sahifa" />
              <NavButton label="Casterlar" onClick={() => openModal("casters")} />
              <NavButton label="O'yinchilar" onClick={() => openModal("players")} />
              <NavButton label="Turnirlar" onClick={() => openModal("tournaments")} />
              <NavLinkInternal href="/streams" label="Streamlar" />
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="text-[#8B92A8] hover:text-white transition-colors p-2"
              aria-label="Qidiruv"
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
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            <div className="flex items-center gap-1 bg-[#131929] rounded-md p-1">
              <button
                onClick={() => setLang("uz")}
                className={
                  "px-3 py-1 text-xs font-medium rounded transition-colors " +
                  (lang === "uz"
                    ? "bg-[#FF6B35] text-[#0A0E1A]"
                    : "text-[#8B92A8] hover:text-white")
                }
              >
                UZ
              </button>
              <button
                onClick={() => setLang("ru")}
                className={
                  "px-3 py-1 text-xs font-medium rounded transition-colors " +
                  (lang === "ru"
                    ? "bg-[#FF6B35] text-[#0A0E1A]"
                    : "text-[#8B92A8] hover:text-white")
                }
              >
                RU
              </button>
            </div>

            <button className="bg-[#00D9FF] hover:bg-[#33E0FF] text-[#0A0E1A] font-medium text-sm px-4 py-2 rounded-md transition-colors flex items-center gap-2">
              <span>📱</span>
              <span className="hidden sm:inline">Kirish</span>
            </button>
          </div>
        </div>
      </header>

      <GameModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        section={modalSection}
      />
    </>
  );
}

function NavLinkInternal({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-[#8B92A8] hover:text-white text-sm font-medium px-3 py-2 rounded-md hover:bg-white/5 transition-colors"
    >
      {label}
    </Link>
  );
}

function NavButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-[#8B92A8] hover:text-white text-sm font-medium px-3 py-2 rounded-md hover:bg-white/5 transition-colors"
    >
      {label}
    </button>
  );
}
