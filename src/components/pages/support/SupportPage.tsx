import { useEffect, useState } from 'react';
import { Search, MessageCircle, AlertCircle, Clock, CheckCircle2, ArrowRight, Plus, User } from 'lucide-react';
import Header from '../../layout/Header';
import { Loading, Empty, Table, Tr, Td, Pagination, Badge, Modal, Select } from '../../ui';
import { SupportTicket } from '../../../types';
import { formatDateTime, statusColor, timeAgo } from '../../../utils/format';
import { supportApi } from '../../../services/api';
import { useAppSelector } from '../../../hooks/useStore';
import { hasPermission } from '../../../utils/permissions';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { SideModal } from '@/components/SideModal';

const PRIORITY_COLORS: Record<string, string> = {
  low:    'text-white/40 bg-white/5',
  medium: 'text-blue-400 bg-blue-400/10',
  high:   'text-amber-400 bg-amber-400/10',
  urgent: 'text-red-400 bg-red-400/10',
};

const STATUS_ICONS: Record<string, any> = {
  open:        <AlertCircle size={12} />,
  in_progress: <Clock size={12} />,
  resolved:    <CheckCircle2 size={12} />,
  closed:      <CheckCircle2 size={12} />,
};

interface IStats {
  all: number;
  open: number;
  in_progress: number;
  resolved: number;
}


interface Admin {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export default function SupportPage() {
  const { user: admin } = useAppSelector(s => s.auth);
  const canManage = hasPermission(admin!.role, 'MANAGE_SUPPORT');
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [reply, setReply] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState<IStats>({
    all: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
  });

