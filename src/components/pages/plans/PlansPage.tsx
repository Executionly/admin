import { useState, useEffect } from 'react';
import {
  Settings, DollarSign, Zap, ToggleLeft, ToggleRight,
  ChevronDown, ChevronUp, Save, AlertCircle, Package,
  Globe, Sliders, FileText, Check,
} from 'lucide-react';
import Header from '../../layout/Header';
import { Loading, Modal } from '../../ui';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

// ── Types ─────────────────────────────────────────────────────
interface PlanConfig {
  tier:            string;
  display_name:    string;
  tagline:         string;
  description:     string;
  best_for:        string;
  monthly_limit:   number;
  daily_limit:     number;
  weekly_limit:    number | null;
  char_limit:      number;
  most_popular:    boolean;
  is_active:       boolean;
  weekly_available: boolean;
  prices:          Record<string, number>;
  tool_limits:     Record<string, number>;
  features:        Record<string, boolean>;
  feature_list:    string[];
  available_packs: string[];
}

interface PackConfig {
  pack_id:   string;
  credits:   number;
  label:     string;
  is_active: boolean;
  prices:    Record<string, number>;
}

const CURRENCIES = ['USD','NGN','GHS','KES','ZAR','UGX','TZS','GBP','EUR','CAD','AUD'];
const TOOLS      = ['reply_generator','tone_checker','improve_reply','boundary_builder','negotiation','follow_up','difficult_email','intent_detector'];
const PACKS      = ['personal','dating','work_corporate','customer_support','sales_negotiation'];
const FEATURES   = ['watermark','saved_replies','regional_tone','advanced_negotiation','escalation_sequences','priority_generation','share_receipt_watermark','all_packs'];
const PLAN_COLORS: Record<string, string> = {
  starter: 'border-blue-500/30 bg-blue-500/5',
  daily:   'border-brand-400/30 bg-brand-400/5',
  pro:     'border-amber-400/30 bg-amber-400/5',
};
const PLAN_ACCENTS: Record<string, string> = {
  starter: 'text-blue-400',
  daily:   'text-brand-400',
  pro:     'text-amber-400',
};

// ── Sub-components ────────────────────────────────────────────
function SectionHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">{icon}</div>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-white/30">{sub}</p>
      </div>
    </div>
  );
}

function NumericInput({ label, value, onChange, min = 0 }: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div>
      <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">{label}</label>
      <input
        type="number" value={value} min={min}
        onChange={e => onChange(Number(e.target.value))}
        className="input text-sm h-8 w-full"
      />
    </div>
  );
}

