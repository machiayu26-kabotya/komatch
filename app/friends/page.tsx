import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FriendsList from "./FriendsList";

export default async function FriendsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: friendships } = await supabase
    .from("friendships")
    .select("id, user_a_id, user_b_id, status")
    .eq("status", "accepted")
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`);

  const friendIds = (friendships || []).map((f) =>
    f.user_a_id === user.id ? f.user_b_id : f.user_a_id
  );

  let friends: { id: string; display_name: string; faculty: string | null; grade: number | null }[] = [];
  if (friendIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, faculty, grade")
      .in("id", friendIds);
    friends = data || [];
  }

  return <FriendsList userId={user.id} friends={friends} />;
}