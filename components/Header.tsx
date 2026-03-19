"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const getInitialUser = async () => {
      try {
        const {
          data: { user: u },
        } = await supabase.auth.getUser();
        setUser(u);
        if (u) {
          const { data } = await supabase
            .from("users")
            .select("username, avatar_url")
            .eq("id", u.id)
            .single();
          if (data) {
            setUsername(data.username);
            setAvatarUrl(data.avatar_url);
          }
        }
      } catch {
        // エラー時は未ログインとして表示
      }
    };

    getInitialUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("users")
          .select("username, avatar_url")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUsername(data.username);
              setAvatarUrl(data.avatar_url);
            }
          });
      } else {
        setUsername(null);
        setAvatarUrl(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/", label: "ホーム" },
    { href: "/search", label: "探す" },
    { href: "/map", label: "地図" },
    { href: "/posts/new", label: "投稿する" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-amber-700">
          ラーメンレビュー
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium ${
                pathname === link.href
                  ? "text-amber-600"
                  : "text-gray-900 hover:text-amber-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100"
                aria-expanded={menuOpen}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={username ?? ""}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200 text-sm font-medium text-amber-800">
                    {(username ?? "U").charAt(0)}
                  </div>
                )}
                <span className="hidden text-sm md:inline">{username}</span>
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg">
                    <Link
                      href={`/users/${user.id}`}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      プロフィール
                    </Link>
                    <Link
                      href="/ranking"
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      MYランキング
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-black hover:bg-gray-50"
                    >
                      ログアウト
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100"
              >
                ログイン
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
              >
                新規登録
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* モバイル用ナビ */}
      <nav className="flex border-t md:hidden">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 py-3 text-center text-sm ${
              pathname === link.href
                ? "border-b-2 border-amber-600 text-amber-600"
                : "text-gray-900"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
