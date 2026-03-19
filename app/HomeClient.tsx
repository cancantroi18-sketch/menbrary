"use client";

import { useState, useMemo } from "react";
import PostCard from "@/components/PostCard";
import FilterPanel, { type FilterState } from "@/components/FilterPanel";
import type { PostWithDetails } from "@/lib/types";

const defaultFilters: FilterState = {
  minRating: 1.0,
  keyword: "",
};

interface HomeClientProps {
  initialPosts: PostWithDetails[];
  likedPostIds: string[];
  currentUserId: string | null;
}

export default function HomeClient({
  initialPosts,
  likedPostIds,
  currentUserId,
}: HomeClientProps) {
  const [sortBy, setSortBy] = useState<"likes" | "new">("likes");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const filteredAndSorted = useMemo(() => {
    let list = [...initialPosts];

    list = list.filter((p) => p.rating >= filters.minRating);

    const kw = filters.keyword.trim().toLowerCase();
    if (kw) {
      list = list.filter((p) => {
        const shopName = p.shops?.name?.toLowerCase() ?? "";
        const comment = (p.comment ?? "").toLowerCase();
        return shopName.includes(kw) || comment.includes(kw);
      });
    }

    if (sortBy === "likes") {
      list.sort((a, b) => b.likes_count - a.likes_count);
    } else {
      list.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return list;
  }, [initialPosts, filters, sortBy]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">投稿一覧</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSortBy("likes")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              sortBy === "likes"
                ? "bg-amber-500 text-white"
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            いいね順
          </button>
          <button
            type="button"
            onClick={() => setSortBy("new")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              sortBy === "new"
                ? "bg-amber-500 text-white"
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            新着順
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-64 lg:shrink-0">
          <FilterPanel filters={filters} onChange={setFilters} />
        </aside>

        <div className="min-w-0 flex-1">
          {filteredAndSorted.length === 0 ? (
            <p className="py-12 text-center text-gray-800">
              投稿がありません。最初の投稿をしてみましょう！
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredAndSorted.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId}
                  initialLiked={likedPostIds.includes(post.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
