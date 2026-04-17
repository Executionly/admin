import { useEffect, useState } from 'react';
import { Search, Filter, MoreHorizontal, UserX, RefreshCw, TrendingUp, Eye, ChevronDown } from 'lucide-react';
import Header from '../../layout/Header';
import { Loading, Empty, Table, Tr, Td, Pagination, Badge, Modal, Confirm, Select } from '../../ui';
import { usersApi } from '../../../services/api';
import { AppUser } from '../../../types';
import { formatDate, formatDateTime, planColor, timeAgo } from '../../../utils/format';
import { useAppSelector } from '../../../hooks/useStore';
import { hasPermission } from '../../../utils/permissions';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const PLANS   = ['all', 'trial', 'starter', 'daily', 'pro'];
const PER_PAGE = 20;


export default function UsersPage() {
  const { user: admin } = useAppSelector(s => s.auth);
  const canManage = hasPermission(admin!.role, 'MANAGE_USERS');
  const canDelete = hasPermission(admin!.role, 'DELETE_USERS');

  const [users,    setUsers]    = useState<AppUser[]>();
  const [loading,  setLoading]  = useState(false);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [search,   setSearch]   = useState('');
  const [planFilter, setPlan]   = useState('all');
  const [selected, setSelected] = useState<AppUser | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'toggle' | 'reset' | null>(null);
  const [newPlan, setNewPlan]   = useState('starter');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await usersApi.getAll({ page, limit: PER_PAGE, search, plan: planFilter !== 'all' ? planFilter : undefined });
      setUsers(res.data.data);
      setTotal(res.data.total);
    } catch {
      // use mock
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [page, planFilter]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load();
  }

  async function handleUpgradePlan() {
    if (!selected) return;
    try {
      await usersApi.updatePlan(selected.id, newPlan, 'monthly');
      toast.success(`Plan updated to ${newPlan}`);
      setPlanOpen(false);
      load();
    } catch { toast.error('Failed to update plan'); }
  }

  async function handleResetUsage(id: string) {
    try {
      await usersApi.resetUsage(id);
      toast.success('Usage reset');
      load();
    } catch { toast.error('Failed to reset usage'); }
  }

  async function handleToggleActive(id: string) {
    try {
      await usersApi.toggleActive(id);
      toast.success('Status updated');
      load();
    } catch { toast.error('Failed to update status'); }
  }

  async function handleDelete(id: string) {
    try {
      await usersApi.deleteUser(id);
      toast.success('User deleted');
      load();
    } catch { toast.error('Failed to delete user'); }
  }

  const filtered = users?.filter(u =>
    (planFilter === 'all' || u?.plan_tier === planFilter) &&
    (!search || u?.email?.includes(search) || u?.full_name?.toLowerCase().includes(search?.toLowerCase()))
  );

  return (
    <div className="animate-fade-in">
      <Header title="Users" subtitle={`${total?.toLocaleString()} total users`} />

      {
        loading ? <Loading/> : 
        <div className="p-6 space-y-4">

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <form onSubmit={handleSearch} className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input pl-8 h-9 text-sm" placeholder="Search by name or email..." />
            </form>
            <div className="flex gap-2">
              {PLANS.map(p => (
                <button key={p} onClick={() => { setPlan(p); setPage(1); }}
                  className={clsx('text-xs px-3 py-1.5 rounded-lg transition-colors capitalize', planFilter === p ? 'bg-brand-600/20 text-brand-400' : 'btn-secondary')}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            {loading ? <Loading /> : filtered?.length === 0 ? <Empty title="No users found" /> : (
              <Table headers={['User', 'Plan', 'Usage', 'Status', 'Joined', '']}>
                {filtered?.map(u => (
                  <Tr key={u.id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-600/20 flex items-center justify-center text-xs font-medium text-brand-400 flex-shrink-0">
                          {u.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{u.full_name}</p>
                          <p className="text-white/30 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <Badge className={planColor(u.plan_tier)}>{u.plan_tier}</Badge>
                      {u.billing_period && <p className="text-white/25 text-[10px] mt-0.5">{u.billing_period}</p>}
                    </Td>
                    <Td>
                      <div className="text-xs">
                        <p className="text-white/60">{u.usage_count_today}/{u.usage_limit_today} <span className="text-white/25">today</span></p>
                        {u.pack_credits > 0 && <p className="text-brand-400">+{u.pack_credits} pack</p>}
                      </div>
                    </Td>
                    <Td>
                      <div className="flex flex-col gap-1">
                        <Badge className={u.is_active ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {!u.is_email_verified && <Badge className="text-amber-400 bg-amber-400/10">Unverified</Badge>}
                      </div>
                    </Td>
                    <Td>
                      <p className="text-white/50 text-xs">{formatDate(u.created_at)}</p>
                      {u.last_login_at && <p className="text-white/25 text-[10px]">{timeAgo(u.last_login_at)}</p>}
                    </Td>
                    <Td>
                      <div className="relative">
                        <button onClick={() => setMenuOpen(menuOpen === u.id ? null : u.id)}
                          className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                        {menuOpen === u.id && (
                          <div className="absolute right-0 top-8 w-44 bg-surface-3 border border-white/10 rounded-xl shadow-xl z-10 py-1">
                            <button onClick={() => { setSelected(u); setViewOpen(true); setMenuOpen(null); }}
                              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5">
                              <Eye size={13} /> View Details
                            </button>
                            {canManage && (
                              <>
                                <button onClick={() => { setSelected(u); setNewPlan(u.plan_tier); setPlanOpen(true); setMenuOpen(null); }}
                                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5">
                                  <TrendingUp size={13} /> Change Plan
                                </button>
                                <button onClick={() => { setConfirmId(u.id); setConfirmAction('reset'); setMenuOpen(null); }}
                                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5">
                                  <RefreshCw size={13} /> Reset Usage
                                </button>
                                <button onClick={() => { setConfirmId(u.id); setConfirmAction('toggle'); setMenuOpen(null); }}
                                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5">
                                  <UserX size={13} /> {u.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                              </>
                            )}
                            {canDelete && (
                              <button onClick={() => { setConfirmId(u.id); setConfirmAction('delete'); setMenuOpen(null); }}
                                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-400/5">
                                <UserX size={13} /> Delete User
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Table>
            )}
            <Pagination page={page} totalPages={Math.ceil(total / PER_PAGE)} onChange={setPage} />
          </div>
        </div>
      }

      {/* View user modal */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="User Details">
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-600/20 flex items-center justify-center text-xl font-display text-brand-400">
                {selected.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">{selected.full_name}</p>
                <p className="text-white/40 text-xs">{selected.email}</p>
                <Badge className={`mt-1 ${planColor(selected.plan_tier)}`}>{selected.plan_tier}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                ['Provider', selected.auth_provider],
                ['Status', selected.is_active ? 'Active' : 'Inactive'],
                ['Verified', selected.is_email_verified ? 'Yes' : 'No'],
                ['Pack Credits', selected.pack_credits],
                ['Usage Today', `${selected.usage_count_today}/${selected.usage_limit_today}`],
                ['Usage Month', `${selected.usage_count_month}/${selected.usage_limit_month}`],
                ['Joined', formatDate(selected.created_at)],
                ['Last Login', selected.last_login_at ? timeAgo(selected.last_login_at) : 'Never'],
              ].map(([k, v]) => (
                <div key={String(k)} className="bg-surface-3 rounded-lg p-3">
                  <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">{k}</p>
                  <p className="text-white/80 text-xs font-medium">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Change plan modal */}
      <Modal open={planOpen} onClose={() => setPlanOpen(false)} title="Change Plan">
        <div className="space-y-4">
          <p className="text-sm text-white/50">Update plan for <span className="text-white">{selected?.email}</span></p>
          <Select value={newPlan} onChange={setNewPlan} options={[
            { value: 'trial',   label: 'Free Trial' },
            { value: 'starter', label: 'Starter'    },
            { value: 'daily',   label: 'Daily'       },
            { value: 'pro',     label: 'Pro'         },
          ]} />
          <div className="flex gap-3 justify-end pt-2">
            <button className="btn-secondary" onClick={() => setPlanOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleUpgradePlan}>Update Plan</button>
          </div>
        </div>
      </Modal>

      {/* Confirm dialogs */}
      <Confirm
        open={!!confirmId && confirmAction === 'delete'}
        onClose={() => { setConfirmId(null); setConfirmAction(null); }}
        onConfirm={() => confirmId && handleDelete(confirmId)}
        title="Delete User" danger
        message="This will permanently delete the user and all their data. This cannot be undone."
      />
      <Confirm
        open={!!confirmId && confirmAction === 'toggle'}
        onClose={() => { setConfirmId(null); setConfirmAction(null); }}
        onConfirm={() => confirmId && handleToggleActive(confirmId)}
        title="Toggle User Status"
        message="This will activate or deactivate the user's account."
      />
      <Confirm
        open={!!confirmId && confirmAction === 'reset'}
        onClose={() => { setConfirmId(null); setConfirmAction(null); }}
        onConfirm={() => confirmId && handleResetUsage(confirmId)}
        title="Reset Usage"
        message="This will reset the user's daily and monthly usage counters to zero."
      />
    </div>
  );
}
