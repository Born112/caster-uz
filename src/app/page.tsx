export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0E1A] text-white flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-[#FF6B35] rounded-lg flex items-center justify-center">
          <span className="text-2xl">🎮</span>
        </div>
        <h1 className="text-4xl font-bold tracking-wider">CASTER.UZ</h1>
      </div>

      {/* Tagline */}
      <p className="text-xl text-[#8B92A8] mb-2 text-center">
        O'zbekiston Kibersport Portali
      </p>
      <p className="text-sm text-[#8B92A8] mb-12 text-center">
        Casterlar · O'yinchilar · Turnirlar · Tarix
      </p>

      {/* Coming Soon */}
      <div className="bg-[#131929] border border-[#FF6B35]/30 rounded-xl p-8 max-w-md text-center">
        <div className="text-[#FF6B35] text-sm font-semibold mb-2 tracking-widest">
          TEZDA OCHILADI
        </div>
        <h2 className="text-2xl font-bold mb-4">
          Sayt qurilmoqda
        </h2>
        <p className="text-[#8B92A8] mb-6">
          CS 1.6 va Dota Allstars uchun professional esports portal yaratmoqdamiz
        </p>
        <div className="flex gap-3 justify-center">
          <span className="px-3 py-1 bg-[#FF6B35]/15 text-[#FF6B35] rounded-md text-xs">
            CS 1.6
          </span>
          <span className="px-3 py-1 bg-[#00D9FF]/15 text-[#00D9FF] rounded-md text-xs">
            Dota Allstars
          </span>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-[#8B92A8] mt-12">
        © 2026 Caster.uz · Made with ❤️ in Uzbekistan
      </p>
    </main>
  );
}