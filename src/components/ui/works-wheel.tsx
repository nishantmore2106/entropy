"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ProjectItem } from "@/data/projectsData";

export interface WorksWheelItem {
  /** Project name. Shown beside the front card and in the index. */
  title: string;
  /** Cover art. Any src an <img> takes. */
  image: string;
  /** Where the card links to. Omit for a wheel that only browses. */
  href?: string;
  /** Optional associated project data item for modal case studies. */
  projectItem?: ProjectItem;
}

export interface WorksWheelProps extends Omit<
  React.ComponentPropsWithoutRef<"section">,
  "children"
> {
  items: WorksWheelItem[];
  /** Sits in the middle of the ring. @default "Selected work" */
  label?: string;
  /** Label on the card's hover affordance. Omit to drop it. @default "View project" */
  action?: string;
  /** Normalized scroll progress (0 to 1) from parent sticky scroll track. */
  progress?: number;
  /** Callback when user clicks a project index to scroll to it. */
  onSelectIndex?: (index: number) => void;
  /** Callback to open project detail modal. */
  onSelectProject?: (project: ProjectItem) => void;
}

/* Geometry. The card is measured against the stage; everything else is measured
   against the card, so a narrow stage - where the card is capped by width, not
   height - scales the whole wheel down with it instead of leaving a small card
   swinging on a huge drum. The three that matter are tuned together: STEP
   against DRUM sets how hard the neighbours rotate away, and DRUM against LENS
   decides whether they land inside the frame or run off it. */
const CARD_H = 0.38; // front card height, of the stage
const CARD_MAX_W = 0.34; // ... but never wider than this much of the stage
const CARD_RATIO = 1.45; // card width / height
const STEP = 40; // degrees between cards on the drum
const DRUM = 2.22; // drum radius, in card heights - and everything below likewise
const LENS = 2.7; // perspective distance
const RING_R = 1.14; // ring radius
/* The drum alone hangs the work on a plumb line. It isn't one: the strip curves
   away round an arc whose centre sits off to the LEFT, so the piece at the front
   is at the arc's near point - dead centre - and its neighbours have already
   swung back left as well as up and down. BOW is that arc's radius; nothing else
   makes the difference between a stack of cards and a wheel seen side on. */
const BOW = 1.82;
const TITLE = 0.124; // ring label and front-card title
const INDEX = 0.04; // the index down the right-hand side
/** Items either side of the front still worth drawing. Past this a card is
    edge-on, and further round it would stack up on the vanishing point. */
const CULL = 1.6;

/** Fraction of the remaining distance closed each frame. 1 = no smoothing. */
const EASE = 0.12;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Stage = { w: number; h: number };

const rad = (deg: number) => (deg * Math.PI) / 180;

/** How far left the arc has carried something that has turned `drumDeg` off the
    front. Zero at the front, so the piece being read stays centred. */
const bowAt = (drumDeg: number, bow: number) =>
  -bow * (1 - Math.cos(rad(drumDeg)));

/** Both states in one chain: the ring terms fall away as `m` reaches the drum,
    and the drum terms are still zero while the ring is up. The bow is applied
    first, in the wheel's own plane, so it slides the card sideways rather than
    turning with it - and perspective still shrinks it with distance. */
function place(
  ringDeg: number,
  drumDeg: number,
  ringR: number,
  drumR: number,
  bow: number,
  m: number,
) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  );
}