  // Create ticket state
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [createForm, setCreateForm] = useState({
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    assigned_to: '',
    user_email: ''
  });
  const [editMode, setEditMode] = useState<{
      priority: boolean;
      assignment: boolean;
      status: boolean;
  }>({
      priority: false,
      assignment: false,
      status: false
  });

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  async function load() {
    setLoading(true);
    try {
      const result = await supportApi.getTickets({ page, limit: 10 });
      setTickets(result?.data?.data || []);
      setStatusCounts(result?.data?.stats || {});
      setTotal(result?.data?.total_pages || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }

  async function loadAdmins() {
    try {
      const result = await supportApi.getAdmins();
      setAdmins(result?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load admins');
    }
  }

  async function loadTicketDetails(ticketId: string) {
    try {
      const result = await supportApi.getTicket(ticketId);
      setSelected(result.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load ticket details');
    }
  }

  useEffect(() => { load(); }, [page]);
  useEffect(() => { if (createOpen) loadAdmins(); }, [createOpen]);

  async function handleCreateTicket() {
    if (!createForm.subject.trim() || !createForm.description.trim()) {
      toast.error('Subject and description are required');
      return;
    }
    setPending(true)
    try {
      await supportApi.createTicket(createForm);
      toast.success('Ticket created successfully');
      setCreateOpen(false);
      setCreateForm({
        subject: '',
        description: '',
        priority: 'medium',
        assigned_to: '',
        user_email: ''
      });
      load();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create ticket');
    }finally{
      setPending(false)
    }
  }

  async function handleReply() {
    if (!selected || !reply.trim()) return;
    setPending(true)
    try {
      await supportApi.replyTicket(selected.id, reply);
      toast.success('Reply sent');
      setReply('');
      loadTicketDetails(selected.id);
      load()
    } catch {
      toast.error('Failed to send reply');
    }finally{
      setPending(false)
    }
  }

  function handleTicketClick(ticket: any) {
    loadTicketDetails(ticket.id);
    setTicketOpen(true);
  }

  async function handleUpdateTicket(ticketId: string, updates: {
    status?: string;
    priority?: string;
    assigned_to?: string | null;
  }) {
    setPending(true)
    try {
      await supportApi.updateTicket(ticketId, updates);
      
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, ...updates } : t
      ));
      
      if (selected && selected.id === ticketId) {
        setSelected(prev => prev ? { ...prev, ...updates } as SupportTicket : null);
      }
      
      toast.success('Ticket updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update ticket');
    }finally{
      setPending(false)
    }
  }

  // Update status change handler
  async function handleStatusChange(id: string, status: string) {
    await handleUpdateTicket(id, { status });
  }

  return (
    <div className="animate-fade-in">
      <Header title="Support" subtitle="Customer tickets & requests"/>
      <div className='w-full flex items-center justify-end'>
        {canManage && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Create Ticket
          </button>
        )}
      </div>

      {loading ? <Loading /> : (
        <div className="p-6 space-y-4">
          {/* Status filters */}
          <div className="flex gap-3 flex-wrap">
            {Object.entries(statusCounts).map(([s, count]) => (
              <button key={s} onClick={() => setFilter(s)}
                className={clsx('flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors capitalize', 
                  filter === s ? 'bg-brand-600/20 text-brand-400' : 'btn-secondary')}>
                {s.replace('_', ' ')}
                <span className={clsx('px-1.5 py-0.5 rounded-full text-[10px]', 
                  filter === s ? 'bg-brand-400/20' : 'bg-white/10')}>{count}</span>
              </button>
            ))}
          </div>

          <div className="card overflow-hidden">
            <Table headers={['Subject', 'User', 'Priority', 'Status', 'Replies', 'Created', '']}>
              {filtered.map(t => (
                <Tr key={t.id} onClick={() => handleTicketClick(t)}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <MessageCircle size={14} className="text-white/20 flex-shrink-0" />
                      <p className="text-white/80 font-medium text-sm">{t.subject}</p>
                    </div>
                  </Td>
                  <Td>
                    <p className="text-white/60 text-xs">{t.user_name}</p>
                    <p className="text-white/25 text-[10px]">{t.user_email}</p>
                  </Td>
                  <Td><Badge className={PRIORITY_COLORS[t.priority]}>{t.priority}</Badge></Td>
                  <Td>
                    <Badge className={clsx(statusColor(t.status), 'flex items-center gap-1')}>
                      {STATUS_ICONS[t.status]} {t.status.replace('_', ' ')}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={12} className="text-white/20" />
                      <span className="text-white/60 text-xs">{t.replies_count || 0}</span>
                    </div>
                  </Td>
                  <Td><p className="text-white/40 text-xs">{timeAgo(t.created_at)}</p></Td>
                  <Td>
                    {canManage && (
                      <select value={t.status}
                        onChange={e => { e.stopPropagation(); handleStatusChange(t.id, e.target.value); }}
                        onClick={e => e.stopPropagation()}
                        className="input text-xs py-1 h-7 w-28">
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    )}
                  </Td>
                </Tr>
              ))}
            </Table>
            <Pagination page={page} totalPages={total} onChange={setPage} />
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Ticket">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/40 block mb-2">Subject</label>
            <input
              type="text"
              value={createForm.subject}
              onChange={e => setCreateForm(prev => ({ ...prev, subject: e.target.value }))}
              className="input w-full"
              placeholder="Enter ticket subject..."
            />
          </div>

          <div>
            <label className="text-xs text-white/40 block mb-2">Description</label>
            <textarea
              value={createForm.description}
              onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="input w-full resize-none"
              placeholder="Describe the issue..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 block mb-2">Priority</label>
              <select
                value={createForm.priority}
                onChange={e => setCreateForm(prev => ({ ...prev, priority: e.target.value as any }))}
                className="input w-full">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-white/40 block mb-2">Assign to</label>
              <select
                value={createForm.assigned_to}
                onChange={e => setCreateForm(prev => ({ ...prev, assigned_to: e.target.value }))}
                className="input w-full">
                <option value="">Unassigned</option>
                {admins.map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.full_name} ({admin.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 block mb-2">User Email (Optional)</label>
            <input
              type="text"
              value={createForm.user_email}
              onChange={e => setCreateForm(prev => ({ ...prev, user_email: e.target.value }))}
              className="input w-full"
              placeholder="Enter user ID if applicable..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
            <button disabled={pending} onClick={handleCreateTicket} className="btn-primary">
              {pending ? "Creating..." : "Create Ticket"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Ticket Details Side Modal */}
      <SideModal open={ticketOpen} onClose={() => setTicketOpen(false)} title="Ticket Details">
        {selected && (
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{selected.subject}</h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                    <User size={12} />
                    {selected.user_email}
                    <Clock size={12} className="ml-2" />
                    {formatDateTime(selected.created_at)}
                  </div>
                </div>
                
              </div>
              <div className="space-y-2">
                {/* Priority */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40 w-16">Priority:</span>
                  {editMode.priority ? (
                    <select
                      value={selected.priority}
                      onChange={async (e) => {
                        await handleUpdateTicket(selected.id, { priority: e.target.value });
                        setEditMode(prev => ({ ...prev, priority: false }));
                      }}
                      onBlur={() => setEditMode(prev => ({ ...prev, priority: false }))}
                      className="input text-xs py-1 h-7 w-24"
                      autoFocus
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  ) : (
                    <Badge 
                      className={clsx(PRIORITY_COLORS[selected.priority], "cursor-pointer")}
                      onClick={() => canManage && setEditMode(prev => ({ ...prev, priority: true }))}
                    >
                      {selected.priority}
                    </Badge>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40 w-16">Status:</span>
                  {editMode.status ? (
                    <select
                      value={selected.status}
                      onChange={async (e) => {
                        await handleUpdateTicket(selected.id, { status: e.target.value });
                        setEditMode(prev => ({ ...prev, status: false }));
                      }}
                      onBlur={() => setEditMode(prev => ({ ...prev, status: false }))}
                      className="input text-xs py-1 h-7 w-28"
                      autoFocus
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  ) : (
                    <Badge 
                      className={clsx(statusColor(selected.status), "cursor-pointer")}
                      onClick={() => canManage && setEditMode(prev => ({ ...prev, status: true }))}
                    >
                      {STATUS_ICONS[selected.status]} {selected.status.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Assignment */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/40">Assigned to:</span>
                {editMode.assignment ? (
                  <select
                    value={selected.assigned_to || ''}
                    onChange={async (e) => {
                      await handleUpdateTicket(selected.id, { assigned_to: String(e.target.value) || null });
                      setEditMode(prev => ({ ...prev, assignment: false }));
                    }}
                    onBlur={() => setEditMode(prev => ({ ...prev, assignment: false }))}
                    className="input text-xs py-1 h-7 flex-1"
                    autoFocus
                  >
                    <option value="">Unassigned</option>
                    {admins.map(admin => (
                      <option key={admin.id} value={admin.id}>
                        {admin.full_name} ({admin.role})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span 
                    className={clsx("text-white/60 cursor-pointer hover:text-white/80", 
                      canManage && "underline")}
                    onClick={() => canManage && setEditMode(prev => ({ ...prev, assignment: true }))}
                  >
                    {selected.assigned_admin_name || 'Unassigned'}
                  </span>
                )}
              </div>
            </div>

            {/* Original Message */}
            <div className="bg-surface-3 rounded-lg p-4">
              <div className="text-xs text-white/40 mb-2">Original Message</div>
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                {selected.message}
              </p>
            </div>

            {/* Replies */}
            {selected.replies && selected.replies.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <MessageCircle size={14} />
                  Replies ({selected.replies.length})
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selected.replies.map((reply: any, idx: number) => (
                    <div key={idx} className={clsx("p-3 rounded-lg", 
                      reply.sender_type === 'admin' ? 'bg-brand-500/10 ml-4' : 'bg-surface-3 mr-4')}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-white/80">
                          {reply.sender_type === 'admin' ? 'Admin' : 'Customer'}
                        </span>
                        <span className="text-xs text-white/40">
                          {formatDateTime(reply.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                        {reply.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reply Section */}
            {canManage && (
              <div className="border-t border-white/10 pt-4">
                <label className="text-xs text-white/40 block mb-2">Reply</label>
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  rows={4}
                  className="input w-full resize-none text-sm"
                  placeholder="Type your reply..."
                />
                <div className="flex justify-end mt-3">
                  <button disabled={pending} onClick={handleReply} className="btn-primary flex items-center gap-2">
                    <ArrowRight size={14} />
                    {pending ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </SideModal>
    </div>
  );
}
