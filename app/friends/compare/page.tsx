import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CompareView from "./CompareView";

function getCurrentTerm(): { year: number; term: "spring" | "fall" } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 4 && month <= 9) return { year, term: "spring" };
  if (month >= 10) return { year, term: "fall" };
  return { year: year - 1, term: "fall" };
}

type Slot = {
  day_of_week: string;
  period: number;
  course_name: string;
  is_private: boolean;
};

export default async function ComparePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: friendships } = await supabase
    .from("friendships")
    .select("user_a_id, user_b_id")
    .eq("status", "accepted")
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`);

  const friendIds = (friendships || []).map((f) =>
    f.user_a_id === user.id ? f.user_b_id : f.user_a_id
  );

  const allUserIds = [user.id, ...friendIds];
  const { year, term } = getCurrentTerm();

  const { data: timetables } = await supabase
    .from("timetables")
    .select("id, user_id")
    .in("user_id", allUserIds)
    .eq("year", year)
    .eq("term", term);

  const userToTimetableId = new Map(
    (timetables || []).map((t) => [t.user_id, t.id])
  );

  const allTimetableIds = (timetables || []).map((t) => t.id);

  type SlotWithTimetable = Slot & { timetable_id: string };
  let allSlots: SlotWithTimetable[] = [];
  if (allTimetableIds.length > 0) {
    const { data } = await supabase
      .from("timetable_slots")
      .select("timetable_id, day_of_week, period, course_name, is_private")
      .in("timetable_id", allTimetableIds);
    allSlots = (data || []) as SlotWithTimetable[];
  }

  const userSlots: Record<string, Slot[]> = {};
  for (const [userId, ttId] of userToTimetableId.entries()) {
    userSlots[userId] = allSlots
      .filter((s) => s.timetable_id === ttId)
      .map(({ timetable_id, ...rest }) => rest);
  }

  let friends: { id: string; display_name: string }[] = [];
  if (friendIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", friendIds);
    friends = data || [];
  }

  return (
    <CompareView
      currentUserId={user.id}
      friends={friends}
      userSlots={userSlots}
      year={year}
      term={term}
    />
  );
}