export function WorksWheel({
  items,
  label = "Selected work",
  action = "View project",
  progress,
  onSelectIndex,
  onSelectProject,
  className,
  ...props
}: WorksWheelProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const wheelRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLElement | null)[]>([]);
  const labelRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLDivElement>(null);

  // The wheel's position, and where it is heading. Only `active` is state -
  // everything else is written to the DOM, so turning the wheel is not a render.
  const turn = React.useRef(0);
  const target = React.useRef(0);
  const [active, setActive] = React.useState(0);
  const [stage, setStage] = React.useState<Stage>({ w: 0, h: 0 });

  const count = items.length;
  const last = Math.max(count - 1, 0);

  // Drag tracking to avoid firing navigation clicks when user spins the wheel
  const hasDragged = React.useRef(false);
  const dragStartPos = React.useRef<{ x: number; y: number } | null>(null);

  // Read after mount, not during render: the server has no matchMedia, and
  // branching on it inline is a hydration mismatch. Reduced motion drops the
  // easing, so the wheel lands where it is put instead of gliding there.
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduced(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const read = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const metrics = React.useMemo(() => {
    const { w, h } = stage;
    const isMobile = w > 0 && w < 640;
    const isTablet = w >= 640 && w < 1024;

    let cardW: number;
    let cardH: number;
    let ringR: number;
    let bow: number;
    let drumScale = 1.0;
    let titleSize: number;
    let indexSize: number;

    if (isMobile) {
      // Mobile (<640px): generous card width and magnification for clear mobile view
      cardW = clamp(w * 0.44, 140, 185);
      cardH = cardW / CARD_RATIO;
      ringR = cardH * 1.12;
      bow = cardH * 0.90; // shallower arc keeps neighbouring cards inside screen
      drumScale = 1.55; // magnify active card on drum mode for prominent preview
      titleSize = clamp(w * 0.065, 20, 26);
      indexSize = 11;
    } else if (isTablet) {
      // Tablet (640px - 1024px)
      cardW = Math.min(h * 0.30 * CARD_RATIO, w * 0.35, 250);
      cardH = cardW / CARD_RATIO;
      ringR = cardH * 1.12;
      bow = cardH * 1.35;
      drumScale = 1.25;
      titleSize = clamp(w * 0.045, 24, 32);
      indexSize = 12;
    } else {
      // Desktop (>=1024px)
      cardW = Math.min(h * CARD_H * CARD_RATIO, w * CARD_MAX_W);
      cardH = cardW / CARD_RATIO;
      ringR = cardH * RING_R;
      bow = cardH * BOW;
      drumScale = 1.0;
      titleSize = Math.max(28, cardH * TITLE);
      indexSize = Math.max(12, cardH * INDEX);
    }

    const drumR = cardH * DRUM;
    // Shrink the ring's cards until the circle reads as a closed loop rather
    // than beads on a wire, however many pieces the wheel is given.
    const ringScale = count
      ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.16, 1)
      : 1;

    return {
      cardW,
      cardH,
      ringR,
      ringScale,
      drumR,
      bow,
      drumScale,
      depth: cardH * (isMobile ? 2.5 : LENS),
      title: titleSize,
      index: indexSize,
      isMobile,
      isTablet,
    };
  }, [stage, count]);

  // One pass per frame: ease toward the target, then write every transform.
  React.useEffect(() => {
    if (!stage.h) return;
    let frame = 0;
    const { ringR, ringScale, drumR, bow, drumScale } = metrics;

    const draw = () => {
      frame = requestAnimationFrame(draw);
      const gap = target.current - turn.current;
      if (Math.abs(gap) < 0.0005) turn.current = target.current;
      else turn.current += gap * (reduced ? 1 : EASE);

      const t = turn.current;
      const m = clamp(t, 0, 1);
      const pos = Math.max(0, t - 1);

      // The drum is pulled back so its front face lands on the picture plane.
      if (wheelRef.current) {
        wheelRef.current.style.transform = `translateZ(${-m * drumR}px)`;
      }

      for (let i = 0; i < count; i++) {
        const d = i - pos;
        const drumDeg = d * STEP;
        const card = cardRefs.current[i];
        if (card) {
          card.style.transform = place(
            d * (360 / count),
            drumDeg,
            ringR,
            drumR,
            bow,
            m,
          );
          card.style.opacity = m > 0.5 && Math.abs(d) > CULL ? "0" : "1";
          card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
        }
        const face = card?.firstElementChild as HTMLElement | null;
        if (face) face.style.transform = `scale(${lerp(ringScale, drumScale, m)})`;
      }

      if (labelRef.current) labelRef.current.style.opacity = String(1 - m);
      if (titleRef.current) titleRef.current.style.opacity = String(m);
      const near = clamp(Math.round(pos), 0, last);
      setActive((prev) => (prev === near ? prev : near));
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [metrics, stage.h, count, last, reduced]);

  const to = React.useCallback(
    (next: number) => {
      target.current = clamp(next, 0, last + 1);
    },
    [last],
  );

  // Directly synchronize target position with parent sticky scroll progress
  React.useEffect(() => {
    if (progress !== undefined) {
      // Map progress with buffer so label rest state and the final project have comfortable dwell time
      const mapped =
        progress <= 0.03
          ? 0
          : clamp((progress - 0.03) / (0.92 - 0.03), 0, 1) * (last + 1);
      target.current = clamp(mapped, 0, last + 1);
    }
  }, [progress, last]);

  return (
    <section
      aria-label={label}
      className={cn(
        "bg-[#000000] text-white relative h-full min-h-[32rem] w-full overflow-hidden select-none",
        className,
      )}
      {...props}
    >
      <div
        ref={stageRef}
        tabIndex={0}
        role="listbox"
        aria-label={label}
        aria-activedescendant={`works-wheel-${active}`}
        className="focus-visible:outline-white absolute inset-0 cursor-default outline-none focus-visible:outline-2 focus-visible:-outline-offset-4"
        style={{ perspective: `${metrics.depth}px` }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") to(Math.round(target.current) + 1);
          else if (event.key === "ArrowUp") to(Math.round(target.current) - 1);
          else return;
          event.preventDefault();
        }}
      >
        <div
          ref={wheelRef}
          className="absolute top-1/2 left-1/2 [transform-style:preserve-3d]"
        >
          {items.map((item, i) => {
            const Tag = (item.href ? "a" : "div") as "a";
            return (
              <React.Fragment key={item.title}>
                <Tag
                  id={`works-wheel-${i}`}
                  role="option"
                  aria-selected={i === active}
                  href={item.href}
                  target={item.href?.startsWith('http') ? "_blank" : undefined}
                  rel={item.href?.startsWith('http') ? "noopener noreferrer" : undefined}
                  onClick={(e) => {
                    if (onSelectProject && item.projectItem) {
                      e.preventDefault();
                      onSelectProject(item.projectItem);
                    }
                  }}
                  ref={(node: HTMLElement | null) => {
                    cardRefs.current[i] = node;
                  }}
                  className="group absolute [backface-visibility:hidden] cursor-pointer"
                  style={{
                    width: metrics.cardW,
                    height: metrics.cardH,
                    marginLeft: -metrics.cardW / 2,
                    marginTop: -metrics.cardH / 2,
                  }}
                >
                  <span className="bg-[#0e0e11] border border-white/12 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] relative block size-full overflow-hidden rounded-xl group-hover:border-white/30 transition-colors duration-300">
                    <img
                      src={item.image}
                      alt={item.title}
                      draggable={false}
                      className="size-full object-cover select-none"
                    />
                    {action && item.href ? (
                      <span className="bg-black/85 text-white border border-white/20 pointer-events-none absolute right-3 bottom-3 hidden lg:flex translate-y-1 items-center gap-1.5 rounded-full px-3 py-1 text-[0.72rem] font-mono opacity-0 backdrop-blur-md transition group-hover:translate-y-0 group-hover:opacity-100 shadow-lg">
                        <svg
                          viewBox="0 0 12 12"
                          className="size-2.5"
                          aria-hidden="true"
                        >
                          <path
                            d="M3 9 9 3M4 3h5v5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {action}
                      </span>
                    ) : null}
                  </span>
                </Tag>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Central Ring Label: Displays at rest (turn = 0). Uses Rigter display font */}
      <div
        ref={labelRef}
        className="pointer-events-none absolute inset-0 grid place-items-center tracking-tight font-['Rigter',sans-serif] text-white select-none whitespace-nowrap px-4 text-center max-w-[85vw] mx-auto z-10"
        style={{ fontSize: metrics.title }}
      >
        {label}
      </div>

      {/* Active Project Title: Centered above drum on mobile/tablet, left-aligned on desktop */}
      <div
        ref={titleRef}
        className="pointer-events-none absolute top-[9%] sm:top-[11%] left-1/2 -translate-x-1/2 text-center w-full max-w-[90vw] px-4 lg:top-1/2 lg:left-[8%] lg:translate-x-0 lg:-translate-y-1/2 lg:text-left lg:w-auto lg:max-w-[28vw] lg:px-0 tracking-tight opacity-0 font-['Rigter',sans-serif] text-white select-none leading-tight transition-opacity duration-200"
        style={{ fontSize: metrics.title }}
      >
        {items[active]?.title}
      </div>

      {/* Project Index: Vertical right-hand project directory (Desktop >= 1024px) */}
      <ol
        className="hidden lg:block text-neutral-500 absolute top-[7.5%] right-[3%] lg:right-[4%] text-right leading-[1.85] font-mono z-20 max-h-[85vh] overflow-y-auto no-scrollbar pointer-events-auto"
        style={{ fontSize: metrics.index }}
      >
        {items.map((item, i) => (
          <li key={item.title}>
            <button
              type="button"
              onClick={() => {
                if (onSelectIndex) {
                  onSelectIndex(i);
                } else {
                  to(i + 1);
                }
              }}
              className={cn(
                "focus-visible:outline-white cursor-pointer transition-colors duration-200 outline-none focus-visible:outline-1 text-neutral-500 hover:text-neutral-300 py-0.5",
                i === active && "text-white font-semibold",
              )}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ol>

      {/* Mobile & Tablet Navigation & Indicator Dock (< 1024px) */}
      <div className="lg:hidden pointer-events-none absolute bottom-[calc(76px+env(safe-area-inset-bottom,0px))] inset-x-0 z-30 flex items-center justify-center px-4">
        {/* Active Project Counter, Progress Line & Quick Visit */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-neutral-900/90 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 text-xs font-mono text-neutral-300 shadow-2xl">
          <div className="flex items-center gap-1.5">
            <span className="text-white font-semibold tabular-nums">{String(active + 1).padStart(2, "0")}</span>
            <span className="text-neutral-500">/</span>
            <span className="text-neutral-400 tabular-nums">{String(count).padStart(2, "0")}</span>
          </div>

          <div className="w-16 h-1 bg-white/15 rounded-full overflow-hidden" aria-hidden="true">
            <div
              className="h-full bg-white rounded-full transition-all duration-200"
              style={{ width: `${Math.min(100, Math.max(5, ((active + 1) / count) * 100))}%` }}
            />
          </div>

          {items[active]?.href && (
            <a
              href={items[active].href}
              target={items[active].href?.startsWith('http') ? "_blank" : undefined}
              rel={items[active].href?.startsWith('http') ? "noopener noreferrer" : undefined}
              className="ml-1 inline-flex items-center gap-1 text-[0.72rem] text-white bg-white/15 hover:bg-white/25 active:scale-95 transition-all rounded-full px-2.5 py-0.5 cursor-pointer"
              onClick={(e) => {
                if (onSelectProject && items[active]?.projectItem) {
                  e.preventDefault();
                  onSelectProject(items[active].projectItem);
                }
              }}
            >
              <span>Visit</span>
              <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden="true">
                <path
                  d="M3 9 9 3M4 3h5v5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

export default WorksWheel;
