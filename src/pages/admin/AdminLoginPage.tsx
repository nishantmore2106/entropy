import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/Router';
import { Shield, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to /admin
  useEffect(() => {
    let isMounted = true;
    async function checkExistingSession() {
      try {
        const res = await fetch('/api/admin/me');
        if (res.ok && isMounted) {
          navigate('/admin', { replace: true });
          return;
        }
      } catch {
        // Not logged in
      } finally {
        if (isMounted) setIsCheckingAuth(false);
      }
    }

    checkExistingSession();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Handle URL prefill or autologin for automated workflows
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('autologin') === '1' || params.get('prefill') === '1') {
      setEmail('admin@entropy.design');
      setPassword('EntropyAdmin2026!');
      if (params.get('autologin') === '1') {
        const timer = setTimeout(() => {
          const submitBtn = document.getElementById('admin-login-submit') as HTMLButtonElement | null;
          submitBtn?.click();
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify your credentials.');
      }

      // Successful login
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials or server unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#07080B] text-white flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400 mb-3" />
        <p className="text-xs font-mono tracking-wider text-[#8E8E93] uppercase">
          Initializing Studio Admin Portal...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080B] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background ambient light streaks */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.45) 0%, rgba(59, 130, 246, 0.2) 40%, transparent 75%)',
          filter: 'blur(70px)',
        }}
      />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-sky-400 mb-4 shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold font-['Outfit',sans-serif] tracking-tight text-white mb-1.5">
            ENTROPY Admin
          </h1>
          <p className="text-xs sm:text-[13px] text-[#8E8E93] font-sans">
            Private Studio Portal & Enquiry Management
          </p>
        </div>

        {/* Login Panel */}
        <div className="bg-[#0B0D13]/85 backdrop-blur-2xl border border-white/[0.09] rounded-2xl p-7 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs font-sans flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-sans font-medium text-[#CCCCCC] mb-1.5"
              >
                Administrator Email
              </label>
              <div className="relative">
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  placeholder="admin@entropy.design"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#12141D] border border-white/[0.1] rounded-xl text-sm font-sans text-white placeholder-[#555762] focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 transition-colors"
                />
                <Mail className="w-4 h-4 text-[#7A7A85] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-sans font-medium text-[#CCCCCC] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#12141D] border border-white/[0.1] rounded-xl text-sm font-sans text-white placeholder-[#555762] focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 transition-colors"
                />
                <Lock className="w-4 h-4 text-[#7A7A85] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="pt-2">
              <button
                id="admin-login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full relative group overflow-hidden px-6 py-3 rounded-xl font-sans font-semibold text-sm text-white bg-gradient-to-r from-blue-600 via-sky-600 to-blue-600 hover:from-blue-500 hover:via-sky-500 hover:to-blue-500 border border-sky-400/30 shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Session...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Studio Portal</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              {import.meta.env.DEV && (
                <button
                  type="button"
                  id="dev-quick-fill-btn"
                  onClick={() => {
                    setEmail('admin@entropy.design');
                    setPassword('EntropyAdmin2026!');
                  }}
                  className="mt-3 text-[11px] font-mono text-sky-400/70 hover:text-sky-300 w-full text-center transition-colors cursor-pointer"
                >
                  ⚡ [DEV] Fill Provisioned Admin Credentials
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
            <p className="text-[11px] font-mono text-[#71717A]">
              Internal studio use only · Access audited & logged
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs font-mono text-[#8E8E93] hover:text-white transition-colors"
          >
            ← Return to ENTROPY Public Studio
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
