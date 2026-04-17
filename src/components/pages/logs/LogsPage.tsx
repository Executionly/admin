import { useEffect, useState } from 'react';
import { Search, Filter, ScrollText } from 'lucide-react';
import Header from '../../layout/Header';
import { Loading, Empty, Table, Tr, Td, Pagination, Badge } from '../../ui';
import { AdminLog } from '../../../types';
import { formatDateTime, roleColor } from '../../../utils/format';
import clsx from 'clsx';
import { logsApi } from '@/services/api';

const ACTION_COLOR: Record<string, string> = {
  'user.plan_update':     'text-brand-400  bg-brand-400/10',
  'user.delete':          'text-red-400    bg-red-400/10',
  'user.reset_usage':     'text-blue-400   bg-blue-400/10',
  'user.toggle_active':   'text-amber-400  bg-amber-400/10',
  'admin.create':         'text-emerald-400 bg-emerald-400/10',
  'admin.delete':         'text-red-400    bg-red-400/10',
  'affiliate.payout':     'text-emerald-400 bg-emerald-400/10',
  'affiliate.suspend':    'text-amber-400  bg-amber-400/10',
  'support.reply':        'text-blue-400   bg-blue-400/10',
};

function formatMetadata(metadata: Record<string, any>) {
  const entries: { key: string; value: string }[] = [];

  Object.entries(metadata || {}).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    // Handle nested object (like prices)
    if (typeof value === 'object' && !Array.isArray(value)) {
      Object.entries(value).forEach(([k, v]) => {
        entries.push({
          key: `${key}.${k}`,
          value: String(v),
        });
      });
    } else {
      entries.push({
        key,
        value: String(value),
      });
    }
  });

  return entries;
}

export default function LogsPage() {
  const [logs,     setLogs]     = useState<any[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [page,     setPage]     = useState(1);
  const [total, setTotal] = useState(0);

  const filtered = logs.filter(l =>
    (filter === 'all' || l.action.startsWith(filter)) &&
    (!search || l.admin_name.toLowerCase().includes(search.toLowerCase()) || l.action.includes(search))
  );

  const categories = ['all', 'user', 'admin', 'affiliate', 'support'];

  async function load() {
    setLoading(true);

    try {
      const result = await logsApi.getAll({
        page,
        limit: 10,
      })
      setLogs(result?.data?.data)
      setTotal(result?.data?.total)

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
    
  useEffect(() => { load(); }, [page]);


  return (
    <div className="animate-fade-in">
      <Header title="Audit Logs" subtitle="All admin actions are recorded here" />
      <div className="p-6 space-y-4">

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input pl-8 h-9 text-sm" placeholder="Search by admin or action..." />
          </div>
          <div className="flex gap-2">
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)}
                className={clsx('text-xs px-3 py-1.5 rounded-lg transition-colors capitalize', filter === c ? 'bg-brand-600/20 text-brand-400' : 'btn-secondary')}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          {loading ? <Loading /> : filtered.length === 0 ? (
            <Empty icon={<ScrollText size={32} />} title="No logs found" />
          ) : (
            <Table headers={['Admin', 'Action', 'Target', 'Details', 'IP', 'Time']}>
              {filtered.map(log => (
                <Tr key={log.id}>
                  <Td>
                    <div>
                      <p className="text-white/80 text-sm font-medium">{log.admin_name}</p>
                      <Badge className={`text-[10px] ${roleColor(log.admin_role)}`}>{log.admin_role.replace('_', ' ')}</Badge>
                    </div>
                  </Td>
                  <Td>
                    <Badge className={ACTION_COLOR[log.action] || 'text-white/40 bg-white/5'}>
                      {log.action}
                    </Badge>
                  </Td>
                  <Td>
                    <p className="text-white/50 text-xs capitalize">{log.target_type}</p>
                    {log.target_id && <p className="text-white/25 text-[10px] font-mono">{log.target_id.slice(0, 8)}...</p>}
                  </Td>
                  <Td>
                    <div className="text-xs text-white/30 space-y-0.5">
                      {formatMetadata(log.metadata).slice(0, 3).map((item) => (
                        <p key={item.key}>
                          <span className="text-white/20">{item.key}:</span>{' '}
                          <span className="text-white/60">{item.value}</span>
                        </p>
                      ))}
                    </div>
                  </Td>
                  <Td><p className="font-mono text-xs text-white/30">{log.ip_address}</p></Td>
                  <Td><p className="text-white/30 text-xs whitespace-nowrap">{formatDateTime(log.created_at)}</p></Td>
                </Tr>
              ))}
            </Table>
          )}
          <Pagination page={page} totalPages={total} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
