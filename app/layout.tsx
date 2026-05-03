import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Komatch — 空きコマ、合おう。",
  description: "履修登録した時間割を友達と共有して、空きコマでそのまま誘い合えるチャットアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}