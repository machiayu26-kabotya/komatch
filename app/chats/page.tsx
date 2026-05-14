import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ChatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("chat_room_members")
    .select("chat_room_id")
    .eq("user_id", user.id);

  const roomIds = (memberships || []).map(m => m.chat_room_id);

  type Room = { id: string; title: string; created_at: string; archived_at: string | null };
  let rooms: Room[] = [];
  if (roomIds.length > 0) {
    const { data } = await supabase
      .from("chat_rooms")
      .select("id, title, created_at, archived_at")
      .in("id", roomIds)
      .order("created_at", { ascending: false });
    rooms = (data || []) as Room[];
  }

  return (
    <main className="min-h-screen p-6 bg-cream">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-medium text-rose">チャット</h1>
          <Link href="/" className="text-sm text-ink-muted hover:text-rose underline">← ホーム</Link>
        </header>

        <div className="bg-white rounded-2xl shadow-soft p-6">
          {rooms.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-ink-muted text-sm">まだチャットがありません</p>
              <p className="text-ink-muted text-xs mt-2">
                <Link href="/friends/compare" className="text-rose underline">共通空きコマ</Link>から友達を誘ってみよう
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {rooms.map(room => (
                <li key={room.id}>
                  <Link
                    href={`/chats/${room.id}`}
                    className="block p-4 bg-cream-deep rounded-xl hover:bg-line/30 transition"
                  >
                    <div className="font-medium text-ink">{room.title}</div>
                    <div className="text-xs text-ink-muted mt-1">
                      {new Date(room.created_at).toLocaleString("ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}