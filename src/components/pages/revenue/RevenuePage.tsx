import { useEffect, useState } from 'react';
import { DollarSign, CreditCard, TrendingUp, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Header from '../../layout/Header';
import { StatCard, Loading, Table, Tr, Td, Pagination, Badge } from '../../ui';
import { revenueApi } from '../../../services/api';
import { formatCurrency, formatDate, statusColor } from '../../../utils/format';


const PROVIDER_COLORS = {
  stripe: '#7F77DD',
  paystack: '#10B981',
  flutterwave: '#F59E0B',
};


const PLAN_COLORS: Record<string, string> = {
  trial: '#ffffff33',
  starter: '#3B82F6',
  daily: '#7F77DD',
  pro: '#F59E0B',
};

interface IStats {
  active_subscriptions: number;
  stripe_subscriptions:    number,
  paystack_subscriptions:  number,
  total_revenue_month:     number,
  mrr: number,
  churned_this_month: number,
  new_subscriptions_today: number,
  revenue_chart: any[],
  provider_split: {
    trial: number;
    starter: number;
    daily: number;
    pro: number;
  },
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-3 border border-white/10 rounded-lg p-3 text-xs">
      <p className="text-white/50 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function RevenuePage() {
  const [loading, setLoading] = useState(false);
  const [tab,     setTab]     = useState<'subscriptions' | 'transactions'>('subscriptions');
  const [stats, setStats] = useState<IStats | null>(null);
  const [subs, setSubs] = useState<any[]>([]);
  const [txs, setTxs] = useState<any[]>([]);
  const [provider, setProvider] = useState('');
  const [status, setStatus] = useState('');
  const [txPage, setTxPage] = useState(1);
  const [txTotal, setTxTotal] = useState(1);
  const [subsPage, setSubsPage] = useState(1);
  const [subsTotal, setSubsTotal] = useState(1);


  async function load() {
    setLoading(true);

    try {
      const [statsRes, subsRes, txRes] = await Promise.all([
        revenueApi.getStats(),

        revenueApi.getSubscriptions({
          page: subsPage,
          limit: 10,
          provider,
          status,  
        }),

        revenueApi.getTransactions({
          page: txPage,
          limit: 10,
        }),
      ]);

      setStats(statsRes.data);
      setSubs(subsRes.data.data || subsRes.data);
      setTxs(txRes.data.data);
      setSubsTotal(subsRes.data.data?.total);
      setTxTotal(txRes.data.data?.total);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => { load(); }, [txPage,subsPage, provider, status]);


    const providerData = Object.entries(stats?.provider_split || {}).map(
      ([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value,
        color: PLAN_COLORS[key],
      })
    );
  return (
    <div className="animate-fade-in">
      <Header title="Revenue" subtitle="Subscriptions & payment tracking" />

      {
        loading ? <Loading/> : 
        <div className="p-6 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Monthly Revenue"
              value={formatCurrency(stats?.total_revenue_month || 0)}
            />

            <StatCard
              label="MRR"
              value={formatCurrency(stats?.mrr || 0)}
            />

            <StatCard
              label="Active Subs"
              value={stats?.active_subscriptions || 0}
            />

            <StatCard
              label="Churned / Month"
              value={stats?.churned_this_month || 0}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card p-5 lg:col-span-2">
              <h3 className="font-display font-600 text-white text-sm mb-1">Revenue by Provider</h3>
              <p className="text-xs text-white/30 mb-5">Last 30 days</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={stats?.revenue_chart}>
                  <defs>
                    <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7F77DD" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7F77DD" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#ffffff40' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#ffffff40' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="stripe"   name="Stripe"   stroke="#7F77DD" fill="url(#gs)" strokeWidth={2} />
                  <Area type="monotone" dataKey="paystack" name="Paystack" stroke="#10B981" fill="url(#gp)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h3 className="font-display font-600 text-white text-sm mb-1">Provider Split</h3>
              <p className="text-xs text-white/30 mb-4">Revenue share</p>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={providerData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                    {providerData?.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {providerData?.map(p => (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                      <span className="text-white/50">{p.name}</span>
                    </div>
                    <span className="text-white/70 font-medium">{formatCurrency(p.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subscriptions table */}
          <div className="card overflow-hidden">
            <div>
              <div className="flex items-center gap-4 px-5 pt-5 pb-4 border-b border-white/5">
                <h3 className="font-display font-600 text-white text-sm flex-1">Subscriptions</h3>
                {['subscriptions', 'transactions'].map(t => (
                  <button key={t} onClick={() => setTab(t as any)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors capitalize ${tab === t ? 'bg-brand-600/20 text-brand-400' : 'text-white/30 hover:text-white/60'}`}>
                    {t}
                  </button>
                ))}
              </div>
              {tab === 'subscriptions' && (
                <div className="flex gap-3 px-5 py-3 border-b border-white/5">
                  
                  <select
                    value={provider}
                    onChange={(e) => {
                      setSubsPage(1);
                      setProvider(e.target.value);
                    }}
                    className="input text-xs"
                  >
                    <option value="">All Providers</option>
                    <option value="stripe">Stripe</option>
                    <option value="paystack">Paystack</option>
                    {/* <option value="flutterwave">Flutterwave</option> */}
                  </select>

                  <select
                    value={status}
                    onChange={(e) => {
                      setSubsPage(1);
                      setStatus(e.target.value);
                    }}
                    className="input text-xs"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                </div>
              )}
            </div>
            {tab === 'subscriptions' && (
              <>
                <Table headers={['User', 'Plan', 'Provider', 'Status', 'Period End']}>
                  {subs.map((s) => (
                    <Tr key={s.id}>
                      <Td>
                        <p className="text-white/70 text-xs">{s.users?.email}</p>
                      </Td>

                      <Td>
                        <div>
                          <span className="text-white/70 capitalize">{s.plan_tier}</span>
                          <p className="text-white/25 text-[10px]">{s.billing_period}</p>
                        </div>
                      </Td>

                      <Td>
                        <span
                          className="text-xs font-medium capitalize"
                          style={{ color: (PROVIDER_COLORS as any)[s.provider] }}
                        >
                          {s.provider}
                        </span>
                      </Td>

                      <Td>
                        <Badge className={statusColor(s.status)}>
                          {s.status}
                        </Badge>
                      </Td>

                      <Td>
                        <p className="text-white/50 text-xs">
                          {formatDate(s.current_period_end)}
                        </p>
                      </Td>
                    </Tr>
                  ))}
                </Table>

                <Pagination
                  page={subsPage}
                  totalPages={subsTotal}
                  onChange={setSubsPage}
                />
              </>
            )}
            {tab === 'transactions' && (
              <>
                <Table headers={['User', 'Credits', 'Amount', 'Reference', 'Date']}>
                  {txs.map((t) => (
                    <Tr key={t.id}>
                      <Td>
                        <p className="text-white/70 text-xs">{t.users?.email}</p>
                      </Td>

                      <Td>
                        <span className="text-white/70 text-xs">{t.credits} Packs</span>
                      </Td>

                      <Td>
                        <span className="text-white font-medium text-xs">
                          {formatCurrency(t.price_paid)}
                        </span>
                      </Td>

                      <Td>
                        <span className="text-white/50 text-xs truncate max-w-[120px] block">
                          {t.reference}
                        </span>
                      </Td>

                      <Td>
                        <span className="text-white/50 text-xs">
                          {formatDate(t.created_at)}
                        </span>
                      </Td>
                    </Tr>
                  ))}
                </Table>

                <Pagination
                  page={txPage}
                  totalPages={txTotal}
                  onChange={setTxPage}
                />
              </>
            )}
          </div>
        </div>
      }
    </div>
  );
}
