import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAppSelector } from '../../hooks/useStore';
import clsx from 'clsx';

export default function Layout() {
  const collapsed = useAppSelector(s => s.ui.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-surface-0 bg-grid-pattern">
      <Sidebar />
      <main className={clsx('transition-all duration-300', collapsed ? 'ml-16' : 'ml-60')}>
        <Outlet />
      </main>
    </div>
  );
}
