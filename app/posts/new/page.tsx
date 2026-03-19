"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ImageUploader from "@/components/ImageUploader";
import LocationSearch from "@/components/LocationSearch";

export default function NewPostPage() {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [rating, setRating] = useState(3.0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!image) {
      setError("画像を選択してください");
      return;
    }
    if (!shopName.trim()) {
      setError("店名を入力してください");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      let shopQuery = supabase
        .from("shops")
        .select("id")
        .eq("name", shopName.trim());

      // Only match coordinate if they exist
      if (lat && lng) {
        shopQuery = shopQuery.eq("lat", lat).eq("lng", lng);
      }

      const { data: existingShop } = await shopQuery.maybeSingle();

      let shopId: string;
      if (existingShop) {
        shopId = existingShop.id;
      } else {
        const { data: newShop, error: shopErr } = await supabase
          .from("shops")
          .insert({
            name: shopName.trim(),
            address: address.trim() || null,
            lat: lat ?? null,
            lng: lng ?? null,
          })
          .select("id")
          .single();

        if (shopErr || !newShop) {
          console.error("Shop insert error:", shopErr);
          setError(`店舗の登録に失敗しました: ${shopErr?.message || "不明なエラー"}`);
          setLoading(false);
          return;
        }
        shopId = newShop.id;
      }

      // 2. 画像をアップロード
      const ext = image.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("post-images")
        .upload(path, image, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadErr) {
        setError("画像のアップロードに失敗しました: " + uploadErr.message);
        setLoading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("post-images").getPublicUrl(path);

      // 3. 投稿を作成
      const { data: post, error: postErr } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          shop_id: shopId,
          image_url: publicUrl,
          rating,
          flavor_type: null,
          richness: null,
        })
        .select("id")
        .single();

      if (postErr || !post) {
        console.error("Post insert error:", postErr);
        setError(`投稿の作成に失敗しました: ${postErr?.message || "不明なエラー"}`);
        setLoading(false);
        return;
      }

      router.push(`/posts/${post.id}`);
      router.refresh();
    } catch (err) {
      setError("エラーが発生しました");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">新規投稿</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-black">
            ラーメン画像 <span className="text-red-500">*</span>
          </label>
          <ImageUploader value={image} onChange={setImage} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-black">
            店名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="ラーメン店の名前を入力"
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-black">
              位置情報（任意）
            </label>
            <button
              type="button"
              onClick={() => setShowLocationSearch(!showLocationSearch)}
              className="text-xs font-medium text-amber-600 hover:text-amber-700 bg-amber-50 px-2 py-1 rounded"
            >
              {showLocationSearch ? "閉じる" : "📍 タグ付けする"}
            </button>
          </div>
          
          {lat && lng && !showLocationSearch && (
            <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded flex items-center gap-2">
              <span>✅ 位置情報がタグ付けされています</span>
            </div>
          )}

          {showLocationSearch && (
            <div className="p-3 border rounded-md bg-gray-50 mb-2">
              <LocationSearch
                shopName={shopName}
                onShopNameChange={(name) => {
                  if (!shopName) setShopName(name);
                }}
                address={address}
                onPlaceSelected={(place) => {
                  if (!shopName) setShopName(place.shopName);
                  setAddress(place.address);
                  setLat(place.lat);
                  setLng(place.lng);
                  setShowLocationSearch(false);
                }}
              />
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black">
            総合評価 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={5}
              step={0.5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="flex-1 accent-amber-500"
            />
            <span className="w-8 text-right text-xl font-bold text-amber-500">
              {rating.toFixed(1)}
            </span>
          </div>
          <div className="mt-2 flex gap-1 justify-center text-3xl">
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
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-md bg-amber-600 py-2 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {loading ? "投稿中..." : "投稿する"}
          </button>
          <Link
            href="/"
            className="rounded-md border border-gray-300 px-4 py-2 text-center font-medium text-black hover:bg-gray-50"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
