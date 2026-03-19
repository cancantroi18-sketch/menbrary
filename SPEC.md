# ラーメンレビューWebアプリ 仕様書 v2.0

> Cursor向け開発仕様書 | 初心者向け構成

---

## 1. プロジェクト概要

ユーザーがラーメンの写真と感想を投稿し、地図上でラーメン店を探せるレビューコミュニティアプリ。

### 主な機能
- ラーメン画像＋レビューの投稿
- いいね機能（いいね数が多い投稿が上位表示）
- Google マップ連携（店舗をピン表示・フィルタリング）
- MYランキング（好きな店Best 3を登録・公開/非公開選択可）
- 他ユーザーの投稿・ランキング閲覧

---

## 2. 技術スタック

| カテゴリ | 技術 | 理由 |
|----------|------|------|
| フロントエンド | Next.js 14 (App Router) + TypeScript | 最もメジャーなReactフレームワーク |
| スタイリング | Tailwind CSS | クラス名だけでデザイン可能 |
| バックエンド / DB | Supabase (PostgreSQL + Auth + Storage) | DB・認証・画像保存が一体で初心者向け |
| 地図 | Google Maps JavaScript API + Places API | 日本語対応が充実 |
| デプロイ | Vercel | Next.jsと相性最良・無料枠あり |

---

## 3. 認証

### 方式: メールアドレス＋パスワード（Supabase Auth）

- 新規登録: メールアドレス・パスワード・ユーザー名を入力
- ログイン: メールアドレス＋パスワード
- パスワードリセット: メール送信によるリセット（Supabase標準機能）
- メール確認: 登録後に確認メールを送信（Supabase設定で有効化）

### 権限の考え方
| 機能 | 未ログイン | ログイン済み |
|------|-----------|-------------|
| 投稿・地図の閲覧 | ✅ 可能 | ✅ 可能 |
| 投稿の作成 | ❌ 不可 | ✅ 可能 |
| いいね | ❌ 不可 | ✅ 可能 |
| MYランキング編集 | ❌ 不可 | ✅ 可能 |
| 他ユーザーのプロフィール閲覧 | ✅ 可能 | ✅ 可能 |

---

## 4. データベース設計

### テーブル: `users`（プロフィール情報）
| カラム | 型 | 制約 | 説明 |
|--------|----|------|------|
| id | uuid | PK, FK → auth.users | Supabase Auth UID |
| username | text | NOT NULL, UNIQUE | 表示名 |
| avatar_url | text | | プロフィール画像URL |
| created_at | timestamp | DEFAULT now() | 登録日時 |

### テーブル: `shops`（ラーメン店情報）
| カラム | 型 | 制約 | 説明 |
|--------|----|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | 店舗ID |
| name | text | NOT NULL | 店名 |
| address | text | | 住所 |
| lat | float8 | NOT NULL | 緯度 |
| lng | float8 | NOT NULL | 経度 |
| created_at | timestamp | DEFAULT now() | 登録日時 |

### テーブル: `posts`（レビュー投稿）
| カラム | 型 | 制約 | 説明 |
|--------|----|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | 投稿ID |
| user_id | uuid | FK → users.id, NOT NULL | 投稿者 |
| shop_id | uuid | FK → shops.id, NOT NULL | 対象店舗 |
| image_url | text | NOT NULL | ラーメン画像URL |
| flavor_type | text | NOT NULL | 味の種類（下記参照） |
| richness | int2 | NOT NULL, 1〜5 | 濃さ |
| rating | int2 | NOT NULL, 1〜5 | 総合評価 |
| comment | text | MAX 500文字 | 自由コメント |
| likes_count | int4 | DEFAULT 0 | いいね数（キャッシュ） |
| created_at | timestamp | DEFAULT now() | 投稿日時 |

**flavor_type の選択肢:**
`'醤油' | '味噌' | '塩' | '豚骨' | '二郎系' | 'その他'`

### テーブル: `likes`（いいね）
| カラム | 型 | 制約 | 説明 |
|--------|----|------|------|
| id | uuid | PK | |
| user_id | uuid | FK → users.id, NOT NULL | いいねしたユーザー |
| post_id | uuid | FK → posts.id, NOT NULL | 対象投稿 |
| created_at | timestamp | DEFAULT now() | |

※ `(user_id, post_id)` にUNIQUE制約 → 1人1いいね

