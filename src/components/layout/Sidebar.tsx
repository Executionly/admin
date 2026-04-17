import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, DollarSign, BarChart2, HeadphonesIcon,
  MessageSquare, Share2, ShieldCheck, ScrollText, Settings,
  ChevronLeft, Zap, LogOut,
  AlertCircle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { toggleCollapse } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { hasPermission } from '../../utils/permissions';
import { roleColor } from '../../utils/format';
import clsx from 'clsx';

const NAV = [
  { to: '/dashboard',   label: 'Overview',    icon: LayoutDashboard, permission: 'VIEW_DASHBOARD'   as const },
  { to: '/analytics',   label: 'Analytics',   icon: BarChart2,       permission: 'VIEW_ANALYTICS'   as const },
  { to: '/users',       label: 'Users',       icon: Users,           permission: 'VIEW_USERS'        as const },
  { to: '/revenue',     label: 'Revenue',     icon: DollarSign,      permission: 'VIEW_REVENUE'      as const },
  { to: '/support',     label: 'Support',     icon: HeadphonesIcon,  permission: 'VIEW_SUPPORT'      as const },
  { to: '/chat',        label: 'Team Chat',   icon: MessageSquare,   permission: 'VIEW_CHAT'         as const },
  { to: '/affiliates',  label: 'Affiliates',  icon: Share2,          permission: 'VIEW_AFFILIATES'   as const },
  { to: '/admins',      label: 'Admins',      icon: ShieldCheck,     permission: 'VIEW_ADMINS'       as const },
  { to: '/logs',        label: 'Audit Logs',  icon: ScrollText,      permission: 'VIEW_LOGS'         as const },
  { to: '/error-logs', label: 'Error Logs', icon: AlertCircle, permission: 'VIEW_ERROR_LOGS' as const },
  { to: '/plans',    label: 'Plans Config',    icon: Zap,        permission: 'VIEW_PLANS'     as const },
  { to: '/settings',    label: 'Settings',    icon: Settings,        permission: 'VIEW_SETTINGS'     as const },
];

export default function Sidebar() {
  const dispatch   = useAppDispatch();
  const { user }   = useAppSelector(s => s.auth);
  const collapsed  = useAppSelector(s => s.ui.sidebarCollapsed);
  const location   = useLocation();

  if (!user) return null;

  return (
    <aside className={clsx(
      'fixed left-0 top-0 h-screen flex flex-col bg-surface-1 border-r border-white/5 transition-all duration-300 z-40',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className={clsx('flex items-center gap-3 px-4 py-5 border-b border-white/5', collapsed && 'justify-center px-0')}>
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-700 text-white text-base tracking-tight">Avertune</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {NAV.map(({ to, label, icon: Icon, permission }) => {
          if (!hasPermission(user.role, permission)) return null;
          const active = location.pathname.startsWith(to);
          return (
            <NavLink key={to} to={to} title={collapsed ? label : undefined}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                collapsed && 'justify-center px-0',
                active
                  ? 'bg-brand-600/15 text-brand-400 font-medium'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User + collapse */}
      <div className="border-t border-white/5 p-3 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-7 h-7 rounded-full bg-brand-600/30 flex items-center justify-center text-xs font-medium text-brand-400 flex-shrink-0">
              {user.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.full_name}</p>
              <span className={clsx('badge text-[10px]', roleColor(user.role))}>
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}
        <button onClick={() => dispatch(logout())}
          className={clsx('flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-all', collapsed && 'justify-center px-0')}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
        <button onClick={() => dispatch(toggleCollapse())}
          className={clsx('flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all', collapsed && 'justify-center px-0')}
        >
          <ChevronLeft size={16} className={clsx('transition-transform', collapsed && 'rotate-180')} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
