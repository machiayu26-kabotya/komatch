import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  // セッションを取得（未ログインなら session=null、エラーにはならない）
  const { data: { session }, error } = await supabase.auth.getSession();

  // 環境変数のチェック
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
              <span>未ログイン (Day 2 で実装します)</span>
            )}
          </div>
          {error && (
            <div className="text-hard mt-2 text-xs">
              エラー: {error.message}
            </div>
          )}
        </div>

        <p className="text-ink-muted text-xs mt-8">Day 1 の動作確認画面 / 開発中</p>
      </div>
    </main>
  );
}