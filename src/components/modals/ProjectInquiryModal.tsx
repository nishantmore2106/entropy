import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { ProjectEnquiryForm } from '../contact/ProjectEnquiryForm';

interface ProjectInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
}

export const ProjectInquiryModal: React.FC<ProjectInquiryModalProps> = ({
  isOpen,
  onClose,
  initialService,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl h-full bg-[#0B0B0D] border-l border-[#1E1E24] overflow-y-auto flex flex-col shadow-2xl transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 sm:px-8 py-5 bg-[#0B0B0D]/95 backdrop-blur-md border-b border-[#1E1E24]">
          <div>
            <div className="text-[11px] font-mono tracking-wider text-[#8B8B8B]">
              Project Engagement
            </div>
            <h2 id="inquiry-title" className="text-xl font-bold font-['Outfit',sans-serif] text-[#F4F4F2]">
              Let's Connect
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#8B8B8B] hover:text-[#F4F4F2] hover:bg-[#1E1E24] rounded-md transition-colors cursor-pointer"
            aria-label="Close inquiry drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Embedded ProjectEnquiryForm */}
        <div className="p-6 sm:p-8 flex-1">
          <ProjectEnquiryForm
            initialService={initialService}
            onSuccess={onClose}
            className="border-0 shadow-none p-0 bg-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectInquiryModal;
