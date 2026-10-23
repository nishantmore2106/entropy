import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  Mail,
  Send,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Eye,
  Loader2,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface EmailJob {
  id: string;
  enquiry_id: string | null;
  recipient: string;
  template_type: string;
  subject: string;
  payload: string;
  status: 'Pending' | 'Processing' | 'Accepted' | 'Retry Scheduled' | 'Failed Permanently';
  attempts: number;
  max_attempts: number;
  next_retry_at: number;
  idempotency_key: string;
  provider_message_id: string | null;
  last_error: string | null;
  created_at: number;
  updated_at: number;
  delivered_at: number | null;
}

interface OutboxCounts {
  total: number;
  pending: number;
  accepted: number;
  retrying: number;
  failed: number;
}

export const AdminEmailPage: React.FC = () => {
  const [jobs, setJobs] = useState<EmailJob[]>([]);
  const [counts, setCounts] = useState<OutboxCounts>({ total: 0, pending: 0, accepted: 0, retrying: 0, failed: 0 });
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Preview Modal
  const [previewJob, setPreviewJob] = useState<EmailJob | null>(null);

  // Diagnostic Test Email Modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [testRecipient, setTestRecipient] = useState('entropy.helpdesk@gmail.com');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  // Retrying job
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const fetchOutbox = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const url = statusFilter && statusFilter !== 'All'
        ? `/api/admin/email/outbox?status=${encodeURIComponent(statusFilter)}`
        : '/api/admin/email/outbox';

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch email outbox records');
      const data = await res.json();
      setJobs(data.jobs || []);
      if (data.counts) {
        setCounts(data.counts);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with outbox queue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOutbox();
  }, [statusFilter]);

  const handleRetry = async (jobId: string) => {
    setRetryingId(jobId);
    try {
      const res = await fetch(`/api/admin/email/retry/${jobId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Entropy-Admin-Action': '1',
        },
      });
      if (!res.ok) throw new Error('Failed to reschedule job');
      await fetchOutbox();
    } catch (err: any) {
      alert(err.message || 'Error retrying job');
    } finally {
      setRetryingId(null);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Entropy-Admin-Action': '1',
        },
        body: JSON.stringify({ recipient: testRecipient }),
      });

      const data = await res.json();
      setTestResult(data);
      await fetchOutbox();
    } catch (err: any) {
      setTestResult({ error: err.message || 'Diagnostic dispatch failed' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const getStatusBadge = (status: EmailJob['status']) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Accepted
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Pending
          </span>
        );
      case 'Retry Scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <RotateCcw className="w-3 h-3 animate-spin text-sky-400" />
            Retry Scheduled
          </span>
        );
      case 'Failed Permanently':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3 text-red-400" />
            Failed Permanently
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
            Processing
          </span>
        );
      default:
        return <span className="text-xs font-mono text-zinc-400">{status}</span>;
    }
  };

  const formatTemplateType = (type: string) => {
    switch (type) {
      case 'CLIENT_CONFIRMATION':
        return 'Client Confirmation (Email A)';
      case 'STUDIO_NOTIFICATION':
        return 'Studio Alert (Email B)';
      case 'CLIENT_STATUS_UPDATE':
        return 'Client Proposal / Update (Email C)';
      case 'INTERNAL_REMINDER':
        return 'Internal Reminder (Email D)';
      case 'TEST_EMAIL':
        return 'Diagnostic Test Email';
      default:
        return type;
    }
  };

  return (
    <AdminLayout activeTab="email">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit',sans-serif] tracking-tight text-white">
              Email Activity & Queue
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-sky-500/10 border border-sky-400/20 text-sky-400">
              Durable SQLite Outbox
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8E8E93] font-sans">
            Real-time status of client confirmations, internal studio alerts, and transactional delivery queues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchOutbox}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-medium text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowTestModal(true);
              setTestResult(null);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-sans font-semibold text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 border border-sky-400/30 shadow-[0_4px_14px_rgba(37,99,235,0.3)] transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Run Diagnostic Test</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-8">
        <div className="p-4 rounded-xl bg-[#0E1017] border border-white/[0.07]">
          <div className="text-[11px] font-mono text-[#8E8E93] uppercase mb-1">Total Queued</div>
          <div className="text-2xl font-bold font-['Outfit',sans-serif] text-white">{counts.total}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0E1017] border border-emerald-500/20">
          <div className="text-[11px] font-mono text-emerald-400 uppercase mb-1">Accepted</div>
          <div className="text-2xl font-bold font-['Outfit',sans-serif] text-emerald-300">{counts.accepted}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0E1017] border border-amber-500/20">
          <div className="text-[11px] font-mono text-amber-300 uppercase mb-1">Pending</div>
          <div className="text-2xl font-bold font-['Outfit',sans-serif] text-amber-200">{counts.pending}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0E1017] border border-sky-500/20">
          <div className="text-[11px] font-mono text-sky-400 uppercase mb-1">Retrying</div>
          <div className="text-2xl font-bold font-['Outfit',sans-serif] text-sky-300">{counts.retrying}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0E1017] border border-red-500/20">
          <div className="text-[11px] font-mono text-red-400 uppercase mb-1">Failed</div>
          <div className="text-2xl font-bold font-['Outfit',sans-serif] text-red-300">{counts.failed}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-6 p-2 rounded-xl bg-[#0E1017] border border-white/[0.07]">
        <span className="text-xs font-mono text-[#8E8E93] ml-2">Status Filter:</span>
        <div className="flex flex-wrap gap-1">
          {['All', 'Accepted', 'Pending', 'Retry Scheduled', 'Failed Permanently'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-sans transition-colors cursor-pointer ${
                statusFilter === s
                  ? 'bg-white/[0.1] text-white font-medium border border-white/[0.12]'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Outbox Table */}
      <div className="rounded-2xl bg-[#0B0D13]/80 border border-white/[0.08] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#0E1017]/80 text-[#8E8E93] uppercase font-mono tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Recipient</th>
                <th className="py-3.5 px-4">Template / Event</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Attempts</th>
                <th className="py-3.5 px-4">Created / Delivered</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8E8E93]">
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                        <span>Loading outbox records...</span>
                      </div>
                    ) : (
                      'No email jobs recorded for this filter.'
                    )}
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{job.recipient}</div>
                      {job.enquiry_id && (
                        <div className="text-[10px] font-mono text-[#8E8E93]">Ref: {job.enquiry_id.substring(0, 16)}...</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-[#D1D1D6] font-medium">{formatTemplateType(job.template_type)}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-[240px] truncate text-[#A1A1AA]">
                      {job.subject}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(job.status)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#8E8E93]">
                      {job.attempts} / {job.max_attempts}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] font-mono text-[#8E8E93]">
                      <div>{new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                      {job.delivered_at && (
                        <div className="text-emerald-400/80">Delivered: {new Date(job.delivered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewJob(job)}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-sky-400" />
                          <span>Preview</span>
                        </button>

                        {job.status !== 'Accepted' && (
                          <button
                            type="button"
                            disabled={retryingId === job.id}
                            onClick={() => handleRetry(job.id)}
                            className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/20 text-sky-300 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                          >
                            <RotateCcw className={`w-3 h-3 ${retryingId === job.id ? 'animate-spin' : ''}`} />
                            <span>Retry</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0E1017] border border-white/[0.1] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Email Transmission Record</h3>
                <p className="text-[11px] font-mono text-[#8E8E93]">Job ID: {previewJob.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewJob(null)}
                className="p-1 rounded-lg text-[#8E8E93] hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#090B10] border border-white/[0.06]">
                <div>
                  <span className="text-[10px] font-mono text-[#8E8E93] uppercase block mb-0.5">Recipient</span>
                  <span className="font-medium text-white">{previewJob.recipient}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#8E8E93] uppercase block mb-0.5">Status</span>
                  <div>{getStatusBadge(previewJob.status)}</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#8E8E93] uppercase block mb-0.5">Subject</span>
                  <span className="text-white">{previewJob.subject}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#8E8E93] uppercase block mb-0.5">Idempotency Key</span>
                  <span className="font-mono text-[#A1A1AA]">{previewJob.idempotency_key}</span>
                </div>
                {previewJob.provider_message_id && (
                  <div className="col-span-2">
                    <span className="text-[10px] font-mono text-[#8E8E93] uppercase block mb-0.5">Provider Message ID</span>
                    <span className="font-mono text-emerald-400">{previewJob.provider_message_id}</span>
                  </div>
                )}
                {previewJob.last_error && (
                  <div className="col-span-2 p-3 rounded-lg bg-red-950/30 border border-red-500/20 text-red-300">
                    <span className="text-[10px] font-mono uppercase block mb-0.5 font-bold">Last Delivery Error</span>
                    <span>{previewJob.last_error}</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#8E8E93] mb-2">Template Variables Payload</h4>
                <pre className="p-3.5 rounded-xl bg-[#07080B] border border-white/[0.06] text-[11px] font-mono text-[#38BDF8] overflow-x-auto">
                  {JSON.stringify(JSON.parse(previewJob.payload || '{}'), null, 2)}
                </pre>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-white/[0.08] flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewJob(null)}
                className="px-4 py-2 rounded-xl text-xs font-sans font-medium text-white bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostic Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0E1017] border border-white/[0.1] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-white">Diagnostic Mailer Test</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="p-1 rounded-lg text-[#8E8E93] hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendTestEmail} className="p-6 space-y-4">
              <p className="text-xs text-[#8E8E93] leading-relaxed">
                Dispatches a live diagnostic transmission to verify transport connectivity and outbox queue processing.
              </p>

              <div>
                <label className="block text-xs font-mono text-[#CCCCCC] mb-1.5">
                  Test Recipient Address
                </label>
                <input
                  type="email"
                  required
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="entropy.helpdesk@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-[#12141D] border border-white/[0.1] rounded-xl text-xs font-sans text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              {testResult && (
                <div className={`p-3.5 rounded-xl text-xs font-sans border ${
                  testResult.success
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                }`}>
                  <div className="font-semibold mb-1">
                    {testResult.success ? '✔ Transport Accepted Diagnostic Transmission' : 'Notice'}
                  </div>
                  {testResult.messageId && (
                    <div className="font-mono text-[11px] text-emerald-400">ID: {testResult.messageId}</div>
                  )}
                  {testResult.note && (
                    <div className="text-[11px] text-[#A1A1AA] mt-1">{testResult.note}</div>
                  )}
                  {testResult.connection?.transport && (
                    <div className="text-[10px] font-mono text-[#8E8E93] mt-1">Transport: {testResult.connection.transport}</div>
                  )}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-sans text-[#8E8E93] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-sans font-semibold text-white bg-blue-600 hover:bg-blue-500 border border-blue-400/30 shadow-[0_4px_14px_rgba(37,99,235,0.4)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSendingTest ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Diagnostic</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminEmailPage;
