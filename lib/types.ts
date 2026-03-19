// 味の種類
export const FLAVOR_TYPES = [
  "醤油",
  "味噌",
  "塩",
  "豚骨",
  "二郎系",
  "その他",
] as const;

export type FlavorType = (typeof FLAVOR_TYPES)[number];

// データベース型
export interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Shop {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  shop_id: string;
  image_url: string;
  flavor_type: FlavorType;
  richness: number;
  rating: number;
  comment: string | null;
  likes_count: number;
  created_at: string;
  menu: string | null;
  oil_amount: number | null;
  noodle_thickness: number | null;
  other_notes: string | null;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface MyRanking {
  id: string;
  user_id: string;
  shop_id: string;
  rank: number;
  is_public: boolean;
  updated_at: string;
}

// 結合データ型（一覧表示用）
export interface PostWithDetails extends Post {
  shops: Shop | null;
  users: User | null;
}