### テーブル: `my_rankings`（MYランキング）
| カラム | 型 | 制約 | 説明 |
|--------|----|------|------|
| id | uuid | PK | |
| user_id | uuid | FK → users.id, NOT NULL | オーナー |
| shop_id | uuid | FK → shops.id, NOT NULL | 登録店舗 |
| rank | int2 | NOT NULL, 1〜3 | 順位 |
| is_public | boolean | DEFAULT true | 公開フラグ |
| updated_at | timestamp | DEFAULT now() | |

※ `(user_id, rank)` にUNIQUE制約 → 同順位に複数店舗禁止

---

## 5. 画面・機能仕様

### 5-1. ホーム（投稿一覧） `/`

**表示内容:**
- 投稿をカード形式でグリッド表示
- 各カード: ラーメン画像・店名・評価(★)・味の種類・コメント冒頭（50文字）・いいね数・投稿者名

**ソート（切り替えボタン）:**
- いいね数順（デフォルト）
- 新着順

**フィルター:**
- 味の種類（複数選択可: 醤油/味噌/塩/豚骨/二郎系/その他）
- 最低評価（★1以上〜★5以上）
- 濃さ（1〜5の範囲指定）

**いいねボタン:**
- ハートアイコン＋カウント表示
- ログイン必須（未ログインはクリック時にログイン画面へ誘導）
- 押した状態はローカルで即時反映（Optimistic UI）

---

### 5-2. 投稿詳細 `/posts/[id]`

- ラーメン画像（大）
- 店名・住所
- 評価（★）・濃さ・味の種類
- コメント全文
- 投稿者名・投稿日時
- いいねボタン
- 投稿者本人のみ: 編集・削除ボタン表示

---

### 5-3. 投稿作成 `/posts/new`（ログイン必須）

**フォーム項目:**

| 項目 | UI | バリデーション |
|------|----|---------------|
| ラーメン画像 | ファイルアップロード | 必須・JPG/PNG・最大5MB |
| 店名 | テキスト入力 + Google Places Autocomplete | 必須 |
| 味の種類 | セレクトボックス | 必須 |
| 濃さ | スライダー（1〜5） | 必須 |
| 総合評価 | ★クリックで選択（1〜5） | 必須 |
| コメント | テキストエリア | 任意・最大500文字 |

**送信後:** 投稿詳細ページへリダイレクト

---

### 5-4. 地図ページ `/map`

**地図表示:**
- Google Maps上に店舗をピン（マーカー）で表示
- ピンクリック → 店舗名・平均評価・レビュー数のポップアップ
- ポップアップに「投稿一覧を見る」リンク

**フィルターパネル（左サイドバー or 上部パネル）:**
- 味の種類（複数選択）
- 最低評価（★3以上 / ★4以上 / ★5のみ）
- → 条件に合う店舗ピンのみ地図に表示

**現在地範囲検索:**
- 「現在地から探す」ボタン → ブラウザのGeolocation API で現在地取得
- 半径選択: 1km / 3km / 5km
- 範囲内の★4以上の店舗を強調表示（ピンの色を変える）

---

### 5-5. MYランキング `/ranking`（ログイン必須）

**機能:**
- 1位〜3位のスロットに好きな店を登録
- 店舗はテキスト検索して選択
- 各スロットに公開・非公開を個別設定可能
- ドラッグ&ドロップで順位の入れ替え

**公開設定の挙動:**
- 公開設定にした順位のみ `/users/[id]` で他ユーザーが閲覧可能
- 非公開設定の順位は自分のマイページにのみ表示（「非公開」バッジ付き）

---

### 5-6. プロフィールページ `/users/[id]`

- ユーザー名・アバター（未設定時はデフォルトアイコン）
- その人の投稿一覧（新着順）
- MYランキング（公開設定のもののみ表示）
- 自分のページには「編集」ボタン → プロフィール編集モーダル

**プロフィール編集（自分のみ）:**
- ユーザー名変更
- アバター画像アップロード

---

### 5-7. 認証ページ

- `/auth/login`: ログインフォーム（メール・パスワード）
- `/auth/signup`: 新規登録フォーム（ユーザー名・メール・パスワード）
- `/auth/reset-password`: パスワードリセット申請

---

### 5-8. ヘッダー（全ページ共通）

- ロゴ / ホームリンク
- ナビゲーション: ホーム・地図・投稿する
- 右端: ログイン済みはユーザーアバター（クリックでプロフィール・ログアウトメニュー）
- 未ログインは「ログイン」「新規登録」ボタン

