"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      router.refresh();
      router.push("/");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-cream">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-soft p-8">
        <div className="flex items-center justify-center gap-1 mb-6">
          <div className="w-7 h-7 rounded-md bg-rose"></div>
          <div className="w-7 h-7 rounded-md bg-rose -ml-2 opacity-60"></div>
          <div className="w-7 h-7 rounded-md bg-easy -ml-2"></div>
        </div>

        <h1 className="text-2xl font-medium text-center text-rose mb-1">ログイン</h1>
        <p className="text-ink-muted text-sm text-center mb-8">空きコマ、合おう。</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">メールアドレス</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ayuta@example.ac.jp"
              className="w-full px-4 py-3 border border-line rounded-2xl bg-cream-deep focus:outline-none focus:border-rose transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">パスワード</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-line rounded-2xl bg-cream-deep focus:outline-none focus:border-rose transition"
            />
          </div>

          {error && (
            <div className="bg-hard rounded-xl p-3 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose text-white rounded-full py-3 font-medium hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-6">
          アカウントをお持ちでない方は{" "}
          <Link href="/signup" className="text-rose hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </main>
  );
}