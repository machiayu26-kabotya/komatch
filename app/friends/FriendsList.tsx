"use client";

import { useState } from "react";
import Link from "next/link";

export default function FriendsList({
  userId,
  friends,
}: {
  userId: string;
  friends: { id: string; display_name: string; faculty: string | null; grade: number | null }[];
}) {
  const [copied, setCopied] = useState(false);

  const friendLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/friends/add/${userId}`
      : `/friends/add/${userId}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(friendLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("コピーに失敗しました。手動でコピーしてください。");
    }
  }

  return (
    <main className="min-h-screen p-6 bg-cream">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-medium text-rose">友達</h1>
          <Link href="/" className="text-sm text-ink-muted hover:text-rose underline transition">
            ← ホーム
          </Link>
        </header>

        {friends.length > 0 && (
          <Link
            href="/friends/compare"
            className="block bg-rose rounded-2xl shadow-soft p-5 mb-6 text-center hover:opacity-90 transition"
            style={{ color: "white" }}
          >
            <div className="text-base font-medium">🔍 共通の空きコマを探す</div>
            <div className="text-xs opacity-80 mt-1">友達と自分の時間割を重ねて表示</div>
          </Link>
        )}

        <div className="bg-white rounded-2xl shadow-soft p-6 mb-6">
          <h2 className="text-base font-medium text-ink mb-1">あなたの招待リンク</h2>
          <p className="text-xs text-ink-muted mb-4">
            このリンクを LINE などで友達に送ってみよう。相手が開いて承認すれば、お互いの時間割が見られるようになります。
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={friendLink}
              className="flex-1 px-3 py-2 bg-cream-deep border border-line rounded-xl text-xs text-ink-muted focus:outline-none"
              onFocus={(e) => e.target.select()}
            />
            <button
              onClick={copyLink}
              className="px-4 py-2 rounded-full bg-rose hover:opacity-90 transition text-sm whitespace-nowrap"
              style={{ color: "white" }}
            >
              {copied ? "✓ コピー済み" : "コピー"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6">
          <h2 className="text-base font-medium text-ink mb-4">
            友達リスト ({friends.length})
          </h2>

          {friends.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">👋</div>
              <p className="text-ink-muted text-sm">まだ友達がいません</p>
              <p className="text-ink-muted text-xs mt-2">
                上の招待リンクを送ってみよう
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {friends.map((friend) => (
                <li
                  key={friend.id}
                  className="flex items-center justify-between p-3 bg-cream-deep rounded-xl"
                >
                  <div>
                    <div className="font-medium text-ink">{friend.display_name}</div>
                    <div className="text-xs text-ink-muted mt-0.5">
                      {friend.faculty || "学部未設定"}
                      {friend.grade ? ` ・ ${friend.grade}年` : ""}
                    </div>
                  </div>
                  <Link
                    href={`/friends/${friend.id}`}
                    className="text-xs px-4 py-2 rounded-full bg-rose hover:opacity-90 transition"
                    style={{ color: "white" }}
                  >
                    時間割を見る
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}