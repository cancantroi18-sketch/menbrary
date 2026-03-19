"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LikeButton from "@/components/LikeButton";

interface PostDetailClientProps {
  post: {
    id: string;
    image_url: string;
    flavor_type: string;
    richness: number;
    rating: number;
    comment: string | null;
    likes_count: number;
    created_at: string;
    user_id: string;
    shops: { id: string; name: string; address: string | null } | null;
    users: { id: string; username: string } | null;
  };
  currentUserId: string | null;
  initialLiked: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-amber-500 text-2xl">
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
      <span className="ml-2 text-lg font-bold text-black">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function PostDetailClient({
  post,
  currentUserId,
  initialLiked,
}: PostDetailClientProps) {
  const router = useRouter();
  const shop = post.shops;
  const user = post.users;
  const isOwner = currentUserId === post.user_id;

  const handleDelete = async () => {
    if (!confirm("この投稿を削除しますか？")) return;
    const supabase = createClient();
    await supabase.from("posts").delete().eq("id", post.id);
    router.push("/");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <article className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={post.image_url}
            alt={shop?.name ?? "ラーメン"}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {shop ? (
              <Link href={`/shops/${shop.id}`} className="hover:text-amber-600 hover:underline">
                {shop.name}
              </Link>
            ) : (
              "不明な店"
            )}
          </h1>
          {shop?.address && (
            <p className="mt-1 text-sm text-gray-900">{shop.address}</p>
          )}

          <div className="mt-4">
            <StarRating rating={post.rating} />
          </div>

          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-4">
              <LikeButton
                postId={post.id}
                likesCount={post.likes_count}
                currentUserId={currentUserId}
                initialLiked={initialLiked}
              />
              {user && (
                <Link
                  href={`/users/${user.id}`}
                  className="text-sm text-gray-900 hover:text-amber-600"
                >
                  @{user.username}
                </Link>
              )}
            </div>
            <span className="text-sm text-gray-800">
              {new Date(post.created_at).toLocaleDateString("ja-JP")}
            </span>
          </div>

          {isOwner && (
            <div className="mt-4 flex gap-2">
              <Link
                href={`/posts/${post.id}/edit`}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
              >
                編集
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                削除
              </button>
            </div>
          )}
        </div>
      </article>

      <p className="mt-6">
        <Link href="/" className="text-amber-600 hover:underline">
          ← 一覧に戻る
        </Link>
      </p>
    </div>
  );
}
