import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from '../../router/Router';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Inbox,
  ArrowUpDown,
} from 'lucide-react';

interface EnquiryRecord {
  id: string;
  client_name: string;
  email: string;
  country: string;
  phone: string | null;
  project_type: string | null;
  page_count: string | null;
  budget_range: string;
  response_method: string;
  status: string;
  created_at: number;
  updated_at: number;
}

const STATUS_OPTIONS = [
  'All',
  'New',
  'Contacted',
  'In Discussion',
  'Proposal Sent',
  'Won',
  'Lost',
  'Archived',
];

const PROJECT_TYPE_FILTER_OPTIONS = [
  'All',
  'Brand Identity & Strategy',
  'UI/UX Design System',
  'Website Design & Interactive Web',
  'Full-Stack Web Development',
  'eCommerce Platform',
  'Landing Page & Campaign',
  'Motion & 3D Interactive Experience',
  'Digital Product Development',
  'Other / Multi-Disciplinary',
];

export const AdminEnquiriesPage: React.FC = () => {
  const { navigate } = useRouter();

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [projectType, setProjectType] = useState('All');
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  // Data State
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEnquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search.trim()) params.append('search', search.trim());
      if (status !== 'All') params.append('status', status);
      if (projectType !== 'All') params.append('projectType', projectType);

      const res = await fetch(`/api/admin/enquiries?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.enquiries || []);
        setTotalCount(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, status, projectType]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  // Handle Search Input with Debounce or Direct on Enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEnquiries();
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
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
    <AdminLayout activeTab="enquiries">
      <div className="space-y-6">
        {/* Page Header & CSV Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit',sans-serif] tracking-tight text-white">
              Client Enquiries
            </h1>
            <p className="text-xs sm:text-sm text-[#8E8E93] font-sans mt-1">
              Search, filter, track status, and inspect project briefs received from the public website.
            </p>
          </div>

          <a
            href="/api/admin/export"
            download
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-medium text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export CSV</span>
          </a>
        </div>

        {/* 
          ======================================================================
          SEARCH & FILTER TOOLBAR
          ======================================================================
        */}
        <div className="bg-[#0B0D13]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center gap-3.5">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by client name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#12141D] border border-white/[0.1] rounded-xl text-xs sm:text-sm font-sans text-white placeholder-[#555762] focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 transition-colors"
            />
            <Search className="w-4 h-4 text-[#7A7A85] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#8E8E93] shrink-0">Status:</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-[#12141D] border border-white/[0.1] rounded-xl text-xs font-sans text-white focus:outline-none focus:border-sky-400 transition-colors cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-[#0B0B0E] text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Project Type Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#8E8E93] shrink-0">Discipline:</span>
            <select
              value={projectType}
              onChange={(e) => {
                setProjectType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-[#12141D] border border-white/[0.1] rounded-xl text-xs font-sans text-white focus:outline-none focus:border-sky-400 transition-colors cursor-pointer max-w-[200px] truncate"
            >
              {PROJECT_TYPE_FILTER_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-[#0B0B0E] text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 
          ======================================================================
          ENQUIRIES LIST TABLE
          ======================================================================
        */}
        <div className="bg-[#0B0D13]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center text-[#8E8E93]">
              <Loader2 className="w-8 h-8 animate-spin text-sky-400 mb-2" />
              <p className="text-xs font-mono">Loading enquiries from SQLite database...</p>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="py-20 text-center text-[#8E8E93]">
              <Inbox className="w-8 h-8 mx-auto mb-2 opacity-30 text-white" />
              <p className="text-sm font-medium text-white">No matching enquiries found.</p>
              <p className="text-xs text-[#71717A] mt-1">
                Try adjusting your search query or filter options.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/[0.08] text-[11px] font-mono uppercase tracking-wider text-[#8E8E93]">
                    <th className="py-3.5 px-4 font-medium">Client</th>
                    <th className="py-3.5 px-4 font-medium">Country</th>
                    <th className="py-3.5 px-4 font-medium">Discipline & Scope</th>
                    <th className="py-3.5 px-4 font-medium">Budget Range</th>
                    <th className="py-3.5 px-4 font-medium">Response</th>
                    <th className="py-3.5 px-4 font-medium">Status</th>
                    <th className="py-3.5 px-4 font-medium">Date</th>
                    <th className="py-3.5 px-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-xs font-sans">
                  {enquiries.map((enq) => (
                    <tr
                      key={enq.id}
                      onClick={() => navigate(`/admin/enquiries/${enq.id}`)}
                      className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-white group-hover:text-sky-300 transition-colors">
                          {enq.client_name}
                        </div>
                        <div className="text-[11px] font-mono text-[#8E8E93]">{enq.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[#CCCCCC]">
                        {enq.country}
                      </td>
                      <td className="py-3.5 px-4 text-[#CCCCCC]">
                        <div>{enq.project_type || 'Custom Brief'}</div>
                        {enq.page_count && (
                          <div className="text-[10.5px] font-mono text-[#71717A]">{enq.page_count}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#A1A1A6]">
                        {enq.budget_range}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-mono text-white/80">
                          {enq.response_method}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-mono border ${getStatusBadge(
                            enq.status
                          )}`}
                        >
                          {enq.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#8E8E93]">
                        {new Date(enq.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-400 group-hover:underline">
                          View →
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 
            ====================================================================
            PAGINATION CONTROLS
            ====================================================================
          */}
          <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#8E8E93]">
            <span>
              Showing {enquiries.length} of {totalCount} records (Page {page} of {totalPages})
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEnquiriesPage;
