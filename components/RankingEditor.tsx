"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface RankingItem {
  id: string;
  shop_id: string;
  shop_name: string;
  rank: number;
  is_public: boolean;
}

interface RankingEditorProps {
  userId: string;
}

export default function RankingEditor({ userId }: RankingEditorProps) {
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; name: string }[]>([]);
  const [editingRank, setEditingRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("my_rankings")
        .select(`
          id,
          shop_id,
          rank,
          is_public,
          shops(id, name)
        `)
        .eq("user_id", userId)
        .order("rank");

      const items: RankingItem[] = [1, 2, 3].map((r) => {
        const found = (data ?? []).find((d) => d.rank === r);
        const shop = found?.shops as { id: string; name: string } | null;
        return {
          id: found?.id ?? "",
          shop_id: shop?.id ?? "",
          shop_name: shop?.name ?? "",
          rank: r,
          is_public: found?.is_public ?? true,
        };
      });
      setRankings(items);
      setLoading(false);
    };
    load();
  }, [userId]);

  const searchShops = async () => {
    if (!searchQuery.trim()) return;
    const { data } = await supabase
      .from("shops")
      .select("id, name")
      .ilike("name", `%${searchQuery}%`)
      .limit(10);
    setSearchResults(data ?? []);
  };

  const assignShop = async (rank: number, shopId: string, shopName: string) => {
    const existing = rankings.find((r) => r.rank === rank);
    if (existing?.id) {
      await supabase
        .from("my_rankings")
        .update({ shop_id: shopId, is_public: existing.is_public })
        .eq("id", existing.id);
    } else {
      await supabase.from("my_rankings").insert({
        user_id: userId,
        shop_id: shopId,
        rank,
        is_public: true,
      });
    }
    setRankings((prev) =>
      prev.map((r) =>
        r.rank === rank ? { ...r, shop_id: shopId, shop_name: shopName } : r
      )
    );
    setEditingRank(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const togglePublic = async (rank: number, isPublic: boolean) => {
    const item = rankings.find((r) => r.rank === rank);
    if (!item?.id) return;
    await supabase.from("my_rankings").update({ is_public: isPublic }).eq("id", item.id);
    setRankings((prev) =>
      prev.map((r) => (r.rank === rank ? { ...r, is_public: isPublic } : r))
    );
  };

  const removeShop = async (rank: number) => {
    const item = rankings.find((r) => r.rank === rank);
    if (item?.id) {
      await supabase.from("my_rankings").delete().eq("id", item.id);
    }
    setRankings((prev) =>
      prev.map((r) =>
        r.rank === rank ? { ...r, id: "", shop_id: "", shop_name: "" } : r
      )
    );
    setEditingRank(null);
  };

  if (loading) return <p className="text-gray-800">読み込み中...</p>;

  return (
    <div className="space-y-4">
      {rankings.map((item) => (
        <div
          key={item.rank}
          className="flex flex-col gap-2 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-amber-500">{item.rank}位</span>
            {editingRank === item.rank ? (
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchShops()}
                  placeholder="店名で検索"
                  className="w-full rounded border px-3 py-2"
                />
                <div className="mt-2 max-h-40 overflow-y-auto">
                  {searchResults.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => assignShop(item.rank, s.id, s.name)}
                      className="block w-full px-3 py-2 text-left hover:bg-gray-100"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={searchShops}
                    className="rounded bg-amber-600 px-3 py-1 text-sm text-white"
                  >
                    検索
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingRank(null)}
                    className="rounded border px-3 py-1 text-sm"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="font-medium">
                  {item.shop_name || "未登録"}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingRank(item.rank)}
                  className="text-sm text-amber-600 hover:underline"
                >
                  {item.shop_name ? "変更" : "登録"}
                </button>
                {item.shop_name && (
                  <button
                    type="button"
                    onClick={() => removeShop(item.rank)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    削除
                  </button>
                )}
              </>
            )}
          </div>
          {item.shop_name && editingRank !== item.rank && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.is_public}
                onChange={(e) => togglePublic(item.rank, e.target.checked)}
              />
              <span className="text-sm">公開</span>
            </label>
          )}
        </div>
      ))}
    </div>
  );
}
