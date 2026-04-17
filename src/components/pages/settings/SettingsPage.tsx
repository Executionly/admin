import { useState } from 'react';
import { Settings, Key, Bell, Globe, Shield } from 'lucide-react';
import Header from '../../layout/Header';
import { useAppSelector } from '../../../hooks/useStore';
import { hasPermission } from '../../../utils/permissions';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAppSelector(s => s.auth);
  const canManage = hasPermission(user!.role, 'MANAGE_SETTINGS');
  const [saved, setSaved] = useState(false);

  const [general, setGeneral] = useState({
    app_name:     'Avertune',
    support_email: 'support@avertune.com',
    maintenance_mode: false,
  });

  const [notifications, setNotifications] = useState({
    new_user:        true,
    new_sub:         true,
    payment_failed:  true,
    usage_spike:     true,
  });

  function handleSave() {
    toast.success('Settings saved');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="animate-fade-in">
      <Header title="Settings" subtitle="Platform configuration" />
      <div className="p-6 w-full space-y-6">

        {/* General */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center">
              <Globe size={15} className="text-brand-400" />
            </div>
            <div>
              <h3 className="font-display font-600 text-white text-sm">General</h3>
              <p className="text-xs text-white/30">Basic platform settings</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/40 block mb-1.5">App Name</label>
              <input value={general.app_name} onChange={e => setGeneral(p => ({ ...p, app_name: e.target.value }))}
                className="input" disabled={!canManage} readOnly/>
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-1.5">Support Email</label>
              <input value={general.support_email} onChange={e => setGeneral(p => ({ ...p, support_email: e.target.value }))}
                className="input" disabled={!canManage} readOnly />
            </div>
            {/* <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-white/70">Maintenance Mode</p>
                <p className="text-xs text-white/30">Temporarily disable access for users</p>
              </div>
              <button
                disabled={!canManage}
                onClick={() => setGeneral(p => ({ ...p, maintenance_mode: !p.maintenance_mode }))}
                className={`w-10 h-5 rounded-full transition-colors relative ${general.maintenance_mode ? 'bg-red-500' : 'bg-surface-4'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${general.maintenance_mode ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div> */}
          </div>
        </div>

        {/* Notifications */}
        {/* <div className="card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center">
              <Bell size={15} className="text-amber-400" />
            </div>
            <div>
              <h3 className="font-display font-600 text-white text-sm">Notifications</h3>
              <p className="text-xs text-white/30">Admin alert preferences</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { key: 'new_user',       label: 'New user signup',       desc: 'Notify when a new user registers' },
              { key: 'new_sub',        label: 'New subscription',      desc: 'Notify when a user subscribes' },
              { key: 'payment_failed', label: 'Payment failure',       desc: 'Notify on failed payment events' },
              { key: 'usage_spike',    label: 'Usage spike detected',  desc: 'Notify on unusual activity' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm text-white/70">{item.label}</p>
                  <p className="text-xs text-white/25">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                  className={`w-10 h-5 rounded-full transition-colors relative ${(notifications as any)[item.key] ? 'bg-brand-600' : 'bg-surface-4'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${(notifications as any)[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div> */}

        {/* API Keys — developer only */}
        {hasPermission(user!.role, 'VIEW_SETTINGS') && (
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-emerald-400/20 flex items-center justify-center">
                <Key size={15} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="font-display font-600 text-white text-sm">API Configuration</h3>
                <p className="text-xs text-white/30">Environment variables overview</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                'SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY',
                'ADMIN_JWT_SECRET','GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_CALLBACK_URL',
                'FRONTEND_URL','OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'STRIPE_SECRET_KEY',
                'STRIPE_WEBHOOK_SECRET','STRIPE_PRICE_STARTER_MONTHLY','STRIPE_PRICE_STARTER_YEARLY',
                'STRIPE_PRICE_DAILY_WEEKLY','STRIPE_PRICE_DAILY_MONTHLY','STRIPE_PRICE_DAILY_YEARLY',
                'STRIPE_PRICE_PRO_MONTHLY','STRIPE_PRICE_PRO_YEARLY',
                'PAYSTACK_SECRET_KEY','PAYSTACK_WEBHOOK_SECRET','PAYSTACK_PLAN_STARTER_MONTHLY',
                'PAYSTACK_PLAN_STARTER_YEARLY','PAYSTACK_PLAN_DAILY_WEEKLY','PAYSTACK_PLAN_DAILY_MONTHLY',
                'PAYSTACK_PLAN_DAILY_YEARLY','PAYSTACK_PLAN_PRO_MONTHLY','PAYSTACK_PLAN_PRO_YEARLY', 
                'RESEND_API_KEY', 'MAIL_FROM', 'PAYMENT_PROVIDER_AFRICA',
              ].map(key => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <code className="text-xs font-mono text-white/50">{key}</code>
                  <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Configured</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* {canManage && (
          <button onClick={handleSave} className="btn-primary w-full py-2.5">
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>
        )} */}
      </div>
    </div>
  );
}
