export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n?.toString();
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr));
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days > 0)  return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0)  return `${mins}m ago`;
  return 'just now';
}

export function planColor(plan: string): string {
  const map: Record<string, string> = {
    trial:   'text-white/40 bg-white/5',
    starter: 'text-blue-400 bg-blue-400/10',
    daily:   'text-brand-400 bg-brand-400/10',
    pro:     'text-amber-400 bg-amber-400/10',
  };
  return map[plan] || 'text-white/40 bg-white/5';
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    active:      'text-emerald-400 bg-emerald-400/10',
    cancelled:   'text-red-400 bg-red-400/10',
    past_due:    'text-amber-400 bg-amber-400/10',
    open:        'text-blue-400 bg-blue-400/10',
    in_progress: 'text-brand-400 bg-brand-400/10',
    resolved:    'text-emerald-400 bg-emerald-400/10',
    closed:      'text-white/40 bg-white/5',
    suspended:   'text-red-400 bg-red-400/10',
    pending:     'text-amber-400 bg-amber-400/10',
  };
  return map[status] || 'text-white/40 bg-white/5';
}

export function roleColor(role: string): string {
  const map: Record<string, string> = {
    super_admin: 'text-amber-400 bg-amber-400/10',
    admin:       'text-brand-400 bg-brand-400/10',
    support:     'text-emerald-400 bg-emerald-400/10',
    developer:   'text-blue-400 bg-blue-400/10',
  };
  return map[role] || 'text-white/40 bg-white/5';
}
