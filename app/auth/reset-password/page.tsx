"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password/confirm`,
    });

    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="mb-8 text-2xl font-bold">パスワードリセット</h1>
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
          {email} にパスワードリセット用のメールを送信しました。メール内のリンクから新しいパスワードを設定してください。
        </div>
        <p className="mt-6">
          <Link href="/auth/login" className="text-amber-600 hover:underline">
            ログイン画面に戻る
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 text-2xl font-bold">パスワードリセット</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-black">
            登録済みのメールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="example@email.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-amber-600 py-2 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? "送信中..." : "リセットメールを送信"}
        </button>
      </form>

      <p className="mt-6">
        <Link href="/auth/login" className="text-sm text-amber-600 hover:underline">
          ログイン画面に戻る
        </Link>
      </p>
    </div>
  );
}
