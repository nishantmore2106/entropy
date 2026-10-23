import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { cn } from '../../lib/utils';
import { ArrowLeft, ArrowRight, Eye, RotateCw } from 'lucide-react';

/* --------------------------------------------------------------------------
 * Types & Interfaces
 * ------------------------------------------------------------------------ */
export interface OrbitReelItem {
  src?: string;
  image?: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  href?: string;
  step?: string;
  stepName?: string;
  description?: string;
  output?: string;
  deliverable?: string;
  color?: string;
  glow?: string;
  border?: string;
  tagline?: string;
  icon?: React.ReactNode;
  frontContent?: React.ReactNode;
  backContent?: React.ReactNode;
}

export interface OrbitReelProps {
  items?: OrbitReelItem[];
  count?: number;
  defaultView?: 'ring' | 'arc';
  spin?: number;
  autoplay?: boolean;
  interval?: number;
  arc?: number;
  apex?: number;
  aspect?: number;
  radius?: number;
  gap?: number;
  tilt?: boolean;
  flipWave?: boolean;
  accentColor?: string;
  backgroundColor?: string;
  captions?: boolean;
  controls?: boolean;
  draggable?: boolean;
  wheel?: boolean;
  pauseOnHover?: boolean;
  zoomOnClick?: boolean;
  paused?: boolean;
  ariaLabel?: string;
  onViewChange?: (view: 'ring' | 'arc') => void;
  onActiveChange?: (item: OrbitReelItem, index: number) => void;
  onSelect?: (item: OrbitReelItem, index: number) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface OrbitReelRef {
  next: () => void;
  previous: () => void;
  goTo: (index: number) => void;
  setView: (view: 'ring' | 'arc') => void;
  flipActive: () => void;
}

/* --------------------------------------------------------------------------
 * Mathematical & Physics Helpers
 * ------------------------------------------------------------------------ */
const TWO_PI = 2 * Math.PI;

const clamp = (val: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, val));

const wrapAngle = (angle: number): number =>
  ((angle + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI;

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const subscribeReducedMotion = (callback: () => void) => {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  try {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!media) return () => {};
    if (media.addEventListener) {
      media.addEventListener('change', callback);
      return () => media.removeEventListener('change', callback);
    } else if ((media as any).addListener) {
      (media as any).addListener(callback);
      return () => (media as any).removeListener(callback);
    }
  } catch {
    return () => {};
  }
  return () => {};
};

const getReducedMotionSnapshot = () => {
  try {
    return typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')?.matches ?? false
      : false;
  } catch {
    return false;
  }
};

const springIntegrator = (
  pos: number,
  vel: number,
  target: number,
  dt: number,
  frequency: number,
  damping: number
): [number, number] => {
  const omega = TWO_PI / Math.max(frequency, 0.02);
  const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
  const subDt = dt / steps;
  let p = pos;
  let v = vel;
  for (let i = 0; i < steps; i++) {
    const acc = omega * omega * (target - p) - 2 * damping * omega * v;
    v += acc * subDt;
    p += v * subDt;
  }
  return [p, v];
};

/* --------------------------------------------------------------------------
 * Base Inline Styles (Preserving 3D matrix transforms)
 * ------------------------------------------------------------------------ */
const visuallyHiddenStyle: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const sceneContainerStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  perspective: 1400,
  touchAction: 'pan-y',
  userSelect: 'none',
  WebkitUserSelect: 'none',
};

const cardButtonStyle: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  padding: 0,
  margin: 0,
  border: 0,
  background: 'none',
  cursor: 'pointer',
  transformStyle: 'preserve-3d',
  transformOrigin: '50% 50%',
  willChange: 'transform',
  outline: 'none',
};

const cardFlipperStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  transformStyle: 'preserve-3d',
  transformOrigin: '50% 50%',
};

const cardFaceStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
};

const controlButtonStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  display: 'grid',
  placeItems: 'center',
  padding: 0,
  borderRadius: 999,
  border: '1px solid rgba(255, 255, 255, 0.12)',
  background: 'rgba(255, 255, 255, 0.05)',
  color: 'inherit',
  cursor: 'pointer',
  transition: 'all 200ms ease',
};

/* --------------------------------------------------------------------------
 * Main OrbitReel Component
 * ------------------------------------------------------------------------ */
