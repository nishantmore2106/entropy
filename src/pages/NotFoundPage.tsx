import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { GetStartedButton } from '../components/ui/GetStartedButton';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 bg-[#080808] text-[#F5F5F7]">
      <div className="relative z-10 max-w-md mx-auto flex flex-col items-center">
        <span className="text-xs font-mono tracking-wider text-[#8E8E93] mb-4">
          404 · Not found
        </span>
        <h1 className="font-['Rigter',sans-serif] text-5xl sm:text-6xl text-white tracking-tight mb-4">
          Page not found
        </h1>
        <p className="text-base text-[#A1A1A6] mb-8">
          The requested service or page does not exist or has been relocated.
        </p>
        <GetStartedButton
          to="/"
          variant="secondary"
          defaultText="Return to home"
          hoverText="Back to site"
          icon={<ArrowLeft className="w-4 h-4" />}
          className="min-w-[170px]"
        />
      </div>
    </div>
  );
};

export default NotFoundPage;