---

## 6. ディレクトリ構成

```
ramen-review-app/
├── app/
│   ├── layout.tsx              # 共通レイアウト（ヘッダー）
│   ├── page.tsx                # ホーム（投稿一覧）
│   ├── posts/
│   │   ├── new/page.tsx        # 投稿作成
│   │   └── [id]/page.tsx       # 投稿詳細
│   ├── map/page.tsx            # 地図
│   ├── ranking/page.tsx        # MYランキング編集
│   ├── users/[id]/page.tsx     # プロフィール
│   └── auth/
│       ├── login/page.tsx
│       ├── signup/page.tsx
│       └── reset-password/page.tsx
├── components/
│   ├── Header.tsx
│   ├── PostCard.tsx
│   ├── LikeButton.tsx
│   ├── FilterPanel.tsx
│   ├── MapView.tsx
│   ├── RankingEditor.tsx
│   └── ImageUploader.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # ブラウザ用Supabaseクライアント
│   │   └── server.ts           # サーバー用Supabaseクライアント
│   └── types.ts                # 型定義（DB型 + UI型）
├── public/
│   └── default-avatar.png
├── .env.local                  # 環境変数
└── package.json
```

---

## 7. 環境変数（`.env.local`）

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
```

---

## 8. Supabase セキュリティ設定（Row Level Security）

```sql
-- posts: 誰でも読める・自分の投稿のみ作成/更新/削除
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_select" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.uid() = user_id);

-- likes: 誰でも読める・自分のいいねのみ作成/削除
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "likes_select" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON likes FOR DELETE USING (auth.uid() = user_id);

-- my_rankings: 公開のものは誰でも読める・自分のランキングのみ編集
ALTER TABLE my_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ranking_select" ON my_rankings FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "ranking_insert" ON my_rankings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ranking_update" ON my_rankings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ranking_delete" ON my_rankings FOR DELETE USING (auth.uid() = user_id);

-- users: 誰でも読める・自分のレコードのみ更新
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select" ON users FOR SELECT USING (true);
CREATE POLICY "users_update" ON users FOR UPDATE USING (auth.uid() = id);
```

---

## 9. いいね数の整合性管理

いいね数は `posts.likes_count` にキャッシュし、Supabase の Database Function + Trigger で自動同期する。

```sql
-- likes が INSERT/DELETE されたら posts.likes_count を更新するトリガー
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

CREATE TRIGGER likes_count_trigger
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();
```

---

## 10. 開発手順（Cursorでの作業順序）

| Step | 作業内容 |
|------|---------|
| 1 | `npx create-next-app@latest` でプロジェクト作成（TypeScript・Tailwind・App Router を選択） |
| 2 | Supabaseプロジェクト作成 → Section 4のSQLでテーブル作成 → Section 8のRLS設定 |
| 3 | `.env.local` に環境変数を設定 |
| 4 | Supabase Authのメール認証を有効化 → 認証ページ（ログイン・新規登録）実装 |
| 5 | 投稿作成フォーム + Supabase Storageへの画像アップロード実装 |
| 6 | ホーム（一覧表示・フィルター・ソート）実装 |
| 7 | いいね機能（Optimistic UI）実装 |
| 8 | 地図ページ実装（Google Maps API + フィルター + 現在地検索） |
| 9 | MYランキング機能（公開/非公開切り替え含む）実装 |
| 10 | プロフィールページ実装 |
| 11 | UIの仕上げ・レスポンシブ対応 |
| 12 | Vercelにデプロイ（GitHubと連携） |

---

## 11. 外部サービス取得手順

### Supabase（無料）
1. https://supabase.com でアカウント作成
2. 「New Project」でプロジェクト作成
3. Settings → API から `URL` と `anon key` をコピー

### Google Maps API（有効化が必要なAPI）
1. https://console.cloud.google.com でプロジェクト作成
2. 以下のAPIを有効化:
   - Maps JavaScript API
   - Places API
   - Geocoding API
3. 認証情報 → APIキーを作成してコピー

### Vercel（無料）
1. https://vercel.com でGitHubアカウント連携
2. GitHubリポジトリをインポート
3. 環境変数を設定してデプロイ

---

*この仕様書をCursorのプロジェクトルートに `SPEC.md` として配置し、「SPEC.mdに従ってStep 1から実装してください」と指示するとスムーズです。*
