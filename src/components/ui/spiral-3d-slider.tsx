"use client";

/* eslint-disable react/no-unknown-property */

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  WebGLErrorBoundary,
  WebGLFallback,
} from "./webgl-error-boundary";
import { cn } from "../../lib/utils";
import {
  DoubleSide,
  LinearFilter,
  Mesh,
  ShaderMaterial,
  NoColorSpace,
  Texture,
  TextureLoader,
} from "three";
import {
  Suspense,
  type MutableRefObject,
  type WheelEvent,
  useEffect,
  useMemo,
  useRef,
} from "react";

export interface Spiral3DSlide {
  /** Image source rendered inside the slide. */
  src: string;
  /** Accessible description for the image. */
  alt: string;
}

export interface Spiral3DSliderProps {
  /** Images arranged along the spiral. */
  items: Spiral3DSlide[];
  /** Additional classes for the WebGL stage. */
  className?: string;
  /** Maximum horizontal radius of the spiral in pixels. */
  radius?: number;
  /** Vertical distance between neighboring images in pixels. */
  verticalGap?: number;
  /** Maximum width of every image plane in pixels. */
  cardWidth?: number;
  /** Width divided by height for every image plane. */
  cardAspectRatio?: number;
  /** Whether the spiral advances automatically while idle. */
  autoRotate?: boolean;
  /** Automatic movement in slides per second. */
  autoSpeed?: number;
  /** Amount of scroll required to move along the spiral. */
  scrollSensitivity?: number;
  /** Motion smoothing between 0 and 1. */
  smoothing?: number;
  /** Maximum blur applied to distant images. */
  blurStrength?: number;
  /** Amount each image plane bends into the spiral. */
  bend?: number;
  /** Perspective camera field of view in degrees. */
  fov?: number;
  /** Accessible name for the gallery region. */
  ariaLabel?: string;
  /** Callback invoked when an image plane is clicked. */
  onItemClick?: (item: Spiral3DSlide, index: number) => void;
  /** External scroll progress (0 to 1) for pinned container playback */
  scrollProgress?: number;
  /** Callback invoked whenever the active centered project changes */
  onActiveIndexChange?: (index: number) => void;
}

const vertexShader = `
  uniform float uBend;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float curve = 1.0 - cos(position.x * 3.14159265);
    transformed.z -= curve * uBend;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uImageAspect;
  uniform float uPlaneAspect;
  uniform float uBrightness;
  varying vec2 vUv;

  vec2 coverUv(vec2 uv) {
    vec2 scale = vec2(1.0);
    if (uImageAspect > uPlaneAspect) {
      scale.x = uPlaneAspect / uImageAspect;
    } else {
      scale.y = uImageAspect / uPlaneAspect;
    }
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    vec2 uv = coverUv(vUv);
    vec4 color = texture2D(uTexture, uv);
    // True-to-source colors: clean, bright, no dark gamma compression
    color.rgb *= uBrightness;
    gl_FragColor = color;
  }
`;

function wrappedPosition(value: number, length: number) {
  const wrapped = ((value % length) + length) % length;
  return wrapped > length / 2 ? wrapped - length : wrapped;
}

function imageAspect(texture: Texture) {
  const image = texture.image as
    | {
        naturalWidth?: number;
        naturalHeight?: number;
        width?: number;
        height?: number;
      }
    | undefined;
  const width = image?.naturalWidth ?? image?.width ?? 1;
  const height = image?.naturalHeight ?? image?.height ?? 1;
  return width / Math.max(height, 1);
}

interface SpiralSceneProps {
  items: Spiral3DSlide[];
  targetProgress: MutableRefObject<number>;
  radius: number;
  verticalGap: number;
  cardWidth: number;
  cardAspectRatio: number;
  autoRotate: boolean;
  autoSpeed: number;
  smoothing: number;
  blurStrength: number;
  bend: number;
  reducedMotion: MutableRefObject<boolean>;
  lastInteraction: MutableRefObject<number>;
  onItemClick?: (item: Spiral3DSlide, index: number) => void;
  onActiveIndexChange?: (index: number) => void;
}

