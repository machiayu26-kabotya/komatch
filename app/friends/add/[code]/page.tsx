import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { addFriendAction } from "../../actions";

export default async function AddFriendPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login`);
  }

  if (code === user.id) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-cream">
        <div className="bg-white rounded-2xl shadow-soft p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-3">😅</div>
          <p className="text-ink mb-4">自分自身は友達に追加できません</p>
          <Link href="/friends" className="text-rose underline text-sm">
            友達一覧へ
          </Link>
        </div>
      </main>
    );
  }

  const userA = user.id < code ? user.id : code;
  const userB = user.id < code ? code : user.id;

  const { data: existing } = await supabase
    .from("friendships")
    .select("id, status")
    .eq("user_a_id", userA)
    .eq("user_b_id", userB)
    .maybeSingle();

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-cream">
      <div className="bg-white rounded-2xl shadow-soft p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">👋</div>
        <h1 className="text-xl font-medium text-rose mb-3">
          {existing?.status === "accepted" ? "もう友達です" : "新しい友達を追加"}
        </h1>

        {existing?.status === "accepted" ? (
          <>
            <p className="text-ink-muted text-sm mb-6">この方とはすでに友達です</p>
            <Link
              href="/friends"
              className="inline-block text-sm bg-rose px-6 py-2 rounded-full hover:opacity-90 transition"
              style={{ color: "white" }}
            >
              友達一覧へ
            </Link>
          </>
        ) : (
          <>
            <p className="text-ink-muted text-sm mb-6 leading-relaxed">
              この招待リンクを使って友達になりますか？
              <br />
              つながると、お互いの時間割が見られるようになります。
            </p>
            <form action={addFriendAction}>
              <input type="hidden" name="targetId" value={code} />
              <button
                type="submit"
                className="w-full text-sm bg-rose px-6 py-3 rounded-full hover:opacity-90 transition mb-3"
                style={{ color: "white" }}
              >
                友達になる
              </button>
            </form>
            <Link
              href="/"
              className="text-xs text-ink-muted hover:text-rose underline transition"
            >
              キャンセルしてホームに戻る
            </Link>
          </>
        )}
      </div>
    </main>
  );
}