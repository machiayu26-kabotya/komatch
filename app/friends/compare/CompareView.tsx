"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createInviteAndChat } from "./actions";

const DAYS = ["mon", "tue", "wed", "thu", "fri"] as const;
const DAY_LABELS = ["月", "火", "水", "木", "金"];
const PERIODS = [1, 2, 3, 4, 5, 6];

const CATEGORIES = [
  { value: "lunch", label: "🍙 ランチ" },
  { value: "cafe", label: "☕ カフェ" },
  { value: "study", label: "📚 勉強" },
  { value: "casual", label: "🎮 なんとなく" },
];

type Slot = {
  day_of_week: string;
  period: number;
  course_name: string;
  is_private: boolean;
};

type Friend = { id: string; display_name: string };

export default function CompareView({
  currentUserId,
  friends,
  userSlots,
  year,
  term,
}: {
  currentUserId: string;
  friends: Friend[];
  userSlots: Record<string, Slot[]>;
  year: number;
  term: "spring" | "fall";
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(friends.map(f => f.id)));
  const [invitingCell, setInvitingCell] = useState<{ day: string; period: number } | null>(null);
  const [category, setCategory] = useState("lunch");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleFriend(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function getMySlot(day: string, period: number): Slot | undefined {
    return (userSlots[currentUserId] || []).find(s => s.day_of_week === day && s.period === period);
  }

  function countFriendsBusy(day: string, period: number): number {
    let count = 0;
    for (const id of selectedIds) {
      const slots = userSlots[id] || [];
      if (slots.some(s => s.day_of_week === day && s.period === period)) count++;
    }
    return count;
  }

  function openInviteModal(day: string, period: number) {
    setInvitingCell({ day, period });
    setCategory("lunch");
    setMessage("");
    setError(null);
  }

  async function handleInviteSubmit() {
    if (!invitingCell || selectedIds.size === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("day", invitingCell.day);
      formData.append("period", String(invitingCell.period));
      formData.append("category", category);
      formData.append("message", message);
      formData.append("recipientIds", Array.from(selectedIds).join(","));
      const result = await createInviteAndChat(formData);
      router.push(`/chats/${result.chatRoomId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen p-6 bg-cream">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-medium text-rose">共通の空きコマ</h1>
            <p className="text-ink-muted text-sm mt-1">
              {year}年 {term === "spring" ? "前期" : "後期"}
            </p>
          </div>
          <Link href="/friends" className="text-sm text-ink-muted hover:text-rose underline">
            ← 友達一覧
          </Link>
        </header>

        <div className="bg-white rounded-2xl shadow-soft p-5 mb-6">
          <p className="text-sm text-ink-muted mb-3">比較する相手を選ぶ</p>
          <div className="flex flex-wrap gap-2">
            <div className="px-4 py-2 rounded-full bg-rose text-sm" style={{ color: "white" }}>あなた</div>
            {friends.length === 0 ? (
              <p className="text-sm text-ink-muted py-2">友達がいません。先に友達を追加してください。</p>
            ) : friends.map(friend => (
              <button
                key={friend.id}
                onClick={() => toggleFriend(friend.id)}
                className={`px-4 py-2 rounded-full text-sm transition ${
                  selectedIds.has(friend.id)
                    ? "bg-rose-soft border border-rose"
                    : "bg-cream-deep border border-line text-ink-muted"
                }`}
                style={selectedIds.has(friend.id) ? { color: "#993556" } : {}}
              >
                {friend.display_name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-5">
          <p className="text-xs text-ink-muted mb-3">緑色のコマ（全員空き）をタップすると、招待できます</p>
          <div className="grid gap-2" style={{ gridTemplateColumns: "32px repeat(5, 1fr)" }}>
            <div></div>
            {DAY_LABELS.map(label => (
              <div key={label} className="text-center text-xs text-ink-muted py-2 bg-cream-deep rounded-md">{label}</div>
            ))}
            {PERIODS.map(period => (
              <Fragment key={period}>
                <div className="flex items-center justify-center text-xs text-ink-muted bg-cream-deep rounded-md">{period}</div>
                {DAYS.map(day => {
                  const mySlot = getMySlot(day, period);
                  const friendsBusyCount = countFriendsBusy(day, period);
                  const totalFriends = selectedIds.size;

                  if (mySlot) {
                    return (
                      <div key={`${day}-${period}`} className="min-h-[64px] p-2 rounded-md text-xs bg-rose-soft border border-rose">
                        <div className="font-medium text-ink leading-tight">{mySlot.course_name}</div>
                        <div className="text-ink-muted text-[10px] mt-1">あなたの授業</div>
                      </div>
                    );
                  }

                  if (totalFriends > 0 && friendsBusyCount === 0) {
                    return (
                      <button
                        key={`${day}-${period}`}
                        onClick={() => openInviteModal(day, period)}
                        className="min-h-[64px] p-2 rounded-md text-xs bg-mint transition hover:opacity-80"
                        style={{ borderWidth: 1, borderStyle: "solid", borderColor: "#88C9A3" }}
                      >
                        <div className="font-medium" style={{ color: "#0F6E56" }}>全員空き</div>
                        <div className="text-[10px] mt-1" style={{ color: "#0F6E56" }}>{totalFriends + 1}人 ・ タップ</div>
                      </button>
                    );
                  }

                  if (totalFriends === 0) {
                    return (
                      <div key={`${day}-${period}`} className="min-h-[64px] p-2 rounded-md text-xs bg-mint"
                        style={{ borderWidth: 1, borderStyle: "solid", borderColor: "#88C9A3" }}>
                        <div className="font-medium" style={{ color: "#0F6E56" }}>空き</div>
                      </div>
                    );
                  }

                  return (
                    <div key={`${day}-${period}`} className="min-h-[64px] p-2 rounded-md text-xs bg-cream-deep border border-line">
                      <div className="text-ink-muted text-[10px]">{totalFriends - friendsBusyCount + 1} / {totalFriends + 1}人空き</div>
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      {invitingCell && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-soft">
            <h2 className="text-lg font-medium text-rose mb-1">
              {DAY_LABELS[DAYS.indexOf(invitingCell.day as typeof DAYS[number])]}{invitingCell.period}限 に誘う
            </h2>
            <p className="text-ink-muted text-xs mb-4">{selectedIds.size}人の友達 + あなた</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">何して過ごす？</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`px-4 py-2 rounded-full text-sm transition ${
                        category === cat.value
                          ? "bg-rose"
                          : "bg-cream-deep border border-line text-ink-muted"
                      }`}
                      style={category === cat.value ? { color: "white" } : {}}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">メッセージ（任意）</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="どこ集合する？"
                  rows={2}
                  className="w-full px-3 py-2 border border-line rounded-xl bg-cream-deep focus:outline-none focus:border-rose transition resize-none"
                />
              </div>

              {error && <div className="bg-hard rounded-xl p-3 text-sm">{error}</div>}
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setInvitingCell(null)}
                disabled={submitting}
                className="flex-1 px-4 py-2 rounded-full bg-cream-deep text-ink-muted hover:opacity-80 transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleInviteSubmit}
                disabled={submitting || selectedIds.size === 0}
                className="flex-1 px-4 py-2 rounded-full bg-rose hover:opacity-90 disabled:opacity-50 transition"
                style={{ color: "white" }}
              >
                {submitting ? "送信中..." : "招待を送る"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}