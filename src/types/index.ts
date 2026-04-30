export type AdminRole = 'super_admin' | 'admin' | 'support' | 'developer';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  avatar_url?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  permissions: string[];
}

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  plan_tier: 'trial' | 'starter' | 'daily' | 'pro';
  billing_period?: string;
  usage_count_today: number;
  usage_limit_today: number;
  usage_count_month: number;
  usage_limit_month: number;
  pack_credits: number;
  is_active: boolean;
  is_email_verified: boolean;
  auth_provider: string;
  trial_end_date?: string;
  created_at: string;
  last_login_at?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_tier: string;
  billing_period: string;
  provider: 'stripe' | 'paystack' | 'flutterwave';
  status: 'active' | 'cancelled' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

export interface RevenueStats {
  total_revenue: number;
  monthly_revenue: number;
  stripe_revenue: number;
  paystack_revenue: number;
  active_subscriptions: number;
  churned_this_month: number;
  new_subscriptions_today: number;
  mrr: number;
}

export interface DashboardStats {
  total_users: number;
  active_users_today: number;
  new_users_today: number;
  trial_users: number;
  paid_users: number;
  total_generations_today: number;
  total_revenue_month: number;
  active_subscriptions: number;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  admin_name: string;
  admin_role: AdminRole;
  action: string;
  target_type: string;
  target_id?: string;
  metadata: Record<string, any>;
  ip_address: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  assigned_admin_name?: string;
  replies: any[];
  created_at: string;
  updated_at: string;
}

export interface Affiliate {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  referral_code: string;
  total_referrals: number;
  paid_referrals: number;
  total_earnings: number;
  pending_earnings: number;
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
}

export interface VisitorAnalytics {
  date: string;
  visitors: number;
  page_views: number;
  new_users: number;
  conversions: number;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
