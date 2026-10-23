import React, { useEffect, useRef } from 'react';
import { createNoise3D } from 'simplex-noise';
import { motion, useReducedMotion } from 'framer-motion';

export interface VortexProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  particleCount?: number;
  rangeY?: number;
  baseHue?: number;
  rangeHue?: number;
  baseSpeed?: number;
  rangeSpeed?: number;
  baseRadius?: number;
  rangeRadius?: number;
  backgroundColor?: string;
}

/**
 * ENTROPY — High-Performance Canvas Vortex Background Animation
 * 
 * Powered by HTML5 2D Canvas, Float32Array particle buffers, and 3D Simplex Noise.
 * Features organic, swirling cosmic particle streams with dual-pass glow and trail fading.
 */
export const Vortex: React.FC<VortexProps> = ({
  children,
  className = '',
  containerClassName = '',
  particleCount = 550,
  rangeY = 160,
  baseHue = 215,
  rangeHue = 35,
  baseSpeed = 0.12,
  rangeSpeed = 1.1,
  baseRadius = 0.8,
  rangeRadius = 1.8,
  backgroundColor = '#000000',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameId = useRef<number>(0);
  const shouldReduceMotion = useReducedMotion();

  const particlePropCount = 9;
  const particlePropsLength = particleCount * particlePropCount;
  const baseTTL = 60;
  const rangeTTL = 160;
  const noiseSteps = 3;
  const xOff = 0.00125;
  const yOff = 0.00125;
  const zOff = 0.00045;

  useEffect(() => {
    if (shouldReduceMotion) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;
    const noise3D = createNoise3D();
    let particleProps = new Float32Array(particlePropsLength);
    const center: [number, number] = [0, 0];

    const TAU = 2 * Math.PI;
    const rand = (n: number): number => n * Math.random();
    const randRange = (n: number): number => n - rand(2 * n);
    const fadeInOut = (t: number, m: number): number => {
      const hm = 0.5 * m;
      return Math.abs(((t + hm) % m) - hm) / hm;
    };
    const lerp = (n1: number, n2: number, speed: number): number =>
      (1 - speed) * n1 + speed * n2;

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      const width = clientWidth || window.innerWidth;
      const height = clientHeight || window.innerHeight;

      canvas.width = width;
      canvas.height = height;

      center[0] = 0.5 * canvas.width;
      center[1] = 0.5 * canvas.height;
    };

    const initParticle = (i: number) => {
      const x = rand(canvas.width);
      const y = center[1] + randRange(rangeY);
      const vx = 0;
      const vy = 0;
      const life = 0;
      const ttl = baseTTL + rand(rangeTTL);
      const speed = baseSpeed + rand(rangeSpeed);
      const radius = baseRadius + rand(rangeRadius);
      const hue = baseHue + rand(rangeHue);

      particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue], i);
    };

    const initParticles = () => {
      tick = 0;
      particleProps = new Float32Array(particlePropsLength);
      for (let i = 0; i < particlePropsLength; i += particlePropCount) {
        initParticle(i);
      }
    };

    const checkBounds = (x: number, y: number) => {
      return x > canvas.width || x < 0 || y > canvas.height || y < 0;
    };

    const drawParticle = (
      x: number,
      y: number,
      x2: number,
      y2: number,
      life: number,
      ttl: number,
      radius: number,
      hue: number
    ) => {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineWidth = radius;
      ctx.strokeStyle = `hsla(${hue}, 88%, 65%, ${fadeInOut(life, ttl) * 0.85})`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    };

    const updateParticle = (i: number) => {
      const x = particleProps[i];
      const y = particleProps[i + 1];
      const n = noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * TAU;
      const vx = lerp(particleProps[i + 2], Math.cos(n), 0.5);
      const vy = lerp(particleProps[i + 3], Math.sin(n), 0.5);
      const life = particleProps[i + 4];
      const ttl = particleProps[i + 5];
      const speed = particleProps[i + 6];
      const x2 = x + vx * speed;
      const y2 = y + vy * speed;
      const radius = particleProps[i + 7];
      const hue = particleProps[i + 8];

      drawParticle(x, y, x2, y2, life, ttl, radius, hue);

      const nextLife = life + 1;

      particleProps[i] = x2;
      particleProps[i + 1] = y2;
      particleProps[i + 2] = vx;
      particleProps[i + 3] = vy;
      particleProps[i + 4] = nextLife;

      if (checkBounds(x, y) || nextLife > ttl) {
        initParticle(i);
      }
    };

    const renderGlow = () => {
      ctx.save();
      ctx.filter = 'blur(6px) brightness(180%)';
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(canvas, 0, 0);
      ctx.restore();
    };

    const render = () => {
      tick++;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particlePropsLength; i += particlePropCount) {
        updateParticle(i);
      }

      renderGlow();

      animationFrameId.current = window.requestAnimationFrame(render);
    };

    resize();
    initParticles();
    render();

    const handleResize = () => {
      resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        window.cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [
    particleCount,
    rangeY,
    baseHue,
    rangeHue,
    baseSpeed,
    rangeSpeed,
    baseRadius,
    rangeRadius,
    backgroundColor,
    shouldReduceMotion,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${containerClassName}`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 z-0 flex items-center justify-center bg-transparent pointer-events-none"
      >
        <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />
      </motion.div>

      {children && <div className={`relative z-10 ${className}`}>{children}</div>}
    </div>
  );
};
