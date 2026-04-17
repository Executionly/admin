import { useEffect, useState } from 'react';
import { Search, AlertCircle, AlertTriangle, Zap, CheckCircle2, Trash2, RefreshCw } from 'lucide-react';
import Header from '../../layout/Header';
import { Loading, Empty, Table, Tr, Td, Pagination, Badge, Confirm, Modal } from '../../ui';
import api from '../../../services/api';
import { formatDateTime, timeAgo } from '../../../utils/format';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const LEVEL_STYLES: Record<string, string> = {
  fatal: 'text-red-300    bg-red-300/10    border-red-300/20',
  error: 'text-red-400    bg-red-400/10    border-red-400/20',
  warn:  'text-amber-400  bg-amber-400/10  border-amber-400/20',
};

const LEVEL_ICONS: Record<string, React.ReactNode> = {
  fatal: <Zap         size={12} />,
  error: <AlertCircle size={12} />,
  warn:  <AlertTriangle size={12} />,
};

export default function ErrorLogsPage() {
  const [logs,     setLogs]     = useState<any[]>([]);
  const [stats,    setStats]    = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [search,   setSearch]   = useState('');
  const [level,    setLevel]    = useState('');
  const [resolved, setResolved] = useState('false');
  const [selected, setSelected] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmResolveAll, setConfirmResolveAll] = useState(false);

  useEffect(() => { load(); }, [page, level, resolved]);

  async function load() {
    setLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        api.get('/admin/error-logs', { params: { page, limit: 50, level: level || undefined, resolved, search: search || undefined } }),
        api.get('/admin/error-logs/stats'),
      ]);
      setLogs(logsRes.data.data);
      setTotal(logsRes.data.total);
      setStats(statsRes.data);
    } catch { toast.error('Failed to load error logs'); }
    finally { setLoading(false); }
  }

  async function handleResolve(id: string) {
    try {
      await api.patch(`/admin/error-logs/${id}/resolve`);
      toast.success('Marked as resolved');
      load();
    } catch { toast.error('Failed to resolve'); }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/admin/error-logs/${id}`);
      toast.success('Log deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  }

  async function handleResolveAll() {
    try {
      await api.patch('/admin/error-logs/resolve-all');
      toast.success('All errors resolved');
      load();
    } catch { toast.error('Failed'); }
  }

  return (
    <div className="animate-fade-in">
      <Header title="Error Logs" subtitle="Backend errors and warnings" />
      <div className="p-6 space-y-5">

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total errors',  value: stats.total,      color: 'text-white/60' },
              { label: 'Last 24h',      value: stats.last_24h,   color: 'text-amber-400' },
              { label: 'Unresolved',    value: stats.unresolved, color: 'text-red-400' },
              { label: 'Fatal (7d)',    value: stats.by_level?.fatal || 0, color: 'text-red-300' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <p className="text-xs text-white/30 uppercase tracking-wider">{s.label}</p>
                <p className={clsx('text-2xl font-display font-700', s.color)}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <form onSubmit={e => { e.preventDefault(); load(); }} className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input pl-8 h-9 text-sm" placeholder="Search error messages..." />
          </form>
          <div className="flex gap-2">
            {['', 'fatal', 'error', 'warn'].map(l => (
              <button key={l} onClick={() => { setLevel(l); setPage(1); }}
                className={clsx('text-xs px-3 py-1.5 rounded-lg transition-colors capitalize', level === l ? 'bg-brand-600/20 text-brand-400' : 'btn-secondary')}>
                {l || 'All'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {[{ v: 'false', l: 'Unresolved' }, { v: 'true', l: 'Resolved' }, { v: '', l: 'All' }].map(o => (
              <button key={o.v} onClick={() => { setResolved(o.v); setPage(1); }}
                className={clsx('text-xs px-3 py-1.5 rounded-lg transition-colors', resolved === o.v ? 'bg-brand-600/20 text-brand-400' : 'btn-secondary')}>
                {o.l}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            <button onClick={load} className="btn-secondary flex items-center gap-1.5 text-xs">
              <RefreshCw size={13} /> Refresh
            </button>
            <button onClick={() => setConfirmResolveAll(true)} className="btn-secondary flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 size={13} /> Resolve all
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? <Loading /> : logs.length === 0 ? (
            <Empty icon={<CheckCircle2 size={32} />} title="No errors found" sub="The backend is clean" />
          ) : (
            <Table headers={['Level', 'Context', 'Message', 'Time', '']}>
              {logs.map(log => (
                <Tr key={log.id} onClick={() => { setSelected(log); setDetailOpen(true); }}>
                  <Td>
                    <Badge className={clsx('flex items-center gap-1', LEVEL_STYLES[log.level] || 'text-white/40 bg-white/5')}>
                      {LEVEL_ICONS[log.level]} {log.level}
                    </Badge>
                  </Td>
                  <Td>
                    <p className="font-mono text-xs text-white/50">{log.context || '—'}</p>
                  </Td>
                  <Td>
                    <p className="text-white/70 text-xs max-w-md truncate">{log.message}</p>
                    {log.request_path && <p className="text-white/25 text-[10px] font-mono mt-0.5">{log.request_path}</p>}
                  </Td>
                  <Td>
                    <p className="text-white/40 text-xs whitespace-nowrap">{timeAgo(log.created_at)}</p>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      {!log.resolved && (
                        <button onClick={() => handleResolve(log.id)}
                          className="text-white/20 hover:text-emerald-400 transition-colors" title="Mark resolved">
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                      {log.resolved && <CheckCircle2 size={14} className="text-emerald-400/40" />}
                      <button onClick={() => handleDelete(log.id)}
                        className="text-white/20 hover:text-red-400 transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
          <Pagination page={page} totalPages={Math.ceil(total / 50)} onChange={setPage} />
        </div>
      </div>

      {/* Detail modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Error Detail">
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Badge className={clsx('flex items-center gap-1', LEVEL_STYLES[selected.level])}>
                {LEVEL_ICONS[selected.level]} {selected.level}
              </Badge>
              <span className="font-mono text-xs text-white/40">{selected.context}</span>
              <span className="text-white/25 text-xs ml-auto">{formatDateTime(selected.created_at)}</span>
            </div>

            <div className="bg-surface-3 rounded-lg p-4">
              <p className="text-white/80 text-sm leading-relaxed break-words">{selected.message}</p>
            </div>

            {selected.stack && (
              <div>
                <p className="text-xs text-white/30 mb-2">Stack trace</p>
                <pre className="bg-surface-3 rounded-lg p-4 text-[11px] text-white/50 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {selected.stack}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              {selected.request_path && (
                <div className="bg-surface-3 rounded-lg p-3">
                  <p className="text-white/30 mb-1">Request path</p>
                  <p className="font-mono text-white/60">{selected.request_path}</p>
                </div>
              )}
              {selected.user_id && (
                <div className="bg-surface-3 rounded-lg p-3">
                  <p className="text-white/30 mb-1">User ID</p>
                  <p className="font-mono text-white/60 text-[10px]">{selected.user_id}</p>
                </div>
              )}
              <div className="bg-surface-3 rounded-lg p-3">
                <p className="text-white/30 mb-1">Status</p>
                <p className={selected.resolved ? 'text-emerald-400' : 'text-red-400'}>
                  {selected.resolved ? 'Resolved' : 'Unresolved'}
                </p>
              </div>
            </div>

            {!selected.resolved && (
              <div className="flex justify-end pt-2">
                <button className="btn-primary flex items-center gap-2 text-xs"
                  onClick={() => { handleResolve(selected.id); setDetailOpen(false); }}>
                  <CheckCircle2 size={13} /> Mark resolved
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Confirm
        open={confirmResolveAll}
        onClose={() => setConfirmResolveAll(false)}
        onConfirm={handleResolveAll}
        title="Resolve all errors"
        message="This will mark all unresolved errors as resolved. You can still view them by filtering for resolved."
      />
    </div>
  );
}