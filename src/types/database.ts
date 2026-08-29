export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'user' | 'admin';

export type RequestStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'collected'
  | 'verified'
  | 'recycled'
  | 'cancelled';

export type ItemCondition = 'working' | 'broken' | 'scrap';

export type TransactionType =
  | 'collection'
  | 'bonus'
  | 'redemption'
  | 'adjustment'
  | 'refund';

export type RewardCategory =
  | 'cash'
  | 'tree'
  | 'donation'
  | 'voucher'
  | 'discount'
  | 'cashback'
  | 'product';

export type RedemptionStatus =
  | 'pending'
  | 'approved'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | 'used'
  | 'expired';

export interface Profile {
  id: string;
  clerk_user_id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  role: UserRole;
  points_balance: number;
  created_at: string;
  updated_at: string;
}

export interface WasteCategory {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  description: string | null;
  icon?: string | null;
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WasteItem {
  id: string;
  category_id: string;
  name: string;
  name_ar: string;
  description: string | null;
  points_per_kg: number;
  base_price: number;
  estimated_weight_kg: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollectionRequest {
  id: string;
  user_id: string; // clerk_user_id
  status: RequestStatus;
  address: string;
  city: string;
  governorate: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  estimated_weight: number;
  verified_weight: number | null;
  estimated_points: number;
  final_points: number | null;
  created_at: string;
  updated_at: string;
}

export interface RequestItem {
  id: string;
  request_id: string;
  waste_item_id: string | null;
  item_name: string;
  quantity: number;
  weight: number;
  condition: ItemCondition;
  image_url: string | null;
  created_at: string;
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  request_id: string | null;
  type: TransactionType;
  points: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export interface PointsSummary {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  transactionCount: number;
}

export interface Reward {
  id: string;
  name?: string;
  title: string;
  title_ar: string;
  description: string | null;
  partner_name: string;
  category: RewardCategory;
  type?: RewardCategory;
  points_cost: number;
  points_required?: number;
  monetary_value: number;
  image_url?: string | null;
  stock_quantity: number;
  is_active: boolean;
  expiry_days: number;
  metadata?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface Redemption {
  id: string;
  user_id: string;
  reward_id: string;
  points_spent: number;
  points?: number;
  amount?: number;
  status: RedemptionStatus;
  voucher_code: string;
  expires_at: string;
  used_at: string | null;
  metadata?: Record<string, any> | null;
  created_at: string;
  updated_at?: string;
  reward?: Reward;
}

export type RewardRedemption = Redemption;

export type PartnerType = 'recycler' | 'collection_point' | 'transport' | 'business';
export type PartnerStatus = 'active' | 'inactive' | 'busy';
export type PickupStatus = 'pending' | 'assigned' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Partner {
  id: string;
  name: string;
  name_ar: string;
  type: PartnerType;
  phone: string | null;
  email: string | null;
  address: string;
  city: string;
  governorate: string;
  latitude: number | null;
  longitude: number | null;
  status: PartnerStatus;
  capacity_kg: number;
  working_hours?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PickupAssignment {
  id: string;
  request_id: string;
  partner_id: string;
  assigned_at: string;
  scheduled_at: string | null;
  status: PickupStatus;
  driver_name?: string | null;
  driver_phone?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  partner?: Partner;
  request?: CollectionRequest;
}

export type ProfileInsert = Partial<Profile> & {
  clerk_user_id: string;
  email: string;
};

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'clerk_user_id' | 'created_at' | 'updated_at'>>;

export type CollectionRequestInsert = Omit<
  CollectionRequest,
  'id' | 'created_at' | 'updated_at' | 'verified_weight' | 'final_points' | 'latitude' | 'longitude'
> & {
  id?: string;
  latitude?: number | null;
  longitude?: number | null;
  verified_weight?: number | null;
  final_points?: number | null;
};

export type RequestItemInsert = Omit<RequestItem, 'id' | 'created_at'> & {
  id?: string;
};

export type PointsTransactionInsert = Omit<PointsTransaction, 'id' | 'created_at' | 'balance_after'> & {
  id?: string;
  balance_after?: number;
};

export type RewardInsert = Partial<Reward> & {
  title: string;
  title_ar: string;
  partner_name: string;
  category: RewardCategory;
  points_cost: number;
};

export type RedemptionInsert = Omit<Redemption, 'id' | 'created_at' | 'used_at' | 'reward'> & {
  id?: string;
  used_at?: string | null;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      waste_categories: {
        Row: WasteCategory;
        Insert: Partial<WasteCategory> & { name: string; name_ar: string; slug: string };
        Update: Partial<WasteCategory>;
        Relationships: [];
      };
      waste_items: {
        Row: WasteItem;
        Insert: Partial<WasteItem> & { category_id: string; name: string; name_ar: string };
        Update: Partial<WasteItem>;
        Relationships: [];
      };
      collection_requests: {
        Row: CollectionRequest;
        Insert: CollectionRequestInsert;
        Update: Partial<CollectionRequest>;
        Relationships: [];
      };
      request_items: {
        Row: RequestItem;
        Insert: RequestItemInsert;
        Update: Partial<RequestItem>;
        Relationships: [];
      };
      points_transactions: {
        Row: PointsTransaction;
        Insert: PointsTransactionInsert;
        Update: Partial<PointsTransaction>;
        Relationships: [];
      };
      rewards: {
        Row: Reward;
        Insert: RewardInsert;
        Update: Partial<Reward>;
        Relationships: [];
      };
      redemptions: {
        Row: Redemption;
        Insert: RedemptionInsert;
        Update: Partial<Redemption>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      request_status: RequestStatus;
      item_condition: ItemCondition;
      points_transaction_type: TransactionType;
      reward_category: RewardCategory;
      redemption_status: RedemptionStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
