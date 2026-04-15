import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useStore';
import { Permission, hasPermission } from '../../utils/permissions';

interface Props {
  children: React.ReactNode;
  permission?: Permission;
}

export default function ProtectedRoute({ children, permission }: Props) {
  const { user, token } = useAppSelector(s => s.auth);

  if (!token || !user) return <Navigate to="/login" replace />;

  if (permission && !hasPermission(user.role, permission)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-6xl">🔒</div>
        <h2 className="font-display font-700 text-white text-xl">Access Denied</h2>
        <p className="text-white/40 text-sm">You don't have permission to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
