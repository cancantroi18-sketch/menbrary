import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PostDetailClient from "./PostDetailClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      shops(*),
      users(*)
    `
    )
    .eq("id", id)
    .single();

  if (error || !post) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: like } = user
    ? await supabase
        .from("likes")
        .select("id")
        .eq("post_id", id)
        .eq("user_id", user.id)
        .single()
    : { data: null };

  return (
    <PostDetailClient
      post={post}
      currentUserId={user?.id ?? null}
      initialLiked={!!like}
    />
  );
}