// ── Plan card ─────────────────────────────────────────────────
function PlanCard({ plan, onSave }: { plan: PlanConfig; onSave: (tier: string, section: string, data: any) => Promise<void> }) {
  const [expanded, setExpanded] = useState(false);
  const [tab,      setTab]      = useState<'prices' | 'limits' | 'features' | 'content'>('prices');
  const [saving,   setSaving]   = useState(false);

  // Local editable state
  const [prices,     setPrices]     = useState({ ...plan.prices });
  const [limits,     setLimits]     = useState({
    monthly_limit: plan.monthly_limit,
    daily_limit:   plan.daily_limit,
    weekly_limit:  plan.weekly_limit || 0,
    char_limit:    plan.char_limit,
  });
  const [toolLimits, setToolLimits] = useState({ ...plan.tool_limits });
  const [features,   setFeatures]   = useState({ ...plan.features });
  const [content,    setContent]    = useState({
    tagline:        plan.tagline,
    description:    plan.description,
    best_for:       plan.best_for,
    feature_list:   [...plan.feature_list],
    available_packs: [...plan.available_packs],
    most_popular:   plan.most_popular,
    is_active:      plan.is_active,
  });

  async function save() {
    setSaving(true);
    try {
      if (tab === 'prices')   await onSave(plan.tier, 'prices',   { prices });
      if (tab === 'limits')   await onSave(plan.tier, 'limits',   { ...limits, tool_limits: toolLimits });
      if (tab === 'features') await onSave(plan.tier, 'features', { features });
      if (tab === 'content')  await onSave(plan.tier, 'content',  content);
      toast.success('Saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  }

  const TABS = [
    { key: 'prices',   label: 'Prices',   icon: <DollarSign size={13} /> },
    { key: 'limits',   label: 'Limits',   icon: <Sliders size={13} /> },
    { key: 'features', label: 'Features', icon: <Zap size={13} /> },
    { key: 'content',  label: 'Content',  icon: <FileText size={13} /> },
  ];

  return (
    <div className={clsx('rounded-xl border transition-all', PLAN_COLORS[plan.tier], expanded ? 'shadow-lg' : '')}>
      {/* Header */}
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 flex items-center gap-3">
          <div className={clsx('w-2 h-2 rounded-full', plan.is_active ? 'bg-emerald-400' : 'bg-white/20')} />
          <div>
            <div className="flex items-center gap-2">
              <span className={clsx('font-display font-600 text-base', PLAN_ACCENTS[plan.tier])}>{plan.display_name}</span>
              {plan.most_popular && <span className="text-[10px] bg-brand-400/20 text-brand-400 px-2 py-0.5 rounded-full">Most popular</span>}
            </div>
            <p className="text-xs text-white/30">{plan.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs text-white/40">
          <div className="text-right">
            <p className="text-white/60 font-medium">${plan.prices.monthly}/mo</p>
            <p>{plan.monthly_limit} replies/mo</p>
          </div>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-white/5 px-5 py-4">
          {/* Tabs */}
          <div className="flex gap-1 mb-5 bg-surface-2 p-1 rounded-lg w-fit">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all', tab === t.key ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70')}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Prices tab */}
          {tab === 'prices' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {['monthly', 'yearly', 'weekly'].map(p => (
                  <div key={p} className={!plan.weekly_available && p === 'weekly' ? 'opacity-40' : ''}>
                    <NumericInput
                      label={`${p} ($)`}
                      value={prices[p] || 0}
                      onChange={v => setPrices(prev => ({ ...prev, [p]: v }))}
                    />
                    {!plan.weekly_available && p === 'weekly' && (
                      <p className="text-[10px] text-white/20 mt-1">Not available for this plan</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Limits tab */}
          {tab === 'limits' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <NumericInput label="Monthly limit" value={limits.monthly_limit} onChange={v => setLimits(p => ({ ...p, monthly_limit: v }))} min={1} />
                <NumericInput label="Daily limit"   value={limits.daily_limit}   onChange={v => setLimits(p => ({ ...p, daily_limit:   v }))} min={1} />
                <NumericInput label="Weekly limit"  value={limits.weekly_limit}  onChange={v => setLimits(p => ({ ...p, weekly_limit:  v }))} min={1} />
                <NumericInput label="Char limit"    value={limits.char_limit}    onChange={v => setLimits(p => ({ ...p, char_limit:    v }))} min={1} />
              </div>
              <div>
                <p className="text-xs text-white/40 mb-3">Per-tool daily limits</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {TOOLS.map(tool => (
                    <NumericInput
                      key={tool}
                      label={tool.replace(/_/g, ' ')}
                      value={toolLimits[tool] || 0}
                      onChange={v => setToolLimits(p => ({ ...p, [tool]: v }))}
                      min={0}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Features tab */}
          {tab === 'features' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {FEATURES.map(f => (
                  <button key={f} onClick={() => setFeatures(p => ({ ...p, [f]: !p[f] }))}
                    className={clsx('flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs transition-all', features[f] ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : 'border-white/5 bg-white/3 text-white/40')}>
                    <span className="capitalize">{f.replace(/_/g, ' ')}</span>
                    {features[f] ? <Check size={13} /> : <div className="w-3 h-3 rounded-full border border-white/20" />}
                  </button>
                ))}
              </div>
              <div>
                <p className="text-xs text-white/40 mb-2">Available context packs</p>
                <div className="flex flex-wrap gap-2">
                  {PACKS.map(p => (
                    <button key={p}
                      onClick={() => setContent(prev => ({
                        ...prev,
                        available_packs: prev.available_packs.includes(p)
                          ? prev.available_packs.filter(x => x !== p)
                          : [...prev.available_packs, p],
                      }))}
                      className={clsx('px-3 py-1 rounded-full text-xs border transition-all capitalize', content.available_packs.includes(p) ? 'border-brand-400/40 bg-brand-400/10 text-brand-400' : 'border-white/10 text-white/30')}>
                      {p.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Content tab */}
          {tab === 'content' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs text-white/40 block mb-1.5">Tagline</label>
                  <input value={content.tagline} onChange={e => setContent(p => ({ ...p, tagline: e.target.value }))} className="input text-sm" />
                </div>
                <div>
                  <label className="text-xs text-white/40 block mb-1.5">Description</label>
                  <textarea value={content.description} onChange={e => setContent(p => ({ ...p, description: e.target.value }))} rows={2} className="input text-sm resize-none" />
                </div>
                <div>
                  <label className="text-xs text-white/40 block mb-1.5">Best for</label>
                  <input value={content.best_for} onChange={e => setContent(p => ({ ...p, best_for: e.target.value }))} className="input text-sm" />
                </div>
                <div>
                  <label className="text-xs text-white/40 block mb-1.5">Feature list (one per line)</label>
                  <textarea
                    value={content.feature_list.join('\n')}
                    onChange={e => setContent(p => ({ ...p, feature_list: e.target.value.split('\n').filter(Boolean) }))}
                    rows={5} className="input text-sm resize-none font-mono text-xs"
                  />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button onClick={() => setContent(p => ({ ...p, most_popular: !p.most_popular }))}
                      className={clsx('w-9 h-5 rounded-full relative transition-colors', content.most_popular ? 'bg-brand-600' : 'bg-surface-4')}>
                      <div className={clsx('absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform', content.most_popular ? 'translate-x-4' : 'translate-x-0.5')} />
                    </button>
                    <span className="text-xs text-white/60">Most popular badge</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button onClick={() => setContent(p => ({ ...p, is_active: !p.is_active }))}
                      className={clsx('w-9 h-5 rounded-full relative transition-colors', content.is_active ? 'bg-emerald-500' : 'bg-surface-4')}>
                      <div className={clsx('absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform', content.is_active ? 'translate-x-4' : 'translate-x-0.5')} />
                    </button>
                    <span className="text-xs text-white/60">Plan active</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="mt-5 flex justify-end">
            <button onClick={save} disabled={saving}
              className="btn-primary flex items-center gap-2 text-sm">
              <Save size={14} />
              {saving ? 'Saving...' : `Save ${tab}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pack price table ───────────────────────────────────────────
function PackPricesSection({ packs, onSave }: { packs: PackConfig[]; onSave: (packId: string, prices: Record<string, number>) => Promise<void> }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [localPrices, setLocalPrices] = useState<Record<string, Record<string, number>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const map: Record<string, Record<string, number>> = {};
    packs.forEach(p => { map[p.pack_id] = { ...p.prices }; });
    setLocalPrices(map);
  }, [packs]);

  async function save(packId: string) {
    setSaving(true);
    try {
      await onSave(packId, localPrices[packId] || {});
      toast.success('Pack prices saved');
      setEditing(null);
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      {packs.map(pack => (
        <div key={pack.pack_id} className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <Package size={16} className="text-brand-400" />
              <div>
                <p className="text-white font-medium text-sm">{pack.label}</p>
                <p className="text-white/30 text-xs">{pack.credits} credits · {pack.pack_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={clsx('text-xs px-2 py-0.5 rounded-full', pack.is_active ? 'text-emerald-400 bg-emerald-400/10' : 'text-white/30 bg-white/5')}>
                {pack.is_active ? 'Active' : 'Inactive'}
              </span>
              <button onClick={() => setEditing(editing === pack.pack_id ? null : pack.pack_id)}
                className="btn-secondary text-xs">
                {editing === pack.pack_id ? 'Cancel' : 'Edit prices'}
              </button>
            </div>
          </div>

          {/* Price grid */}
          <div className="px-5 py-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {CURRENCIES.map(curr => (
                <div key={curr}>
                  <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">{curr}</label>
                  {editing === pack.pack_id ? (
                    <input
                      type="number"
                      value={localPrices[pack.pack_id]?.[curr] || ''}
                      onChange={e => setLocalPrices(prev => ({
                        ...prev,
                        [pack.pack_id]: { ...prev[pack.pack_id], [curr]: Number(e.target.value) },
                      }))}
                      className="input text-xs h-8 w-full"
                      min={0}
                    />
                  ) : (
                    <p className="text-white/70 text-sm font-medium">
                      {pack.prices[curr] ? pack.prices[curr].toLocaleString() : <span className="text-white/20">—</span>}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {editing === pack.pack_id && (
              <div className="mt-4 flex justify-end">
                <button onClick={() => save(pack.pack_id)} disabled={saving}
                  className="btn-primary flex items-center gap-2 text-xs">
                  <Save size={13} />
                  {saving ? 'Saving...' : 'Save all prices'}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function PlansPage() {
  const [plans,   setPlans]   = useState<PlanConfig[]>([]);
  const [packs,   setPacks]   = useState<PackConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<'plans' | 'packs'>('plans');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [plansRes, packsRes] = await Promise.all([
        api.get('/admin/plans'),
        api.get('/admin/packs'),
      ]);
      setPlans(plansRes.data);
      setPacks(packsRes.data);
    } catch {
      toast.error('Failed to load config');
    } finally {
      setLoading(false);
    }
  }

  async function savePlanSection(tier: string, section: string, data: any) {
    await api.patch(`/admin/plans/${tier}/${section}`, section === 'prices' ? data : section === 'features' ? data : data);
    await load();
  }

  async function savePackPrices(packId: string, prices: Record<string, number>) {
    await api.patch(`/admin/packs/${packId}/prices`, { prices });
    await load();
  }

  return (
    <div className="animate-fade-in">
      <Header title="Plans & Packs" subtitle="Configure pricing, limits, and features" />
      <div className="p-6">

        {/* Warning banner */}
        <div className="flex items-start gap-3 bg-amber-400/5 border border-amber-400/20 rounded-xl px-4 py-3 mb-6">
          <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400/80 leading-relaxed">
            Changes here update the database and take effect immediately. Price changes affect new subscriptions only — existing subscribers keep their current rate until renewal.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'plans', label: 'Subscription Plans', icon: <Zap size={14} /> },
            { key: 'packs', label: 'Reply Packs',        icon: <Package size={14} /> },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all', tab === t.key ? 'bg-brand-600/20 text-brand-400' : 'btn-secondary')}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading ? <Loading /> : (
          <>
            {tab === 'plans' && (
              <div className="space-y-4">
                {plans.map(plan => (
                  <PlanCard key={plan.tier} plan={plan} onSave={savePlanSection} />
                ))}
              </div>
            )}
            {tab === 'packs' && (
              <PackPricesSection packs={packs} onSave={savePackPrices} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
