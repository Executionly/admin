import { useState } from 'react';
import { Eye, Users, MousePointer, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
import Header from '../../layout/Header';
import { StatCard, Table, Tr, Td } from '../../ui';
import { formatNumber } from '../../../utils/format';

const MOCK_VISITORS = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  visitors:    Math.floor(Math.random() * 500 + 100),
  page_views:  Math.floor(Math.random() * 1200 + 300),
  new_users:   Math.floor(Math.random() * 40 + 5),
  conversions: Math.floor(Math.random() * 20 + 2),
}));

const MOCK_PAGES = [
  { path: '/',             views: 8420, bounceRate: '32%' },
  { path: '/pricing',      views: 5210, bounceRate: '28%' },
  { path: '/dashboard',    views: 4180, bounceRate: '18%' },
  { path: '/auth/login',   views: 3920, bounceRate: '41%' },
  { path: '/auth/signup',  views: 3100, bounceRate: '35%' },
  { path: '/tools/reply',  views: 2840, bounceRate: '12%' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-3 border border-white/10 rounded-lg p-3 text-xs">
      <p className="text-white/50 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium capitalize">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d');



  const totals = MOCK_VISITORS.reduce((acc, d) => ({
    visitors:    acc.visitors    + d.visitors,
    page_views:  acc.page_views  + d.page_views,
    new_users:   acc.new_users   + d.new_users,
    conversions: acc.conversions + d.conversions,
  }), { visitors: 0, page_views: 0, new_users: 0, conversions: 0 });


  return <div className="animate-fade-in">
      <Header title="Analytics" subtitle="Visitor & engagement metrics" />
      <div className="p-6 space-y-6">

      </div>
  </div>

  return (
    <div className="animate-fade-in">
      <Header title="Analytics" subtitle="Visitor & engagement metrics" />
      <div className="p-6 space-y-6">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Visitors"  value={formatNumber(totals.visitors)}    icon={<Eye size={18} />}          trend={14} />
          <StatCard label="Page Views"      value={formatNumber(totals.page_views)}  icon={<MousePointer size={18} />} trend={9} />
          <StatCard label="New Users"       value={formatNumber(totals.new_users)}   icon={<Users size={18} />}        trend={18} color="text-brand-400" />
          <StatCard label="Conversions"     value={formatNumber(totals.conversions)} icon={<TrendingUp size={18} />}   trend={6} color="text-emerald-400" />
        </div>

        {/* Visitors chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-600 text-white text-sm">Visitor Traffic</h3>
              <p className="text-xs text-white/30 mt-0.5">Unique visitors & page views</p>
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
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MOCK_VISITORS.slice(period === '7d' ? -7 : period === '14d' ? -14 : 0)}>
              <defs>
                <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7F77DD" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7F77DD" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gpv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#ffffff40' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#ffffff40' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="visitors"   name="Visitors"   stroke="#7F77DD" fill="url(#gv)"  strokeWidth={2} />
              <Area type="monotone" dataKey="page_views" name="Page Views" stroke="#10B981" fill="url(#gpv)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Conversions */}
          <div className="card p-5">
            <h3 className="font-display font-600 text-white text-sm mb-1">New Users vs Conversions</h3>
            <p className="text-xs text-white/30 mb-5">Signups and paid conversions</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={MOCK_VISITORS.slice(-14)}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#ffffff40' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#ffffff40' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="new_users"   name="New Users"   fill="#534AB7" radius={[3, 3, 0, 0]} />
                <Bar dataKey="conversions" name="Conversions" fill="#10B981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top pages */}
          {/* <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="font-display font-600 text-white text-sm">Top Pages</h3>
            </div>
            <Table headers={['Page', 'Views', 'Bounce Rate']}>
              {MOCK_PAGES.map(p => (
                <Tr key={p.path}>
                  <Td><p className="font-mono text-xs text-white/60">{p.path}</p></Td>
                  <Td><p className="text-white/70 text-xs">{p.views.toLocaleString()}</p></Td>
                  <Td><p className="text-white/50 text-xs">{p.bounceRate}</p></Td>
                </Tr>
              ))}
            </Table>
          </div> */}
        </div>
      </div>
    </div>
  );
}
