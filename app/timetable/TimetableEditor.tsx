"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveSlot, deleteSlot } from "./actions";

const DAYS = ["mon", "tue", "wed", "thu", "fri"] as const;
const DAY_LABELS = ["月", "火", "水", "木", "金"];
const PERIODS = [1, 2, 3, 4, 5, 6];

type DayOfWeek = (typeof DAYS)[number];
type Slot = {
  id: string;
  day_of_week: string;
  period: number;
  course_name: string;
  room: string | null;
};

type Editing = { day: DayOfWeek; period: number } | null;

export default function TimetableEditor({
  timetableId,
  year,
  term,
  slots,
}: {
  timetableId: string;
  year: number;
  term: "spring" | "fall";
  slots: Slot[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);
  const [courseName, setCourseName] = useState("");
  const [room, setRoom] = useState("");
  const [saving, setSaving] = useState(false);

  const slotMap = new Map<string, Slot>();
  for (const s of slots) slotMap.set(`${s.day_of_week}-${s.period}`, s);

  function openEdit(day: DayOfWeek, period: number) {
    const slot = slotMap.get(`${day}-${period}`);
    setCourseName(slot?.course_name || "");
    setRoom(slot?.room || "");
    setEditing({ day, period });
  }

  async function handleSave() {
    if (!editing) return;
    if (!courseName.trim()) return;
    setSaving(true);
    await saveSlot({
      timetableId,
      day: editing.day,
      period: editing.period,
      courseName: courseName.trim(),
      room: room.trim(),
    });
    setEditing(null);
    setSaving(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!editing) return;
    const slot = slotMap.get(`${editing.day}-${editing.period}`);
    if (!slot) return;
    setSaving(true);
    await deleteSlot(slot.id);
    setEditing(null);
    setSaving(false);
    router.refresh();
  }

  return (
    <main className="min-h-screen p-6 bg-cream">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-medium text-rose">My 時間割</h1>
            <p className="text-ink-muted text-sm mt-1">
              {year}年 {term === "spring" ? "前期" : "後期"}
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-ink-muted hover:text-rose underline transition"
          >
            ← ホーム
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
                    <button
                      key={`${day}-${period}`}
                      onClick={() => openEdit(day, period)}
                      className={`min-h-[64px] p-2 rounded-md text-left text-xs transition ${
                        slot
                          ? "bg-rose-soft border border-rose hover:opacity-80"
                          : "bg-cream-deep border border-dashed border-line hover:bg-line/40"
                      }`}
                    >
                      {slot ? (
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
                      ) : (
                        <span className="text-ink-muted/40 text-base">+</span>
                      )}
                    </button>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-soft">
            <h2 className="text-lg font-medium text-rose mb-1">
              {DAY_LABELS[DAYS.indexOf(editing.day)]}
              {editing.period}限
            </h2>
            <p className="text-ink-muted text-xs mb-4">
              {slotMap.has(`${editing.day}-${editing.period}`)
                ? "授業を編集"
                : "新しい授業を追加"}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">授業名</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="ミクロ経済学入門"
                  className="w-full px-3 py-2 border border-line rounded-xl bg-cream-deep focus:outline-none focus:border-rose transition"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">教室</label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="B201"
                  className="w-full px-3 py-2 border border-line rounded-xl bg-cream-deep focus:outline-none focus:border-rose transition"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setEditing(null)}
                disabled={saving}
                className="flex-1 px-4 py-2 rounded-full bg-cream-deep text-ink-muted hover:opacity-80 transition"
              >
                キャンセル
              </button>
              {slotMap.has(`${editing.day}-${editing.period}`) && (
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-4 py-2 rounded-full bg-hard hover:opacity-80 transition"
                  style={{ color: "#993556" }}
                >
                  削除
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving || !courseName.trim()}
                className="flex-1 px-4 py-2 rounded-full bg-rose hover:opacity-90 disabled:opacity-50 transition"
                style={{ color: "white" }}
              >
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}