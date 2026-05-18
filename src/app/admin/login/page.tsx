"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email yoki parol noto'g'ri");
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError("Foydalanuvchi topilmadi");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      await supabase.auth.signOut();
      setError("Sizda admin huquqi yo'q");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#0A0E1A] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-10 h-10 bg-[#FF6B35] rounded-lg flex items-center justify-center group-hover:bg-[#FF8557] transition-colors">
            <span className="text-2xl">🎮</span>
          </div>
          <span className="text-xl font-bold tracking-wider">CASTER.UZ</span>
        </Link>

        <div className="bg-[#131929] border border-white/10 rounded-2xl p-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-[#FF6B35]/10 text-[#FF6B35] text-xs font-medium px-3 py-1 rounded-md mb-3">
              <span>🔐</span>
              <span>Admin Panel</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Tizimga kirish</h1>
            <p className="text-sm text-[#8B92A8]">
              Saytni boshqarish uchun admin akkaunti bilan kiring
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-[#8B92A8] mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@caster.uz"
                className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-3 text-white placeholder-[#5A6178] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-[#8B92A8] mb-2" htmlFor="password">
                Parol
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#0A0E1A] border border-white/10 focus:border-[#FF6B35] rounded-md px-4 py-3 text-white placeholder-[#5A6178] outline-none transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-md p-3 text-red-300 text-sm flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF6B35] hover:bg-[#FF8557] disabled:bg-[#FF6B35]/50 disabled:cursor-not-allowed text-[#0A0E1A] font-bold py-3 rounded-md transition-colors"
            >
              {loading ? "Tekshirilmoqda..." : "Kirish"}
            </button>
          </form>

          <p className="text-xs text-[#8B92A8] text-center mt-6">
            Bu sahifa faqat saytning <strong className="text-white">adminlari</strong> uchun
          </p>
        </div>

        <Link
          href="/"
          className="block text-center text-sm text-[#8B92A8] hover:text-white mt-6 transition-colors"
        >
          ← Bosh sahifaga qaytish
        </Link>
      </div>
    </main>
  );
}
