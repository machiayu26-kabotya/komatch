import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TimetableEditor from "./TimetableEditor";

function getCurrentTerm(): { year: number; term: "spring" | "fall" } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 4 && month <= 9) return { year, term: "spring" };
  if (month >= 10) return { year, term: "fall" };
  return { year: year - 1, term: "fall" };
}

export default async function TimetablePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { year, term } = getCurrentTerm();

  let { data: timetable } = await supabase
    .from("timetables")
    .select("id, year, term")
    .eq("user_id", user.id)
    .eq("year", year)
    .eq("term", term)
    .maybeSingle();

  if (!timetable) {
    const { data: created } = await supabase
      .from("timetables")
      .insert({ user_id: user.id, year, term })
      .select("id, year, term")
      .single();
    timetable = created;
  }

  if (!timetable) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-cream p-6">
        <div className="text-ink-muted">時間割の読み込みに失敗しました</div>
      </main>
    );
  }

  const { data: slots } = await supabase
    .from("timetable_slots")
    .select("id, day_of_week, period, course_name, room")
    .eq("timetable_id", timetable.id);

  return (
    <TimetableEditor
      timetableId={timetable.id}
      year={timetable.year}
      term={timetable.term as "spring" | "fall"}
      slots={slots || []}
    />
  );
}