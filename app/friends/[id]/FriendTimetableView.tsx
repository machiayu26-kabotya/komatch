"use client";

import { Fragment } from "react";
import Link from "next/link";

const DAYS = ["mon", "tue", "wed", "thu", "fri"] as const;
const DAY_LABELS = ["月", "火", "水", "木", "金"];
const PERIODS = [1, 2, 3, 4, 5, 6];

type Slot = {
  id: string;
  day_of_week: string;
  period: number;
  course_name: string;
  room: string | null;
  is_private: boolean;
};

export default function FriendTimetableView({
  friend,
  year,
  term,
  slots,
}: {
  friend: { display_name: string; faculty: string | null; grade: number | null };
  year: number;
  term: "spring" | "fall";
  slots: Slot[];
}) {
  const slotMap = new Map<string, Slot>();
  for (const s of slots) slotMap.set(`${s.day_of_week}-${s.period}`, s);

  return (
    <main className="min-h-screen p-6 bg-cream">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-medium text-rose">
              {friend.display_name}さんの時間割
            </h1>
            <p className="text-ink-muted text-sm mt-1">
              {friend.faculty || "学部未設定"}
              {friend.grade ? ` ・ ${friend.grade}年` : ""}
              {" "}・{" "}
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
                  const slot = slotMap.get(`${day}-${period}`);
                  return (
                    <div
                      key={`${day}-${period}`}
                      className={`min-h-[64px] p-2 rounded-md text-xs ${
                        slot
                          ? slot.is_private
                            ? "bg-cream-deep border border-line"
                            : "bg-rose-soft border border-rose"
                          : "bg-white border border-dashed border-line"
                      }`}
                    >
                      {slot ? (
                        slot.is_private ? (
                          <div className="text-ink-muted italic">予定あり</div>
                        ) : (
                          <>
                            <div className="font-medium text-ink leading-tight">
                              {slot.course_name}
                            </div>
                            {slot.room && (
                              <div className="text-ink-muted mt-1 text-[10px]">
                                {slot.room}
                              </div>
                            )}
                          </>
                        )
                      ) : (
                        <span className="text-ink-muted/30">空き</span>
                      )}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-ink-muted mt-6">
          表示専用です（編集はできません）
        </p>
      </div>
    </main>
  );
}