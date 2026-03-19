"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { FLAVOR_TYPES } from "@/lib/types";

interface ShopWithStats {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  avg_rating: number;
  review_count: number;
  posts?: { flavor_type: string }[];
}

interface MapClientProps {
  shops: ShopWithStats[];
}

declare global {
  interface Window {
    initMap?: () => void;
  }
}

export default function MapClient({ shops }: MapClientProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [filterFlavors, setFilterFlavors] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(1);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(3);
  const [mapLoaded, setMapLoaded] = useState(false);

  const filteredShops = shops.filter((shop) => {
    if (filterFlavors.length > 0) {
      const flavors = (shop.posts ?? []).map((p) => p.flavor_type);
      if (!filterFlavors.some((f) => flavors.includes(f))) return false;
    }
    if (shop.avg_rating < minRating) return false;
    return true;
  });

  const highlightedShops = userLocation
    ? filteredShops.filter((shop) => {
        const R = 6371; // km
        const dLat = ((shop.lat - userLocation.lat) * Math.PI) / 180;
        const dLng = ((shop.lng - userLocation.lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((shop.lat * Math.PI) / 180) *
            Math.cos((userLocation.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;
        return dist <= radius && shop.avg_rating >= 4;
      })
    : [];

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 35.6762, lng: 139.6503 },
      zoom: 12,
    });

    mapInstanceRef.current = map;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    filteredShops.forEach((shop) => {
      const isHighlighted = highlightedShops.some((s) => s.id === shop.id);
      const marker = new window.google.maps.Marker({
        position: { lat: shop.lat, lng: shop.lng },
        map,
        title: shop.name,
        icon: isHighlighted
          ? {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: "#f59e0b",
              fillOpacity: 1,
              strokeColor: "#fff",
              strokeWeight: 2,
            }
          : undefined,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2 min-w-[180px]">
            <h3 class="font-semibold">${shop.name}</h3>
            <p class="text-sm text-gray-900">★${shop.avg_rating.toFixed(1)} (${shop.review_count}件)</p>
            <a href="/shops/${shop.id}" class="mt-2 inline-block text-sm text-amber-600 hover:underline">店舗詳細を見る</a>
          </div>
        `,
      });

      marker.addListener("click", () => {
        markersRef.current.forEach((m) => {
          const iw = (m as unknown as { iw?: google.maps.InfoWindow }).iw;
          if (iw) iw.close();
        });
        infoWindow.open(map, marker);
        (marker as unknown as { iw?: google.maps.InfoWindow }).iw = infoWindow;
      });

      markersRef.current.push(marker);
    });

    if (userLocation) {
      new window.google.maps.Marker({
        position: userLocation,
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });
    }
  }, [mapLoaded, filteredShops, highlightedShops, userLocation]);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("位置情報が利用できません");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          mapInstanceRef.current.setZoom(14);
        }
      },
      () => alert("位置情報を取得できませんでした")
    );
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">地図</h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <p>
            Google Maps API キーが設定されていません。.env.local に
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY を追加してください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}`}
        onLoad={() => setMapLoaded(true)}
        strategy="afterInteractive"
      />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">地図</h1>

        <div className="flex flex-col gap-4 lg:flex-row">
          <aside className="lg:w-64 lg:shrink-0 space-y-4">
            <div className="rounded-lg border bg-white p-4">
              <h3 className="mb-3 font-semibold">フィルター</h3>
              <div className="mb-3">
                <p className="mb-2 text-sm">味の種類</p>
                <div className="flex flex-wrap gap-2">
                  {FLAVOR_TYPES.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() =>
                        setFilterFlavors((prev) =>
                          prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
                        )
                      }
                      className={`rounded-full px-3 py-1 text-sm ${
                        filterFlavors.includes(f)
                          ? "bg-amber-500 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm">最低評価</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full rounded border px-2 py-1"
                >
                  <option value={1}>★1以上</option>
                  <option value={2}>★2以上</option>
                  <option value={3}>★3以上</option>
                  <option value={4}>★4以上</option>
                  <option value={5}>★5のみ</option>
                </select>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-4">
              <h3 className="mb-3 font-semibold">現在地から探す</h3>
              <button
                type="button"
                onClick={handleCurrentLocation}
                className="w-full rounded-md bg-amber-600 py-2 text-sm font-medium text-white hover:bg-amber-700"
              >
                現在地を表示
              </button>
              {userLocation && (
                <div className="mt-3">
                  <label className="mb-1 block text-sm">半径</label>
                  <select
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full rounded border px-2 py-1"
                  >
                    <option value={1}>1km</option>
                    <option value={3}>3km</option>
                    <option value={5}>5km</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-800">
                    ★4以上の店舗を強調表示
                  </p>
                </div>
              )}
            </div>
          </aside>

          <div className="min-h-[400px] flex-1 rounded-lg border bg-gray-100">
            <div ref={mapRef} className="h-[500px] w-full" />
          </div>
        </div>
      </div>
    </>
  );
}
