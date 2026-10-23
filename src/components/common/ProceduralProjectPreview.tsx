import React, { useState } from 'react';

interface ProceduralProjectPreviewProps {
  theme: 'identity' | 'motion' | 'uiux' | 'webapp';
  title: string;
  category: string;
  accentColor: string;
}

export const ProceduralProjectPreview: React.FC<ProceduralProjectPreviewProps> = ({
  theme,
  title,
  category,
  accentColor,
}) => {
  const [interactiveParam, setInteractiveParam] = useState(0);

  if (theme === 'identity') {
    return (
      <div className="relative w-full h-full min-h-[260px] sm:min-h-[340px] bg-[#0E0E11] p-6 sm:p-8 flex flex-col justify-between overflow-hidden border border-[#1E1E24] group">
        {/* Background Architectural Grid */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${accentColor} 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Spec Header */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#8B8B8B]">
          <span>SPEC // 01-BRAND-SYSTEM</span>
          <span className="text-[#F4F4F2]">GRID RATIO 1:1.618</span>
        </div>

        {/* Center Typographic Mark Composition */}
        <div className="relative z-10 my-6 flex flex-col items-center justify-center text-center">
          <div className="relative p-6 sm:p-8 border border-[#27272A] bg-[#070709] shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
            <div className="text-4xl sm:text-6xl font-extrabold tracking-tighter text-[#F4F4F2] font-display flex items-center gap-1">
              <span>K</span>
              <span style={{ color: accentColor }}>•</span>
              <span>D</span>
            </div>
            <div className="mt-2 text-[10px] sm:text-xs font-mono tracking-wider text-[#8B8B8B]">
              Kinesis Dynamics
            </div>

            {/* Corner Crosshair Coordinates */}
            <div className="absolute top-1 left-1 text-[8px] font-mono text-[#52525B]">+0.0</div>
            <div className="absolute bottom-1 right-1 text-[8px] font-mono text-[#52525B]">+1.0</div>
          </div>
        </div>

        {/* Bottom Swatches & Vector Metric Strip */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-[#1C1C22] text-[11px] font-mono text-[#71717A]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#0B0B0D] border border-[#3F3F46]" title="Onyx" />
            <span className="w-2.5 h-2.5 bg-[#E85A32]" title="Vermilion" />
            <span className="w-2.5 h-2.5 bg-[#F4F4F2]" title="Soft White" />
          </div>
          <span>GEOMETRIC TYPOGRAPHY</span>
        </div>
      </div>
    );
  }

  if (theme === 'motion') {
    return (
      <div className="relative w-full h-full min-h-[260px] sm:min-h-[340px] bg-[#0A0912] p-6 sm:p-8 flex flex-col justify-between overflow-hidden border border-[#1F1D2E] group">
        {/* Subtle Ambient Radial Glow */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#8B8B8B]">
          <span>HARMONIC WAVEFORM</span>
          <span className="text-[#A1A1AA]">60 FPS // 48kHz</span>
        </div>

        {/* Center Sinusoidal Wave Animation Preview */}
        <div className="relative z-10 my-4 h-32 flex items-center justify-center">
          <svg className="w-full h-24 overflow-visible" viewBox="0 0 400 100" fill="none">
            {/* Wave Harmonic 1 */}
            <path
              d="M 0 50 Q 50 10, 100 50 T 200 50 T 300 50 T 400 50"
              stroke="#534B82"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="opacity-40"
            />
            {/* Wave Harmonic 2 (Primary) */}
            <path
              d="M 0 50 Q 50 85, 100 50 T 200 50 T 300 50 T 400 50"
              stroke="#8B5CF6"
              strokeWidth="2.5"
              className="transition-all duration-700 group-hover:scale-y-125"
            />
            {/* Wave Harmonic 3 (Accent) */}
            <path
              d="M 0 50 Q 100 20, 200 50 T 400 50"
              stroke="#F4F4F2"
              strokeWidth="1"
              className="opacity-70"
            />
          </svg>
        </div>

        {/* Bottom Interactive Trigger Note */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-[#232035] text-[11px] font-mono text-[#71717A]">
          <span>SPATIAL AUDIO CANVAS</span>
          <span className="text-[#A1A1AA]">ZERO-LATENCY SHADER</span>
        </div>
      </div>
    );
  }

  if (theme === 'uiux') {
    return (
      <div className="relative w-full h-full min-h-[260px] sm:min-h-[340px] bg-[#0A0D10] p-6 sm:p-8 flex flex-col justify-between overflow-hidden border border-[#16202A] group">
        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#8B8B8B]">
          <span>CORTEX WORKSPACE</span>
          <span className="text-[#38BDF8]">SYSTEM TELEMETRY</span>
        </div>

        {/* Center UI Layout Simulation */}
        <div className="relative z-10 my-4 bg-[#050709] border border-[#1E293B] p-4 rounded-md">
          {/* Mock Console Header */}
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1E293B] text-[10px] font-mono text-[#64748B]">
            <span>STREAM: VOLATILITY_01</span>
            <span className="text-emerald-400">NORMALIZED</span>
          </div>

          {/* Bar Indicators */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#94A3B8]">CONFIDENCE DELTA</span>
              <span className="text-[#F8FAFC]">0.9842</span>
            </div>
            <div className="w-full bg-[#0F172A] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E85A32] transition-all duration-500 group-hover:w-[94%]"
                style={{ width: '84%' }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono pt-1">
              <span className="text-[#94A3B8]">LATENCY BUDGET</span>
              <span className="text-[#F8FAFC]">4.2 ms</span>
            </div>
            <div className="w-full bg-[#0F172A] h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-[#38BDF8] w-[28%]" />
            </div>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-[#16202A] text-[11px] font-mono text-[#64748B]">
          <span>DARK-FIELD HIGH CONTRAST</span>
          <span>WCAG AAA COMPLIANT</span>
        </div>
      </div>
    );
  }

  // theme === 'webapp'
  return (
    <div className="relative w-full h-full min-h-[260px] sm:min-h-[340px] bg-[#0B0C0E] p-6 sm:p-8 flex flex-col justify-between overflow-hidden border border-[#1F2228] group">
      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#8B8B8B]">
        <span>AETHEL PIPELINE ORCHESTRATOR</span>
        <span className="text-[#A78BFA]">NODE GRAPH</span>
      </div>

      {/* Center Graph Node Layout */}
      <div className="relative z-10 my-4 flex items-center justify-between py-2">
        {/* Node 1 */}
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded border border-[#3F3F46] bg-[#18181B] flex items-center justify-center font-mono text-xs text-[#F4F4F2] shadow-md">
            IN
          </div>
          <span className="mt-1 text-[9px] font-mono text-[#71717A]">FASTA</span>
        </div>

        {/* Connecting Vector Line */}
        <div className="flex-1 h-[1px] bg-gradient-to-r from-[#3F3F46] via-[#8B5CF6] to-[#3F3F46] mx-2 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
        </div>

        {/* Node 2 (Processing) */}
        <div className="flex flex-col items-center">
          <div className="px-3 h-10 rounded border border-[#534B82] bg-[#1E1A33] flex items-center justify-center font-mono text-xs text-[#E9D5FF] shadow-lg">
            ALIGN // BWA
          </div>
          <span className="mt-1 text-[9px] font-mono text-[#A78BFA]">EXEC</span>
        </div>

        {/* Connecting Vector Line */}
        <div className="flex-1 h-[1px] bg-[#3F3F46] mx-2" />

        {/* Node 3 (Output) */}
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded border border-[#27272A] bg-[#18181B] flex items-center justify-center font-mono text-xs text-[#71717A]">
            OUT
          </div>
          <span className="mt-1 text-[9px] font-mono text-[#71717A]">VCF</span>
        </div>
      </div>

      {/* Bottom Metadata */}
      <div className="relative z-10 flex items-center justify-between pt-4 border-t border-[#1C1F26] text-[11px] font-mono text-[#71717A]">
        <span>DAG PIPELINE ENGINE</span>
        <span className="text-[#A1A1AA]">DETERMINISTIC COMPUTE</span>
      </div>
    </div>
  );
};
