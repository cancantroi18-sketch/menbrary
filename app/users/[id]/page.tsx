import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      shops(*)
    `)
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const { data: rankings } = await supabase
    .from("my_rankings")
    .select(`
      rank,
      is_public,
      shops(id, name)
    `)
    .eq("user_id", id)
    .eq("is_public", true)
    .order("rank");

  return (
    <ProfileClient
      profile={profile}
      posts={posts ?? []}
      rankings={rankings ?? []}
      isOwnProfile={currentUser?.id === id}
    />
  );
}
