import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ChatRoom from "./ChatRoom";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: roomId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check membership
  const { data: membership } = await supabase
    .from("chat_room_members")
    .select("chat_room_id")
    .eq("chat_room_id", roomId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-cream">
        <div className="bg-white rounded-2xl shadow-soft p-8 max-w-md text-center">
          <p className="text-ink mb-4">このチャットには参加していません</p>
          <Link href="/chats" className="text-rose underline">チャット一覧へ</Link>
        </div>
      </main>
    );
  }

  const { data: room } = await supabase
    .from("chat_rooms")
    .select("id, title, created_at")
    .eq("id", roomId)
    .maybeSingle();

  if (!room) notFound();

  const { data: members } = await supabase
    .from("chat_room_members")
    .select("user_id")
    .eq("chat_room_id", roomId);

  const memberIds = (members || []).map(m => m.user_id);
  const { data: memberProfiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", memberIds);

  const memberMap: Record<string, string> = {};
  for (const p of memberProfiles || []) memberMap[p.id] = p.display_name;

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("chat_room_id", roomId)
    .order("created_at", { ascending: true });

  return (
    <ChatRoom
      roomId={roomId}
      title={room.title}
      currentUserId={user.id}
      memberMap={memberMap}
      initialMessages={messages || []}
    />
  );
}