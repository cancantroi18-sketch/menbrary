"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface LikeButtonProps {
  postId: string;
  likesCount: number;
  currentUserId: string | null | undefined;
  initialLiked?: boolean;
}

export default function LikeButton({
  postId,
  likesCount,
  currentUserId,
  initialLiked = false,
}: LikeButtonProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(likesCount);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      router.push("/auth/login");
      return;
    }

    if (loading) return;

    setLoading(true);
    const supabase = createClient();

    if (liked) {
      setLiked(false);
      setCount((c) => c - 1);
      await supabase.from("likes").delete().match({ user_id: currentUserId, post_id: postId });
    } else {
      setLiked(true);
      setCount((c) => c + 1);
      await supabase.from("likes").insert({ user_id: currentUserId, post_id: postId });
    }

    setLoading(false);
    router.refresh();
  };

  if (!currentUserId) {
    return (
      <Link
        href="/auth/login"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1 text-gray-800 hover:text-amber-500"
      >
        <span className="text-lg">♡</span>
        <span>{count}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1 text-gray-800 hover:text-amber-500 disabled:opacity-50"
    >
      <span className="text-lg">{liked ? "♥" : "♡"}</span>
      <span>{count}</span>
    </button>
  );
}
