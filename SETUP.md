# ラーメンレビューアプリ セットアップ手順

## 1. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、値を設定してください。

```bash
cp .env.local.example .env.local
```

### 必要な環境変数

| 変数名 | 説明 |
|--------|------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase プロジェクトの URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase の anon key |
| NEXT_PUBLIC_GOOGLE_MAPS_API_KEY | Google Maps API キー |

## 2. Supabase のセットアップ

1. [Supabase](https://supabase.com) でアカウント作成・プロジェクト作成
2. Settings → API から URL と anon key をコピーして `.env.local` に設定
3. SQL Editor で `supabase/schema.sql` の内容を実行
4. **Storage** で以下のバケットを作成（Public にチェック）:
   - `post-images`（投稿画像用）
   - `avatars`（プロフィール画像用）
5. 各バケットの Policies:
   - **INSERT**: `auth.uid() IS NOT NULL`
   - **SELECT**: `true`
6. Authentication → Providers で Email を有効化

## 3. Google Maps API のセットアップ

1. [Google Cloud Console](https://console.cloud.google.com) でプロジェクト作成
2. 以下の API を有効化:
   - Maps JavaScript API
   - Places API
   - Geocoding API
3. 認証情報 → API キーを作成して `.env.local` に設定

## 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリが起動します。
