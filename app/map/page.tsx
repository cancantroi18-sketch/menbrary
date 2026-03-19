import { createClient } from "@/lib/supabase/server";
import MapClient from "./MapClient";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const supabase = await createClient();

  const { data: shops } = await supabase
    .from("shops")
    .select(`
      *,
      posts(rating, flavor_type)
    `);

  // 店舗ごとに平均評価を計算
  const shopsWithAvg = (shops ?? []).map((shop) => {
    const posts = (shop as { posts?: { rating: number }[] }).posts ?? [];
    const avgRating =
      posts.length > 0
        ? posts.reduce((s, p) => s + p.rating, 0) / posts.length
        : 0;
    const reviewCount = posts.length;
    return {
      ...shop,
      avg_rating: avgRating,
      review_count: reviewCount,
    };
  });

  return <MapClient shops={shopsWithAvg} />;
}