function SpiralScene({
  items,
  targetProgress,
  radius,
  verticalGap,
  cardWidth,
  cardAspectRatio,
  autoRotate,
  autoSpeed,
  smoothing,
  blurStrength,
  bend,
  reducedMotion,
  lastInteraction,
  onItemClick,
  onActiveIndexChange,
}: SpiralSceneProps) {
  const sceneItems = useMemo(
    () =>
      Array.from(
        { length: Math.max(items.length, 16) },
        (_, index) => items[index % items.length]!,
      ),
    [items],
  );
  const textures = useLoader(
    TextureLoader,
    sceneItems.map((item) => item.src),
  );
  const { gl, viewport } = useThree();
  const progress = useRef(0);
  const meshes = useRef<(Mesh | null)[]>([]);
  const materials = useRef<(ShaderMaterial | null)[]>([]);
  const lastActiveIndex = useRef(-1);

  const uniforms = useMemo(
    () =>
      textures.map((texture) => ({
        uTexture: { value: texture },
        uImageAspect: { value: imageAspect(texture) },
        uPlaneAspect: { value: cardAspectRatio },
        uBlur: { value: 0 },
        uBend: { value: 0 },
        uBrightness: { value: 1.05 },
      })),
    [cardAspectRatio, textures],
  );

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = NoColorSpace;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      texture.needsUpdate = true;
    });
  }, [gl, textures]);

  useFrame((_state, delta) => {
    if (
      autoRotate &&
      !reducedMotion.current &&
      performance.now() - lastInteraction.current > 450
    ) {
      targetProgress.current += autoSpeed * Math.min(delta, 0.05);
    }

    const frameScale = Math.min(delta * 60, 3);
    const ease = reducedMotion.current
      ? 1
      : 1 - Math.pow(1 - smoothing, frameScale);
    progress.current += (targetProgress.current - progress.current) * ease;

    // Track active centered project
    const currentActive = Math.round(progress.current);
    const normalizedActive = ((currentActive % items.length) + items.length) % items.length;
    if (normalizedActive !== lastActiveIndex.current) {
      lastActiveIndex.current = normalizedActive;
      onActiveIndexChange?.(normalizedActive);
    }

    const factor = Math.max(viewport.factor, 1);
    const planeWidth = Math.min(cardWidth / factor, viewport.width * 0.24);
    const planeHeight = planeWidth / cardAspectRatio;
    const spiralRadius = Math.min(radius / factor, viewport.width * 0.38);
    const gap = Math.min(verticalGap / factor, viewport.height * 0.17);
    const count = sceneItems.length;

    meshes.current.forEach((mesh, index) => {
      const material = materials.current[index];
      if (!mesh || !material) return;

      const position = wrappedPosition(index - progress.current, count);
      const angle = position * 0.95;
      const depth = (Math.cos(angle) + 1) / 2;
      const distance = Math.min(Math.abs(position) / (count * 0.43), 1);
      const scale = 0.60 + depth * 0.40;

      mesh.position.set(
        Math.sin(angle) * spiralRadius,
        -position * gap,
        Math.cos(angle) * 2.65,
      );
      mesh.rotation.set(0, Math.sin(angle) * -1.05, 0);
      mesh.scale.set(planeWidth * scale, planeHeight * scale, 1);

      material.uniforms.uBlur!.value = Math.pow(distance, 1.28) * blurStrength;
      material.uniforms.uBend!.value = planeWidth * bend;
      material.uniforms.uPlaneAspect!.value = cardAspectRatio;
    });
  });

  return (
    <>
      {sceneItems.map((item, index) => (
        <mesh
          key={`${item.src}-${index}`}
          ref={(node) => {
            meshes.current[index] = node;
          }}
          frustumCulled={false}
          onClick={(e) => {
            e.stopPropagation();
            onItemClick?.(item, index % items.length);
          }}
          onPointerOver={() => {
            if (onItemClick) document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            if (onItemClick) document.body.style.cursor = "auto";
          }}
        >
          <planeGeometry args={[1, 1, 48, 2]} />
          <shaderMaterial
            ref={(node) => {
              materials.current[index] = node;
            }}
            uniforms={uniforms[index]}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            side={DoubleSide}
            depthTest
            depthWrite
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

export function Spiral3DSlider({
  items,
  className,
  radius = 235,
  verticalGap = 64,
  cardWidth = 255,
  cardAspectRatio = 3 / 2,
  autoRotate = true,
  autoSpeed = 0.13,
  scrollSensitivity = 0.0024,
  smoothing = 0.065,
  blurStrength = 1.65,
  bend = 0.17,
  fov = 44,
  ariaLabel = "Spiral image gallery",
  onItemClick,
  scrollProgress,
  onActiveIndexChange,
}: Spiral3DSliderProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const targetProgress = useRef(0);
  const previousScroll = useRef(0);
  const lastWheelTime = useRef(0);
  const lastInteraction = useRef(0);
  const visible = useRef(false);
  const reducedMotion = useRef(false);
  const dragOffset = useRef(0);

  // When external scrollProgress is passed, map it directly across all items
  useEffect(() => {
    if (typeof scrollProgress === 'number') {
      const itemsCount = items.length;
      targetProgress.current = scrollProgress * (itemsCount - 1) + dragOffset.current;
      lastInteraction.current = performance.now();
    }
  }, [scrollProgress, items.length]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // Skip window scroll listener when external scrollProgress is driving the slider
    if (typeof scrollProgress === 'number') return;

    previousScroll.current = window.scrollY;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => {
      reducedMotion.current = motionQuery.matches;
    };
    syncMotionPreference();
    motionQuery.addEventListener("change", syncMotionPreference);

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.current = Boolean(entry?.isIntersecting);
      },
      { threshold: 0.08 },
    );
    observer.observe(stage);

    const handlePageScroll = () => {
      const scrollY = window.scrollY;
      const delta = scrollY - previousScroll.current;
      previousScroll.current = scrollY;
      if (visible.current && performance.now() - lastWheelTime.current > 80) {
        lastInteraction.current = performance.now();
        const boundedDelta = Math.sign(delta) * Math.min(Math.abs(delta), 160);
        targetProgress.current += boundedDelta * scrollSensitivity;
      }
    };
    window.addEventListener("scroll", handlePageScroll, { passive: true });

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", syncMotionPreference);
      window.removeEventListener("scroll", handlePageScroll);
    };
  }, [scrollSensitivity, scrollProgress]);

  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartProgress = useRef(0);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    lastWheelTime.current = performance.now();
    lastInteraction.current = lastWheelTime.current;
    
    // Normalize delta across line vs pixel modes
    let rawDelta = event.deltaY;
    if (event.deltaMode === 1) rawDelta *= 33;
    else if (event.deltaMode === 2) rawDelta *= 600;

    const boundedDelta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), 180);
    if (typeof scrollProgress !== 'number') {
      targetProgress.current += boundedDelta * scrollSensitivity * 2.5;
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    isDragging.current = true;
    dragStartY.current = event.clientY;
    dragStartProgress.current = targetProgress.current;
    lastInteraction.current = performance.now();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const deltaY = dragStartY.current - event.clientY;
    dragOffset.current += deltaY * 0.005;
    if (typeof scrollProgress === 'number') {
      targetProgress.current = scrollProgress * (items.length - 1) + dragOffset.current;
    } else {
      targetProgress.current = dragStartProgress.current + deltaY * 0.005;
    }
    lastInteraction.current = performance.now();
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  if (!items.length) return null;

  return (
    <div
      ref={stageRef}
      role="region"
      aria-label={ariaLabel}
      className={cn(
        "relative min-h-[38rem] sm:min-h-[42rem] w-full overflow-hidden bg-transparent transition-colors duration-300 touch-pan-y cursor-grab active:cursor-grabbing",
        className,
      )}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <WebGLErrorBoundary
        fallback={<WebGLFallback className="absolute inset-0 h-full w-full" />}
      >
        <div className="absolute inset-0">
          <Canvas
            dpr={[1, 1.75]}
            camera={{ position: [0, 0, 10], fov, near: 0.1, far: 100 }}
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: "high-performance",
            }}
          >
            <Suspense fallback={null}>
              <SpiralScene
                items={items}
                targetProgress={targetProgress}
                radius={radius}
                verticalGap={verticalGap}
                cardWidth={cardWidth}
                cardAspectRatio={cardAspectRatio}
                autoRotate={autoRotate}
                autoSpeed={autoSpeed}
                smoothing={smoothing}
                blurStrength={blurStrength}
                bend={bend}
                reducedMotion={reducedMotion}
                lastInteraction={lastInteraction}
                onItemClick={onItemClick}
                onActiveIndexChange={onActiveIndexChange}
              />
            </Suspense>
          </Canvas>
        </div>
      </WebGLErrorBoundary>

      <div className="sr-only">
        <p>{ariaLabel}</p>
        <ul>
          {items.map((item, index) => (
            <li key={`${item.src}-description-${index}`}>{item.alt}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
export default Spiral3DSlider;
