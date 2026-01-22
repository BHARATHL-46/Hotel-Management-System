
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_DEFAULT_ROUTES } from '../services/permissions';

const Login: React.FC = () => {
  const { login, token, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (token && user) {
      const from = (location.state as any)?.from?.pathname || ROLE_DEFAULT_ROUTES[user.role];
      // Only navigate if we're not already heading to the correct destination
      if (location.pathname !== from) {
        navigate(from, { replace: true });
      }
    }
  }, [token, user, navigate, location.pathname, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const success = await login(email, password);

    if (!success) {
      setError('Invalid credentials. Access Denied.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0a]">
      {/* Immersive Cinematic Background */}
      <div
        className="absolute inset-0 z-0 scale-105 animate-pulse-slow"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2070")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.3) contrast(1.1)'
        }}
      ></div>

      {/* Royal Vignette Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/40 to-[#0a0a0a]"></div>

      <div className="max-w-xl w-full px-6 relative z-10 animate-in fade-in zoom-in duration-1000">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black tracking-[0.2em] text-[#EAB308] mb-2 drop-shadow-2xl">
            ROYAL VILLAS
          </h1>
          <div className="h-px w-24 bg-[#EAB308] mx-auto mb-4 opacity-50"></div>
          <p className="text-white/60 font-medium tracking-[0.4em] text-[10px] uppercase">
            Property Management Excellence
          </p>
        </div>

        <div className="bg-black/40 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-[0_35px_100px_-15px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-rose-500/10 text-rose-400 text-xs font-bold p-4 rounded-2xl border border-rose-500/20 text-center animate-bounce">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[#EAB308] uppercase tracking-[0.2em] ml-2">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#EAB308]/50 focus:bg-white/10 outline-none transition-all text-white placeholder-white/20 font-medium"
                  placeholder="name@royalvillas.com"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <label className="block text-[10px] font-black text-[#EAB308] uppercase tracking-[0.2em]">Security Key</label>
                  <button type="button" className="text-[9px] font-bold text-white/30 uppercase tracking-widest hover:text-[#EAB308] transition-colors">Forgot Access?</button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#EAB308]/50 focus:bg-white/10 outline-none transition-all text-white placeholder-white/20 font-medium"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-[#EAB308] text-black rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-[#FACC15] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_20px_40px_-10px_rgba(234,179,8,0.3)] group overflow-hidden relative"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </>
                  ) : 'Grant Access'}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </form>
          </div>
        </div>

        <p className="mt-10 text-center text-white/20 text-[9px] font-bold uppercase tracking-[0.5em]">
          Secure Infrastructure &copy; 2025 Royal Villas Group
        </p>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
