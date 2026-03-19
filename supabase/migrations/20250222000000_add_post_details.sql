-- posts テーブルにメニュー、油の量、麵の太さ、その他自由記述を追加
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS menu text,
  ADD COLUMN IF NOT EXISTS oil_amount int2 CHECK (oil_amount IS NULL OR (oil_amount >= 1 AND oil_amount <= 5)),
  ADD COLUMN IF NOT EXISTS noodle_thickness int2 CHECK (noodle_thickness IS NULL OR (noodle_thickness >= 1 AND noodle_thickness <= 5)),
  ADD COLUMN IF NOT EXISTS other_notes text CHECK (other_notes IS NULL OR char_length(other_notes) <= 500);
