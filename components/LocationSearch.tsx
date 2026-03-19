"use client";

import { useState, useRef } from "react";
import { Autocomplete, useLoadScript } from "@react-google-maps/api";

const libraries: ("places")[] = ["places"];

interface LocationSearchProps {
    shopName: string;
    onShopNameChange: (name: string) => void;
    address: string;
    onPlaceSelected: (place: {
        shopName: string;
        address: string;
        lat: number;
        lng: number;
    }) => void;
}

export default function LocationSearch({
    shopName,
    onShopNameChange,
    address,
    onPlaceSelected
}: LocationSearchProps) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries,
        language: "ja",
        region: "JP",
    });

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
        // 日本国内の店舗を優先
        autocomplete.setComponentRestrictions({ country: "jp" });
        autocomplete.setFields(["name", "formatted_address", "geometry"]);
    };

    const onPlaceChanged = () => {
        try {
            if (autocompleteRef.current !== null) {
                const place = autocompleteRef.current.getPlace();

                // If the user presses enter without selecting a suggestion, place may be undefined or lack details.
                if (!place || !place.name) return;

                const newShopName = place.name || "";
                const newAddress = place.formatted_address || "";
                const lat = place.geometry?.location?.lat() || 0;
                const lng = place.geometry?.location?.lng() || 0;

                if (newShopName) {
                    onShopNameChange(newShopName);
                }

                if (newShopName && lat && lng) {
                    onPlaceSelected({
                        shopName: newShopName,
                        address: newAddress,
                        lat,
                        lng,
                    });
                }
            }
        } catch (error) {
            console.error("Google Maps Autocomplete Error:", error);
        }
    };

    if (loadError) {
        return <div className="text-red-500 text-sm">Google Maps APIの読み込みに失敗しました。APIキーを確認してください。</div>;
    }

    if (!isLoaded) {
        return <div className="text-gray-800 text-sm animate-pulse">マップを読み込み中...</div>;
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-black mb-1">
                    場所を検索 (Google Maps)
                </label>
                <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                    <input
                        type="text"
                        defaultValue={shopName}
                        onChange={(e) => onShopNameChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                            }
                        }}
                        placeholder="店舗名や住所で検索..."
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                </Autocomplete>
                <p className="mt-1 text-xs text-gray-800">
                    検索候補から選択すると位置情報が自動でタグ付けされます。
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-black mb-1">
                    取得された住所
                </label>
                <input
                    type="text"
                    value={address}
                    readOnly
                    placeholder="まだ場所が選択されていません"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 text-gray-800 focus:outline-none text-sm"
                />
            </div>
        </div>
    );
}
