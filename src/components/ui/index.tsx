import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

// ── Stat Card ─────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  trend?: number;
  color?: string;
}
export function StatCard({ label, value, sub, icon, trend, color = 'text-white' }: StatCardProps) {
  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-start justify-between">
        <p className="text-xs text-white/40 font-medium uppercase tracking-wider">{label}</p>
        {icon && <div className="text-white/20">{icon}</div>}
      </div>
      <p className={clsx('text-2xl font-display font-700', color)}>{value}</p>
      {(sub || trend !== undefined) && (
        <div className="flex items-center gap-2">
          {sub && <p className="text-xs text-white/30">{sub}</p>}
          {trend !== undefined && (
            <span className={clsx('text-xs font-medium', trend >= 0 ? 'text-emerald-400' : 'text-red-400')}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────
interface BadgeProps { children: ReactNode; className?: string; onClick?: ()=>void; }
export function Badge({ children, className, onClick }: BadgeProps) {
  return <span onClick={onClick} className={clsx('badge', className)}>{children}</span>;
}

// ── Loading ───────────────────────────────────────────────────
export function Loading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-20 gap-3 text-white/30">
      <Loader2 size={18} className="animate-spin" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────
interface EmptyProps { icon?: ReactNode; title: string; sub?: string; action?: ReactNode; }
export function Empty({ icon, title, sub, action }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      {icon && <div className="text-white/10 mb-2">{icon}</div>}
      <p className="text-white/50 font-medium">{title}</p>
      {sub && <p className="text-white/25 text-sm max-w-xs">{sub}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────────
interface TableProps { headers: string[]; children: ReactNode; }
export function Table({ headers, children }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            {headers.map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs text-white/30 font-medium uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">{children}</tbody>
      </table>
    </div>
  );
}

export function Tr({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <tr onClick={onClick} className={clsx('transition-colors', onClick && 'cursor-pointer hover:bg-white/3')}>
      {children}
    </tr>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={clsx('px-4 py-3 text-white/70', className)}>{children}</td>;
}

// ── Pagination ────────────────────────────────────────────────
interface PaginationProps { page: number; totalPages: number; onChange: (p: number) => void; }
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
      <p className="text-xs text-white/30">Page {page} of {totalPages}</p>
      <div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)}
          className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-30">Prev</button>
        <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}
          className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-30">Next</button>
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────
interface ModalProps { open: boolean; onClose: () => void; title: string; children: ReactNode; }
export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative card w-full max-w-lg p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-600 text-white">{title}</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/80 text-lg leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────
interface SelectProps { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string; }
export function Select({ value, onChange, options, className }: SelectProps) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className={clsx('input text-sm', className)}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────
interface ConfirmProps { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; danger?: boolean; }
export function Confirm({ open, onClose, onConfirm, title, message, danger }: ConfirmProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-white/50 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={() => { onConfirm(); onClose(); }}>
          Confirm
        </button>
      </div>
    </Modal>
  );
}
