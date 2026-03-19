"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface PostEditClientProps {
  post: {
    id: string;
    flavor_type: string;
    richness: number;
    rating: number;
    comment: string | null;
    menu: string | null;
    oil_amount: number | null;
    noodle_thickness: number | null;
    other_notes: string | null;
    shops: { name: string; address: string | null } | null;
  };
}

export default function PostEditClient({ post }: PostEditClientProps) {
  const router = useRouter();
  const [rating, setRating] = useState(post.rating);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: err } = await supabase
      .from("posts")
      .update({
        rating,
      })
      .eq("id", post.id);

    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push(`/posts/${post.id}`);
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">投稿を編集</h1>
      <p className="mb-4 text-gray-900">
        店名: {post.shops?.name}（店舗情報は変更できません）
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-black">
            総合評価 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={5}
              step={0.5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="flex-1 accent-amber-500"
            />
            <span className="w-8 text-right text-xl font-bold text-amber-500">
              {rating.toFixed(1)}
            </span>
          </div>
          <div className="mt-2 flex gap-1 justify-center text-3xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="relative inline-block text-gray-200">
                ★
                <span
                  className="absolute left-0 top-0 overflow-hidden text-amber-500"
                  style={{ width: rating >= star ? "100%" : rating >= star - 0.5 ? "50%" : "0%" }}
                >
                  ★
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-md bg-amber-600 py-2 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {loading ? "保存中..." : "保存"}
          </button>
          <Link
            href={`/posts/${post.id}`}
            className="rounded-md border border-gray-300 px-4 py-2 text-center font-medium text-black hover:bg-gray-50"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
