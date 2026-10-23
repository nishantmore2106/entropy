import React, { useEffect, useState } from 'react';
import { useRouter } from '../../router/Router';
import {
  LayoutDashboard,
  Inbox,
  Mail,
  LogOut,
  Shield,
  ExternalLink,
  Loader2,
} from 'lucide-react';

export interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab?: 'dashboard' | 'enquiries' | 'email';
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab = 'dashboard' }) => {
  const { navigate, pathname } = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/me');
        if (!res.ok) {
          navigate('/admin/login', { replace: true });
          return;
        }
        const data = await res.json();
        if (isMounted) {
          setUser(data.user);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          navigate('/admin/login', { replace: true });
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Entropy-Admin-Action': '1',
        },
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      navigate('/admin/login', { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07080B] text-white flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400 mb-3" />
        <p className="text-xs font-mono tracking-wider text-[#8E8E93] uppercase">
          Verifying Studio Security Session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080B] text-[#F4F4F2] font-sans flex flex-col">
      {/* 
        ========================================================================
        ADMIN TOP NAVIGATION BAR
        ========================================================================
      */}
      <header className="sticky top-0 z-50 w-full bg-[#0B0D13]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Left: Studio Brand & Admin Badge */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <span className="font-['Outfit',sans-serif] font-bold text-lg sm:text-xl tracking-tight text-white group-hover:text-sky-300 transition-colors">
              ENTROPY
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase bg-sky-500/10 border border-sky-400/20 text-sky-400">
              <Shield className="w-2.5 h-2.5" />
              <span>Admin</span>
            </span>
          </button>

          {/* Navigation Links */}
          <nav aria-label="Admin Navigation" className="hidden sm:flex items-center gap-1 ml-4 pl-4 border-l border-white/[0.08]">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white/[0.08] text-white'
                  : 'text-[#8E8E93] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/enquiries')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer ${
                activeTab === 'enquiries'
                  ? 'bg-white/[0.08] text-white'
                  : 'text-[#8E8E93] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Client Enquiries</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/email')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer ${
                activeTab === 'email'
                  ? 'bg-white/[0.08] text-white'
                  : 'text-[#8E8E93] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Activity</span>
            </button>
          </nav>
        </div>

        {/* Right: User Identity & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 text-xs text-[#8E8E93] hover:text-white transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {user && (
            <div className="hidden lg:flex flex-col text-right pr-2">
              <span className="text-xs font-sans font-medium text-white">
                {user.displayName}
              </span>
              <span className="text-[10px] font-mono text-[#8E8E93]">
                {user.email}
              </span>
            </div>
          )}

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Page Content */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-8 sm:py-10">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="w-full border-t border-white/[0.06] py-4 px-6 text-center text-xs font-mono text-[#6E6E78]">
        ENTROPY Studio Internal Systems · Confidential Project Records · Restricted Administrator Access
      </footer>
    </div>
  );
};

export default AdminLayout;
