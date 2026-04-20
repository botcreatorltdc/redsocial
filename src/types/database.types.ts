export interface Users {
  id: string;
  email: string;
  nickname: string;
  avatar_url: string | null;
  birth_date: string | null;
  is_verified: boolean;
  preferences_json: Record<string, unknown>;
  created_at: string;
}

export interface Clubs {
  id: string;
  name: string;
  description: string | null;
  lat: number;
  lng: number;
  address: string;
  cover_image: string | null;
  is_verified: boolean;
  requirements_json: Record<string, unknown>;
  amenities_json: Record<string, unknown>;
  owner_id: string | null;
}

export interface Products {
  id: string;
  name: string;
  category: string;
  strain_type: string;
  lineage: string | null;
  thc_avg: number | null;
  cbd_avg: number | null;
  terpenes_json: Record<string, unknown>;
  effects_json: Record<string, unknown>;
}

export interface Reviews {
  id: string;
  author_id: string;
  target_type: "club" | "product";
  target_id: string;
  rating: number;
  content_text: string;
  images_array: string[];
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: Users;
        Insert: Omit<Users, "created_at"> & { created_at?: string };
        Update: Partial<Users>;
      };
      clubs: {
        Row: Clubs;
        Insert: Omit<Clubs, "id"> & { id?: string };
        Update: Partial<Clubs>;
      };
      products: {
        Row: Products;
        Insert: Omit<Products, "id"> & { id?: string };
        Update: Partial<Products>;
      };
      reviews: {
        Row: Reviews;
        Insert: Omit<Reviews, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Reviews>;
      };
    };
  };
};
