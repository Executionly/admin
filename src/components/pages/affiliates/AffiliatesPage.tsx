import { useEffect, useState } from 'react';
import { DollarSign, Users, TrendingUp, Share2, MoreHorizontal } from 'lucide-react';
import Header from '../../layout/Header';
import { StatCard, Table, Tr, Td, Pagination, Badge, Confirm, Modal, Loading } from '../../ui';
import { Affiliate } from '../../../types';
import { formatCurrency, formatDate, statusColor, timeAgo } from '../../../utils/format';
import { affiliatesApi } from '../../../services/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

function formatPayoutAccount(w: any) {
  switch (w.payout_method) {
    case 'bank_transfer':
      return {
        title: w.bank_name,
        subtitle: `${w.bank_account_name} • ${w.bank_account}`,
      };

    case 'paypal':
      return {
        title: 'PayPal',
        subtitle: w.paypal_email,
      };

    case 'wise':
      return {
        title: 'Wise',
        subtitle: w.wise_email,
      };

    case 'payoneer':
      return {
        title: 'Payoneer',
        subtitle: w.payoneer_email,
      };

    case 'mobile_money':
      return {
        title: w.mobile_provider,
        subtitle: `${w.mobile_country} • ${w.mobile_number}`,
      };

    case 'usdt':
      return {
        title: `${w.usdt_network}`,
        subtitle: w.usdt_address,
      };

    default:
      return {
        title: '—',
        subtitle: '',
      };
  }
}

