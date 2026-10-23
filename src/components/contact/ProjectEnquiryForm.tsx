import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Check,
  Send,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { WhatsAppIcon } from '../common/BrandIcons';

export interface ProjectEnquiryFormProps {
  initialService?: string;
  onSuccess?: () => void;
  className?: string;
}

const COUNTRY_OPTIONS = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'United Arab Emirates',
  'Singapore',
  'Switzerland',
  'Japan',
  'Other',
];

const PROJECT_TYPE_OPTIONS = [
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

const PAGE_COUNT_OPTIONS = [
  '1 Page (Campaign / Landing)',
  '2 – 5 Pages (Boutique / Studio Site)',
  '6 – 10 Pages (Comprehensive Commercial)',
  '10+ Pages (Platform / SaaS / Flagship)',
];

const BUDGET_TIERS = [
  '₹20,000 – ₹50,000',
  '₹50,000 – ₹80,000',
  '₹80,000 – ₹1,50,000',
  'Above ₹1,50,000',
];

export const ProjectEnquiryForm: React.FC<ProjectEnquiryFormProps> = ({
  initialService,
  onSuccess,
  className = '',
}) => {
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('India');
  const [phone, setPhone] = useState('');
  const [projectType, setProjectType] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [budgetTier, setBudgetTier] = useState('₹50,000 – ₹80,000');
  const [description, setDescription] = useState('');
  const [responseMethod, setResponseMethod] = useState<'Email' | 'WhatsApp'>('Email');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEnquiryId, setSubmittedEnquiryId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync initial service if passed from query param or another route
  useEffect(() => {
    if (initialService) {
      const match = PROJECT_TYPE_OPTIONS.find((t) =>
        t.toLowerCase().includes(initialService.toLowerCase())
      );
      if (match) {
        setProjectType(match);
      } else {
        setProjectType(initialService);
      }
    }
  }, [initialService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMsg(null);

    // Client-side Validation
    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          country: country.trim(),
          phone: phone.trim() || null,
          projectType: projectType.trim() || null,
          pageCount: pageCount.trim() || null,
          budgetRange: budgetTier,
          description: description.trim() || null,
          responseMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to transmit project enquiry.');
      }

      setSubmittedEnquiryId(data.id || null);
      setIsSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('[Form Submit Error]:', err);
      setErrorMsg(
        err.message || 'Unable to transmit enquiry. Please reach out to entropy.helpdesk@gmail.com directly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSubmittedEnquiryId(null);
    setName('');
    setEmail('');
    setCountry('India');
    setPhone('');
    setProjectType('');
    setPageCount('');
    setBudgetTier('₹50,000 – ₹80,000');
    setDescription('');
    setResponseMethod('Email');
    setErrorMsg(null);
  };

  if (isSubmitted) {
    return (
      <div
        className={`w-full bg-[#07090E]/85 backdrop-blur-2xl border border-white/[0.09] rounded-2xl p-8 sm:p-12 text-center shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col items-center justify-center space-y-6 font-sans ${className}`}
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.2)]">
          <Check className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl sm:text-3xl font-bold font-['Outfit',sans-serif] text-white">
            Enquiry Transmitted
          </h2>
          <p className="text-sm sm:text-base text-[#A1A1A6] font-sans leading-relaxed">
            Thank you, <span className="text-white font-medium">{name}</span>. Your brief has been securely stored in our studio records. A principal will review your project requirements and follow up via{' '}
            <span className="text-white font-medium">{responseMethod}</span> within 24 hours.
          </p>
          {submittedEnquiryId && (
            <p className="text-[11px] font-mono text-[#71717A] pt-1">
              Reference ID: {submittedEnquiryId}
            </p>
          )}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-sans font-medium text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] transition-colors cursor-pointer"
          >
            Submit Another Project
          </button>
          <a
            href="/"
            className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-sans text-black bg-white hover:bg-white/90 font-medium transition-colors cursor-pointer"
          >
            Return to Studio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full bg-[#07090E]/85 backdrop-blur-2xl border border-white/[0.09] rounded-2xl p-6 sm:p-8 lg:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(56,189,248,0.03)] font-sans ${className}`}
    >
      {/* Form Introduction */}
      <div className="mb-7 sm:mb-8">
        <div className="flex items-center gap-2 mb-3 text-white">
          <MessageSquare className="w-5 h-5 fill-white" />
        </div>
        <h2 className="text-2xl sm:text-[28px] font-bold font-['Outfit',sans-serif] tracking-tight text-white leading-tight">
          Start Your Project
        </h2>
        <p className="text-sm sm:text-[15px] text-[#A1A1A6] font-sans font-normal leading-relaxed mt-1">
          Tell us what you're looking to create. We'll help you find the right direction.
        </p>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs sm:text-sm font-sans"
        >
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* ROW 1: Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="field-name"
              className="block text-xs font-sans font-medium tracking-wide text-[#CCCCCC] mb-1.5"
            >
              Name <span className="text-sky-400">*</span>
            </label>
            <input
              id="field-name"
              type="text"
              required
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 bg-[#111319]/90 border border-white/[0.1] rounded-xl text-sm font-sans text-white placeholder-[#555760] focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="field-email"
              className="block text-xs font-sans font-medium tracking-wide text-[#CCCCCC] mb-1.5"
            >
              Email <span className="text-sky-400">*</span>
            </label>
            <input
              id="field-email"
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 bg-[#111319]/90 border border-white/[0.1] rounded-xl text-sm font-sans text-white placeholder-[#555760] focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 transition-colors"
            />
          </div>
        </div>

        {/* ROW 2: Country & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="field-country"
              className="block text-xs font-sans font-medium tracking-wide text-[#CCCCCC] mb-1.5"
            >
              Country <span className="text-sky-400">*</span>
            </label>
            <div className="relative">
              <select
                id="field-country"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2.5 sm:py-3 bg-[#111319]/90 border border-white/[0.1] rounded-xl text-sm font-sans text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 transition-colors appearance-none cursor-pointer pr-10"
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c} value={c} className="bg-[#0B0B0E] text-white">
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#7A7A85] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label
              htmlFor="field-phone"
              className="block text-xs font-sans font-medium tracking-wide text-[#CCCCCC] mb-1.5"
            >
              Phone
            </label>
            <input
              id="field-phone"
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 bg-[#111319]/90 border border-white/[0.1] rounded-xl text-sm font-sans text-white placeholder-[#555760] focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 transition-colors"
            />
          </div>
        </div>

        {/* ROW 3: Project Type & Number of Pages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="field-project-type"
              className="block text-xs font-sans font-medium tracking-wide text-[#CCCCCC] mb-1.5"
            >
              Project Type
            </label>
            <div className="relative">
              <select
                id="field-project-type"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full px-4 py-2.5 sm:py-3 bg-[#111319]/90 border border-white/[0.1] rounded-xl text-sm font-sans text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 transition-colors appearance-none cursor-pointer pr-10"
              >
                <option value="" className="bg-[#0B0B0E] text-[#6E6E78]">
                  Select....
                </option>
                {PROJECT_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t} className="bg-[#0B0B0E] text-white">
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#7A7A85] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label
              htmlFor="field-page-count"
              className="block text-xs font-sans font-medium tracking-wide text-[#CCCCCC] mb-1.5"
            >
              Number of pages
            </label>
            <div className="relative">
              <select
                id="field-page-count"
                value={pageCount}
                onChange={(e) => setPageCount(e.target.value)}
                className="w-full px-4 py-2.5 sm:py-3 bg-[#111319]/90 border border-white/[0.1] rounded-xl text-sm font-sans text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 transition-colors appearance-none cursor-pointer pr-10"
              >
                <option value="" className="bg-[#0B0B0E] text-[#6E6E78]">
                  Select....
                </option>
                {PAGE_COUNT_OPTIONS.map((p) => (
                  <option key={p} value={p} className="bg-[#0B0B0E] text-white">
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#7A7A85] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ROW 4: Budget Range Selector (2x2 Grid) */}
        <div>
          <label className="block text-xs font-sans font-medium tracking-wide text-[#CCCCCC] mb-2">
            Budget range <span className="text-sky-400">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {BUDGET_TIERS.map((tier) => {
              const isSelected = budgetTier === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setBudgetTier(tier)}
                  className={`px-4 py-3 rounded-xl text-xs sm:text-[13.5px] font-sans transition-all duration-200 border cursor-pointer text-center select-none ${
                    isSelected
                      ? 'bg-[#121c2e] border-blue-500/80 text-white font-medium shadow-[0_0_18px_rgba(59,130,246,0.25)]'
                      : 'bg-[#10131B]/75 hover:bg-[#151924] border-white/[0.08] hover:border-white/[0.18] text-[#A1A1AA] hover:text-white font-normal'
                  }`}
                  aria-pressed={isSelected}
                >
                  {tier}
                </button>
              );
            })}
          </div>
        </div>

        {/* ROW 5: Project Description */}
        <div>
          <label
            htmlFor="field-description"
            className="block text-xs font-sans font-medium tracking-wide text-[#CCCCCC] mb-1.5"
          >
            What do you need help with?
          </label>
          <textarea
            id="field-description"
            rows={4}
            placeholder="Tell us what you're looking to create and what matters most..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 sm:py-3 bg-[#111319]/90 border border-white/[0.1] rounded-xl text-sm font-sans text-white placeholder-[#555760] focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* ROW 6: Preferred Response Method */}
        <div>
          <label className="block text-xs font-sans font-medium tracking-wide text-[#CCCCCC] mb-2">
            Preferred Response Method <span className="text-sky-400">*</span>
          </label>
          <div className="flex items-center gap-7">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="radio"
                name="responseMethod"
                value="Email"
                checked={responseMethod === 'Email'}
                onChange={() => setResponseMethod('Email')}
                className="sr-only"
              />
              <span
                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                  responseMethod === 'Email'
                    ? 'border-sky-400 bg-sky-400/20 shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                    : 'border-white/30 bg-transparent'
                }`}
              >
                {responseMethod === 'Email' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </span>
              <span
                className={`text-xs sm:text-sm font-sans font-medium transition-colors ${
                  responseMethod === 'Email' ? 'text-white' : 'text-[#8E8E93]'
                }`}
              >
                Email
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="radio"
                name="responseMethod"
                value="WhatsApp"
                checked={responseMethod === 'WhatsApp'}
                onChange={() => setResponseMethod('WhatsApp')}
                className="sr-only"
              />
              <span
                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                  responseMethod === 'WhatsApp'
                    ? 'border-emerald-400 bg-emerald-400/20 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                    : 'border-white/30 bg-transparent'
                }`}
              >
                {responseMethod === 'WhatsApp' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-sans font-medium transition-colors ${
                  responseMethod === 'WhatsApp' ? 'text-white' : 'text-[#8E8E93]'
                }`}
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </span>
            </label>
          </div>
        </div>

        {/* ROW 7: Primary Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full relative group overflow-hidden px-8 py-3.5 sm:py-4 rounded-xl font-sans font-semibold text-sm sm:text-base text-white bg-gradient-to-r from-blue-600 via-sky-600 to-blue-600 hover:from-blue-500 hover:via-sky-500 hover:to-blue-500 border border-sky-400/30 hover:border-sky-300/60 shadow-[0_10px_30px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_35px_-5px_rgba(37,99,235,0.6)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Transmitting Project Brief...</span>
              </>
            ) : (
              <>
                <span>Send Project Enquiry</span>
                <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectEnquiryForm;
