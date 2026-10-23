import React, { useRef, useMemo, useEffect, useState, useSyncExternalStore, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { cn } from '../../lib/utils';

export interface SpectralDrapeProps {
  colors?: [string, string];
  backgroundColor?: string;
  density?: number;
  dotSize?: number;
  strands?: number;
  amplitude?: number;
  frequency?: number;
  thickness?: number;
  depth?: number;
  softness?: number;
  intensity?: number;
  colorShift?: number;
  tilt?: number;
  turn?: number;
  roll?: number;
  zoom?: number;
  flow?: number;
  speed?: number;
  interactive?: boolean;
  brush?: number;
  brushRadius?: number;
  parallax?: number;
  clickRipples?: boolean;
  seed?: number;
  paused?: boolean;
  dpr?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

const DEFAULT_COLORS: [string, string] = ['#6A4BFF', '#E4DBFF'];

const VERTEX_SHADER = /* glsl */ `
#define MAX_STRANDS 12
#define MAX_RIPPLES 4

attribute vec2 aGrid;

uniform float uTime;
uniform float uClock;
uniform float uSeed;
uniform float uStrands;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uThickness;
uniform float uDepth;
uniform float uSpacing;
uniform float uSize;
uniform float uViewHeight;
uniform float uIntensity;
uniform float uShift;
uniform vec3 uBodyLab;
uniform vec3 uGlowLab;
uniform vec3 uWake;
uniform vec3 uWakeVector;
uniform float uWakeRadius;
uniform float uAspect;
uniform vec4 uRipple[MAX_RIPPLES];

varying vec3 vColor;
varying float vGlow;

float hash(float n) {
  return fract(sin(n * 127.1 + uSeed * 311.7) * 43758.5453);
}

vec3 labToLinear(vec3 lab) {
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

vec3 toSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

float strands(vec2 g, float t) {
  float sum = 0.0;
  for (int k = 0; k < MAX_STRANDS; k++) {
    float index = float(k);
    if (index >= uStrands) break;
    float a = hash(index + 1.0);
    float b = hash(index + 17.0);
    float c = hash(index + 43.0);
    float frequency = uFrequency * (0.55 + 0.9 * a);
    float phase = b * 6.2831853;
    float along = g.x * 6.2831853 * frequency;
    float wave =
      sin(along + phase + t * (0.35 + 0.45 * a)) * 0.62 +
      sin(along * 2.07 - phase * 1.31 - t * (0.27 + 0.36 * b)) * 0.26 +
      sin(along * 0.47 + phase * 0.7 + t * (0.19 + 0.2 * c)) * 0.3;
    float line = 0.5 + (c - 0.5) * 0.8 + uAmplitude * 0.16 * wave;
    float width = uThickness * (0.022 + 0.05 * c) * (0.75 + 0.5 * sin(along * 0.5 + t * 0.4 + phase));
    float d = (g.y - line) / max(width, 0.004);
    sum += exp(-d * d);
  }
  float edge = smoothstep(0.0, 0.12, g.y) * (1.0 - smoothstep(0.88, 1.0, g.y)) *
    smoothstep(0.0, 0.05, g.x) * (1.0 - smoothstep(0.95, 1.0, g.x));
  return (1.0 - exp(-sum * 1.1)) * edge;
}

void main() {
  float field = strands(aGrid, uTime);
  vec3 local = vec3((aGrid.x - 0.5) * 11.0, (aGrid.y - 0.5) * 11.0, field * uDepth);

  float reveal = 0.0;
  for (int k = 0; k < MAX_RIPPLES; k++) {
    vec4 ripple = uRipple[k];
    float age = uClock - ripple.z;
    if (ripple.w <= 0.0 || age < 0.0 || age > 6.0) continue;
    float radius = length((aGrid - ripple.xy) * 11.0);
    float front = radius - age * 3.4;
    float envelope = exp(-front * front * 3.0) * exp(-age * 0.5) * ripple.w;
    local.z += sin(front * 3.2) * 0.3 * envelope;
    reveal += envelope;
  }

  vec4 world = modelMatrix * vec4(local, 1.0);
  vec4 clip = projectionMatrix * viewMatrix * world;
  vec2 ndc = clip.xy / clip.w;
  vec2 offset = (ndc - uWake.xy) * vec2(uAspect, 1.0);
  float touch = exp(-dot(offset, offset) / max(uWakeRadius * uWakeRadius, 1e-4)) * uWake.z;
  world.xyz += uWakeVector * touch;

  vec4 view = viewMatrix * world;
  gl_Position = projectionMatrix * view;

  float eye = -view.z;
  float size = uSpacing * uSize * projectionMatrix[1][1] * uViewHeight * 0.5 / max(eye, 0.1);
  float nearness = clamp(9.0 / max(eye, 0.1), 0.35, 1.8);
  float shade = mix(0.35, 1.0, smoothstep(0.55, 1.2, nearness));

  float lift = smoothstep(0.06, 0.95, field);
  float glow = (pow(lift, 1.35) * 1.3 + reveal * 1.1) * shade * uIntensity;
  float shown = max(size, 1.35);
  vGlow = glow * min(size * size / (shown * shown), 1.0);
  gl_PointSize = shown * (1.0 + touch * 0.35);

  float tone = clamp(lift * 0.9 + (aGrid.x - 0.5) * uShift + reveal * 0.25, 0.0, 1.0);
  vec3 lab = mix(uBodyLab, uGlowLab, tone);
  vColor = toSrgb(max(labToLinear(lab), vec3(0.0)));
}
`;

const FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform float uSoftness;
uniform float uInk;

varying vec3 vColor;
varying float vGlow;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c) * 2.0;
  float disc = 1.0 - smoothstep(mix(0.55, 0.0, uSoftness), 1.0, r);
  float amount = disc * vGlow;
  if (amount < 0.003) discard;
  if (uInk > 0.5) {
    float alpha = clamp(amount, 0.0, 1.0);
    gl_FragColor = vec4(vColor * alpha, alpha);
  } else {
    gl_FragColor = vec4(vColor * amount, clamp(amount, 0.0, 1.0));
  }
}
`;

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));
const degToRad = (deg: number) => (deg * Math.PI) / 180;

const isTransparent = (val: string) => {
  const t = val.trim().toLowerCase();
  return (
    t === 'transparent' ||
    (/^#[0-9a-f]{8}$/.test(t)
      ? t.endsWith('00')
      : /^#[0-9a-f]{4}$/.test(t)
        ? t.endsWith('0')
        : t.match(/^(?:rgba?|hsla?)\(.*[,/]\s*(0|0?\.0+|0%)\s*\)$/) !== null)
  );
};

const parseColor = (target: THREE.Color, input: string, fallback: string) => {
  const clean = input.trim();
  try {
    target.set(/^#[0-9a-f]{8}$/i.test(clean) ? clean.slice(0, 7) : clean);
  } catch {
    target.set(fallback);
  }
  return target;
};

const linearToOklab = (target: THREE.Vector3, color: THREE.Color) => {
  const l = Math.cbrt(0.4122214708 * color.r + 0.5363325363 * color.g + 0.0514459929 * color.b);
  const m = Math.cbrt(0.2119034982 * color.r + 0.6806995451 * color.g + 0.1073969566 * color.b);
  const s = Math.cbrt(0.0883024619 * color.r + 0.2817188376 * color.g + 0.6299787005 * color.b);
  return target.set(
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  );
};

const subscribeDpr = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const mql = window.matchMedia('(min-resolution: 2dppx)');
  mql.addEventListener('change', callback);
  window.addEventListener('resize', callback);
  return () => {
    mql.removeEventListener('change', callback);
    window.removeEventListener('resize', callback);
  };
};

const getDprSnapshot = () => (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);

const subscribeMotion = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
};

const getMotionSnapshot = () =>
  typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

interface PointerState {
  x: number;
  y: number;
  inside: boolean;
  presses: number;
  pressX: number;
  pressY: number;
}

interface MeshSettings {
  colors: [string, string];
  backgroundColor: string;
  density: number;
  dotSize: number;
  strands: number;
  amplitude: number;
  frequency: number;
  thickness: number;
  depth: number;
  softness: number;
  intensity: number;
  colorShift: number;
  tilt: number;
  turn: number;
  roll: number;
  zoom: number;
  flow: number;
  speed: number;
  interactive: boolean;
  brush: number;
  brushRadius: number;
  parallax: number;
  clickRipples: boolean;
  seed: number;
  paused: boolean;
  reduced: boolean;
}

const DrapeInner: React.FC<{
  settings: MeshSettings;
  pointerRef: React.RefObject<PointerState>;
  wakeRef: React.MutableRefObject<(() => void) | null>;
}> = ({ settings, pointerRef, wakeRef }) => {
  const { size, invalidate } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const simRef = useRef({
    time: 0,
    clock: 0,
    leanX: 0,
    leanY: 0,
    wakeX: 9,
    wakeY: 9,
    lastX: 0.5,
    lastY: 0.5,
    hasLast: false,
    velocityX: 0,
    velocityY: 0,
    strength: 0,
    presses: 0,
    nextRipple: 0,
    ripples: Array.from({ length: 4 }, () => new THREE.Vector4(0, 0, -99, 0)),
  });

  const mathRefs = useMemo(
    () => ({
      right: new THREE.Vector3(),
      up: new THREE.Vector3(),
      raycaster: new THREE.Raycaster(),
      ndc: new THREE.Vector2(),
      plane: new THREE.Plane(),
      normal: new THREE.Vector3(),
      point: new THREE.Vector3(),
      inverse: new THREE.Matrix4(),
      euler: new THREE.Euler(),
    }),
    []
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uClock: { value: 0 },
      uSeed: { value: 0 },
      uStrands: { value: 8 },
      uAmplitude: { value: 1 },
      uFrequency: { value: 0.6 },
      uThickness: { value: 1 },
      uDepth: { value: 1.6 },
      uSpacing: { value: 0.04 },
      uSize: { value: 0.5 },
      uViewHeight: { value: 600 },
      uIntensity: { value: 1 },
      uShift: { value: 0 },
      uBodyLab: { value: new THREE.Vector3() },
      uGlowLab: { value: new THREE.Vector3() },
      uWake: { value: new THREE.Vector3(9, 9, 0) },
      uWakeVector: { value: new THREE.Vector3() },
      uWakeRadius: { value: 0.3 },
      uAspect: { value: 1 },
      uRipple: { value: Array.from({ length: 4 }, () => new THREE.Vector4(0, 0, -99, 0)) },
      uSoftness: { value: 0.6 },
      uInk: { value: 0 },
    }),
    []
  );

  const gridData = useMemo(() => {
    const scale = Math.sqrt(clamp(settings.density, 0.2, 2.5));
    const cols = Math.max(24, Math.round(260 * scale));
    const rows = Math.max(16, Math.round(170 * scale));
    const coords = new Float32Array(cols * rows * 2);
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        coords[idx++] = c / (cols - 1);
        coords[idx++] = r / (rows - 1);
      }
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('aGrid', new THREE.BufferAttribute(coords, 2));
    geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cols * rows * 3), 3));
    geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 22);
    return {
      geometry: geom,
      spacing: 11 / (cols - 1),
    };
  }, [settings.density]);

  const colorsKey = settings.colors.join('|');
  const { backgroundColor } = settings;

  useEffect(() => {
    return () => {
      gridData.geometry.dispose();
    };
  }, [gridData]);

  useEffect(() => {
    wakeRef.current = invalidate;
    return () => {
      wakeRef.current = null;
    };
  }, [invalidate, wakeRef]);

  // Update color uniforms and blending
  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;
    const u = mat.uniforms;
    const c = colorsKey ? colorsKey.split('|') : DEFAULT_COLORS;
    const colorObj = new THREE.Color();

    parseColor(colorObj, c[0] ?? DEFAULT_COLORS[0], DEFAULT_COLORS[0]);
    linearToOklab(u.uBodyLab.value, colorObj);

    parseColor(colorObj, c[1] ?? c[0] ?? DEFAULT_COLORS[1], DEFAULT_COLORS[1]);
    linearToOklab(u.uGlowLab.value, colorObj);

    const transparent = isTransparent(backgroundColor);
    parseColor(colorObj, transparent ? '#000000' : backgroundColor, '#000000');
    const lum = 0.2126 * colorObj.r + 0.7152 * colorObj.g + 0.0722 * colorObj.b;
    const isInk = !transparent && lum > 0.25;

    u.uInk.value = isInk ? 1 : 0;
    mat.blending = THREE.CustomBlending;
    mat.blendEquation = THREE.AddEquation;
    mat.blendSrc = THREE.OneFactor;
    mat.blendDst = isInk ? THREE.OneMinusSrcAlphaFactor : THREE.OneFactor;
    mat.blendSrcAlpha = THREE.OneFactor;
    mat.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
    mat.needsUpdate = true;
    invalidate();
  }, [colorsKey, backgroundColor, invalidate]);

  useEffect(() => {
    invalidate();
  }, [settings, size, invalidate]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const mat = materialRef.current;
    if (!group || !mat) return;

    const u = mat.uniforms;
    const sim = simRef.current;
    const ptr = pointerRef.current || { x: 0.5, y: 0.5, inside: false, presses: 0, pressX: 0, pressY: 0 };
    const dt = Math.min(Math.max(delta, 0), 0.05);
    const active = !settings.paused && !settings.reduced;

    if (active) {
      sim.time += dt * clamp(settings.speed, 0, 4) * clamp(settings.flow, 0, 4) * 0.3;
    }
    if (!settings.reduced) {
      sim.clock += dt;
    }

    const aspect = size.width / Math.max(size.height, 1);
    const cam = state.camera;
    const inside = settings.interactive && !settings.reduced && ptr.inside;
    const parallaxVal = clamp(settings.parallax, 0, 3);
    const targetLeanX = inside ? (ptr.x - 0.5) * 2 : 0;
    const targetLeanY = inside ? (ptr.y - 0.5) * 2 : 0;
    const leanDecay = 1 - Math.exp(-(2.2 * dt));

    sim.leanX += (targetLeanX - sim.leanX) * leanDecay;
    sim.leanY += (targetLeanY - sim.leanY) * leanDecay;

    mathRefs.euler.set(
      degToRad(clamp(settings.tilt, -180, 180)) - 0.06 * sim.leanY * parallaxVal,
      degToRad(clamp(settings.turn, -180, 180)) + 0.08 * sim.leanX * parallaxVal,
      degToRad(clamp(settings.roll, -180, 180)),
      'XYZ'
    );
    group.rotation.copy(mathRefs.euler);
    group.scale.setScalar(clamp(settings.zoom, 0.3, 3));
    group.updateMatrixWorld();

    let vx = 0;
    let vy = 0;
    if (inside) {
      if (!sim.hasLast) {
        sim.lastX = ptr.x;
        sim.lastY = ptr.y;
        sim.wakeX = ptr.x;
        sim.wakeY = ptr.y;
        sim.hasLast = true;
      }
      if (dt > 0) {
        vx = (ptr.x - sim.lastX) / dt;
        vy = (ptr.y - sim.lastY) / dt;
      }
      sim.lastX = ptr.x;
      sim.lastY = ptr.y;
    } else {
      sim.hasLast = false;
    }

    const vDecay = 1 - Math.exp(-(6 * dt));
    sim.velocityX += (clamp(vx, -5, 5) - sim.velocityX) * vDecay;
    sim.velocityY += (clamp(vy, -5, 5) - sim.velocityY) * vDecay;

    const wakeDecay = 1 - Math.exp(-(7 * dt));
    if (inside) {
      sim.wakeX += (ptr.x - sim.wakeX) * wakeDecay;
      sim.wakeY += (ptr.y - sim.wakeY) * wakeDecay;
    }

    const speedHypot = Math.hypot(sim.velocityX * aspect, sim.velocityY);
    const targetStrength = inside ? clamp(0.9 * speedHypot, 0, 1.4) : 0;
    sim.strength += (targetStrength - sim.strength) * (1 - Math.exp(-(4 * dt)));

    cam.updateMatrixWorld();
    mathRefs.right.setFromMatrixColumn(cam.matrixWorld, 0);
    mathRefs.up.setFromMatrixColumn(cam.matrixWorld, 1);

    const fovScale = 9 * Math.tan(degToRad(38) / 2);
    const brushVal = clamp(settings.brush, 0, 3);
    const normVx = sim.velocityX / Math.max(speedHypot, 1e-4);
    const normVy = sim.velocityY / Math.max(speedHypot, 1e-4);

    u.uWake.value.set(2 * sim.wakeX - 1, 2 * sim.wakeY - 1, sim.strength * brushVal);
    u.uWakeVector.value
      .copy(mathRefs.right)
      .multiplyScalar(normVx * aspect * fovScale * 0.16)
      .addScaledVector(mathRefs.up, normVy * fovScale * 0.16);
    u.uWakeRadius.value = clamp(settings.brushRadius, 0.03, 1);

    if (
      ptr.presses !== sim.presses &&
      settings.clickRipples &&
      settings.interactive &&
      !settings.reduced
    ) {
      sim.presses = ptr.presses;
      mathRefs.ndc.set(ptr.pressX, ptr.pressY);
      mathRefs.raycaster.setFromCamera(mathRefs.ndc, cam);
      mathRefs.normal.set(0, 0, 1).transformDirection(group.matrixWorld);
      mathRefs.point.setFromMatrixPosition(group.matrixWorld);
      mathRefs.plane.setFromNormalAndCoplanarPoint(mathRefs.normal, mathRefs.point);
      if (mathRefs.raycaster.ray.intersectPlane(mathRefs.plane, mathRefs.point)) {
        mathRefs.inverse.copy(group.matrixWorld).invert();
        mathRefs.point.applyMatrix4(mathRefs.inverse);
        const nextIdx = sim.nextRipple;
        sim.nextRipple = (nextIdx + 1) % 4;
        sim.ripples[nextIdx].set(
          clamp(mathRefs.point.x / 11 + 0.5, -0.5, 1.5),
          clamp(mathRefs.point.y / 11 + 0.5, -0.5, 1.5),
          sim.clock,
          1
        );
      }
    }

    let hasActiveRipples = false;
    for (let i = 0; i < 4; i++) {
      u.uRipple.value[i].copy(sim.ripples[i]);
      if (sim.ripples[i].w > 0 && sim.clock - sim.ripples[i].z < 6) {
        hasActiveRipples = true;
      }
    }

    u.uTime.value = sim.time;
    u.uClock.value = sim.clock;
    u.uSeed.value = 0.137 * settings.seed;
    u.uStrands.value = Math.round(clamp(settings.strands, 1, 12));
    u.uAmplitude.value = clamp(settings.amplitude, 0, 3);
    u.uFrequency.value = 0.6 * clamp(settings.frequency, 0.05, 4);
    u.uThickness.value = clamp(settings.thickness, 0.2, 4);
    u.uDepth.value = 1.6 * clamp(settings.depth, 0, 3);
    u.uSpacing.value = gridData.spacing;
    u.uSize.value = 0.5 * clamp(settings.dotSize, 0.1, 4);
    u.uViewHeight.value = size.height * state.viewport.dpr;
    u.uIntensity.value = clamp(settings.intensity, 0, 4);
    u.uShift.value = clamp(settings.colorShift, -1, 1);
    u.uAspect.value = aspect;
    u.uSoftness.value = clamp(settings.softness, 0, 1);

    const needsRerender =
      hasActiveRipples ||
      sim.strength > 0.002 ||
      Math.abs(sim.leanX - targetLeanX) > 0.001 ||
      Math.abs(sim.leanY - targetLeanY) > 0.001;

    if (!active && needsRerender) {
      invalidate();
    }
  });

  return (
    <group ref={groupRef}>
      <points geometry={gridData.geometry} frustumCulled={false}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER}
          uniforms={uniforms}
          transparent={true}
          depthTest={false}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

// Error Boundary for WebGL stability
class WebGLErrorBoundary extends Component<
  { fallback?: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback?: ReactNode; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[SpectralDrape] WebGL Canvas initialization error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

export const SpectralDrape: React.FC<SpectralDrapeProps> = ({
  colors = DEFAULT_COLORS,
  backgroundColor = '#080808',
  density = 1,
  dotSize = 1,
  strands = 8,
  amplitude = 1,
  frequency = 1,
  thickness = 0.7,
  depth = 1,
  softness = 0.6,
  intensity = 1,
  colorShift = 0.3,
  tilt = -40,
  turn = -45,
  roll = 110,
  zoom = 1,
  flow = 1,
  speed = 1,
  interactive = true,
  brush = 1,
  brushRadius = 0.2,
  parallax = 1,
  clickRipples = true,
  seed = 0,
  paused = false,
  dpr = 2,
  className,
  style,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<PointerState>({
    x: 0.5,
    y: 0.5,
    inside: false,
    presses: 0,
    pressX: 0,
    pressY: 0,
  });
  const wakeRef = useRef<(() => void) | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(true);

  const reducedMotion = useSyncExternalStore(subscribeMotion, getMotionSnapshot, () => false);
  const systemDpr = useSyncExternalStore(subscribeDpr, getDprSnapshot, () => 1);
  const effectiveDpr = Math.min(systemDpr, Math.max(dpr, 0.5));
  const isRunning = !paused && !reducedMotion;
  const isTrans = isTransparent(backgroundColor);

  // Intersection Observer for viewport-aware rendering
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { rootMargin: '80px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Event handling (passive pointer listeners)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateCoord = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const ptr = pointerRef.current;
      ptr.x = (e.clientX - rect.left) / Math.max(rect.width, 1);
      ptr.y = 1 - (e.clientY - rect.top) / Math.max(rect.height, 1);
      ptr.inside = true;
    };

    const handlePointerMove = (e: PointerEvent) => {
      updateCoord(e);
      wakeRef.current?.();
    };

    const handlePointerDown = (e: PointerEvent) => {
      updateCoord(e);
      const ptr = pointerRef.current;
      ptr.pressX = 2 * ptr.x - 1;
      ptr.pressY = 2 * ptr.y - 1;
      ptr.presses += 1;
      wakeRef.current?.();
    };

    const handlePointerLeave = () => {
      pointerRef.current.inside = false;
      wakeRef.current?.();
    };

    el.addEventListener('pointermove', handlePointerMove, { passive: true });
    el.addEventListener('pointerdown', handlePointerDown, { passive: true });
    el.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    el.addEventListener('pointercancel', handlePointerLeave, { passive: true });

    return () => {
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerdown', handlePointerDown);
      el.removeEventListener('pointerleave', handlePointerLeave);
      el.removeEventListener('pointercancel', handlePointerLeave);
    };
  }, []);

  const fallbackNode = (
    <div
      className="absolute inset-0 bg-[#080808]"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(191,215,242,0.06) 0%, transparent 70%)',
      }}
      aria-hidden="true"
    />
  );

  return (
    <div
      ref={containerRef}
      className={cn('relative isolate overflow-hidden', className)}
      style={{
        backgroundColor: isTrans ? undefined : backgroundColor,
        ...style,
      }}
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <WebGLErrorBoundary fallback={fallbackNode}>
          <Canvas
            dpr={effectiveDpr}
            frameloop={isIntersecting && isRunning ? 'always' : 'demand'}
            camera={{ fov: 38, near: 0.1, far: 100, position: [0, 0, 9] }}
            gl={{
              antialias: false,
              alpha: true,
              premultipliedAlpha: true,
              powerPreference: 'high-performance',
            }}
            style={{ pointerEvents: 'none', width: '100%', height: '100%' }}
          >
            <DrapeInner
              settings={{
                colors,
                backgroundColor,
                density,
                dotSize,
                strands,
                amplitude,
                frequency,
                thickness,
                depth,
                softness,
                intensity,
                colorShift,
                tilt,
                turn,
                roll,
                zoom,
                flow,
                speed,
                interactive,
                brush,
                brushRadius,
                parallax,
                clickRipples,
                seed,
                paused,
                reduced: reducedMotion,
              }}
              pointerRef={pointerRef}
              wakeRef={wakeRef}
            />
          </Canvas>
        </WebGLErrorBoundary>
      </div>
      {children ? <div className="relative z-10 h-full w-full">{children}</div> : null}
    </div>
  );
};

export default SpectralDrape;
