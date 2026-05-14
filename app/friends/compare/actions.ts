"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const DAY_LABELS_JP: Record<string, string> = {
  mon: "月", tue: "火", wed: "水", thu: "木", fri: "金",
};

const CATEGORY_LABELS: Record<string, string> = {
  lunch: "🍙 ランチ",
  cafe: "☕ カフェ",
  study: "📚 勉強",
  casual: "🎮 なんとなく",
};

function computeStartsAt(dayOfWeek: string, period: number): Date {
  const dayMap: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  const targetDay = dayMap[dayOfWeek] ?? 1;
  const now = new Date();
  const today = now.getDay();
  const daysToAdd = (targetDay - today + 7) % 7;
  const date = new Date(now);
  date.setDate(now.getDate() + daysToAdd);
  const periodTimes = [
    { h: 9, m: 0 }, { h: 10, m: 40 }, { h: 13, m: 0 },
    { h: 14, m: 45 }, { h: 16, m: 30 }, { h: 18, m: 15 },
  ];
  const time = periodTimes[period - 1] || { h: 9, m: 0 };
  date.setHours(time.h, time.m, 0, 0);
  return date;
}

export async function createInviteAndChat(formData: FormData): Promise<{ chatRoomId: string }> {
  const day = formData.get("day") as string;
  const period = parseInt(formData.get("period") as string, 10);
  const category = formData.get("category") as string;
  const message = (formData.get("message") as string)?.trim() || null;
  const recipientIdsStr = formData.get("recipientIds") as string;
  const recipientIds = recipientIdsStr ? recipientIdsStr.split(",").filter(Boolean) : [];

  if (!day || !period || !category) throw new Error("必要な情報が不足しています");
  if (recipientIds.length === 0) throw new Error("少なくとも1人の友達を選んでください");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインしていません");

  const startsAt = computeStartsAt(day, period);

  const { data: invite, error: inviteError } = await supabase
    .from("invites")
    .insert({
      sender_id: user.id,
      date: startsAt.toISOString().split("T")[0],
      period,
      category,
      message,
      starts_at: startsAt.toISOString(),
    })
    .select("id")
    .single();

  if (inviteError || !invite) throw new Error(inviteError?.message || "招待作成失敗");

  const recipientRecords = recipientIds.map((rid) => ({
    invite_id: invite.id,
    user_id: rid,
    response: "accepted",
    responded_at: new Date().toISOString(),
  }));
  const { error: recError } = await supabase.from("invite_recipients").insert(recipientRecords);
  if (recError) throw new Error(recError.message);

  const title = `${CATEGORY_LABELS[category] || category} ${DAY_LABELS_JP[day] || day}${period}限`;
  const { data: chatRoom, error: roomError } = await supabase
    .from("chat_rooms")
    .insert({ invite_id: invite.id, title })
    .select("id")
    .single();
  if (roomError || !chatRoom) throw new Error(roomError?.message || "ルーム作成失敗");

  const memberRecords = [
    { chat_room_id: chatRoom.id, user_id: user.id },
    ...recipientIds.map((rid) => ({ chat_room_id: chatRoom.id, user_id: rid })),
  ];
  const { error: memError } = await supabase.from("chat_room_members").insert(memberRecords);
  if (memError) throw new Error(memError.message);

  revalidatePath("/chats");
  return { chatRoomId: chatRoom.id };
}