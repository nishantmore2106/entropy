// @ts-nocheck
import React, { forwardRef, useRef, useEffect, useImperativeHandle, useSyncExternalStore } from 'react';
import * as THREE from 'three';
import { cn } from '../../lib/utils';

/**
 * React Bits Pro — Voxel Arc (Tailwind / TSX Variant)
 * Official Component Implementation
 * A curved horizon of square voxels rolling like a calm sea.
 */

const QUAD_VERT_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;
const VOXEL_VERT_SHADER = `
attribute vec3 iVoxel;
uniform float uTime;
uniform float uAmp;
uniform float uWaveScale;
uniform float uTurb;
uniform float uCurveX;
uniform float uCurveZ;
uniform float uCell;
uniform float uFill;
uniform float uTilt;
uniform float uFocusDepth;
uniform float uAperture;
uniform float uFocalPx;
uniform vec2 uViewport;
uniform float uNear;
uniform float uFar;
uniform float uSpread;
uniform float uIntro;
uniform float uGlow;
uniform float uBright;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uInk;
uniform sampler2D uRipple;
uniform vec4 uRippleRect;
uniform vec2 uRippleTexel;
uniform float uRippleOn;
varying vec2 vQuad;
varying vec2 vHalf;
varying float vSigma;
varying vec3 vColor;
varying float vAlpha;

const float TAU = 6.28318530718;

vec3 component(vec2 p, vec2 dir, float wavelength, float amp, float rate, float phase) {
  float k = TAU / wavelength;
  vec2 d = normalize(dir);
  float theta = k * dot(d, p) + rate * uTime + phase;
  return vec3(amp * sin(theta), amp * k * cos(theta) * d);
}

vec3 surface(vec2 p) {
  float L = uWaveScale;
  vec3 h = component(p, vec2(0.14, 1.0), 3.3 * L, 0.55, 1.0, 0.0);
  h += component(p, vec2(-0.48, 1.0), 2.15 * L, 0.32, 1.22, 1.9);
  h += component(p, vec2(0.82, 0.62), 1.45 * L, 0.2, 1.5, 4.2);
  h += component(p, vec2(-0.86, 0.42), 0.95 * L, 0.13 * (0.35 + uTurb), 1.95, 2.6);
  h += component(p, vec2(0.33, -0.9), 0.64 * L, 0.09 * uTurb, 2.6, 5.3);
  h += component(p, vec2(-0.2, 0.95), 0.41 * L, 0.05 * uTurb, 3.4, 0.7);
  return h * uAmp;
}

float rippleTap(vec2 st) {
  return texture2D(uRipple, (st + 0.5) * uRippleTexel).r;
}

float rippleSample(vec2 uv) {
  vec2 st = uv / uRippleTexel - 0.5;
  vec2 i = floor(st);
  vec2 f = st - i;
  float a = rippleTap(i);
  float b = rippleTap(i + vec2(1.0, 0.0));
  float c = rippleTap(i + vec2(0.0, 1.0));
  float d = rippleTap(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

vec3 ripple(vec2 p) {
  if (uRippleOn < 0.5) return vec3(0.0);
  vec2 span = uRippleRect.zw - uRippleRect.xy;
  vec2 uv = (p - uRippleRect.xy) / span;
  if (uv.x <= 0.01 || uv.y <= 0.01 || uv.x >= 0.99 || uv.y >= 0.99) return vec3(0.0);
  float h0 = rippleSample(uv);
  float hx = rippleSample(uv + vec2(uRippleTexel.x, 0.0));
  float hz = rippleSample(uv + vec2(0.0, uRippleTexel.y));
  vec2 cell = span * uRippleTexel;
  return vec3(h0, (hx - h0) / cell.x, (hz - h0) / cell.y);
}

void main() {
  vec2 p = iVoxel.xy;
  vec3 w = surface(p);
  vec3 r = ripple(p);
  float h = w.x + r.x;
  vec2 g = w.yz + r.yz;
  float drop = p.x * p.x * uCurveX + p.y * p.y * uCurveZ;
  vec3 world = vec3(p.x, h - drop, -p.y);
  vec4 viewPos = modelViewMatrix * vec4(world, 1.0);
  float depth = max(-viewPos.z, 0.05);
  vec4 clip = projectionMatrix * viewPos;

  vec3 normal = normalize(vec3(-g.x + 2.0 * p.x * uCurveX, 1.0, g.y - 2.0 * p.y * uCurveZ));
  vec3 toCamera = normalize(cameraPosition - world);
  float facing = clamp(dot(normal, toCamera), 0.06, 1.0);
  float size = uCell * uFill * uFocalPx / depth;
  vec2 core = vec2(size, size * mix(1.0, facing, uTilt));
  float coc = uAperture * uFocalPx * abs(1.0 / depth - 1.0 / uFocusDepth);
  float sigma = max(coc * 0.42, 0.42);
  vec2 extent = core * 0.5 + 2.6 * sigma + 0.5;
  vec2 corner = position.xy * extent;
  gl_Position = clip + vec4(corner / uViewport * 2.0 * clip.w, 0.0, 0.0);
  vQuad = corner;
  vHalf = core * 0.5;
  vSigma = sigma;

  float t = clamp((p.y - uNear) / max(uFar - uNear, 0.001), 0.0, 1.0);
  float side = abs(p.x) / max(p.y * uSpread, 0.001);
  float edge = (1.0 - smoothstep(0.94, 1.0, t)) * (1.0 - smoothstep(0.72, 1.0, side));
  float crest = smoothstep(-0.25, 1.05, h / max(uAmp * 0.62, 0.001));
  float lateral = 1.0 - 0.6 * side * side;
  float limb = exp(-(1.0 - t) * 6.5) * lateral;
  float depthLight = mix(0.45, 1.0, smoothstep(0.0, 0.55, t));
  float front = uIntro * 1.3 - (1.0 - t);
  float reveal = smoothstep(0.0, 0.22, front);
  float sweep = exp(-front * front / 0.004) * step(uIntro, 0.999) * 0.9;
  float energy = (0.018 + 0.9 * pow(crest, 2.4)) * depthLight * lateral + uGlow * limb * (0.25 + 0.95 * crest);
  float light = (energy * reveal + sweep * (0.4 + crest)) * edge * uBright;
  float tone = smoothstep(0.1, 0.95, light);
  vec3 tint = mix(uColorA, uColorB, tone);
  if (uInk > 0.5) {
    vColor = mix(uColorB, uColorA, smoothstep(0.05, 0.7, energy));
    vAlpha = clamp((0.28 + energy * 2.0) * uBright, 0.0, 1.0) * edge * max(reveal, sweep) * (0.55 + 0.45 * depthLight);
  } else {
    vColor = tint * light + vec3(1.0) * max(light - 0.9, 0.0) * 0.45;
    vAlpha = 1.0;
  }
}
`;
const VOXEL_FRAG_SHADER = `
uniform float uRound;
uniform float uInk;
varying vec2 vQuad;
varying vec2 vHalf;
varying float vSigma;
varying vec3 vColor;
varying float vAlpha;

float erfApprox(float x) {
  float x2 = x * x;
  float t = 1.0 - exp(-x2 * (1.27323954 + 0.147 * x2) / (1.0 + 0.147 * x2));
  return sign(x) * sqrt(max(t, 0.0));
}

float blurred(float x, float halfSize, float sigma) {
  float k = 0.70710678 / sigma;
  return 0.5 * (erfApprox((x + halfSize) * k) - erfApprox((x - halfSize) * k));
}

void main() {
  float soft = blurred(vQuad.x, vHalf.x, vSigma) * blurred(vQuad.y, vHalf.y, vSigma);
  float radius = uRound * min(vHalf.x, vHalf.y);
  vec2 q = abs(vQuad) - vHalf + radius;
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
  float sharp = 1.0 - smoothstep(-0.6, 0.6, d);
  float k = max(smoothstep(0.55, 1.4, vSigma), 1.0 - smoothstep(1.6, 3.2, min(vHalf.x, vHalf.y) * 2.0));
  float coverage = mix(sharp, soft, k);
  if (coverage < 0.002) discard;
  if (uInk > 0.5) {
    float a = coverage * vAlpha;
    gl_FragColor = vec4(vColor * a, a);
  } else {
    gl_FragColor = vec4(vColor * coverage, 1.0);
  }
}
`;
const BLOOM_PREPASS_FRAG_SHADER = `
uniform sampler2D uSource;
uniform vec2 uTexel;
uniform float uThreshold;
varying vec2 vUv;
vec3 tap(vec2 d) {
  vec3 c = texture2D(uSource, vUv + d * uTexel).rgb;
  float peak = max(c.r, max(c.g, c.b));
  return c * (max(peak - uThreshold, 0.0) / max(peak, 0.0001));
}
void main() {
  vec3 a = tap(vec2(-2.0, 2.0));
  vec3 b = tap(vec2(0.0, 2.0));
  vec3 c = tap(vec2(2.0, 2.0));
  vec3 d = tap(vec2(-2.0, 0.0));
  vec3 e = tap(vec2(0.0, 0.0));
  vec3 f = tap(vec2(2.0, 0.0));
  vec3 g = tap(vec2(-2.0, -2.0));
  vec3 h = tap(vec2(0.0, -2.0));
  vec3 i = tap(vec2(2.0, -2.0));
  vec3 j = tap(vec2(-1.0, 1.0));
  vec3 k = tap(vec2(1.0, 1.0));
  vec3 l = tap(vec2(-1.0, -1.0));
  vec3 m = tap(vec2(1.0, -1.0));
  vec3 color = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
  gl_FragColor = vec4(color, 1.0);
}
`;
const BLOOM_BLUR_FRAG_SHADER = `
uniform sampler2D uSource;
uniform vec2 uTexel;
varying vec2 vUv;
vec3 tap(vec2 d) { return texture2D(uSource, vUv + d * uTexel).rgb; }
void main() {
  vec3 color = tap(vec2(0.0)) * 4.0
    + (tap(vec2(-1.0, 0.0)) + tap(vec2(1.0, 0.0)) + tap(vec2(0.0, -1.0)) + tap(vec2(0.0, 1.0))) * 2.0
    + tap(vec2(-1.0, -1.0)) + tap(vec2(1.0, -1.0)) + tap(vec2(-1.0, 1.0)) + tap(vec2(1.0, 1.0));
  gl_FragColor = vec4(color / 16.0, 1.0);
}
`;
const COMPOSITE_FRAG_SHADER = `
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform vec3 uBackground;
uniform vec3 uHazeColor;
uniform vec3 uArc;
uniform float uHaze;
uniform float uBloomStrength;
uniform float uGrain;
uniform float uTime;
uniform float uInk;
uniform float uIntro;
varying vec2 vUv;

vec3 neutral(vec3 color) {
  const float start = 0.76;
  const float desaturation = 0.15;
  float x = min(color.r, min(color.g, color.b));
  float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
  color -= offset;
  float peak = max(color.r, max(color.g, color.b));
  if (peak < start) return color;
  const float d = 1.0 - start;
  float next = 1.0 - d * d / (peak + d - start);
  color *= next / peak;
  float g = 1.0 - 1.0 / (desaturation * (peak - next) + 1.0);
  return mix(color, vec3(next), g);
}

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  float dx = vUv.x - 0.5;
  float arc = uArc.x - uArc.y * dx * dx;
  float offset = vUv.y - arc;
  float spread = 1.0 - clamp(dx * dx * uArc.z, 0.0, 0.85);
  float profile = offset > 0.0
    ? exp(-offset / 0.045) + exp(-offset / 0.15) * 0.2
    : 1.2 * exp(offset / 0.03);
  float haze = profile * spread * uHaze * uIntro;
  vec4 scene = texture2D(uScene, vUv);
  float n = hash(gl_FragCoord.xy + fract(uTime * 13.0) * 911.0) - 0.5;
  if (uInk > 0.5) {
    float cover = clamp(scene.a, 0.0, 1.0);
    vec3 ink = scene.rgb / max(scene.a, 0.0001);
    vec3 color = mix(uBackground, ink, cover * 0.94);
    color = mix(color, uHazeColor, clamp(haze * 0.16, 0.0, 0.4));
    float mask = smoothstep(0.0, 0.05, cover + haze * 0.2);
    color += n * uGrain * 0.06 * mask;
    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
    return;
  }
  vec3 emission = scene.rgb + texture2D(uBloom, vUv).rgb * uBloomStrength + uHazeColor * haze;
  vec3 light = neutral(max(emission, 0.0));
  light = pow(light, vec3(1.0 / 2.2));
  vec3 color = 1.0 - (1.0 - uBackground) * (1.0 - light);
  float l = max(light.r, max(light.g, light.b));
  float mask = smoothstep(0.0, 0.04, l);
  color += n * uGrain * 0.1 * mask;
  color += (hash(gl_FragCoord.xy * 1.7) - 0.5) / 255.0 * mask;
  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

const FIXED_DELTA = 1 / 120;
const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));
const fallback = (val: any, def: number) => (Number.isFinite(val) ? Number(val) : def);

const tempColor = new THREE.Color();
const parseColor = (str: string | undefined): [number, number, number] | null => {
  if (!str) return null;
  const s = str.trim().toLowerCase();
  if (!s || s === 'transparent' || s === 'none' || s === 'auto') return null;
  try {
    tempColor.setStyle(s, THREE.SRGBColorSpace);
    return [tempColor.r, tempColor.g, tempColor.b];
  } catch {
    return null;
  }
};

const srgbToLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const linearToSrgb = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

const srgbToOklab = ([r, g, b]: [number, number, number]): [number, number, number] => {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};

const oklabToSrgb = ([l, a, b]: [number, number, number]): [number, number, number] => {
  const l_ = Math.pow(l + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m_ = Math.pow(l - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s_ = Math.pow(l - 0.0894841775 * a - 1.291485548 * b, 3);
  return [
    clamp(linearToSrgb(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_), 0, 1),
    clamp(linearToSrgb(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_), 0, 1),
    clamp(linearToSrgb(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_), 0, 1),
  ];
};

const subscribeReducedMotion = (cb: () => void) => {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  try {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql && mql.addEventListener) {
      mql.addEventListener('change', cb);
      return () => mql.removeEventListener('change', cb);
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

export interface VoxelArcProps {
  color?: string;
  accentColor?: string;
  backgroundColor?: string;
  density?: number;
  voxelSize?: number;
  roundness?: number;
  tilt?: number;
  horizon?: number;
  curvature?: number;
  waveHeight?: number;
  waveLength?: number;
  speed?: number;
  turbulence?: number;
  brightness?: number;
  glow?: number;
  haze?: number;
  bloom?: number;
  focus?: number;
  aperture?: number;
  grain?: number;
  interactive?: boolean;
  ripples?: number;
  intro?: boolean;
  paused?: boolean;
  dpr?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface VoxelArcRef {
  ripple: (x?: number, y?: number, amount?: number) => void;
  replay: () => void;
}

export const VoxelArc = forwardRef<VoxelArcRef, VoxelArcProps>(function VoxelArc(
  {
    color = '#5227FF',
    accentColor = '#B19EEF',
    backgroundColor = 'transparent',
    density = 1,
    voxelSize = 0.55,
    roundness = 0.2,
    tilt = 1,
    horizon = 0.56,
    curvature = 0.5,
    waveHeight = 1,
    waveLength = 1,
    speed = 0.5,
    turbulence = 0.4,
    brightness = 1,
    glow = 1,
    haze = 0.7,
    bloom = 0.5,
    focus = 0.25,
    aperture = 0.35,
    grain = 0.25,
    interactive = true,
    ripples = 1,
    intro = true,
    paused = false,
    dpr = 2,
    children,
    className,
    style,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<any>(null);

  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false);

  const params = {
    color,
    accentColor,
    backgroundColor,
    density,
    voxelSize,
    roundness,
    tilt,
    horizon,
    curvature,
    waveHeight,
    waveLength,
    speed,
    turbulence,
    brightness,
    glow,
    haze,
    bloom,
    focus,
    aperture,
    grain,
    interactive,
    ripples,
    intro,
    paused,
    dpr,
    reduced: reducedMotion,
  };

  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    engineRef.current?.sync();
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvasHost = canvasHostRef.current;
    if (!container || !canvasHost) return;

    let renderer: THREE.WebGLRenderer;
    const doc = container.ownerDocument;
    const win = doc.defaultView ?? window;
    const canvas = doc.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: false,
        antialias: false,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    canvasHost.appendChild(canvas);
    renderer.autoClear = false;

    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 200);
    camera.position.set(0, 3, 0);

    const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    const quadGeometry = new THREE.PlaneGeometry(2, 2);
    const quadScene = new THREE.Scene();
    const quadMesh = new THREE.Mesh(quadGeometry);
    quadMesh.frustumCulled = false;
    quadScene.add(quadMesh);

    const voxelGeometry = new THREE.InstancedBufferGeometry();
    voxelGeometry.index = quadGeometry.index;
    voxelGeometry.setAttribute('position', quadGeometry.getAttribute('position'));

    let voxelPositions = new Float32Array(3);
    let voxelAttr = new THREE.InstancedBufferAttribute(voxelPositions, 3);
    voxelGeometry.setAttribute('iVoxel', voxelAttr);
    voxelGeometry.instanceCount = 0;

    let rippleCurrent = new Float32Array(24576);
    let ripplePrev = new Float32Array(24576);
    let rippleNext = new Float32Array(24576);

    const rippleTexture = new THREE.DataTexture(
      rippleCurrent,
      192,
      128,
      THREE.RedFormat,
      THREE.FloatType
    );
    rippleTexture.minFilter = THREE.LinearFilter;
    rippleTexture.magFilter = THREE.LinearFilter;
    rippleTexture.needsUpdate = true;

    const colorA = new THREE.Vector3(0.2, 0.1, 1.0);
    const colorB = new THREE.Vector3(0.6, 0.5, 1.0);
    const bgColor = new THREE.Vector3(0.04, 0.04, 0.04);
    const hazeColor = new THREE.Vector3(0.3, 0.2, 0.9);
    const rippleRect = new THREE.Vector4(-8, 5, 8, 18);

    const voxelMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uAmp: { value: 0.18 },
        uWaveScale: { value: 1.0 },
        uTurb: { value: 0.4 },
        uCurveX: { value: 0.006 },
        uCurveZ: { value: 0.0015 },
        uCell: { value: 0.06 },
        uFill: { value: 0.55 },
        uTilt: { value: 0.6 },
        uFocusDepth: { value: 8.0 },
        uAperture: { value: 0.1 },
        uFocalPx: { value: 1000.0 },
        uViewport: { value: new THREE.Vector2(1, 1) },
        uNear: { value: 5.0 },
        uFar: { value: 18.0 },
        uSpread: { value: 0.5 },
        uIntro: { value: 1.0 },
        uGlow: { value: 1.0 },
        uBright: { value: 1.0 },
        uColorA: { value: colorA },
        uColorB: { value: colorB },
        uInk: { value: 0 },
        uRound: { value: 0.2 },
        uRipple: { value: rippleTexture },
        uRippleRect: { value: rippleRect },
        uRippleTexel: { value: new THREE.Vector2(1 / 192, 1 / 128) },
        uRippleOn: { value: 0 },
      },
      vertexShader: VOXEL_VERT_SHADER,
      fragmentShader: VOXEL_FRAG_SHADER,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });

    const voxelMesh = new THREE.Mesh(voxelGeometry, voxelMaterial);
    voxelMesh.frustumCulled = false;
    const voxelScene = new THREE.Scene();
    voxelScene.add(voxelMesh);

    const createRenderTarget = () =>
      new THREE.WebGLRenderTarget(1, 1, {
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        depthBuffer: false,
        stencilBuffer: false,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        generateMipmaps: false,
      });

    const sceneTarget = createRenderTarget();
    const bloomTargets = Array.from({ length: 5 }, createRenderTarget);

    const prepassMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uSource: { value: null },
        uTexel: { value: new THREE.Vector2() },
        uThreshold: { value: 0 },
      },
      vertexShader: QUAD_VERT_SHADER,
      fragmentShader: BLOOM_PREPASS_FRAG_SHADER,
      depthTest: false,
      depthWrite: false,
    });

    const blurMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uSource: { value: null },
        uTexel: { value: new THREE.Vector2() },
      },
      vertexShader: QUAD_VERT_SHADER,
      fragmentShader: BLOOM_BLUR_FRAG_SHADER,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const compositeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uScene: { value: sceneTarget.texture },
        uBloom: { value: bloomTargets[0].texture },
        uBackground: { value: bgColor },
        uHazeColor: { value: hazeColor },
        uArc: { value: new THREE.Vector3(0.44, 0.1, 1.0) },
        uHaze: { value: 0.8 },
        uBloomStrength: { value: 0.6 },
        uGrain: { value: 0.25 },
        uTime: { value: 0 },
        uInk: { value: 0 },
        uIntro: { value: 1 },
      },
      vertexShader: QUAD_VERT_SHADER,
      fragmentShader: COMPOSITE_FRAG_SHADER,
      depthTest: false,
      depthWrite: false,
    });

    let viewWidth = 0;
    let viewHeight = 0;
    let viewDpr = 1;
    let isInitialized = false;
    let cacheKey = '';
    let colorCacheKey = '';
    let isLightBg = false;
    let bgRGB: [number, number, number] = [0.04, 0.04, 0.04];
    let lastColorCheck = -10;
    let elapsedTime = 0;
    let introStartTime = -1;
    let isIntroDone = false;
    let hasRipples = false;
    let rippleAccumulator = 0;
    let rippleFadeTimer = 0;
    let nearDistance = 5;
    let spreadFactor = 0.5;
    let animFrame = 0;
    let lastFrameTime = 0;
    let isIntersecting = false;
    let isDestroyed = false;
    let isContextLost = false;
    let activePointer: { x: number; z: number; t: number } | null = null;
    const queuedRipples: { x: number; z: number; amount: number; radius: number }[] = [];

    const updateColors = () => {
      const p = paramsRef.current;
      const parsedBg = parseColor(p.backgroundColor) ?? [0, 0, 0];
      bgRGB = parsedBg;
      const key = [bgRGB.join(','), p.color, p.accentColor].join('|');
      if (key === colorCacheKey) return;
      colorCacheKey = key;

      isLightBg = 0.2126 * bgRGB[0] + 0.7152 * bgRGB[1] + 0.0722 * bgRGB[2] > 0.55;
      bgColor.set(bgRGB[0], bgRGB[1], bgRGB[2]);

      const oklabA = srgbToOklab(parseColor(p.color) ?? [0.32, 0.15, 1.0]);
      const oklabB = srgbToOklab(parseColor(p.accentColor) ?? [0.69, 0.62, 0.94]);
      const chroma = (c: [number, number, number]) => Math.hypot(c[1], c[2]);

      const adjustInk = (base: [number, number, number], other: [number, number, number], maxL: number) => {
        if (!isLightBg) return base;
        let c = base;
        if (chroma(base) < 0.03 && chroma(other) >= 0.03) c = other;
        const ch = chroma(c);
        if (ch < 0.03) return [0.3, 0, 0] as [number, number, number];
        const scale = Math.max(1, 0.14 / ch);
        return [clamp(c[0], 0.32, maxL), c[1] * scale, c[2] * scale] as [number, number, number];
      };

      const srgbA = oklabToSrgb(adjustInk(oklabA, oklabB, 0.5));
      const srgbB = oklabToSrgb(adjustInk(oklabB, oklabA, 0.6));

      if (isLightBg) {
        colorA.set(srgbA[0], srgbA[1], srgbA[2]);
        colorB.set(srgbB[0], srgbB[1], srgbB[2]);
        hazeColor.set(srgbB[0], srgbB[1], srgbB[2]);
      } else {
        colorA.set(srgbToLinear(srgbA[0]), srgbToLinear(srgbA[1]), srgbToLinear(srgbA[2]));
        colorB.set(srgbToLinear(srgbB[0]), srgbToLinear(srgbB[1]), srgbToLinear(srgbB[2]));
        hazeColor.set(
          (0.55 * colorA.x + 0.45 * colorB.x) * 0.16,
          (0.55 * colorA.y + 0.45 * colorB.y) * 0.16,
          (0.55 * colorA.z + 0.45 * colorB.z) * 0.16
        );
      }

      voxelMaterial.uniforms.uInk.value = isLightBg ? 1 : 0;
      compositeMaterial.uniforms.uInk.value = isLightBg ? 1 : 0;
    };

    const updateSize = () => {
      const p = paramsRef.current;
      const w = Math.round(container.clientWidth);
      const h = Math.round(container.clientHeight);
      if (w < 2 || h < 2) {
        isInitialized = false;
        return false;
      }
      const targetDpr = Math.min(win.devicePixelRatio || 1, clamp(fallback(p.dpr, 2), 0.5, 3));
      if (isInitialized && w === viewWidth && h === viewHeight && targetDpr === viewDpr) {
        return false;
      }
      isInitialized = true;
      viewWidth = w;
      viewHeight = h;
      viewDpr = targetDpr;

      renderer.setPixelRatio(viewDpr);
      renderer.setSize(viewWidth, viewHeight, false);
      sceneTarget.setSize(Math.round(viewWidth * viewDpr), Math.round(viewHeight * viewDpr));

      let rw = Math.round(viewWidth * viewDpr);
      let rh = Math.round(viewHeight * viewDpr);
      for (const target of bloomTargets) {
        rw = Math.max(1, Math.round(rw / 2));
        rh = Math.max(1, Math.round(rh / 2));
        target.setSize(rw, rh);
      }
      cacheKey = '';
      return true;
    };

    const screenToWorld = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -(((clientY - rect.top) / rect.height) * 2 - 1);
      const ray = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera).sub(camera.position).normalize();
      if (ray.y >= -1e-4) return null;
      const dist = -camera.position.y / ray.y;
      const worldX = camera.position.x + ray.x * dist;
      const worldZ = -(camera.position.z + ray.z * dist);
      return worldZ < nearDistance || worldZ > 18 ? null : { x: worldX, z: worldZ };
    };

    const injectRipple = (x: number, z: number, strength: number, rad: number) => {
      const gx = ((x - rippleRect.x) / (rippleRect.z - rippleRect.x)) * 192;
      const gz = ((z - rippleRect.y) / (rippleRect.w - rippleRect.y)) * 128;
      const r = Math.max(1, rad);
      const span = Math.ceil(2.5 * r);
      const ix = Math.round(gx);
      const iz = Math.round(gz);

      for (let j = iz - span; j <= iz + span; j++) {
        if (j < 1 || j >= 127) continue;
        for (let i = ix - span; i <= ix + span; i++) {
          if (i < 1 || i >= 191) continue;
          const drop = -strength * Math.exp(-(((i - gx) * (i - gx) + (j - gz) * (j - gz)) / (r * r)));
          rippleCurrent[192 * j + i] += drop;
          ripplePrev[192 * j + i] += 0.6 * drop;
        }
      }
      hasRipples = true;
      rippleFadeTimer = 0;
      voxelMaterial.uniforms.uRippleOn.value = 1;
    };

    const stepRipplePhysics = () => {
      let maxDelta = 0;
      for (let y = 1; y < 127; y++) {
        const row = 192 * y;
        for (let x = 1; x < 191; x++) {
          const idx = row + x;
          const neighborSum =
            rippleCurrent[idx - 1] +
            rippleCurrent[idx + 1] +
            rippleCurrent[idx - 192] +
            rippleCurrent[idx + 192] -
            4 * rippleCurrent[idx];
          const nextVal = (2 * rippleCurrent[idx] - ripplePrev[idx] + 0.1 * neighborSum) * 0.9962;
          rippleNext[idx] = nextVal;
          const mag = Math.abs(nextVal);
          if (mag > maxDelta) maxDelta = mag;
        }
      }
      const tmp = ripplePrev;
      ripplePrev = rippleCurrent;
      rippleCurrent = rippleNext;
      rippleNext = tmp;
      return maxDelta;
    };

    const requestFrame = () => {
      if (isDestroyed || isContextLost || !isIntersecting || animFrame) return;
      animFrame = requestAnimationFrame(animate);
    };

    const updateScene = () => {
      if (!isInitialized) return;
      const p = paramsRef.current;
      if (performance.now() - lastColorCheck > 1000) {
        lastColorCheck = performance.now();
        updateColors();
      }

      (() => {
        const p = paramsRef.current;
        const aspect = viewWidth / viewHeight;
        const key = [viewWidth, viewHeight, viewDpr, p.horizon, p.curvature, p.density, p.voxelSize, p.focus, p.aperture].join('|');
        if (key === cacheKey) return;
        cacheKey = key;

        const halfFovRad = THREE.MathUtils.degToRad(13);
        const tanHalfFov = Math.tan(halfFovRad);
        const horizTan = tanHalfFov * aspect;
        const curve = clamp(fallback(p.curvature, 0.5), 0, 1.5);
        const curveX = 0.034 * curve * Math.pow(1.8 / clamp(aspect, 1.05, 3), 2);
        const curveZ = 0.0012 * curve;
        const horizonVal = clamp(fallback(p.horizon, 0.56), 0.12, 0.92);
        const camPitch = clamp(Math.atan((3 + 324 * curveZ) / 18) + Math.atan((1 - 2 * horizonVal) * tanHalfFov), 0.02, 1.2);

        camera.aspect = aspect;
        camera.fov = 26;
        camera.rotation.set(-camPitch, 0, 0);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld(true);

        const effPitch = camPitch + halfFovRad;
        nearDistance = clamp(effPitch < Math.PI / 2 - 0.02 ? (3 / Math.tan(effPitch)) * 0.86 : 0.5, 0.4, 16);
        spreadFactor = 1.12 * horizTan;

        const focalPx = (viewHeight * viewDpr * 0.5) / tanHalfFov;
        const depthProj = (z: number) => z * Math.cos(camPitch) + 3 * Math.sin(camPitch);
        const spreadAtZ = (z: number) => depthProj(z) * spreadFactor;
        const pixelScaleAtNear = ((0.5 * viewHeight) / tanHalfFov) / depthProj(nearDistance);
        let cellSize = clamp(0.0165 * viewHeight, 6, 13) / clamp(fallback(p.density, 1), 0.3, 3) / pixelScaleAtNear;

        const countInstances = (cell: number) => {
          let count = 0;
          for (let z = nearDistance; z <= 18; z += cell) {
            count += 2 * Math.floor(spreadAtZ(z) / cell) + 1;
          }
          return count;
        };

        let totalInstances = countInstances(cellSize);
        if (totalInstances > 110000) {
          cellSize *= 1.02 * Math.sqrt(totalInstances / 110000);
          totalInstances = countInstances(cellSize);
        }

        if (voxelPositions.length < 3 * totalInstances) {
          voxelPositions = new Float32Array(3 * Math.ceil(1.1 * totalInstances));
          voxelAttr = new THREE.InstancedBufferAttribute(voxelPositions, 3);
          voxelGeometry.setAttribute('iVoxel', voxelAttr);
        }

        let idx = 0;
        let rowIdx = 0;
        for (let z = nearDistance; z <= 18 && idx < totalInstances; z += cellSize, rowIdx++) {
          const halfCount = Math.floor(spreadAtZ(z) / cellSize);
          for (let col = -halfCount; col <= halfCount && idx < totalInstances; col++) {
            voxelPositions[3 * idx] = col * cellSize;
            voxelPositions[3 * idx + 1] = z;
            voxelPositions[3 * idx + 2] = (7919 * rowIdx + 104729 * col) % 997;
            idx++;
          }
        }
        voxelAttr.needsUpdate = true;
        voxelGeometry.instanceCount = idx;

        const fill = clamp(fallback(p.voxelSize, 0.55), 0.1, 1);
        const foc = clamp(fallback(p.focus, 0.25), 0, 1);
        const vUniforms = voxelMaterial.uniforms;
        vUniforms.uCell.value = cellSize;
        vUniforms.uFill.value = fill;
        vUniforms.uCurveX.value = curveX;
        vUniforms.uCurveZ.value = curveZ;
        vUniforms.uFocalPx.value = focalPx;
        vUniforms.uViewport.value.set(viewWidth * viewDpr, viewHeight * viewDpr);
        vUniforms.uNear.value = nearDistance;
        vUniforms.uFar.value = 18;
        vUniforms.uSpread.value = spreadFactor;
        vUniforms.uFocusDepth.value = depthProj(nearDistance + (18 - nearDistance) * foc);
        vUniforms.uAperture.value = 0.16 * clamp(fallback(p.aperture, 0.35), 0, 2);

        const farSpread = spreadAtZ(18);
        rippleRect.set(-farSpread, nearDistance, farSpread, 18);

        const projectPoint = (x: number, z: number) => {
          const pt = new THREE.Vector3(x, -(x * x * curveX + z * z * curveZ), -z).project(camera);
          return { x: 0.5 * pt.x + 0.5, y: 0.5 * pt.y + 0.5 };
        };

        const centerPt = projectPoint(0, 18);
        const edgePt = projectPoint(0.8 * farSpread, 18);
        const dx = edgePt.x - 0.5;
        const arcCurv = dx !== 0 ? (centerPt.y - edgePt.y) / (dx * dx) : 0;
        compositeMaterial.uniforms.uArc.value.set(centerPt.y, Math.max(0, arcCurv), 1.4);
      })();

      const pNow = paramsRef.current;
      const vUni = voxelMaterial.uniforms;
      vUni.uAmp.value = 0.17 * clamp(fallback(pNow.waveHeight, 1), 0, 3);
      vUni.uWaveScale.value = clamp(fallback(pNow.waveLength, 1), 0.25, 4);
      vUni.uTurb.value = clamp(fallback(pNow.turbulence, 0.4), 0, 1.5);
      vUni.uTilt.value = clamp(fallback(pNow.tilt, 1), 0, 1);
      vUni.uRound.value = clamp(fallback(pNow.roundness, 0.2), 0, 1);
      vUni.uGlow.value = clamp(fallback(pNow.glow, 1), 0, 3);
      vUni.uBright.value = clamp(fallback(pNow.brightness, 1), 0, 3);

      compositeMaterial.uniforms.uHaze.value = clamp(fallback(pNow.haze, 0.7), 0, 3);
      compositeMaterial.uniforms.uBloomStrength.value = clamp(fallback(pNow.bloom, 0.5), 0, 3);
      compositeMaterial.uniforms.uGrain.value = clamp(fallback(pNow.grain, 0.25), 0, 1);

      voxelMaterial.blending = isLightBg ? THREE.CustomBlending : THREE.AdditiveBlending;
      if (isLightBg) {
        voxelMaterial.blendEquation = THREE.AddEquation;
        voxelMaterial.blendSrc = THREE.OneFactor;
        voxelMaterial.blendDst = THREE.OneFactor;
        voxelMaterial.blendEquationAlpha = THREE.AddEquation;
        voxelMaterial.blendSrcAlpha = THREE.OneFactor;
        voxelMaterial.blendDstAlpha = THREE.OneFactor;
      }

      renderer.setRenderTarget(sceneTarget);
      renderer.setClearColor(0, 0);
      renderer.clear();
      renderer.render(voxelScene, camera);

      const bloomStr = isLightBg ? 0 : clamp(fallback(pNow.bloom, 0.5), 0, 3);
      if (bloomStr > 0.001) {
        let cur = sceneTarget;
        for (const target of bloomTargets) {
          quadMesh.material = prepassMaterial;
          prepassMaterial.uniforms.uThreshold.value = 0.32 * (cur === sceneTarget ? 1 : 0);
          prepassMaterial.uniforms.uSource.value = cur.texture;
          prepassMaterial.uniforms.uTexel.value.set(1 / cur.width, 1 / cur.height);
          renderer.setRenderTarget(target);
          renderer.render(quadScene, quadCamera);
          cur = target;
        }

        quadMesh.material = blurMaterial;
        for (let i = bloomTargets.length - 1; i > 0; i--) {
          blurMaterial.uniforms.uSource.value = bloomTargets[i].texture;
          blurMaterial.uniforms.uTexel.value.set(1 / bloomTargets[i].width, 1 / bloomTargets[i].height);
          renderer.setRenderTarget(bloomTargets[i - 1]);
          renderer.render(quadScene, quadCamera);
        }
      }

      compositeMaterial.uniforms.uBloomStrength.value = bloomStr;
      compositeMaterial.uniforms.uTime.value = elapsedTime;
      quadMesh.material = compositeMaterial;
      renderer.setRenderTarget(null);
      renderer.render(quadScene, quadCamera);
    };

    const animate = (time: number) => {
      animFrame = 0;
      if (isDestroyed || isContextLost) return;
      const p = paramsRef.current;
      const delta = lastFrameTime && time - lastFrameTime < 100 ? Math.min(Math.max((time - lastFrameTime) / 1000, 0), 0.05) : 1 / 60;
      lastFrameTime = time;

      const isRunning = !p.reduced && !p.paused;
      if (isRunning) {
        elapsedTime += delta * clamp(fallback(p.speed, 0.5), 0, 4);
      }
      voxelMaterial.uniforms.uTime.value = elapsedTime;

      if (!p.intro || p.reduced || isIntroDone) {
        isIntroDone = true;
        voxelMaterial.uniforms.uIntro.value = 1;
        compositeMaterial.uniforms.uIntro.value = 1;
      } else {
        if (introStartTime < 0) introStartTime = time;
        const progress = clamp((time - introStartTime) / 2600, 0, 1);
        voxelMaterial.uniforms.uIntro.value = progress;
        compositeMaterial.uniforms.uIntro.value = clamp(1.25 * progress, 0, 1);
        if (progress >= 1) isIntroDone = true;
      }

      for (const rip of queuedRipples.splice(0)) {
        injectRipple(rip.x, rip.z, rip.amount, rip.radius);
      }

      if (hasRipples && isRunning) {
        rippleAccumulator += delta;
        let maxChange = 1;
        let steps = 0;
        while (rippleAccumulator >= FIXED_DELTA && steps < 4) {
          maxChange = stepRipplePhysics();
          rippleAccumulator -= FIXED_DELTA;
          steps++;
        }
        if (steps >= 4) rippleAccumulator = 0;
        if (steps > 0) {
          rippleTexture.image.data = rippleCurrent;
          rippleTexture.needsUpdate = true;
        }

        if (maxChange < 4e-4) {
          rippleFadeTimer += delta;
          if (rippleFadeTimer > 0.6) {
            hasRipples = false;
            rippleCurrent.fill(0);
            ripplePrev.fill(0);
            rippleNext.fill(0);
            rippleTexture.image.data = rippleCurrent;
            rippleTexture.needsUpdate = true;
            voxelMaterial.uniforms.uRippleOn.value = 0;
          }
        } else {
          rippleFadeTimer = 0;
        }
      }

      updateScene();

      if ((isRunning && clamp(fallback(p.speed, 0.5), 0, 4) > 0) || (hasRipples && isRunning) || !isIntroDone) {
        if (!doc.hidden) {
          animFrame = requestAnimationFrame(animate);
        } else {
          lastFrameTime = 0;
        }
      } else {
        lastFrameTime = 0;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const p = paramsRef.current;
      if (!p.interactive || p.reduced || p.paused) return;
      const hit = screenToWorld(e.clientX, e.clientY);
      const now = performance.now();
      if (!hit) {
        activePointer = null;
        return;
      }
      const rippleFactor = clamp(fallback(p.ripples, 1), 0, 3);
      if (activePointer && rippleFactor > 0) {
        const dx = hit.x - activePointer.x;
        const dz = hit.z - activePointer.z;
        const dist = Math.hypot(dx, dz);
        const strength = clamp((dist / Math.max(0.008, (now - activePointer.t) / 1000)) * 0.009, 0, 0.07) * rippleFactor;
        if (strength > 5e-4) {
          const steps = Math.min(12, Math.max(1, Math.ceil(dist / (2 * ((rippleRect.z - rippleRect.x) / 192)))));
          for (let s = 1; s <= steps; s++) {
            queuedRipples.push({
              x: activePointer.x + (dx * s) / steps,
              z: activePointer.z + (dz * s) / steps,
              amount: strength / Math.sqrt(steps),
              radius: 2.2,
            });
          }
          requestFrame();
        }
      }
      activePointer = { x: hit.x, z: hit.z, t: now };
    };

    const onPointerLeave = () => {
      activePointer = null;
    };

    const onPointerDown = (e: PointerEvent) => {
      const p = paramsRef.current;
      if (!p.interactive || p.reduced || p.paused || !e.isPrimary) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('a,button,input,textarea,select,label,summary,[role=button],[contenteditable=true]')) return;

      const hit = screenToWorld(e.clientX, e.clientY);
      if (!hit) return;
      const rippleFactor = clamp(fallback(p.ripples, 1), 0, 3);
      if (rippleFactor <= 0) return;

      queuedRipples.push({
        x: hit.x,
        z: hit.z,
        amount: 0.42 * rippleFactor,
        radius: 3.6,
      });
      requestFrame();
    };

    const onVisibilityChange = () => {
      lastFrameTime = 0;
      requestFrame();
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      isContextLost = true;
      cancelAnimationFrame(animFrame);
      animFrame = 0;
    };

    const onContextRestored = () => {
      isContextLost = false;
      cacheKey = '';
      rippleTexture.needsUpdate = true;
      requestFrame();
    };

    const resizeObserver = new ResizeObserver(() => {
      if (updateSize()) {
        updateScene();
        requestFrame();
      }
    });

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        lastFrameTime = 0;
        requestFrame();
      },
      { rootMargin: '120px' }
    );

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointerleave', onPointerLeave);
    container.addEventListener('pointercancel', onPointerLeave);
    doc.addEventListener('visibilitychange', onVisibilityChange);
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    resizeObserver.observe(container);
    intersectionObserver.observe(container);

    updateSize();
    updateColors();

    engineRef.current = {
      sync: () => {
        lastColorCheck = -10;
        if (updateSize()) cacheKey = '';
        lastFrameTime = 0;
        if (!animFrame && isIntersecting) {
          updateScene();
          requestFrame();
        }
      },
      ripple: (normX?: number, normY?: number, strength?: number) => {
        if (paramsRef.current.reduced) return;
        const rect = container.getBoundingClientRect();
        const hit = screenToWorld(
          rect.left + clamp(normX ?? 0.5, 0, 1) * rect.width,
          rect.top + clamp(normY ?? 0.8, 0, 1) * rect.height
        );
        if (hit) {
          queuedRipples.push({
            x: hit.x,
            z: hit.z,
            amount: 0.42 * clamp(fallback(strength ?? 1, 1), 0, 3),
            radius: 3.6,
          });
          requestFrame();
        }
      },
      replay: () => {
        introStartTime = -1;
        isIntroDone = false;
        lastFrameTime = 0;
        requestFrame();
      },
      destroy: () => {
        isDestroyed = true;
        cancelAnimationFrame(animFrame);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        container.removeEventListener('pointermove', onPointerMove);
        container.removeEventListener('pointerdown', onPointerDown);
        container.removeEventListener('pointerleave', onPointerLeave);
        container.removeEventListener('pointercancel', onPointerLeave);
        doc.removeEventListener('visibilitychange', onVisibilityChange);
        canvas.removeEventListener('webglcontextlost', onContextLost);
        canvas.removeEventListener('webglcontextrestored', onContextRestored);

        voxelGeometry.dispose();
        quadGeometry.dispose();
        voxelMaterial.dispose();
        prepassMaterial.dispose();
        blurMaterial.dispose();
        compositeMaterial.dispose();
        rippleTexture.dispose();
        sceneTarget.dispose();
        for (const t of bloomTargets) t.dispose();
        try {
          renderer.forceContextLoss();
        } catch {
          // ignore
        }
        renderer.dispose();
        canvas.remove();
      },
    };

    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      ripple: (x?: number, y?: number, amount?: number) => engineRef.current?.ripple(x, y, amount),
      replay: () => engineRef.current?.replay(),
    }),
    []
  );

  const cleanBg = backgroundColor?.trim().toLowerCase();

  return (
    <div
      ref={containerRef}
      className={cn('relative isolate h-full min-h-[320px] w-full overflow-hidden', className)}
      style={{
        backgroundColor: cleanBg === 'transparent' || cleanBg === '' ? undefined : backgroundColor,
        touchAction: 'pan-y',
        ...style,
      }}
    >
      <div ref={canvasHostRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      {children ? (
        <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>{children}</div>
      ) : null}
    </div>
  );
});

export { VOXEL_ARC_PRESETS } from './voxelArcPresets';
