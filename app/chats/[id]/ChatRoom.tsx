"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { sendMessage } from "./actions";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export default function ChatRoom({
  roomId,
  title,
  currentUserId,
  memberMap,
  initialMessages,
}: {
  roomId: string;
  title: string;
  currentUserId: string;
  memberMap: Record<string, string>;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `chat_room_id=eq.${roomId}` },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  async function handleSend() {
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("roomId", roomId);
      formData.append("body", body);
      await sendMessage(formData);
      setInput("");
    } catch (e) {
      console.error(e);
      alert("メッセージ送信に失敗しました");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-cream">
      <header className="bg-rose-soft border-b border-line p-4 flex items-center gap-3">
        <Link href="/chats" className="text-ink-muted hover:text-rose">←</Link>
        <div className="flex-1">
          <div className="font-medium text-ink">{title}</div>
          <div className="text-xs text-ink-muted">{Object.keys(memberMap).length}人参加</div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-ink-muted text-sm py-10">
              まだメッセージがありません。最初の一言をどうぞ 👋
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                  {!isMe && (
                    <div className="text-xs text-ink-muted mb-1 px-2">
                      {memberMap[msg.sender_id] || "?"}
                    </div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl ${isMe ? "bg-rose" : "bg-white border border-line"}`}
                    style={isMe ? { color: "white" } : {}}
                  >
                    <div className="text-sm whitespace-pre-wrap break-words">{msg.body}</div>
                  </div>
                  <div className="text-[10px] text-ink-muted mt-1 px-2">
                    {new Date(msg.created_at).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-line p-3 bg-white">
        <div className="max-w-2xl mx-auto flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            rows={1}
            className="flex-1 px-4 py-2 border border-line rounded-2xl bg-cream-deep focus:outline-none focus:border-rose transition resize-none"
            style={{ minHeight: "40px", maxHeight: "120px" }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="px-5 py-2 rounded-full bg-rose hover:opacity-90 disabled:opacity-50 transition whitespace-nowrap"
            style={{ color: "white" }}
          >
            送信
          </button>
        </div>
      </div>
    </main>
  );
}