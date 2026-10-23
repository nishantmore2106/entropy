import React, { useEffect, useState } from 'react';
import { useRouter } from '../../router/Router';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Calendar,
  Save,
  Loader2,
  Check,
  AlertCircle,
  FileText,
  Activity,
  Send,
  X,
  CheckCircle2,
  Clock,
  RotateCcw,
} from 'lucide-react';

export interface AdminEnquiryDetailPageProps {
  id: string;
}

const VALID_STATUSES = [
  'New',
  'Contacted',
  'In Discussion',
  'Proposal Sent',
  'Won',
  'Lost',
  'Archived',
];

export const AdminEnquiryDetailPage: React.FC<AdminEnquiryDetailPageProps> = ({ id }) => {
  const { navigate } = useRouter();

  const [enquiry, setEnquiry] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable fields
  const [status, setStatus] = useState('New');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Deliberate Client Email Modal (Email C)
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('Your project proposal from ENTROPY');
  const [emailMessage, setEmailMessage] = useState(
    'We have reviewed your brief and compiled a detailed scope proposal. Please review the attached deliverables and let us know your availability for a discovery sync.'
  );
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);

  const fetchEnquiryDetail = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/enquiries/${id}`);
      if (!res.ok) {
        throw new Error('Enquiry not found or access denied.');
      }

      const data = await res.json();
      setEnquiry(data.enquiry);
      setAuditLogs(data.auditLogs || []);
      setEmails(data.emails || []);
      setStatus(data.enquiry.status || 'New');
      setAdminNotes(data.enquiry.admin_notes || '');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load enquiry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiryDetail();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Entropy-Admin-Action': '1',
        },
        body: JSON.stringify({
          status,
          adminNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update enquiry.');
      }

      setEnquiry(data.enquiry);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await fetchEnquiryDetail();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to persist changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendClientEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSendingEmail || !emailMessage.trim()) return;

    setIsSendingEmail(true);
    setEmailSuccessMsg(null);

    try {
      const res = await fetch(`/api/admin/enquiries/${id}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Entropy-Admin-Action': '1',
        },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch email');

      setEmailSuccessMsg('Status email queued successfully for immediate delivery.');
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailSuccessMsg(null);
      }, 2000);
      await fetchEnquiryDetail();
    } catch (err: any) {
      alert(err.message || 'Failed to queue client transmission');
    } finally {
      setIsSendingEmail(false);
    }
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

  if (isLoading) {
    return (
      <AdminLayout activeTab="enquiries">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-400 mb-3" />
          <p className="text-xs font-mono tracking-wider text-[#8E8E93] uppercase">
            Loading Client Brief...
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (errorMsg || !enquiry) {
    return (
      <AdminLayout activeTab="enquiries">
        <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 text-center max-w-lg mx-auto my-12">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-white mb-1">Enquiry Unavailable</h2>
          <p className="text-xs text-[#8E8E93] mb-5">{errorMsg || 'Record could not be retrieved.'}</p>
          <button
            type="button"
            onClick={() => navigate('/admin/enquiries')}
            className="px-4 py-2 rounded-xl text-xs font-sans font-medium text-white bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
          >
            ← Return to Enquiries List
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="enquiries">
      <div className="space-y-6">
        {/* Top Back Navigation & Brief Headline */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => navigate('/admin/enquiries')}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8E8E93] hover:text-white transition-colors cursor-pointer mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Client Enquiries</span>
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit',sans-serif] tracking-tight text-white">
                {enquiry.client_name}
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${getStatusBadge(
                  enquiry.status
                )}`}
              >
                {enquiry.status}
              </span>
            </div>
            <p className="text-xs font-mono text-[#71717A]">
              Enquiry ID: <span className="text-sky-400">{enquiry.id}</span> · Submitted{' '}
              {new Date(enquiry.created_at).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEmailModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 border border-sky-400/30 shadow-md transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Email to Client</span>
            </button>
          </div>
        </div>

        {/* Two-Column Grid: Left Details & Right Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Submitted Fields & Project Scope */}
          <div className="lg:col-span-8 space-y-6">
            {/* Contact Channels Card */}
            <div className="bg-[#0B0D13]/80 border border-white/[0.08] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
                <Mail className="w-4 h-4 text-sky-400" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Contact Channels
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-mono text-[#8E8E93] uppercase block mb-1">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="text-sm font-sans font-medium text-white hover:text-sky-300 transition-colors"
                  >
                    {enquiry.email}
                  </a>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-[#8E8E93] uppercase block mb-1">
                    Phone / Mobile
                  </span>
                  {enquiry.phone ? (
                    <a
                      href={`tel:${enquiry.phone}`}
                      className="text-sm font-sans font-medium text-white hover:text-sky-300 transition-colors"
                    >
                      {enquiry.phone}
                    </a>
                  ) : (
                    <span className="text-sm font-sans text-[#71717A]">None provided</span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-mono text-[#8E8E93] uppercase block mb-1">
                    Country Base
                  </span>
                  <span className="text-sm font-sans text-white flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#8E8E93]" />
                    {enquiry.country}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-[#8E8E93] uppercase block mb-1">
                    Preferred Response Method
                  </span>
                  <span className="text-sm font-sans text-white font-medium">
                    {enquiry.response_method}
                  </span>
                </div>
              </div>
            </div>

            {/* Scope & Budget Card */}
            <div className="bg-[#0B0D13]/80 border border-white/[0.08] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
                <FileText className="w-4 h-4 text-sky-400" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Project Scope & Budget
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-mono text-[#8E8E93] uppercase block mb-1">
                    Discipline
                  </span>
                  <span className="text-sm font-sans font-medium text-white">
                    {enquiry.project_type || 'General Creative Technology'}
                  </span>
                  {enquiry.page_count && (
                    <span className="block text-xs text-[#8E8E93] mt-0.5">
                      {enquiry.page_count}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-mono text-[#8E8E93] uppercase block mb-1">
                    Allocated Budget
                  </span>
                  <span className="text-sm font-mono font-bold text-sky-400">
                    {enquiry.budget_range}
                  </span>
                </div>
              </div>
            </div>

            {/* Client Description Card */}
            <div className="bg-[#0B0D13]/80 border border-white/[0.08] rounded-2xl p-6 shadow-xl">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-3">
                Client Project Description
              </h2>
              <div className="p-4 rounded-xl bg-[#07080B] border border-white/[0.06] text-xs sm:text-sm text-[#D1D1D6] leading-relaxed whitespace-pre-wrap font-sans">
                {enquiry.description || 'No detailed brief text provided by client.'}
              </div>
            </div>

            {/* Outbound Email Transmissions for this Enquiry */}
            <div className="bg-[#0B0D13]/80 border border-white/[0.08] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
                <Mail className="w-4 h-4 text-sky-400" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Outbound Email Transmissions ({emails.length})
                </h2>
              </div>

              {emails.length === 0 ? (
                <p className="text-xs text-[#8E8E93] py-2">No email transmissions recorded for this enquiry yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {emails.map((em) => (
                    <div
                      key={em.id}
                      className="p-3.5 rounded-xl bg-[#090B10] border border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-sans"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{em.subject}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            em.status === 'Accepted'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-300'
                          }`}>
                            {em.status}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-[#8E8E93] mt-0.5">
                          To: {em.recipient} · {new Date(em.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {em.delivered_at && (
                        <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 shrink-0">
                          <Check className="w-3 h-3" /> Delivered
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audit Trail Card */}
            {auditLogs.length > 0 && (
              <div className="bg-[#0B0D13]/80 border border-white/[0.08] rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Enquiry Activity & Audit Trail
                  </h2>
                </div>

                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-[#07080B] border border-white/[0.04] flex items-start justify-between text-xs font-mono"
                    >
                      <div>
                        <span className="font-medium text-white">{log.action}</span>
                        {log.details && (
                          <span className="block text-[#8E8E93] text-[11px] mt-0.5">
                            {log.details}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#71717A] shrink-0 ml-2">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (4 cols): Status Changer & Internal Notes */}
          <div className="lg:col-span-4 space-y-6">
            <form
              onSubmit={handleSave}
              className="bg-[#0B0D13]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 space-y-5 sticky top-20 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
            >
              <h2 className="text-sm font-bold font-['Outfit',sans-serif] uppercase tracking-wider text-white">
                Manage Enquiry
              </h2>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-sans flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Changes saved to database.</span>
                </div>
              )}

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#8E8E93] mb-1.5">
                  Pipeline Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#12141D] border border-white/[0.1] rounded-xl text-xs sm:text-sm font-sans text-white focus:outline-none focus:border-sky-400 transition-colors cursor-pointer"
                >
                  {VALID_STATUSES.map((st) => (
                    <option key={st} value={st} className="bg-[#0B0B0E] text-white">
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#8E8E93] mb-1.5">
                  Internal Studio Notes
                </label>
                <textarea
                  rows={6}
                  placeholder="Record call summaries, proposal links, next actions, or private principal notes..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#12141D] border border-white/[0.1] rounded-xl text-xs sm:text-sm font-sans text-white placeholder-[#555762] focus:outline-none focus:border-sky-400 transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-semibold text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 border border-sky-400/30 shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Enquiry Updates</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Deliberate Client Status Update / Proposal Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0E1017] border border-white/[0.1] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-white">Send Client Transmission</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="p-1 rounded-lg text-[#8E8E93] hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendClientEmail} className="p-6 space-y-4 text-xs font-sans">
              <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/20 text-sky-200">
                <span className="font-semibold block mb-0.5">Deliberate Client Transmission</span>
                <span>This action queues a direct branded email transmission to <strong>{enquiry.client_name}</strong> at <strong>{enquiry.email}</strong>.</span>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#CCCCCC] mb-1.5">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#12141D] border border-white/[0.1] rounded-xl text-xs font-sans text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#CCCCCC] mb-1.5">
                  Message Body
                </label>
                <textarea
                  rows={6}
                  required
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#12141D] border border-white/[0.1] rounded-xl text-xs font-sans text-white focus:outline-none focus:border-sky-400 resize-none leading-relaxed"
                />
              </div>

              {emailSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{emailSuccessMsg}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-sans text-[#8E8E93] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-sans font-semibold text-white bg-blue-600 hover:bg-blue-500 border border-blue-400/30 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirm & Send Email</span>
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

export default AdminEnquiryDetailPage;
