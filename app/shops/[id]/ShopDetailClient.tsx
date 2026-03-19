"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";


interface Shop {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
}

interface Post {
  id: string;
  image_url: string;
  flavor_type: string;
  richness: number;
  rating: number;
  comment: string | null;
  menu: string | null;
  oil_amount: number | null;
  noodle_thickness: number | null;
  other_notes: string | null;
  likes_count: number;
  created_at: string;
  users: { id: string; username: string; avatar_url: string | null } | null;
}

interface ShopDetailClientProps {
  shop: Shop;
  posts: Post[];
  hasMapApiKey: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500">
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

export default function ShopDetailClient({
  shop,
  posts,
  hasMapApiKey,
}: ShopDetailClientProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google || !hasMapApiKey)
      return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: shop.lat, lng: shop.lng },
      zoom: 16,
    });

    new window.google.maps.Marker({
      position: { lat: shop.lat, lng: shop.lng },
      map,
      title: shop.name,
    });
  }, [mapLoaded, shop, hasMapApiKey]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <>
      {hasMapApiKey && apiKey && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}`}
          onLoad={() => setMapLoaded(true)}
          strategy="afterInteractive"
        />
      )}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-amber-600 hover:underline"
          >
            ← 一覧に戻る
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{shop.name}</h1>
          {shop.address && (
            <p className="mt-2 text-gray-900">{shop.address}</p>
          )}
        </header>

        {/* 地図 */}
        {hasMapApiKey && (
          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold">地図</h2>
            <div
              ref={mapRef}
              className="h-64 w-full overflow-hidden rounded-lg border bg-gray-100"
            />
            <a
              href={`https://www.google.com/maps?q=${shop.lat},${shop.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-amber-600 hover:underline"
            >
              Google Mapsで開く
            </a>
          </section>
        )}

        {/* 写真一覧 */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold">写真一覧</h2>
          {posts.length === 0 ? (
            <p className="text-gray-800">まだ投稿がありません</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block overflow-hidden rounded-lg border bg-white transition hover:shadow-md"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={post.image_url}
                      alt={post.menu ?? "ラーメン"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <p className="truncate text-sm font-medium">
                      {post.menu ?? post.flavor_type}
                    </p>
                    <StarRating rating={post.rating} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 口コミ一覧 */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">口コミ</h2>
          {posts.length === 0 ? (
            <p className="text-gray-800">まだ口コミがありません</p>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-xl border bg-white p-4 shadow-sm"
                >
                  <div className="flex gap-4">
                    <Link
                      href={`/posts/${post.id}`}
                      className="block h-24 w-24 shrink-0 overflow-hidden rounded-lg"
                    >
                      <img
                        src={post.image_url}
                        alt={post.menu ?? "ラーメン"}
                        className="h-full w-full object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {post.menu && (
                          <span className="rounded bg-amber-100 px-2 py-0.5 text-sm font-medium text-amber-800">
                            {post.menu}
                          </span>
                        )}
                        <span className="text-sm text-gray-800">
                          {post.flavor_type}
                        </span>
                        <StarRating rating={post.rating} />
                      </div>
                      <p className="mt-1 text-sm text-gray-900">
                        濃さ: {post.richness}/5
                        {post.oil_amount != null && (
                          <> ・油: {post.oil_amount}/5</>
                        )}
                        {post.noodle_thickness != null && (
                          <> ・麵: {post.noodle_thickness}/5</>
                        )}
                      </p>
                      {post.comment && (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-black">
                          {post.comment}
                        </p>
                      )}
                      {post.other_notes && (
                        <p className="mt-1 text-xs text-gray-800">
                          その他: {post.other_notes}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        {post.users && (
                          <Link
                            href={`/users/${post.users.id}`}
                            className="text-sm text-gray-800 hover:text-amber-600"
                          >
                            @{post.users.username}
                          </Link>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-black">
                            ♥ {post.likes_count}
                          </span>
                          <Link
                            href={`/posts/${post.id}`}
                            className="text-sm text-amber-600 hover:underline"
                          >
                            詳細を見る
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
