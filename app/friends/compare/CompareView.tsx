"use client";

import { Fragment, useState } from "react";
import Link from "next/link";

const DAYS = ["mon", "tue", "wed", "thu", "fri"] as const;
const DAY_LABELS = ["月", "火", "水", "木", "金"];
const PERIODS = [1, 2, 3, 4, 5, 6];

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(friends.map((f) => f.id))
  );

  function toggleFriend(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function getMySlot(day: string, period: number): Slot | undefined {
    return (userSlots[currentUserId] || []).find(
      (s) => s.day_of_week === day && s.period === period
    );
  }

  function countFriendsBusy(day: string, period: number): number {
    let count = 0;
    for (const id of selectedIds) {
      const slots = userSlots[id] || [];
      if (slots.some((s) => s.day_of_week === day && s.period === period)) {
        count++;
      }
    }
    return count;
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
          <Link
            href="/friends"
            className="text-sm text-ink-muted hover:text-rose underline transition"
          >
            ← 友達一覧
          </Link>
        </header>

        <div className="bg-white rounded-2xl shadow-soft p-5 mb-6">
          <p className="text-sm text-ink-muted mb-3">比較する相手を選ぶ</p>
          <div className="flex flex-wrap gap-2">
            <div
              className="px-4 py-2 rounded-full bg-rose text-sm"
              style={{ color: "white" }}
            >
              あなた
            </div>
            {friends.length === 0 ? (
              <p className="text-sm text-ink-muted py-2">
                友達がいません。先に友達を追加してください。
              </p>
            ) : (
              friends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => toggleFriend(friend.id)}
                  className={`px-4 py-2 rounded-full text-sm transition ${
                    selectedIds.has(friend.id)
                      ? "bg-rose-soft border border-rose"
                      : "bg-cream-deep border border-line text-ink-muted"
                  }`}
                  style={
                    selectedIds.has(friend.id) ? { color: "#993556" } : {}
                  }
                >
                  {friend.display_name}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-5">
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: "32px repeat(5, 1fr)" }}
          >
            <div></div>
            {DAY_LABELS.map((label) => (
              <div
                key={label}
                className="text-center text-xs text-ink-muted py-2 bg-cream-deep rounded-md"
              >
                {label}
              </div>
            ))}

            {PERIODS.map((period) => (
              <Fragment key={period}>
                <div className="flex items-center justify-center text-xs text-ink-muted bg-cream-deep rounded-md">
                  {period}
                </div>
                {DAYS.map((day) => {
                  const mySlot = getMySlot(day, period);
                  const friendsBusyCount = countFriendsBusy(day, period);
                  const totalFriends = selectedIds.size;

                  if (mySlot) {
                    return (
                      <div
                        key={`${day}-${period}`}
                        className="min-h-[64px] p-2 rounded-md text-xs bg-rose-soft border border-rose"
                      >
                        <div className="font-medium text-ink leading-tight">
                          {mySlot.course_name}
                        </div>
                        <div className="text-ink-muted text-[10px] mt-1">
                          あなたの授業
                        </div>
                      </div>
                    );
                  }

                  if (totalFriends === 0 || friendsBusyCount === 0) {
                    return (
                      <div
                        key={`${day}-${period}`}
                        className="min-h-[64px] p-2 rounded-md text-xs bg-mint"
                        style={{ borderWidth: 1, borderStyle: "solid", borderColor: "#88C9A3" }}
                      >
                        <div className="font-medium" style={{ color: "#0F6E56" }}>
                          全員空き
                        </div>
                        <div className="text-[10px] mt-1" style={{ color: "#0F6E56" }}>
                          {totalFriends + 1}人
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`${day}-${period}`}
                      className="min-h-[64px] p-2 rounded-md text-xs bg-cream-deep border border-line"
                    >
                      <div className="text-ink-muted text-[10px]">
                        {totalFriends - friendsBusyCount + 1} / {totalFriends + 1}人空き
                      </div>
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>

          <div className="mt-4 flex gap-4 text-xs text-ink-muted flex-wrap">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block w-3 h-3 rounded"
                style={{ background: "#C8E8D0", border: "1px solid #88C9A3" }}
              ></span>
              全員空き
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-rose-soft border border-rose"></span>
              あなたの授業
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-cream-deep border border-line"></span>
              一部空き
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}