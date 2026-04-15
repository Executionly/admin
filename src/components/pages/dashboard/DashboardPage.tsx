import { useEffect, useState } from 'react';
import { Users, DollarSign, Zap, TrendingUp, Activity, UserCheck, RefreshCw, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Header from '../../layout/Header';
import { StatCard, Loading } from '../../ui';
import { dashboardApi } from '../../../services/api';
import { formatCurrency, formatNumber, formatDate } from '../../../utils/format';
import toast from 'react-hot-toast';

const MOCK_STATS = {
  total_users: 1842, active_users_today: 234, new_users_today: 28,
  trial_users: 892, paid_users: 950, total_generations_today: 1247,
  total_revenue_month: 14820.50, active_subscriptions: 950,
};

const MOCK_CHART = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  users: Math.floor(Math.random() * 80 + 20),
  revenue: Math.floor(Math.random() * 800 + 200),
  generations: Math.floor(Math.random() * 400 + 100),
}));

interface IStats {
  total_users: number;
  active_users_today: number;
  total_revenue_month: number;
  paid_users: number;
  new_users_today: number;
  trial_users: number;
  active_subscriptions: number;
  total_generations_today: number;
  plan_map: {
    trial: number;
    starter: number;
    daily: number;
    pro: number;
  }
}


const PLAN_COLORS: Record<string, string> = {
  trial: '#ffffff33',
  starter: '#3B82F6',
  daily: '#7F77DD',
  pro: '#F59E0B',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-3 border border-white/10 rounded-lg p-3 text-xs">
      <p className="text-white/50 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.name === 'revenue' ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [stats, setStats] = useState<IStats>({
    total_users: 0,
    active_users_today: 0,
    total_revenue_month: 0,
    paid_users: 0,
    new_users_today: 0,
    trial_users: 0,
    active_subscriptions: 0,
    total_generations_today: 0,
    plan_map: {
      trial: 0,
      starter: 0,
      daily: 0,
      pro: 0
    }
  });
  const [chart, setChart] = useState();
  const [period, setPeriod] = useState('14d');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getChartData(period),
      ]);
      setStats(s.data);
      setChart(c.data);
    } catch {
      // use mock data if API not ready
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [period]);

  function formatPlanDistribution(planMap: Record<string, number>) {
    return Object.entries(planMap || {}).map(([plan, count]) => ({
      plan: plan.charAt(0).toUpperCase() + plan.slice(1),
      count,
      color: PLAN_COLORS[plan] || '#888',
    }));
  }

  const planData = formatPlanDistribution(stats?.plan_map || {});

  return (
    <div className="animate-fade-in">
      <Header title="Overview" subtitle="Platform health at a glance" />
      <div className="p-6 space-y-6">

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={formatNumber(stats?.total_users)} icon={<Users size={18} />} />
          <StatCard label="Active Today" value={formatNumber(stats?.active_users_today)} icon={<Activity size={18} />}/>
          <StatCard label="Monthly Revenue" value={formatCurrency(stats?.total_revenue_month)} icon={<DollarSign size={18} />} color="text-emerald-400" />
          <StatCard label="Paid Users" value={formatNumber(stats?.paid_users)} icon={<UserCheck size={18} />} color="text-brand-400" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="New Today" value={stats?.new_users_today}                    icon={<ArrowUpRight size={18} />} />
          <StatCard label="Trial Users" value={formatNumber(stats?.trial_users)}           icon={<Zap size={18} />} />
          <StatCard label="Active Subs" value={formatNumber(stats?.active_subscriptions)}  icon={<TrendingUp size={18} />} color="text-brand-400" />
          <StatCard label="Generations Today" value={formatNumber(stats?.total_generations_today)} icon={<RefreshCw size={18} />} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Main area chart */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-600 text-white text-sm">Growth Overview</h3>
                <p className="text-xs text-white/30 mt-0.5">Users & Revenue</p>
              </div>
              <div className="flex gap-1">
                {['7d', '14d', '30d'].map(p => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors ${period === p ? 'bg-brand-600/20 text-brand-400' : 'text-white/30 hover:text-white/60'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            {loading ? <Loading /> : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chart} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="gu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7F77DD" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7F77DD" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#ffffff40' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#ffffff40' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="users"   stroke="#7F77DD" fill="url(#gu)" strokeWidth={2} />
                  <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="url(#gr)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Plan distribution */}
          <div className="card p-5">
            <h3 className="font-display font-600 text-white text-sm mb-1">Plan Distribution</h3>
            <p className="text-xs text-white/30 mb-5">Users by plan tier</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={planData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="plan" tick={{ fontSize: 10, fill: '#ffffff40' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#ffffff40' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {planData?.map((entry, i) => (
                    <rect key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {planData?.map(p => (
                <div key={p.plan} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-white/50">{p.plan}</span>
                  </div>
                  <span className="text-white/70 font-medium">{p.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Generation activity chart */}
        <div className="card p-5">
          <h3 className="font-display font-600 text-white text-sm mb-1">Daily Generations</h3>
          <p className="text-xs text-white/30 mb-5">AI tool usage over time</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chart} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#ffffff40' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#ffffff40' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="generations" fill="#534AB7" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
