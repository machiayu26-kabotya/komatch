import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

async function logout() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function Home() {
  const supabase = await createClient();

  const { data: { session }, error } = await supabase.auth.getSession();

  const hasConfig =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const connected = hasConfig && !error;
  const user = session?.user ?? null;

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-cream">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-soft p-8 text-center">
        <div className="flex items-center justify-center gap-1 mb-4">
          <div className="w-8 h-8 rounded-md bg-rose"></div>
          <div className="w-8 h-8 rounded-md bg-rose -ml-3 opacity-60"></div>
          <div className="w-8 h-8 rounded-md bg-easy -ml-3"></div>
        </div>

        <h1 className="text-3xl font-medium text-rose mb-2">Komatch</h1>
        <p className="text-ink-muted mb-8">空きコマ、合おう。</p>

        <div className="bg-cream-deep border border-line rounded-xl p-4 text-left text-sm">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                connected ? "bg-mint" : "bg-hard"
              }`}
            ></span>
            <span className="font-medium">
              Supabase: {connected ? "接続OK" : "接続できていません"}
            </span>
          </div>
          <div className="text-ink-muted">
            ログイン状態:{" "}
            {user ? (
              <span className="text-ink">{user.email}</span>
            ) : (
              <span>未ログイン</span>
            )}
          </div>
          {error && (
            <div className="text-hard mt-2 text-xs">
              エラー: {error.message}
            </div>
          )}
        </div>

        {user ? (
          <div className="mt-6 flex flex-col items-center gap-3">
            <Link
              href="/profile"
              className="text-sm bg-rose text-white px-5 py-2 rounded-full hover:opacity-90 transition"
            >
              プロフィール編集
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm text-ink-muted hover:text-rose transition underline"
              >
                ログアウト
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-6 flex gap-3 justify-center">
            <Link
              href="/login"
              className="text-sm bg-rose text-white px-5 py-2 rounded-full hover:opacity-90 transition"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-white border border-rose text-rose px-5 py-2 rounded-full hover:opacity-90 transition"
            >
              新規登録
            </Link>
          </div>
        )}

        <p className="text-ink-muted text-xs mt-8">開発中</p>
      </div>
    </main>
  );
}