import { useEffect, useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, ShieldCheck } from 'lucide-react';
import Header from '../../layout/Header';
import { Table, Tr, Td, Badge, Modal, Confirm, Empty, Pagination, Loading } from '../../ui';
import { AdminUser, AdminRole } from '../../../types';
import { formatDate, roleColor, timeAgo } from '../../../utils/format';
import { adminsApi } from '../../../services/api';
import { useAppSelector } from '../../../hooks/useStore';
import toast from 'react-hot-toast';

const ROLES: { value: AdminRole; label: string; desc: string }[] = [
  { value: 'super_admin', label: 'Super Admin',  desc: 'Full access to everything'              },
  { value: 'admin',       label: 'Admin',         desc: 'Manage users, revenue, support'         },
  { value: 'support',     label: 'Support',       desc: 'View users, manage support tickets'     },
  { value: 'developer',   label: 'Developer',     desc: 'Analytics, logs, settings'              },
];


export default function AdminsPage() {
  const { user: me } = useAppSelector(s => s.auth);
  const [admins, setAdmins] = useState<any[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmId,  setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', full_name: '', password: '', role: 'admin' as AdminRole });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  async function load() {
      setLoading(true);
  
      try {
        const result = await adminsApi.getAll({
          page,
          limit: 10,
        })
        setAdmins(result?.data?.data)
        setTotal(result?.data?.total)
  
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
  }
    
    useEffect(() => { load(); }, [page]);

  async function handleCreate() {
    try {
      const res = await adminsApi.create(form);
      setAdmins(prev => [...prev, res.data]);
      toast.success('Admin created');
      setCreateOpen(false);
      setForm({ email: '', full_name: '', password: '', role: 'admin' });
    } catch { toast.error('Failed to create admin'); }
  }

  async function handleToggle(id: string) {
    try {
      await adminsApi.toggleActive(id);
      setAdmins(prev => prev.map(a => a.id === id ? { ...a, is_active: !a.is_active } : a));
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
  }

  async function handleDelete(id: string) {
    try {
      await adminsApi.delete(id);
      setAdmins(prev => prev.filter(a => a.id !== id));
      toast.success('Admin removed');
    } catch { toast.error('Failed to delete'); }
  }

  return (
    <div className="animate-fade-in">
      <Header title="Admins" subtitle="Manage team access and roles" />
      <div className="p-6 space-y-6">

        {/* Role reference */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {ROLES.map(r => (
            <div key={r.value} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-white/30" />
                <Badge className={roleColor(r.value)}>{r.label}</Badge>
              </div>
              <p className="text-xs text-white/30 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h3 className="font-display font-600 text-white text-sm">Team Members</h3>
            <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
              <Plus size={14} /> Add Admin
            </button>
          </div>

          {loading ? <Loading/> : admins.length === 0 ? <Empty title="No admins found" /> : (
            <>
              <Table headers={['Admin', 'Role', 'Status', 'Last Login', 'Added', '']}>
                {admins.map(a => (
                  <Tr key={a.id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-600/20 flex items-center justify-center text-xs font-medium text-brand-400">
                          {a.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white/80 text-sm font-medium">{a.full_name}</p>
                          <p className="text-white/30 text-xs">{a.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td><Badge className={roleColor(a.role)}>{a.role.replace('_', ' ')}</Badge></Td>
                    <Td>
                      <Badge className={a.is_active ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}>
                        {a.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td><p className="text-white/40 text-xs">{a.last_login_at ? timeAgo(a.last_login_at) : 'Never'}</p></Td>
                    <Td><p className="text-white/30 text-xs">{formatDate(a.created_at)}</p></Td>
                    <Td>
                      {a.id !== me?.id && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleToggle(a.id)}
                            className="text-white/30 hover:text-white/70 transition-colors">
                            {a.is_active ? <ToggleRight size={18} className="text-emerald-400" /> : <ToggleLeft size={18} />}
                          </button>
                          <button onClick={() => setConfirmId(a.id)}
                            className="text-white/20 hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Table>
              <Pagination
                page={page}
                totalPages={total}
                onChange={setPage}
              />
            </>
          )}
        </div>
      </div>

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Admin">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/40 block mb-1.5">Full Name</label>
            <input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
              className="input" placeholder="Jane Smith" />
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="input" placeholder="jane@avertune.com" />
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-1.5">Password</label>
            <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="input" placeholder="Min 8 characters" />
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-2">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(r => (
                <button key={r.value} onClick={() => setForm(p => ({ ...p, role: r.value }))}
                  className={`p-3 rounded-lg text-left border transition-all text-xs ${
                    form.role === r.value ? 'border-brand-400 bg-brand-400/10' : 'border-white/5 bg-surface-3 hover:border-white/20'
                  }`}>
                  <p className="text-white font-medium mb-0.5">{r.label}</p>
                  <p className="text-white/30 text-[10px]">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleCreate}>Create Admin</button>
          </div>
        </div>
      </Modal>

      <Confirm
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => confirmId && handleDelete(confirmId)}
        title="Remove Admin"
        message="This will remove this admin's access to the dashboard. This action cannot be undone."
        danger
      />
    </div>
  );
}
