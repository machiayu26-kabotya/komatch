"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [faculty, setFaculty] = useState("");
  const [grade, setGrade] = useState<number>(1);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, faculty, grade")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setDisplayName(profile.display_name || "");
        setFaculty(profile.faculty || "");
        setGrade(profile.grade || 1);
      } else {
        setDisplayName(user.email?.split("@")[0] || "");
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("ログインしていません");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email!,
          display_name: displayName,
          faculty: faculty || null,
          grade,
        },
        { onConflict: "id" }
      );

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-cream">
        <div className="text-ink-muted">読み込み中...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-cream">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-soft p-8">
        <h1 className="text-2xl font-medium text-center text-rose mb-1">プロフィール</h1>
        <p className="text-ink-muted text-sm text-center mb-8">あなたの情報を入力</p>

        <div className="bg-cream-deep rounded-xl p-3 text-xs text-ink-muted mb-6">
          メールアドレス: <span className="text-ink">{email}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">表示名</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="あゆた"
              className="w-full px-4 py-3 border border-line rounded-2xl bg-cream-deep focus:outline-none focus:border-rose transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">学部</label>
            <input
              type="text"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              placeholder="経済学部"
              className="w-full px-4 py-3 border border-line rounded-2xl bg-cream-deep focus:outline-none focus:border-rose transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">学年</label>
            <select
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="w-full px-4 py-3 border border-line rounded-2xl bg-cream-deep focus:outline-none focus:border-rose transition"
            >
              <option value={1}>1年</option>
              <option value={2}>2年</option>
              <option value={3}>3年</option>
              <option value={4}>4年</option>
              <option value={5}>5年</option>
              <option value={6}>6年</option>
            </select>
          </div>

          {error && (
            <div className="bg-hard rounded-xl p-3 text-sm">{error}</div>
          )}

          {success && (
            <div className="bg-mint rounded-xl p-3 text-sm">✓ 保存しました</div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-rose text-white rounded-full py-3 font-medium hover:opacity-90 disabled:opacity-50 transition"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-6">
          <Link href="/" className="hover:underline">
            ← ホームに戻る
          </Link>
        </p>
      </div>
    </main>
  );
}