import { useEffect, useState } from 'react';
import { Eye, Users, MousePointer, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
import Header from '../../layout/Header';
import { StatCard, Table, Tr, Td, Loading } from '../../ui';
import { formatNumber } from '../../../utils/format';
import { analyticsApi } from '@/services/api';

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

function generateDateRange(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 86400000);

    return {
      key: d.toISOString().split('T')[0], // for matching
      label: d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    };
  });
}

function mapVisitorData(apiData: any[], days = 30) {
  const range = generateDateRange(days);

  const map: Record<string, any> = {};
  apiData.forEach(d => {
    map[d.date] = d;
  });

  return range.map(d => ({
    date: d.label,
    visitors:    map[d.key]?.visitors    || 0,
    page_views:  map[d.key]?.page_views  || 0,
    new_users:   map[d.key]?.new_users   || 0,
    conversions: map[d.key]?.conversions || 0,
  }));
}

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

interface IStats {
  visitors: number;
  page_views: number;
  new_users: number;
  conversions: number;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d');
  const [loading,  setLoading]  = useState(false);
  const [stats, setStats] = useState<IStats>({
    visitors: 0,
    page_views: 0,
    new_users: 0,
    conversions: 0,
  })
  const [chartData, setChartData] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<any[]>([]);


  async function load() {
    setLoading(true);

    try {
      const [topPages, visitors, chart] = await Promise.all([
        analyticsApi.getTopPages(),
        analyticsApi.getVisitors(period),
        analyticsApi.getVisitorsChart(period),
      ])
      setStats(visitors.data)
      const days = period === '7d' ? 7 : period === '14d' ? 14 : 30;
      const chartData = mapVisitorData(chart.data, days);
      setChartData(chartData)      
      setTopPages(topPages.data)
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
      
  useEffect(() => { load(); }, []);

  // return <div className="animate-fade-in">
  //     <Header title="Analytics" subtitle="Visitor & engagement metrics" />
  //     <div className="p-6 space-y-6">

  //     </div>
  // </div>

  return (
    <div className="animate-fade-in">
      <Header title="Analytics" subtitle="Visitor & engagement metrics" />

      {
        loading ? <Loading/> : 
        <div className="p-6 space-y-6">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Visitors"  value={formatNumber(stats?.visitors || 0)}    icon={<Eye size={18} />}/>
            <StatCard label="Page Views"      value={formatNumber(stats?.page_views) || 0}  icon={<MousePointer size={18} />} />
            <StatCard label="New Users"       value={formatNumber(stats?.new_users) || 0}   icon={<Users size={18} />}color="text-brand-400" />
            <StatCard label="Conversions"     value={formatNumber(stats?.conversions) || 0} icon={<TrendingUp size={18} />} color="text-emerald-400" />
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
              <AreaChart data={chartData.slice(period === '7d' ? -7 : period === '14d' ? -14 : 0)}>
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
                <BarChart data={chartData.slice(-14)}>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#ffffff40' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#ffffff40' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="new_users"   name="New Users"   fill="#534AB7" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="conversions" name="Conversions" fill="#10B981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top pages */}
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <h3 className="font-display font-600 text-white text-sm">Top Pages</h3>
              </div>
              <Table headers={['Page', 'Views']}>
                {topPages.map(p => (
                  <Tr key={p.path}>
                    <Td><p className="font-mono text-xs text-white/60">{p.path}</p></Td>
                    <Td><p className="text-white/70 text-xs">{p.views.toLocaleString()}</p></Td>
                  </Tr>
                ))}
              </Table>
            </div>
          </div>
        </div>
      }
    </div>
  );
}
