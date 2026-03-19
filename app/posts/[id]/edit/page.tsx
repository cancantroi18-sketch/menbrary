import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostEditClient from "./PostEditClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: post, error } = await supabase
    .from("posts")
    .select("*, shops(*)")
    .eq("id", id)
    .single();

  if (error || !post || post.user_id !== user.id) {
    notFound();
  }

  return <PostEditClient post={post} />;
}
