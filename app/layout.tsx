import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "ラーメンレビューアプリ",
  description: "ラーメンの写真と感想を投稿し、地図上でラーメン店を探せるレビューコミュニティアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
