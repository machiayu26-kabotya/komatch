"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function addFriendAction(formData: FormData) {
  const targetId = formData.get("targetId") as string;
  if (!targetId) throw new Error("無効なリンクです");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (targetId === user.id) {
    throw new Error("自分自身は友達に追加できません");
  }

  const userA = user.id < targetId ? user.id : targetId;
  const userB = user.id < targetId ? targetId : user.id;

  const { error } = await supabase
    .from("friendships")
    .upsert(
      {
        user_a_id: userA,
        user_b_id: userB,
        status: "accepted",
        requested_by: user.id,
      },
      { onConflict: "user_a_id,user_b_id" }
    );

  if (error) {
    console.error("addFriend error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/friends");
  redirect("/friends");
}