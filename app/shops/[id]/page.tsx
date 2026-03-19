import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ShopDetailClient from "./ShopDetailClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ShopDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("*")
    .eq("id", id)
    .single();

  if (shopError || !shop) {
    notFound();
  }

  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
      id,
      image_url,
      flavor_type,
      richness,
      rating,
      comment,
      menu,
      oil_amount,
      noodle_thickness,
      other_notes,
      likes_count,
      created_at,
      users(id, username, avatar_url)
    `
    )
    .eq("shop_id", id)
    .order("created_at", { ascending: false });

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <ShopDetailClient
      shop={shop}
      posts={posts ?? []}
      hasMapApiKey={!!apiKey}
    />
  );
}
