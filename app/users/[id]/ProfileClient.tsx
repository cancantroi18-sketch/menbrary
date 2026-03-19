"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface ProfileClientProps {
  profile: { id: string; username: string; avatar_url: string | null };
  posts: { id: string; image_url: string; shops: { name: string } | null }[];
  rankings: {
    rank: number;
    shops: { id: string; name: string } | null;
  }[];
  isOwnProfile: boolean;
}

export default function ProfileClient({
  profile,
  posts,
  rankings,
  isOwnProfile,
}: ProfileClientProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [username, setUsername] = useState(profile.username);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const supabase = createClient();
    let avatarUrl = profile.avatar_url;

    if (avatarFile) {
      const path = `${profile.id}/avatar-${Date.now()}`;
      await supabase.storage.from("avatars").upload(path, avatarFile, {
        upsert: true,
      });
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      avatarUrl = data.publicUrl;
    }

    await supabase
      .from("users")
      .update({ username, avatar_url: avatarUrl })
      .eq("id", profile.id);

    setEditOpen(false);
    setAvatarFile(null);
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt={profile.username}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-200 text-3xl font-bold text-amber-800">
              {profile.username.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold">{username}</h1>
          {isOwnProfile && (
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="mt-2 text-sm text-amber-600 hover:underline"
            >
              プロフィールを編集
            </button>
          )}
        </div>
      </div>

      {editOpen && isOwnProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-bold">プロフィール編集</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm">ユーザー名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">アバター画像</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="w-full"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="rounded bg-amber-600 px-4 py-2 text-white"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditOpen(false);
                  setUsername(profile.username);
                  setAvatarPreview(profile.avatar_url);
                  setAvatarFile(null);
                }}
                className="rounded border px-4 py-2"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {rankings.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold">MYランキング</h2>
          <div className="space-y-2">
            {rankings.map((r) => (
              <div key={r.rank} className="flex items-center gap-2">
                <span className="font-bold text-amber-500">{r.rank}位</span>
                <Link
                  href={`/map?shop=${r.shops?.id}`}
                  className="text-amber-600 hover:underline"
                >
                  {r.shops?.name ?? ""}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-bold">投稿一覧</h2>
        {posts.length === 0 ? (
          <p className="text-gray-800">投稿がありません</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                <div className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={post.image_url}
                    alt={post.shops?.name ?? ""}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-1 truncate text-sm">{post.shops?.name}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