export const OrbitReel = forwardRef<OrbitReelRef, OrbitReelProps>(function OrbitReel(
  {
    items = [],
    count = 18,
    defaultView = 'ring',
    spin = 8,
    autoplay = true,
    interval = 3.5,
    arc = 1,
    apex = 0.42,
    aspect = 0.8,
    radius = 0.07,
    gap = 0.18,
    tilt = true,
    flipWave = true,
    accentColor = '#BFD7F2',
    backgroundColor = 'transparent',
    captions = true,
    controls = true,
    draggable = true,
    wheel = false,
    pauseOnHover = true,
    zoomOnClick = true,
    paused = false,
    ariaLabel = 'Orbit reel. Click a card to bring it forward, drag to turn, press Escape to zoom out.',
    onViewChange,
    onActiveChange,
    onSelect,
    className,
    style,
    children,
  },
  ref
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<any>(null);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  const activeItems = items.length > 0 ? items : [];
  const roundedCount = clamp(Math.round(count), 3, 72);
  const totalCards =
    activeItems.length >= roundedCount
      ? Math.min(activeItems.length, 72)
      : activeItems.length *
        Math.max(
          1,
          Math.min(
            Math.round(roundedCount / (activeItems.length || 1)),
            Math.floor(72 / (activeItems.length || 1))
          )
        );

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [currentView, setCurrentView] = useState<'ring' | 'arc'>(defaultView);
  const [manualFlippedCard, setManualFlippedCard] = useState<number | null>(null);

  const config = {
    items: activeItems,
    count: totalCards,
    spin,
    autoplay,
    interval,
    arc,
    apex,
    aspect,
    radius,
    gap,
    tilt,
    flipWave,
    accentColor,
    backgroundColor,
    captions,
    controls,
    draggable,
    wheel,
    pauseOnHover,
    zoomOnClick,
    paused,
    reduced: reducedMotion,
  };

  const configRef = useRef(config);
  const callbacksRef = useRef({
    onViewChange,
    onActiveChange,
    onSelect,
    list: activeItems,
  });

  useEffect(() => {
    configRef.current = config;
    callbacksRef.current = {
      onViewChange,
      onActiveChange,
      onSelect,
      list: activeItems,
    };
    controllerRef.current?.sync();
  });

  /* --------------------------------------------------------------------------
   * Physics Engine & Interaction Controller
   * ------------------------------------------------------------------------ */
  useEffect(() => {
    const rootEl = rootRef.current;
    const sceneEl = sceneRef.current;
    if (!rootEl || !sceneEl) return;

    const controller = ((root, scene, cfgRef, initialView, cbs) => {
      let width = 1;
      let height = 1;
      let cardButtons: HTMLButtonElement[] = [];
      let cardFlippers: HTMLElement[] = [];
      let numCards = 0;
      let rotationAngle = 0;
      let rotationVelocity = 0;
      let targetRotation = 0;
      let isTargeting = false;
      let viewBlend = +(initialView === 'arc');
      const viewSpring = { value: viewBlend, velocity: 0 };
      const speedSpring = { value: 1, velocity: 0 };
      const cardSprings: { value: number; velocity: number }[] = [];
      let hoveredIndex = -1;
      let lastReportedActive = -1;
      let flipWaveStartTime = -10;
      let lastWaveTriggerTime = 0;
      let autoplayAccumulator = 0;
      let elapsedTime = 0;
      let animFrameId = 0;
      let lastFrameTime = 0;
      let isVisible = false;
      let isDestroyed = false;
      let dragJustEnded = false;
      let momentumVelocity = 0;
      let isSettlingWheel = false;
      let lastWheelTime = 0;
      let pointerState: {
        id: number;
        x: number;
        y: number;
        lastX: number;
        lastY: number;
        moved: boolean;
        samples: { t: number; d: number }[];
      } | null = null;

      const syncCards = () => {
        cardButtons = Array.from(scene.querySelectorAll('[data-orbit-card]'));
        cardFlippers = cardButtons.map((btn) => btn.firstElementChild as HTMLElement);
        numCards = cardButtons.length;
        while (cardSprings.length < numCards) {
          cardSprings.push({ value: 0, velocity: 0 });
        }
        cardSprings.length = numCards;
      };

      const computeGeometry = () => {
        const curCfg = cfgRef.current;
        const aspectVal = clamp(curCfg.aspect, 0.4, 2.5);
        const gapVal = clamp(curCfg.gap, 0, 0.8);
        const minDim = Math.min(width, height);

        const ringRadius = 0.36 * minDim;
        let ringW = ((TWO_PI * ringRadius) / Math.max(numCards, 1)) * (1 - gapVal);
        let ringH = ringW / aspectVal;
        const maxRingH = 0.17 * minDim;
        if (ringH > maxRingH) {
          ringH = maxRingH;
          ringW = ringH * aspectVal;
        }

        let arcH = Math.min(0.44 * height, (0.34 * width) / aspectVal);
        let arcW = arcH * aspectVal;
        const arcRadius =
          Math.max(
            (Math.max(numCards, 1) * arcW) / Math.max(1 - gapVal, 0.2) / TWO_PI,
            0.6 * Math.max(width, height)
          ) * clamp(curCfg.arc, 0.4, 3);
        const maxArcW = ((TWO_PI * arcRadius) / Math.max(numCards, 1)) * (1 - gapVal);
        if (arcW > maxArcW) {
          arcW = maxArcW;
          arcH = arcW / aspectVal;
        }

        return { ringRadius, ringW, ringH, arcRadius, arcW, arcH, aspect: aspectVal };
      };

      const updateDimensions = () => {
        const rect = root.getBoundingClientRect();
        width = Math.max(1, rect.width);
        height = Math.max(1, rect.height);
        const geom = computeGeometry();
        for (const btn of cardButtons) {
          btn.style.width = `${geom.arcW}px`;
          btn.style.height = `${geom.arcH}px`;
        }
        const bRadius = `${clamp(cfgRef.current.radius, 0, 0.5) * geom.arcW}px`;
        for (const flipper of cardFlippers) {
          if (flipper) {
            for (const face of Array.from(flipper.children)) {
              (face as HTMLElement).style.borderRadius = bRadius;
            }
          }
        }
      };

      const getAngleStep = () => TWO_PI / Math.max(numCards, 1);

      const getActiveCardIndex = () => {
        const step = getAngleStep();
        return (Math.round(-rotationAngle / step) % numCards + numCards) % numCards;
      };

      const requestTick = () => {
        if (!isDestroyed && isVisible && !animFrameId) {
          animFrameId = requestAnimationFrame(tick);
        }
      };

      const snapToCard = (cardIdx: number) => {
        const step = getAngleStep();
        targetRotation = rotationAngle + wrapAngle(-cardIdx * step - rotationAngle);
        isTargeting = true;
        autoplayAccumulator = 0;
        requestTick();
      };

      const setViewMode = (newView: 'ring' | 'arc') => {
        const targetBlend = +(newView === 'arc');
        if (targetBlend !== viewBlend) {
          viewBlend = targetBlend;
          if (!cfgRef.current.reduced && cfgRef.current.flipWave) {
            flipWaveStartTime = elapsedTime;
          }
          if (targetBlend === 1) {
            snapToCard(getActiveCardIndex());
          } else {
            isTargeting = false;
          }
          cbs.onView(newView);
          requestTick();
        }
      };

      const stepCards = (direction: number) => {
        if (viewBlend === 1) {
          const base = isTargeting ? targetRotation : rotationAngle;
          const step = getAngleStep();
          targetRotation = Math.round(base / step) * step - direction * step;
          isTargeting = true;
          autoplayAccumulator = 0;
        } else {
          rotationVelocity -= 0.9 * direction;
        }
        requestTick();
      };

      /* ----------------------------------------------------------------------
       * Animation Loop Tick
       * -------------------------------------------------------------------- */
      function tick(timestamp: number) {
        animFrameId = 0;
        if (isDestroyed || !numCards) return;

        const curCfg = cfgRef.current;
        const dt = lastFrameTime
          ? Math.min(Math.max((timestamp - lastFrameTime) / 1000, 0), 0.05)
          : 1 / 60;
        lastFrameTime = timestamp;
        elapsedTime += dt;

        const isReduced = curCfg.reduced;
        const isRunning = !curCfg.paused && !isReduced;
        let needsNextFrame = false;

        // View spring (ring <-> arc blend)
        const [nextViewVal, nextViewVel] = springIntegrator(
          viewSpring.value,
          viewSpring.velocity,
          viewBlend,
          dt,
          isReduced ? 0.05 : 1.1,
          1
        );
        viewSpring.value = nextViewVal;
        viewSpring.velocity = nextViewVel;
        if (
          Math.abs(viewSpring.value - viewBlend) > 1e-4 ||
          Math.abs(viewSpring.velocity) > 1e-4
        ) {
          needsNextFrame = true;
        }

        const arcFactor = clamp(viewSpring.value, 0, 1);

        // Hover deceleration
        const isHovered = curCfg.pauseOnHover && hoveredIndex >= 0;
        const [nextSpeedVal, nextSpeedVel] = springIntegrator(
          speedSpring.value,
          speedSpring.velocity,
          isHovered || !isRunning ? 0 : 1,
          dt,
          isHovered ? 0.25 : 0.9,
          1
        );
        speedSpring.value = nextSpeedVal;
        speedSpring.velocity = nextSpeedVel;

        // Wheel momentum
        if (momentumVelocity !== 0 && (!pointerState || !pointerState.moved)) {
          const decay = momentumVelocity * (1 - Math.exp(-dt / (isReduced ? 0.02 : 0.14)));
          if (Math.abs(momentumVelocity - decay) < 1e-5) {
            momentumVelocity = 0;
          } else {
            momentumVelocity -= decay;
          }
          rotationAngle += decay;
          needsNextFrame = true;
        }

        if (isSettlingWheel && !pointerState && timestamp - lastWheelTime > 140) {
          isSettlingWheel = false;
          if (viewBlend === 1) {
            const step = getAngleStep();
            targetRotation = Math.round(targetRotation / step) * step;
            isTargeting = true;
          }
        }
        if (isSettlingWheel) needsNextFrame = true;

        // Targeting interpolation or natural spin
        if (!pointerState || !pointerState.moved) {
          if (isTargeting) {
            const [nextAngle, nextVel] = springIntegrator(
              rotationAngle,
              rotationVelocity,
              targetRotation,
              dt,
              isReduced ? 0.05 : 0.75,
              0.92
            );
            rotationAngle = nextAngle;
            rotationVelocity = nextVel;
            if (
              Math.abs(rotationAngle - targetRotation) < 1e-4 &&
              Math.abs(rotationVelocity) < 1e-4
            ) {
              rotationAngle = targetRotation;
              rotationVelocity = 0;
              if (viewBlend === 0) isTargeting = false;
            } else {
              needsNextFrame = true;
            }
          } else {
            const spinDelta =
              ((curCfg.spin * Math.PI) / 180) * Math.max(speedSpring.value, 0) * (1 - arcFactor);
            rotationAngle += (spinDelta + rotationVelocity) * dt;
            rotationVelocity *= Math.exp(-1.6 * dt);
            if (Math.abs(spinDelta) > 1e-5 || Math.abs(rotationVelocity) > 1e-4) {
              needsNextFrame = true;
            }
          }
        }

        // Autoplay in arc view
        if (viewBlend === 1 && isRunning && curCfg.autoplay && !isHovered && !pointerState) {
          needsNextFrame = true;
          autoplayAccumulator += dt;
          if (autoplayAccumulator >= Math.max(curCfg.interval, 1)) {
            autoplayAccumulator = 0;
            stepCards(1);
          }
        }

        // Periodic flip wave in ring view
        if (
          viewBlend === 0 &&
          isRunning &&
          curCfg.flipWave &&
          !isHovered &&
          elapsedTime - Math.max(flipWaveStartTime, lastWaveTriggerTime) > 9
        ) {
          flipWaveStartTime = elapsedTime;
          lastWaveTriggerTime = elapsedTime;
        }

        // Geometry transforms
        const geom = computeGeometry();
        const currentRadius =
          geom.ringRadius * Math.pow(geom.arcRadius / geom.ringRadius, arcFactor);
        const currentH = geom.ringH * Math.pow(geom.arcH / geom.ringH, arcFactor);
        const scaleNorm = currentH / geom.arcH;
        const ringTop = height / 2 - geom.ringRadius;
        const currentTop =
          ringTop + (height * clamp(curCfg.apex, 0.1, 0.9) - ringTop) * arcFactor;
        const centerX = width / 2;
        const centerY = currentTop + currentRadius;
        const angleStep = getAngleStep();
        const waveTime = elapsedTime - flipWaveStartTime;
        const isWaveActive = curCfg.flipWave && !isReduced && waveTime < 2.4;
        if (isWaveActive) needsNextFrame = true;

        const cullMargin = 1.3 * Math.hypot((geom.arcW * scaleNorm) / 2, (geom.arcH * scaleNorm) / 2);

        // Position each card
        for (let i = 0; i < numCards; i++) {
          const cardTheta = rotationAngle + i * angleStep - Math.PI / 2;
          const spring = cardSprings[i];

          const [nextHoverVal, nextHoverVel] = springIntegrator(
            spring.value,
            spring.velocity,
            +(i === hoveredIndex),
            dt,
            0.35,
            0.85
          );
          spring.value = nextHoverVal;
          spring.velocity = nextHoverVel;
          if (
            Math.abs(spring.velocity) > 1e-4 ||
            Math.abs(spring.value - +(i === hoveredIndex)) > 1e-4
          ) {
            needsNextFrame = true;
          }

          const hoverElevation = spring.value * (6 + 10 * (1 - arcFactor)) * (1 - 0.6 * arcFactor);
          const posX = centerX + Math.cos(cardTheta) * (currentRadius + hoverElevation);
          const posY = centerY + Math.sin(cardTheta) * (currentRadius + hoverElevation);
          const cardBtn = cardButtons[i];
          if (!cardBtn) continue;

          // Culling
          if (
            posX < -cullMargin ||
            posX > width + cullMargin ||
            posY < -cullMargin ||
            posY > height + cullMargin
          ) {
            if (cardBtn.style.visibility !== 'hidden') {
              cardBtn.style.visibility = 'hidden';
            }
            continue;
          }
          if (cardBtn.style.visibility === 'hidden') {
            cardBtn.style.visibility = '';
          }

          const cardTilt = curCfg.tilt ? cardTheta + Math.PI / 2 : 0;
          const distFromApex = Math.abs(wrapAngle(cardTheta + Math.PI / 2));
          const arcScaleTaper =
            1 - 0.08 * arcFactor * Math.min(Math.min(distFromApex / angleStep, 1.5), 1);
          const totalScale = (1 + spring.value * (0.1 - 0.06 * arcFactor)) * arcScaleTaper;

          cardBtn.style.transform = `translate3d(${posX - geom.arcW / 2}px, ${
            posY - geom.arcH / 2
          }px, 0) rotate(${cardTilt}rad) scale(${scaleNorm * totalScale})`;

          // Wave rotation or individual flip
          let flipDegrees = 0;
          if (isWaveActive) {
            const waveProgress = clamp(
              (waveTime - 0.9 * (distFromApex / Math.PI)) / 0.9,
              0,
              1
            );
            flipDegrees = 360 * easeInOutCubic(waveProgress);
          }

          const isFlipped = cardBtn.getAttribute('data-flipped') === 'true';
          const baseTurn = isFlipped ? 180 : 0;
          const totalFlip = baseTurn + flipDegrees;

          const flipper = cardFlippers[i];
          if (flipper) {
            if (isWaveActive) {
              flipper.style.transition = 'none';
              flipper.style.transform = `rotateY(${totalFlip}deg)`;
            } else {
              flipper.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
              flipper.style.transform = totalFlip ? `rotateY(${totalFlip}deg)` : '';
            }
          }

          cardBtn.style.zIndex = String(
            i === hoveredIndex
              ? 1000
              : Math.round(500 - 100 * distFromApex)
          );
        }

        const activeIdx = getActiveCardIndex();
        if (activeIdx !== lastReportedActive) {
          lastReportedActive = activeIdx;
          cbs.onActive(activeIdx);
        }

        root.style.setProperty('--orbit-caption-y', `${currentTop + currentH / 2 + 20}px`);
        root.style.setProperty('--orbit-arc', String(arcFactor));

        if (needsNextFrame || pointerState) requestTick();
      }

      /* ----------------------------------------------------------------------
       * Pointer / Drag / Touch Events
       * -------------------------------------------------------------------- */
      const onPointerDown = (e: PointerEvent) => {
        if (!cfgRef.current.draggable || !e.isPrimary || e.button > 0) return;
        pointerState = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          lastX: e.clientX,
          lastY: e.clientY,
          moved: false,
          samples: [],
        };
        dragJustEnded = false;
        requestTick();
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!pointerState || pointerState.id !== e.pointerId) return;

        if (!pointerState.moved && Math.hypot(e.clientX - pointerState.x, e.clientY - pointerState.y) > 6) {
          pointerState.moved = true;
          isTargeting = false;
          rotationVelocity = 0;
          try {
            scene.setPointerCapture(e.pointerId);
          } catch {}
        }

        if (pointerState.moved) {
          let delta = 0;
          const rect = root.getBoundingClientRect();
          if (viewBlend === 1) {
            const geom = computeGeometry();
            delta = (e.clientX - pointerState.lastX) / (0.92 * geom.arcRadius);
          } else {
            const originX = rect.left + width / 2;
            const originY = rect.top + height / 2;
            const prevAngle = Math.atan2(pointerState.lastY - originY, pointerState.lastX - originX);
            const currAngle = Math.atan2(e.clientY - originY, e.clientX - originX);
            delta = wrapAngle(currAngle - prevAngle);
          }
          rotationAngle += delta;

          const now = performance.now();
          pointerState.samples.push({ t: now, d: delta });
          while (pointerState.samples.length && now - pointerState.samples[0].t > 100) {
            pointerState.samples.shift();
          }
        }

        pointerState.lastX = e.clientX;
        pointerState.lastY = e.clientY;
        requestTick();
      };

      const onPointerUp = (e: PointerEvent) => {
        if (!pointerState || pointerState.id !== e.pointerId) return;
        const currentDrag = pointerState;
        pointerState = null;

        try {
          if (scene.hasPointerCapture(e.pointerId)) {
            scene.releasePointerCapture(e.pointerId);
          }
        } catch {}

        if (currentDrag.moved) {
          dragJustEnded = true;
          const now = performance.now();
          const recentSamples = currentDrag.samples.filter((s) => now - s.t < 100);
          let vel = 0;
          if (recentSamples.length > 1) {
            const duration = Math.max(
              (recentSamples[recentSamples.length - 1].t - recentSamples[0].t) / 1000,
              1 / 60
            );
            vel = recentSamples.reduce((acc, s) => acc + s.d, 0) / duration;
          }

          if (viewBlend === 1) {
            const step = getAngleStep();
            targetRotation =
              Math.round((rotationAngle + 0.22 * clamp(vel, -6, 6)) / step) * step;
            rotationVelocity = vel;
            isTargeting = true;
            autoplayAccumulator = 0;
          } else {
            rotationVelocity = clamp(vel, -4, 4);
          }
        }
        requestTick();
      };

      const onRootClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-orbit-card]') && !target.closest('[data-orbit-control]')) {
          if (dragJustEnded) {
            dragJustEnded = false;
            return;
          }
          if (viewBlend === 1 && cfgRef.current.zoomOnClick) {
            setViewMode('ring');
          }
        }
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          stepCards(1);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          stepCards(-1);
        } else if (e.key === 'Escape') {
          setViewMode('ring');
        } else if (e.key === 'Enter' && e.target === root) {
          e.preventDefault();
          if (viewBlend === 0) {
            setViewMode('arc');
          } else {
            cbs.onSelect(getActiveCardIndex());
          }
        }
      };

      const onWheel = (e: WheelEvent) => {
        if (!cfgRef.current.wheel) return;
        e.preventDefault();
        const modeMultiplier = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? height : 1;
        const delta = clamp((e.deltaY + e.deltaX) * modeMultiplier, -240, 240);

        if (viewBlend === 1) {
          const step = getAngleStep();
          targetRotation = (isTargeting ? targetRotation : rotationAngle) - (delta / 100) * step;
          isTargeting = true;
          autoplayAccumulator = 0;
          isSettlingWheel = true;
        } else {
          momentumVelocity -= 0.0035 * delta;
        }
        lastWheelTime = performance.now();
        requestTick();
      };

      // Register listeners
      scene.addEventListener('pointerdown', onPointerDown);
      scene.addEventListener('pointermove', onPointerMove);
      scene.addEventListener('pointerup', onPointerUp);
      scene.addEventListener('pointercancel', onPointerUp);
      scene.addEventListener('click', onRootClick);
      scene.addEventListener('wheel', onWheel, { passive: false });
      root.addEventListener('keydown', onKeyDown);

      const resizeObserver = new ResizeObserver(() => {
        updateDimensions();
        requestTick();
      });
      resizeObserver.observe(root);

      const intersectionObserver =
        typeof IntersectionObserver === 'undefined'
          ? null
          : new IntersectionObserver(
              ([entry]) => {
                isVisible = entry.isIntersecting;
                if (isVisible) {
                  lastFrameTime = 0;
                  requestTick();
                } else if (animFrameId) {
                  cancelAnimationFrame(animFrameId);
                  animFrameId = 0;
                }
              },
              { rootMargin: '80px' }
            );

      if (intersectionObserver) {
        intersectionObserver.observe(root);
      } else {
        isVisible = true;
      }

      // Initial layout setup
      syncCards();
      updateDimensions();
      if (viewBlend === 1) {
        targetRotation = 0;
        isTargeting = true;
      }
      if (cfgRef.current.flipWave && !cfgRef.current.reduced) {
        flipWaveStartTime = 0.2;
        lastWaveTriggerTime = 0.2;
      }
      requestTick();

      return {
        sync: () => {
          syncCards();
          updateDimensions();
          lastFrameTime = 0;
          requestTick();
        },
        step: stepCards,
        goTo: (idx: number) => {
          if (viewBlend === 0) setViewMode('arc');
          snapToCard(idx);
        },
        setView: setViewMode,
        select: (idx: number) => {
          if (dragJustEnded) {
            dragJustEnded = false;
            return;
          }
          if (viewBlend === 0) {
            if (cfgRef.current.zoomOnClick) {
              snapToCard(idx);
              viewBlend = 1;
              if (!cfgRef.current.reduced && cfgRef.current.flipWave) {
                flipWaveStartTime = elapsedTime;
              }
              cbs.onView('arc');
              requestTick();
            } else {
              cbs.onSelect(idx);
            }
          } else {
            if (idx === getActiveCardIndex()) {
              cbs.onSelect(idx);
            } else {
              snapToCard(idx);
            }
          }
        },
        hover: (idx: number) => {
          hoveredIndex = idx;
          requestTick();
        },
        destroy: () => {
          isDestroyed = true;
          if (animFrameId) cancelAnimationFrame(animFrameId);
          intersectionObserver?.disconnect();
          resizeObserver.disconnect();
          scene.removeEventListener('pointerdown', onPointerDown);
          scene.removeEventListener('pointermove', onPointerMove);
          scene.removeEventListener('pointerup', onPointerUp);
          scene.removeEventListener('pointercancel', onPointerUp);
          scene.removeEventListener('click', onRootClick);
          scene.removeEventListener('wheel', onWheel);
          root.removeEventListener('keydown', onKeyDown);
        },
      };
    })(
      rootEl,
      sceneEl,
      configRef,
      defaultView,
      {
        onActive: (idx: number) => {
          setActiveIndex(idx);
          setManualFlippedCard(null);
          const { list, onActiveChange: cb } = callbacksRef.current;
          const item = list[idx % list.length];
          if (item) cb?.(item, idx % list.length);
        },
        onView: (view: 'ring' | 'arc') => {
          setCurrentView(view);
          callbacksRef.current.onViewChange?.(view);
        },
        onSelect: (idx: number) => {
          setManualFlippedCard((prev) => (prev === idx ? null : idx));
          const { list, onSelect: cb } = callbacksRef.current;
          const item = list[idx % list.length];
          if (item) {
            cb?.(item, idx % list.length);
            if (item.href) window.location.assign(item.href);
          }
        },
      }
    );

    controllerRef.current = controller;
    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, []);

  // Caption fade in animation
  useEffect(() => {
    const el = captionRef.current;
    if (el && !reducedMotion) {
      el.animate(
        [
          { opacity: 0, transform: 'translateY(6px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 380, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
      );
    }
  }, [activeIndex, reducedMotion]);

  useImperativeHandle(
    ref,
    () => ({
      next: () => controllerRef.current?.step(1),
      previous: () => controllerRef.current?.step(-1),
      goTo: (idx: number) => controllerRef.current?.goTo(idx),
      setView: (v: 'ring' | 'arc') => controllerRef.current?.setView(v),
      flipActive: () => {
        setManualFlippedCard((prev) => (prev === activeIndex ? null : activeIndex));
      },
    }),
    [activeIndex]
  );

  const activeCardItem = activeItems[activeIndex % (activeItems.length || 1)];
  const isArcView = currentView === 'arc';

  return (
    <div
      ref={rootRef}
      className={cn('relative h-full min-h-[460px] w-full overflow-hidden select-none', className)}
      style={{
        backgroundColor,
        color: '#FFFFFF',
        ...style,
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      {/* 3D Scene Container */}
      <div ref={sceneRef} style={sceneContainerStyle}>
        {Array.from({ length: totalCards }, (_, i) => {
          const item = activeItems[i % activeItems.length];
          const isCardFlipped = manualFlippedCard === i;
          const stepNum = item?.step || String((i % activeItems.length) + 1).padStart(2, '0');

          return (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              data-orbit-card=""
              data-flipped={isCardFlipped ? 'true' : 'false'}
              aria-label={item?.title || item?.alt || `Process step ${stepNum}`}
              style={cardButtonStyle}
              onClick={() => {
                controllerRef.current?.select(i);
              }}
              onPointerEnter={(e) => {
                if (e.pointerType !== 'touch') {
                  controllerRef.current?.hover(i);
                }
              }}
              onPointerLeave={() => {
                controllerRef.current?.hover(-1);
              }}
            >
              {/* Inner 3D preserve-3d wrapper */}
              <span
                style={{
                  ...cardFlipperStyle,
                  transform: isCardFlipped ? 'rotateY(180deg)' : undefined,
                  transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {/* ─────────────────────────────────────────────────────────────
                    FRONT OF CARD (Visually Led with Minimal Icon Only)
                    ───────────────────────────────────────────────────────────── */}
                {/* ─────────────────────────────────────────────────────────────
                    FRONT OF CARD (Visually Led with Minimal Icon & Accent Aura)
                    ───────────────────────────────────────────────────────────── */}
                <span
                  style={{
                    ...cardFaceStyle,
                    boxShadow:
                      '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 2px 8px -2px rgba(0, 0, 0, 0.5)',
                    backgroundColor: '#0B0B0E',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: isCardFlipped ? 'none' : 'auto',
                  }}
                  className="group relative overflow-hidden"
                >
                  {/* Subtle inner radial glow with the card's accent color */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at center, ${item?.color || '#BFD7F2'}22 0%, transparent 70%)`,
                    }}
                  />

                  {/* Minimal step number in top corner */}
                  <div className="absolute top-3.5 left-4 font-sans text-[11px] font-semibold text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    {item?.step}
                  </div>

                  {/* Centered distinctive minimal icon */}
                  <div className="relative z-10 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500">
                    {item?.icon}
                  </div>

                  {/* Clean title on front bottom */}
                  <div className="absolute bottom-3.5 text-center w-full px-3">
                    <span className="font-sans text-[11px] tracking-[0.2em] uppercase text-zinc-400 group-hover:text-white transition-colors font-medium">
                      {item?.title}
                    </span>
                  </div>
                </span>

                {/* ─────────────────────────────────────────────────────────────
                    REVERSE OF CARD (Vibrant Colorful Glow + Evocative Image)
                    ───────────────────────────────────────────────────────────── */}
                <span
                  style={{
                    ...cardFaceStyle,
                    transform: 'rotateY(180deg)',
                    backgroundColor: '#08080C',
                    border: `1px solid ${item?.border || 'rgba(255, 255, 255, 0.15)'}`,
                    boxShadow: `0 24px 48px -18px rgba(0, 0, 0, 0.9), 0 0 25px -5px ${item?.glow || 'rgba(59, 130, 246, 0.35)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '20px 18px',
                    textAlign: 'left',
                    pointerEvents: isCardFlipped ? 'auto' : 'none',
                  }}
                  className="relative overflow-hidden group"
                >
                  {/* High-resolution thematic process image */}
                  {(item?.image || item?.src) && (
                    <img
                      src={item.image || item.src}
                      alt={item?.title || ''}
                      className="absolute inset-0 w-full h-full object-cover object-center opacity-35 mix-blend-luminosity filter contrast-125 scale-105 group-hover:scale-110 transition-transform duration-700 pointer-events-none"
                    />
                  )}

                  {/* Vibrant color gradient atmosphere overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(180deg, ${item?.color || '#3B82F6'}33 0%, rgba(10,12,22,0.82) 40%, rgba(6,7,12,0.96) 100%)`,
                    }}
                  />

                  {/* Glowing top colored accent line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
                    style={{
                      backgroundColor: item?.color || '#3B82F6',
                      boxShadow: `0 0 12px ${item?.color || '#3B82F6'}`,
                    }}
                  />

                  {/* Top: Step Tagline, Title, and Divider */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="font-sans text-[10px] tracking-[0.2em] uppercase font-semibold px-2 py-0.5 rounded bg-black/60 border border-white/10"
                        style={{ color: item?.color || '#BFD7F2' }}
                      >
                        {item?.tagline || `${item?.step || '01'} / ${item?.title}`}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-sans font-medium">
                        {item?.step}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-base sm:text-lg tracking-wide text-white">
                      {item?.title}
                    </h4>

                    {/* Colored divider */}
                    <div
                      className="w-full h-px my-2 opacity-40"
                      style={{ backgroundColor: item?.color || 'rgba(255, 255, 255, 0.2)' }}
                    />

                    {/* Explanatory sentence */}
                    <p className="text-xs sm:text-[13px] text-[#E0E2EC] leading-relaxed font-sans font-normal">
                      {item?.description}
                    </p>
                  </div>

                  {/* Bottom: Output with distinctive accent styling */}
                  <div className="relative z-10 pt-2 border-t border-white/10 mt-auto">
                    <div className="text-zinc-400 text-[10px] uppercase tracking-wider mb-0.5 font-sans">
                      Deliverable
                    </div>
                    <div
                      className="font-sans text-xs font-semibold"
                      style={{ color: item?.color || '#BFD7F2' }}
                    >
                      {item?.output || item?.deliverable}
                    </div>
                  </div>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Screen-reader accessible listing */}
      <ul style={visuallyHiddenStyle}>
        {activeItems.map((item, idx) => (
          <li key={idx}>
            {item.title ? `${item.title}: ${item.description || item.alt}` : item.alt}
          </li>
        ))}
      </ul>

      {/* Center content (fades out when zoomed into arc) */}
      {children && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            opacity: 'calc(1 - var(--orbit-arc, 0) * 1.6)',
          }}
        >
          <div style={{ pointerEvents: isArcView ? 'none' : 'auto' }}>{children}</div>
        </div>
      )}

      {/* Captions and Navigation Controls (Streamlined: Prev, Step Counter, Next) */}
      {(captions || controls) && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            pointerEvents: 'none',
            zIndex: 1100,
          }}
          className="px-4"
        >
          {/* Active Card Caption */}
          {captions && activeCardItem && (
            <div
              ref={captionRef}
              aria-live="polite"
              className="flex flex-col items-center gap-1.5 text-center max-w-md pointer-events-auto"
            >
              <div className="flex items-center gap-2">
                <span className="font-sans text-xs tracking-[0.25em] text-[#BFD7F2] uppercase font-semibold">
                  STEP {activeCardItem.step || String((activeIndex % activeItems.length) + 1).padStart(2, '0')}
                </span>
                <span className="text-zinc-600">/</span>
                <span className="font-display font-bold text-sm tracking-widest text-white uppercase">
                  {activeCardItem.title || activeCardItem.stepName}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Controls: Clean minimal Prev/Next & Counter only */}
          {controls && (
            <div
              data-orbit-control=""
              className="flex items-center gap-3 sm:gap-4 pointer-events-auto text-xs font-sans font-medium tracking-wider"
            >
              {/* Prev Button */}
              <button
                type="button"
                aria-label="Previous step"
                onClick={() => controllerRef.current?.step(-1)}
                style={controlButtonStyle}
                className="hover:border-[#BFD7F2] hover:text-[#BFD7F2] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {/* Step Counter */}
              <span className="px-3 py-1 rounded bg-[#101015] border border-white/10 text-white font-sans text-xs font-semibold tabular-nums tracking-widest shadow-sm">
                {String((activeIndex % activeItems.length) + 1).padStart(2, '0')}{' '}
                <span className="text-zinc-600">/</span>{' '}
                {String(activeItems.length).padStart(2, '0')}
              </span>

              {/* Next Button */}
              <button
                type="button"
                aria-label="Next step"
                onClick={() => controllerRef.current?.step(1)}
                style={controlButtonStyle}
                className="hover:border-[#BFD7F2] hover:text-[#BFD7F2] transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

OrbitReel.displayName = 'OrbitReel';
