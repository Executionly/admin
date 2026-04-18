import { useState, FormEvent } from 'react';
import { Eye, EyeOff, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import Header from '../../layout/Header';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

function PasswordInput({ label, value, onChange, placeholder }: {
  label: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="text-xs text-white/40 font-medium block mb-1.5">{label}</label>
      <div className="relative">
        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || '••••••••'}
          className="input pl-9 pr-10"
        />
        <button type="button" onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

function StrengthBar({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Contains uppercase',    ok: /[A-Z]/.test(password) },
    { label: 'Contains number',       ok: /\d/.test(password) },
    { label: 'Contains symbol',       ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['bg-red-500', 'bg-amber-500', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => (
          <div key={i} className={clsx('h-1 flex-1 rounded-full transition-all', i < score ? colors[score] : 'bg-white/10')} />
        ))}
        <span className={clsx('text-[10px] ml-1 font-medium', score >= 3 ? 'text-emerald-400' : score >= 2 ? 'text-amber-400' : 'text-red-400')}>
          {labels[score]}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(c => (
          <div key={c.label} className={clsx('flex items-center gap-1.5 text-[10px]', c.ok ? 'text-emerald-400' : 'text-white/25')}>
            <div className={clsx('w-1.5 h-1.5 rounded-full', c.ok ? 'bg-emerald-400' : 'bg-white/15')} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  const [current,  setCurrent]  = useState('');
  const [next,     setNext]     = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);

  const mismatch  = next && confirm && next !== confirm;
  const canSubmit = current && next.length >= 8 && next === confirm && !saving;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    try {
      await api.patch('/admin/auth/change-password', {
        current_password: current,
        new_password:     next,
      });
      setSuccess(true);
      setCurrent(''); setNext(''); setConfirm('');
      toast.success('Password changed successfully');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to change password';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <Header title="Change Password" subtitle="Update your admin account password" />
      <div className="p-6 max-w-md m-auto">

        {success && (
          <div className="flex items-center gap-3 bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-3 mb-6">
            <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-400">Password changed successfully. Use your new password on next login.</p>
          </div>
        )}

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            <PasswordInput
              label="Current password"
              value={current}
              onChange={setCurrent}
              placeholder="Enter current password"
            />

            <div className="border-t border-white/5 pt-5">
              <PasswordInput
                label="New password"
                value={next}
                onChange={v => { setNext(v); setSuccess(false); }}
                placeholder="Enter new password"
              />
              <StrengthBar password={next} />
            </div>

            <div>
              <PasswordInput
                label="Confirm new password"
                value={confirm}
                onChange={setConfirm}
                placeholder="Repeat new password"
              />
              {mismatch && (
                <p className="text-xs text-red-400 mt-1.5">Passwords do not match</p>
              )}
              {confirm && !mismatch && next === confirm && (
                <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {saving
                ? <><Loader2 size={15} className="animate-spin" /> Changing password...</>
                : <><Lock size={15} /> Change password</>
              }
            </button>
          </form>
        </div>

        <p className="text-xs text-white/20 text-center mt-4">
          You will remain logged in after changing your password.
        </p>
      </div>
    </div>
  );
}