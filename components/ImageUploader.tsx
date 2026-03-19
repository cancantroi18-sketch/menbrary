"use client";

import { useRef, useState } from "react";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPT = "image/jpeg,image/png";

interface ImageUploaderProps {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

export default function ImageUploader({ value, onChange, error }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      onChange(null);
      setPreview(null);
      return;
    }

    if (!ACCEPT.includes(file.type)) {
      onChange(null);
      setPreview(null);
      return;
    }

    if (file.size > MAX_SIZE) {
      onChange(null);
      setPreview(null);
      return;
    }

    onChange(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleRemove = () => {
    onChange(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <div className="flex flex-col items-start gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleChange}
          className="hidden"
        />
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="プレビュー"
              className="h-48 w-48 rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white hover:bg-black/70"
            >
              削除
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-800 hover:border-amber-400 hover:text-amber-600"
          >
            画像を選択（JPG/PNG・最大5MB）
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
