import { createClient } from "@/lib/supabase/server";
import SearchClient from "./SearchClient";
import type { PostWithDetails } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  let posts: PostWithDetails[] = [];
  let likedPostIds: string[] = [];
  let currentUserId: string | null = null;

  const hasSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (hasSupabase) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      currentUserId = user?.id ?? null;

      const { data: postsData } = await supabase
        .from("posts")
        .select(
          `
          *,
          shops(*),
          users(*)
        `
        )
        .order("likes_count", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(100);

      posts = (postsData ?? []) as PostWithDetails[];

      if (user) {
        const { data: likes } = await supabase
          .from("likes")
          .select("post_id")
          .eq("user_id", user.id);
        likedPostIds = (likes ?? []).map((l) => l.post_id);
      }
    } catch {
      // テーブル未作成時などは空で表示
    }
  }

  return (
    <SearchClient
      initialPosts={posts}
      likedPostIds={likedPostIds}
      currentUserId={currentUserId}
    />
  );
}
