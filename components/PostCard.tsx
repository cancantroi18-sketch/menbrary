"use client";

import Link from "next/link";
import type { PostWithDetails } from "@/lib/types";
import LikeButton from "./LikeButton";

interface PostCardProps {
  post: PostWithDetails;
  currentUserId?: string | null;
  initialLiked?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-amber-500 text-lg">
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
      <span className="ml-1 text-sm font-bold text-black">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function PostCard({ post, currentUserId, initialLiked }: PostCardProps) {
  const shop = post.shops;
  const user = post.users;
  const commentPreview = post.comment
    ? post.comment.length > 50
      ? post.comment.slice(0, 50) + "..."
      : post.comment
    : "";

  return (
    <article className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/posts/${post.id}`} className="block">
        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={post.image_url}
            alt={shop?.name ?? "ラーメン"}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900">
            {shop ? (
              <Link
                href={`/shops/${shop.id}`}
                className="hover:text-amber-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {shop.name}
              </Link>
            ) : (
              "不明な店"
            )}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <StarRating rating={post.rating} />
          </div>
          {commentPreview && (
            <p className="mt-2 line-clamp-2 text-sm text-gray-900">{commentPreview}</p>
          )}
        </div>
      </Link>
      <div className="flex items-center justify-between border-t px-4 py-2">
        <LikeButton
          postId={post.id}
          likesCount={post.likes_count}
          currentUserId={currentUserId}
          initialLiked={initialLiked}
        />
        {user && (
          <Link
            href={`/users/${user.id}`}
            className="text-sm text-gray-800 hover:text-amber-600"
            onClick={(e) => e.stopPropagation()}
          >
            @{user.username}
          </Link>
        )}
      </div>
    </article>
  );
}
