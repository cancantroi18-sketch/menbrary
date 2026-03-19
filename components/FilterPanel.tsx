"use client";

export interface FilterState {
  minRating: number;
  keyword: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export const defaultFilterState: FilterState = {
  minRating: 1.0,
  keyword: "",
};

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <h3 className="mb-3 font-semibold text-gray-800">絞り込み検索</h3>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-black">
          キーワード
        </label>
        <input
          type="text"
          value={filters.keyword}
          onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
          placeholder="店名などで検索"
          className="w-full rounded border px-2 py-1.5 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-black">
          最低評価（★ {filters.minRating.toFixed(1)} 以上）
        </label>
        <input
          type="range"
          min={1}
          max={5}
          step={0.5}
          value={filters.minRating}
          onChange={(e) =>
            onChange({ ...filters, minRating: Number(e.target.value) })
          }
          className="w-full accent-amber-500"
        />
      </div>
    </div>
  );
}
