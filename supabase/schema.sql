-- ラーメンレビューアプリ データベーススキーマ
-- Supabase ダッシュボードの SQL Editor で実行してください

-- users テーブル（プロフィール情報）
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- shops テーブル（ラーメン店情報）
CREATE TABLE IF NOT EXISTS public.shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  lat float8,
  lng float8,
  created_at timestamptz DEFAULT now()
);

-- posts テーブル（レビュー投稿）
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  flavor_type text NOT NULL CHECK (flavor_type IN ('醤油', '味噌', '塩', '豚骨', '二郎系', 'その他')),
  richness int2 NOT NULL CHECK (richness >= 1 AND richness <= 5),
  rating int2 NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text CHECK (char_length(comment) <= 500),
  likes_count int4 DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  menu text,
  oil_amount int2 CHECK (oil_amount IS NULL OR (oil_amount >= 1 AND oil_amount <= 5)),
  noodle_thickness int2 CHECK (noodle_thickness IS NULL OR (noodle_thickness >= 1 AND noodle_thickness <= 5)),
  other_notes text CHECK (other_notes IS NULL OR char_length(other_notes) <= 500)
);

-- likes テーブル（いいね）
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- my_rankings テーブル（MYランキング）
CREATE TABLE IF NOT EXISTS public.my_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  rank int2 NOT NULL CHECK (rank >= 1 AND rank <= 3),
  is_public boolean DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, rank)
);

-- users テーブルに auth.users から自動挿入するトリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- いいね数更新トリガー
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS likes_count_trigger ON public.likes;
CREATE TRIGGER likes_count_trigger
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.my_rankings ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY "users_select" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_update" ON public.users FOR UPDATE USING (auth.uid() = id);

-- shops（誰でも読める・認証済みは挿入可）
CREATE POLICY "shops_select" ON public.shops FOR SELECT USING (true);
CREATE POLICY "shops_insert" ON public.shops FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- posts
CREATE POLICY "posts_select" ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_delete" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- likes
CREATE POLICY "likes_select" ON public.likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- my_rankings
CREATE POLICY "ranking_select" ON public.my_rankings FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "ranking_insert" ON public.my_rankings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ranking_update" ON public.my_rankings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ranking_delete" ON public.my_rankings FOR DELETE USING (auth.uid() = user_id);

-- Storage バケット（Supabase ダッシュボード → Storage で作成）
-- 1. post-images: 投稿画像用（Public）
-- 2. avatars: プロフィール画像用（Public）
-- 各バケットの Policies:

-- Storage自体のRLSを有効化する (すでに有効になっている場合が多いですが念の為)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 自分がアップロードした画像を登録できるようにする (INSERT)
CREATE POLICY "post_images_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 投稿画像は誰でも見れるようにする (SELECT)
CREATE POLICY "post_images_select" ON storage.objects FOR SELECT TO public USING (
  bucket_id = 'post-images'
);

-- アバターも同様
CREATE POLICY "avatars_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "avatars_select" ON storage.objects FOR SELECT TO public USING (
  bucket_id = 'avatars'
);
