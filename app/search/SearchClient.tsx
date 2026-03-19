"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import FilterPanel, { type FilterState } from "@/components/FilterPanel";
import type { PostWithDetails } from "@/lib/types";

const defaultFilters: FilterState = {
  flavorTypes: [],
  minRating: 1,
  minRichness: 1,
  maxRichness: 5,
  minOilAmount: 1,
  maxOilAmount: 5,
  minNoodleThickness: 1,
  maxNoodleThickness: 5,
  keyword: "",
  otherNotesKeyword: "",
};

interface SearchClientProps {
  initialPosts: PostWithDetails[];
  likedPostIds: string[];
  currentUserId: string | null;
}

export default function SearchClient({
  initialPosts,
  likedPostIds,
  currentUserId,
}: SearchClientProps) {
  const [searchMode, setSearchMode] = useState<"keyword" | "map">("keyword");
  const [sortBy, setSortBy] = useState<"likes" | "new">("likes");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const filteredAndSorted = useMemo(() => {
    let list = [...initialPosts];

    if (filters.flavorTypes.length > 0) {
      list = list.filter((p) => filters.flavorTypes.includes(p.flavor_type));
    }
    list = list.filter((p) => p.rating >= filters.minRating);
    list = list.filter(
      (p) =>
        p.richness >= filters.minRichness && p.richness <= filters.maxRichness
    );

    type PostExt = PostWithDetails & {
      menu?: string | null;
      oil_amount?: number | null;
      noodle_thickness?: number | null;
      other_notes?: string | null;
    };

    if (filters.minOilAmount > 1 || filters.maxOilAmount < 5) {
      list = list.filter((p) => {
        const oil = (p as PostExt).oil_amount ?? 3;
        return oil >= filters.minOilAmount && oil <= filters.maxOilAmount;
      });
    }
    if (filters.minNoodleThickness > 1 || filters.maxNoodleThickness < 5) {
      list = list.filter((p) => {
        const thick = (p as PostExt).noodle_thickness ?? 3;
        return (
          thick >= filters.minNoodleThickness &&
          thick <= filters.maxNoodleThickness
        );
      });
    }

    const kw = filters.keyword.trim().toLowerCase();
    if (kw) {
      list = list.filter((p) => {
        const pe = p as PostExt;
        const shopName = pe.shops?.name?.toLowerCase() ?? "";
        const comment = (pe.comment ?? "").toLowerCase();
        const menu = (pe.menu ?? "").toLowerCase();
        const otherNotes = (pe.other_notes ?? "").toLowerCase();
        return (
          shopName.includes(kw) ||
          comment.includes(kw) ||
          menu.includes(kw) ||
          otherNotes.includes(kw)
        );
      });
    }

    const otherKw = filters.otherNotesKeyword.trim().toLowerCase();
    if (otherKw) {
      list = list.filter((p) => {
        const otherNotes = ((p as PostExt).other_notes ?? "").toLowerCase();
        return otherNotes.includes(otherKw);
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

  if (searchMode === "map") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setSearchMode("keyword")}
            className="rounded-md px-4 py-2 text-sm font-medium bg-gray-100 text-black hover:bg-gray-200"
          >
            キーワード検索
          </button>
          <button
            type="button"
            onClick={() => setSearchMode("map")}
            className="rounded-md px-4 py-2 text-sm font-medium bg-amber-500 text-white"
          >
            地図検索
          </button>
        </div>
        <div className="rounded-lg border bg-white p-6 text-center">
          <p className="mb-4 text-gray-900">
            地図で店舗を探すには、地図ページをご利用ください。
          </p>
          <Link
            href="/map"
            className="inline-block rounded-md bg-amber-600 px-6 py-2 font-medium text-white hover:bg-amber-700"
          >
            地図ページへ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">探す</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSearchMode("keyword")}
          className="rounded-md px-4 py-2 text-sm font-medium bg-amber-500 text-white"
        >
          キーワード検索
        </button>
        <button
          type="button"
          onClick={() => setSearchMode("map")}
          className="rounded-md px-4 py-2 text-sm font-medium bg-gray-100 text-black hover:bg-gray-200"
        >
          地図検索
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
              条件に合う投稿がありません。フィルターを変更してみてください。
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
