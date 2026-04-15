import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { loginThunk } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const { loading, error } = useAppSelector(s => s.auth);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    try {
      const result = await dispatch(loginThunk({ email, password }));
      if (loginThunk.fulfilled.match(result)) {
        toast.success('Welcome back');
        navigate('/dashboard');
      } else {
        toast.error(result.payload as string || 'Login failed');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Login failed');
    }
  }

  return (
    <div className="min-h-screen bg-surface-0 bg-grid-pattern flex items-center justify-center p-4">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <span className="font-display font-700 text-white text-xl">Avertune</span>
        </div>

        <div className="card p-8">
          <div className="mb-7">
            <h2 className="font-display font-700 text-white text-xl mb-1">Admin Portal</h2>
            <p className="text-sm text-white/40">Sign in to your admin account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-white/40 font-medium block mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="admin@avertune.com" required />
            </div>
            <div>
              <label className="text-xs text-white/40 font-medium block mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center flex items-center gap-2 py-2.5 mt-2">
              {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in...</> : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          Avertune Admin • Restricted Access
        </p>
      </div>
    </div>
  );
}
