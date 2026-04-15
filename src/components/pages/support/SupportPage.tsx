import { useEffect, useState } from 'react';
import { Search, MessageCircle, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import Header from '../../layout/Header';
import { Loading, Empty, Table, Tr, Td, Pagination, Badge, Modal, Select } from '../../ui';
import { SupportTicket } from '../../../types';
import { formatDateTime, statusColor, timeAgo } from '../../../utils/format';
import { supportApi } from '../../../services/api';
import { useAppSelector } from '../../../hooks/useStore';
import { hasPermission } from '../../../utils/permissions';
import toast from 'react-hot-toast';
import clsx from 'clsx';

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

export default function SupportPage() {
  const { user: admin } = useAppSelector(s => s.auth);
  const canManage = hasPermission(admin!.role, 'MANAGE_SUPPORT');
  const [tickets,   setTickets]   = useState<any[]>([]);
  const [selected,  setSelected]  = useState<SupportTicket | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [reply,     setReply]     = useState('');
  const [filter,    setFilter]    = useState('all');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState<IStats>({
    all: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
  })

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  async function load() {
      setLoading(true);
  
      try {
        const result = await supportApi.getTickets({
          page,
          limit: 10,
        })
        setTickets(result?.data?.data)
        setStatusCounts(result?.data?.stats)
        setTotal(result?.data?.total_pages)
  
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false);
      }
    }
      
  useEffect(() => { load(); }, [page]);

  async function handleReply() {
    if (!selected || !reply.trim()) return;
    try {
      await supportApi.replyTicket(selected.id, reply);
      toast.success('Reply sent');
      setReply('');
    } catch { toast.error('Failed to send reply'); }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      await supportApi.updateTicket(id, { status });
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: status as any } : t));
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
  }

  return (
    <div className="animate-fade-in">
      <Header title="Support" subtitle="Customer tickets & requests" />
      <div className="p-6 space-y-4">

        {/* Status filters */}
        <div className="flex gap-3 flex-wrap">
          {Object.entries(statusCounts).map(([s, count]) => (
            <button key={s} onClick={() => setFilter(s)}
              className={clsx('flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors capitalize', filter === s ? 'bg-brand-600/20 text-brand-400' : 'btn-secondary')}>
              {s.replace('_', ' ')}
              <span className={clsx('px-1.5 py-0.5 rounded-full text-[10px]', filter === s ? 'bg-brand-400/20' : 'bg-white/10')}>{count}</span>
            </button>
          ))}
        </div>

        <div className="card overflow-hidden">
          <Table headers={['Subject', 'User', 'Priority', 'Status', 'Created', '']}>
            {filtered.map(t => (
              <Tr key={t.id} onClick={() => { setSelected(t); setTicketOpen(true); }}>
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

      {/* Ticket detail modal */}
      <Modal open={ticketOpen} onClose={() => setTicketOpen(false)} title="Ticket Details">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-white font-medium">{selected.subject}</p>
                <p className="text-white/40 text-xs mt-0.5">{selected.user_email} · {formatDateTime(selected.created_at)}</p>
              </div>
              <div className="flex gap-2">
                <Badge className={PRIORITY_COLORS[selected.priority]}>{selected.priority}</Badge>
                <Badge className={statusColor(selected.status)}>{selected.status}</Badge>
              </div>
            </div>
            <div className="bg-surface-3 rounded-lg p-4">
              <p className="text-white/60 text-sm leading-relaxed">{selected.message}</p>
            </div>
            {canManage && (
              <div>
                <label className="text-xs text-white/40 block mb-2">Reply</label>
                <textarea value={reply} onChange={e => setReply(e.target.value)} rows={4}
                  className="input resize-none text-sm" placeholder="Type your reply..." />
                <div className="flex justify-end mt-3">
                  <button className="btn-primary" onClick={handleReply}>Send Reply</button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
