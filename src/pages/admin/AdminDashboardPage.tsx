import React, { useEffect, useState } from 'react';
import { useRouter } from '../../router/Router';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  Inbox,
  Sparkles,
  Clock,
  Send,
  Trophy,
  ArrowRight,
  Download,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface MetricsData {
  total: number;
  new: number;
  awaitingFollowUp: number;
  inDiscussion: number;
  proposalSent: number;
  won: number;
  lost: number;
  archived: number;
}

interface RecentEnquiry {
  id: string;
  client_name: string;
  email: string;
  country: string;
  project_type: string;
  budget_range: string;
  status: string;
  created_at: number;
}

export const AdminDashboardPage: React.FC = () => {
  const { navigate } = useRouter();
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [recentEnquiries, setRecentEnquiries] = useState<RecentEnquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [metricsRes, enquiriesRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/enquiries?limit=6'),
      ]);

      if (metricsRes.ok) {
        const mData = await metricsRes.json();
        setMetrics(mData);
      }

      if (enquiriesRes.ok) {
        const eData = await enquiriesRes.json();
        setRecentEnquiries(eData.enquiries || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Contacted':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'In Discussion':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Proposal Sent':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Won':
        return 'bg-teal-500/10 text-teal-300 border-teal-500/30';
      case 'Lost':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30';
    }
  };

  return (
    <AdminLayout activeTab="dashboard">
      <div className="space-y-8">
        {/* Header Title & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit',sans-serif] tracking-tight text-white">
              Studio Overview
            </h1>
            <p className="text-xs sm:text-sm text-[#8E8E93] font-sans mt-1">
              Real-time pipeline metrics and incoming client briefs from the live website.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-sans font-medium text-[#CCCCCC] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
              <span>Refresh</span>
            </button>

            <a
              href="/api/admin/export"
              download
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-medium text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] transition-all"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* 
          ======================================================================
          METRICS CARDS GRID (Calculated directly from SQLite database)
          ======================================================================
        */}
        {isLoading ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {/* 1. Total Enquiries */}
            <div className="bg-[#0B0D13]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between text-[#8E8E93] mb-2">
                <span className="text-xs font-sans font-medium">Total Briefs</span>
                <Inbox className="w-4 h-4 text-white/50" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-['Outfit',sans-serif] text-white">
                {metrics?.total ?? 0}
              </p>
              <span className="block text-[11px] font-mono text-[#71717A] mt-1">
                Lifetime submissions
              </span>
            </div>

            {/* 2. New Briefs */}
            <div className="bg-[#0B0D13]/85 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-4 sm:p-5 shadow-[0_0_20px_rgba(52,211,153,0.05)]">
              <div className="flex items-center justify-between text-emerald-400 mb-2">
                <span className="text-xs font-sans font-medium">New Enquiries</span>
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-['Outfit',sans-serif] text-emerald-300">
                {metrics?.new ?? 0}
              </p>
              <span className="block text-[11px] font-mono text-emerald-400/70 mt-1">
                Awaiting review
              </span>
            </div>

            {/* 3. Awaiting Follow-Up */}
            <div className="bg-[#0B0D13]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between text-sky-400 mb-2">
                <span className="text-xs font-sans font-medium">Follow-Up Queue</span>
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-['Outfit',sans-serif] text-white">
                {metrics?.awaitingFollowUp ?? 0}
              </p>
              <span className="block text-[11px] font-mono text-[#71717A] mt-1">
                New or contacted
              </span>
            </div>

            {/* 4. Proposals Sent */}
            <div className="bg-[#0B0D13]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between text-purple-400 mb-2">
                <span className="text-xs font-sans font-medium">Proposals Sent</span>
                <Send className="w-4 h-4" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-['Outfit',sans-serif] text-white">
                {metrics?.proposalSent ?? 0}
              </p>
              <span className="block text-[11px] font-mono text-[#71717A] mt-1">
                Active negotiations
              </span>
            </div>

            {/* 5. Won Projects */}
            <div className="bg-[#0B0D13]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between text-teal-400 mb-2">
                <span className="text-xs font-sans font-medium">Won Projects</span>
                <Trophy className="w-4 h-4" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-['Outfit',sans-serif] text-white">
                {metrics?.won ?? 0}
              </p>
              <span className="block text-[11px] font-mono text-[#71717A] mt-1">
                Confirmed contracts
              </span>
            </div>
          </div>
        )}

        {/* 
          ======================================================================
          RECENT ENQUIRIES TABLE
          ======================================================================
        */}
        <div className="bg-[#0B0D13]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base sm:text-lg font-bold font-['Outfit',sans-serif] text-white">
              Recent Submissions
            </h2>
            <button
              type="button"
              onClick={() => navigate('/admin/enquiries')}
              className="flex items-center gap-1.5 text-xs font-sans font-medium text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
            >
              <span>View All Records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentEnquiries.length === 0 ? (
            <div className="py-12 text-center text-[#8E8E93] font-sans">
              <Inbox className="w-8 h-8 mx-auto mb-2.5 opacity-40 text-white" />
              <p className="text-sm font-medium text-white/90">No enquiries received yet.</p>
              <p className="text-xs mt-1 text-[#71717A]">
                Submissions made through the public contact form will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[11px] font-mono uppercase tracking-wider text-[#8E8E93]">
                    <th className="pb-3 font-medium">Client</th>
                    <th className="pb-3 font-medium">Project Discipline</th>
                    <th className="pb-3 font-medium">Budget Range</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-xs font-sans">
                  {recentEnquiries.map((enq) => (
                    <tr
                      key={enq.id}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => navigate(`/admin/enquiries/${enq.id}`)}
                    >
                      <td className="py-3.5 pr-4">
                        <div className="font-medium text-white group-hover:text-sky-300 transition-colors">
                          {enq.client_name}
                        </div>
                        <div className="text-[11px] font-mono text-[#8E8E93]">{enq.email}</div>
                      </td>
                      <td className="py-3.5 pr-4 text-[#CCCCCC]">
                        {enq.project_type || 'Unspecified'}
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-[#A1A1A6]">
                        {enq.budget_range}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-mono border ${getStatusBadge(
                            enq.status
                          )}`}
                        >
                          {enq.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-[#8E8E93] font-mono text-[11px]">
                        {new Date(enq.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-400 group-hover:underline">
                          Details →
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
