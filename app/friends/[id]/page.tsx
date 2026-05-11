import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import FriendTimetableView from "./FriendTimetableView";

function getCurrentTerm(): { year: number; term: "spring" | "fall" } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 4 && month <= 9) return { year, term: "spring" };
  if (month >= 10) return { year, term: "fall" };
  return { year: year - 1, term: "fall" };
}

export default async function FriendTimetablePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: friendId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: friendProfile } = await supabase
    .from("profiles")
    .select("display_name, faculty, grade")
    .eq("id", friendId)
    .maybeSingle();

  if (!friendProfile) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-cream">
        <div className="bg-white rounded-2xl shadow-soft p-8 max-w-md w-full text-center">
          <p className="text-ink mb-2">この方の時間割は見られません</p>
          <p className="text-xs text-ink-muted mb-6">
            友達ではないか、まだ存在していないアカウントの可能性があります
          </p>
          <Link href="/friends" className="text-rose underline text-sm">
            ← 友達一覧に戻る
          </Link>
        </div>
      </main>
    );
  }

  const { year, term } = getCurrentTerm();

  const { data: timetable } = await supabase
    .from("timetables")
    .select("id")
    .eq("user_id", friendId)
    .eq("year", year)
    .eq("term", term)
    .maybeSingle();

  type Slot = {
    id: string;
    day_of_week: string;
    period: number;
    course_name: string;
    room: string | null;
    is_private: boolean;
  };

  let slots: Slot[] = [];
  if (timetable) {
    const { data } = await supabase
      .from("timetable_slots")
      .select("id, day_of_week, period, course_name, room, is_private")
      .eq("timetable_id", timetable.id);
    slots = (data || []) as Slot[];
  }

  return (
    <FriendTimetableView
      friend={friendProfile}
      year={year}
      term={term}
      slots={slots}
    />
  );
}