"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-cream">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-soft p-8 text-center">
          <div className="text-5xl mb-4">📬</div>
          <h1 className="text-2xl font-medium text-rose mb-3">確認メールを送りました</h1>
          <p className="text-ink-muted text-sm leading-relaxed mb-6">
            <span className="text-ink font-medium">{email}</span> 宛に確認メールを送りました。
            <br />
            メール内のリンクをクリックして登録を完了してください。
          </p>
          <Link href="/login" className="text-rose hover:underline text-sm">
            ログイン画面へ →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-cream">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-soft p-8">
        <div className="flex items-center justify-center gap-1 mb-6">
          <div className="w-7 h-7 rounded-md bg-rose"></div>
          <div className="w-7 h-7 rounded-md bg-rose -ml-2 opacity-60"></div>
          <div className="w-7 h-7 rounded-md bg-easy -ml-2"></div>
        </div>

        <h1 className="text-2xl font-medium text-center text-rose mb-1">新規登録</h1>
        <p className="text-ink-muted text-sm text-center mb-8">空きコマ、合おう。</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">メールアドレス</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="taro@example.ac.jp"
              className="w-full px-4 py-3 border border-line rounded-2xl bg-cream-deep focus:outline-none focus:border-rose transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">パスワード</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6文字以上"
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
            {loading ? "登録中..." : "新規登録"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-cream-deep rounded-xl text-xs text-ink-muted leading-relaxed">
          <p className="font-medium text-ink mb-2">📌 メールについて</p>
          <p>
            あなたのメールアドレスは、
            <strong className="text-ink">ログインと友達からの招待通知のみ</strong>
            に使用します。広告や第三者への提供は一切ありません。
            いつでもアカウント削除できます。
          </p>
        </div>

        <p className="text-center text-sm text-ink-muted mt-6">
          すでにアカウントをお持ちですか？{" "}
          <Link href="/login" className="text-rose hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </main>
  );
}