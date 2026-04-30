import { Bell, Menu, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { toggleSidebar } from '../../store/slices/uiSlice';

interface Props { title: string; subtitle?: string; }

export default function Header({ title, subtitle }: Props) {
  const dispatch  = useAppDispatch();
  const { user }  = useAppSelector(s => s.auth);

  return (
    <header className="h-16 border-b border-white/5 flex items-center px-6 gap-4 bg-surface-0/80 backdrop-blur-sm sticky top-0 z-30">
      <button onClick={() => dispatch(toggleSidebar())} className="md:hidden text-white/40 hover:text-white/80">
        <Menu size={20} />
      </button>

      <div className="flex-1">
        <h1 className="font-display font-600 text-white text-lg leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* <button className="relative w-8 h-8 rounded-lg bg-surface-3 border border-white/5 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-400 rounded-full" />
        </button> */}
        <div className="w-8 h-8 rounded-full bg-brand-600/30 flex items-center justify-center text-xs font-medium text-brand-400">
          {user?.full_name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
