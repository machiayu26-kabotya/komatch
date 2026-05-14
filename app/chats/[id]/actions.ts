"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function sendMessage(formData: FormData) {
  const roomId = formData.get("roomId") as string;
  const body = (formData.get("body") as string)?.trim();

  if (!roomId || !body) throw new Error("メッセージが空です");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインしていません");

  const { error } = await supabase
    .from("messages")
    .insert({
      chat_room_id: roomId,
      sender_id: user.id,
      body,
    });

  if (error) {
    console.error("sendMessage error:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/chats/${roomId}`);
}