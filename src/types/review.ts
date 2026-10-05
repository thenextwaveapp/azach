export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  product_id: string;
  user_id: string | null;
  user_name: string;
  rating: number;
  comment: string;
  verified_purchase: boolean;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
}

export interface ReviewInsert {
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
}