export default function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [affiliatePayouts, setAffiliatePayouts] = useState<any[]>([]);
  const [selected,   setSelected]   = useState<any | null>(null);
  const [menuOpen,   setMenuOpen]   = useState<string | null>(null);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [confirmSuspend, setConfirmSuspend] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [payoutPage, setPayoutPage] = useState(1);
  const [payoutTotal, setPayoutTotal] = useState(0);
  const [tab, setTab] = useState<"affiliates" | "payouts">("affiliates")

  const totals = affiliates?.reduce((acc, a) => ({
    earnings:  acc.earnings  + a.total_earnings,
    pending:   acc.pending   + a.pending_earnings,
    referrals: acc.referrals + a.total_referrals,
  }), { earnings: 0, pending: 0, referrals: 0 });

  async function load() {
    setLoading(true);

    try {
      const [a, w] = await Promise.all([
        await affiliatesApi.getAll({
          page,
          limit: 10,
        }),
        await affiliatesApi.getAllWithdrawals({
          page: payoutPage,
          limit: 10,
        }),
      ])
      setAffiliates(a?.data?.data)
      setAffiliatePayouts(w?.data?.data)
      setTotal(a?.data?.total)
      setPayoutTotal(w?.data?.total)

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
    
  useEffect(() => { load(); }, [page, payoutPage]);

  async function handleStatusChange(id: string, status: string) {
    try {
      await affiliatesApi.updateStatus(id, status);
      setAffiliates(prev => prev.map(a => a.id === id ? { ...a, status: status as any } : a));
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
  }

  async function handlePayout(id: string, amount: number, status: 'reject' | 'approve') {
    try {
      await affiliatesApi.payout(id, status);
      toast.success('Payout processed');
      setPayoutOpen(false);
    } catch { toast.error('Failed to process payout'); }
  }

  return (
    <div className="animate-fade-in">
      <Header title="Affiliates" subtitle="Referral program management" />
      <div className="p-6 space-y-6">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Affiliates"  value={affiliates.length} icon={<Users size={18} />} />
          <StatCard label="Active" value={affiliates.filter(a => a.status === 'active').length} icon={<Share2 size={18} />} color="text-emerald-400" />
          <StatCard label="Total Earnings"    value={formatCurrency(totals.earnings)}  icon={<DollarSign size={18} />} color="text-emerald-400" />
          <StatCard label="Pending Payouts"   value={formatCurrency(totals.pending)}   icon={<TrendingUp size={18} />} color="text-amber-400" />
        </div>

        {
          loading ? <Loading/> : 
          <div className='relative w-full'>
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl w-fit mb-6">
              {[
                { key: 'affiliates', label: 'Affiliates' },
                { key: 'payouts', label: `Withdrawal Requests (${affiliatePayouts?.length})` },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key as any)}
                  className={`
                    px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200
                    ${tab === t.key
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/5'}
                  `}
                >
                  {t.label}
                </button>
              ))}
            </div>
            { tab === "affiliates" && 
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5">
                  <h3 className="font-display font-600 text-white text-sm">Affiliates</h3>
                </div>
                <Table headers={['Affiliate', 'Code', 'Referrals', 'Earnings', 'Pending', 'Status', '']}>
                  {affiliates.map(a => (
                    <Tr key={a.id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-brand-600/20 flex items-center justify-center text-xs font-medium text-brand-400 flex-shrink-0">
                            {a.user_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white/80 text-sm font-medium">{a.user_name}</p>
                            <p className="text-white/30 text-[10px]">{a.user_email}</p>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <code className="text-xs text-brand-400 bg-brand-400/10 px-2 py-0.5 rounded font-mono">{a.referral_code}</code>
                      </Td>
                      <Td>
                        <p className="text-white/70 text-sm">{a.total_referrals}</p>
                        <p className="text-white/25 text-[10px]">{a.paid_referrals} paid</p>
                      </Td>
                      <Td><p className="text-emerald-400 font-medium text-sm">{formatCurrency(a.total_earnings)}</p></Td>
                      <Td><p className="text-amber-400 text-sm">{formatCurrency(a.pending_earnings)}</p></Td>
                      <Td><Badge className={statusColor(a.status)}>{a.status}</Badge></Td>
                      <Td>
                        <div className="relative">
                          <button onClick={() => setMenuOpen(menuOpen === a.id ? null : a.id)}
                            className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors">
                            <MoreHorizontal size={15} />
                          </button>
                          {menuOpen === a.id && (
                            <div className="absolute right-0 top-8 w-40 bg-surface-3 border border-white/10 rounded-xl shadow-xl z-10 py-1">
                              <button onClick={() => { setConfirmSuspend(a.id); setMenuOpen(null); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-400/5">
                                <Users size={12} /> {a.status === 'suspended' ? 'Activate' : 'Suspend'}
                              </button>
                            </div>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </Table>
                <Pagination page={page} totalPages={total} onChange={setPage} />
              </div>
            }
            { tab === "payouts" && 
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5">
                  <h3 className="font-display font-600 text-white text-sm">Withdrawal requests</h3>
                </div>
                <Table headers={['Affiliate', 'Amount', 'Payout Method', 'Account', 'Status', '']}>
                  {affiliatePayouts.map(a => (
                    <Tr key={a.id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-brand-600/20 flex items-center justify-center text-xs font-medium text-brand-400 flex-shrink-0">
                            {a.user_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white/80 text-sm font-medium">{a.user_name}</p>
                            <p className="text-white/30 text-[10px]">{a.user_email}</p>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <code className="text-xs text-brand-400 bg-brand-400/10 px-2 py-0.5 rounded font-mono">{formatCurrency(a.amount)}</code>
                      </Td>
                      <Td>
                        <p className="text-white/70 text-sm">{a.payout_method}</p>
                      </Td>
                      <Td>
                        {(() => {
                          const acc = formatPayoutAccount(a);
                          return (
                            <div>
                              <p className="text-white/80 text-sm font-medium">{acc.title}</p>
                              <p className="text-white/30 text-[10px]">{acc.subtitle}</p>
                            </div>
                          );
                        })()}
                      </Td>
                      <Td><Badge className={statusColor(a.status)}>{a.status}</Badge></Td>
                      <Td>
                        <div className="relative">
                          <button onClick={() => setMenuOpen(menuOpen === a.id ? null : a.id)}
                            className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors">
                            <MoreHorizontal size={15} />
                          </button>
                          {menuOpen === a.id && (
                            <div className="absolute right-0 top-8 w-40 bg-surface-3 border border-white/10 rounded-xl shadow-xl z-10 py-1">
                              <button onClick={() => { setSelected(a); setPayoutOpen(true); setMenuOpen(null); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5">
                                <DollarSign size={12} /> Process Payout
                              </button>
                            </div>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </Table>
                <Pagination page={payoutPage} totalPages={payoutTotal} onChange={setPayoutPage} />
              </div>
            }

          </div>
        }
      </div>

      {/* Payout modal */}
      <Modal open={payoutOpen} onClose={() => setPayoutOpen(false)} title="Process Payout">
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-white/50">
              Process payout for <span className="text-white">{selected.user_name}</span>
            </p>
            <div className="bg-surface-3 rounded-lg p-4 flex items-center justify-between">
              <p className="text-xs text-white/40">Amount</p>
              <p className="text-amber-400 font-display font-700 text-lg">{formatCurrency(selected.amount)}</p>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button className="btn-secondary" onClick={() => setPayoutOpen(false)}>Cancel</button>
              <button className="btn-danger" onClick={() => handlePayout(selected.id, selected.amount, 'reject')}>
                Reject Payout
              </button>
              <button className="btn-primary" onClick={() => handlePayout(selected.id, selected.amount, 'approve')}>
                Confirm Payout
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Confirm
        open={!!confirmSuspend}
        onClose={() => setConfirmSuspend(null)}
        onConfirm={() => confirmSuspend && handleStatusChange(confirmSuspend, affiliates.find(a => a.id === confirmSuspend)?.status === 'suspended' ? 'active' : 'suspended')}
        title="Update Affiliate Status"
        message="This will change the affiliate's status. They will be notified."
        danger
      />
    </div>
  );
}
