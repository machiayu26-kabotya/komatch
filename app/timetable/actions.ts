"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveSlot({
  timetableId,
  day,
  period,
  courseName,
  room,
}: {
  timetableId: string;
  day: string;
  period: number;
  courseName: string;
  room: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("timetable_slots")
    .upsert(
      {
        timetable_id: timetableId,
        day_of_week: day,
        period,
        course_name: courseName,
        room: room || null,
        is_private: false,
      },
      { onConflict: "timetable_id,day_of_week,period" }
    );

  if (error) {
    console.error("saveSlot error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/timetable");
}

export async function deleteSlot(slotId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("timetable_slots")
    .delete()
    .eq("id", slotId);

  if (error) {
    console.error("deleteSlot error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/timetable");
}