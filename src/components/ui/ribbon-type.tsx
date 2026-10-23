import React, {
  forwardRef,
  useRef,
  useEffect,
  useImperativeHandle,
  useSyncExternalStore,
  CSSProperties,
  ReactNode,
} from 'react';
import * as THREE from 'three';
import { cn } from '../../lib/utils';

export interface RibbonTypeRef {
  twist: (position?: number) => void;
  replay: () => void;
}

export interface RibbonTypeProps {
  /** The words printed along the ribbon. They repeat for its whole length. */
  text?: string;
  /** Text placed between repeats. Default: ' · ' */
  separator?: string;
  /** Ribbon colour and text colour. Every second ribbon swaps them. Accepts any CSS colour. */
  colors?: [string, string];
  /** Print the text on a solid satin band. Turn it off for floating type that twists on an invisible ribbon. */
  band?: boolean;
  /** The shape the ribbon follows: a wave across the view, a ring in perspective, or a spiral around a horizontal axis. */
  path?: 'wave' | 'loop' | 'helix';
  /** Number of ribbons, from 1 to 3. They interweave and alternate colours. */
  ribbons?: number;
  /** Vertical distance between ribbons in pixels. Default: 120 */
  gap?: number;
  /** Width of the ribbon in pixels. Default: 76 */
  ribbonWidth?: number;
  /** Text height relative to the ribbon width. Default: 0.5 */
  textScale?: number;
  /** Font of the text. inherit uses the font of the surrounding page. Default: 'inherit' */
  fontFamily?: string;
  /** Weight of the text. Default: 700 */
  fontWeight?: number;
  /** Space between letters in em. Default: 0.06 */
  letterSpacing?: number;
  /** Height of the wave in pixels, or the radius of the helix. Default: 70 */
  amplitude?: number;
  /** Waves or helix turns across the width of the component. Default: 1.1 */
  frequency?: number;
  /** How far the ribbon swings toward and away from you, in pixels. Default: 120 */
  depth?: number;
  /** How far the ribbon rocks around its own length, in turns. Above 0.25 it shows its back. Default: 0.12 */
  twist?: number;
  /** How fast the rocking travels along the ribbon. Default: 0.12 */
  twistSpeed?: number;
  /** Speed of the text along the ribbon in pixels per second. Default: 90 */
  speed?: number;
  /** Direction the text travels. Every second ribbon runs the other way. Default: 'left' */
  direction?: 'left' | 'right';
  /** How fast the ribbon's shape undulates. Default: 0.35 */
  flow?: number;
  /** Tilt of the whole ribbon toward or away from you, in degrees. Default: -6 */
  tilt?: number;
  /** Camera field of view in degrees. Higher values exaggerate depth. Default: 32 */
  perspective?: number;
  /** How strongly the satin is lit and shaded as it turns, from 0 (flat) to 1. Default: 0.6 */
  shading?: number;
  /** Satin highlight and rim light, from 0 to 1. Default: 0.4 */
  sheen?: number;
  /** Speed multiplier while the pointer rests over the ribbon, so it can be read. Default: 0.3 */
  hoverSpeed?: number;
  /** Drag sideways to scrub the text. A flick carries on with momentum. Default: true */
  draggable?: boolean;
  /** Click or tap to send a full twist rolling along the ribbon from that point. Default: true */
  clickTwist?: boolean;
  /** Seconds between automatic twists. 0 turns them off. Default: 0 */
  autoTwist?: number;
  /** Fade in with a twist rolling along the ribbon when it mounts. Default: true */
  intro?: boolean;
  /** Freeze the motion. Default: false */
  paused?: boolean;
  /** Render scale and mesh detail, from 0.5 to 1. Default: 1 */
  quality?: number;
  /** Additional class names for container */
  className?: string;
  /** Inline styles for container */
  style?: CSSProperties;
  /** Content layered over the ribbon */
  children?: ReactNode;
}

const TWO_PI = 2 * Math.PI;

const vertexShader = `
attribute float aLane;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorld;
varying float vLane;
void main() {
  vUv = uv;
  vLane = aLane;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const fragmentShader = `
uniform sampler2D uText;
uniform vec3 uBand;
uniform vec3 uInk;
uniform float uBandOn;
uniform float uShading;
uniform float uSheen;
uniform float uOpacity;
uniform vec3 uLight;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorld;
varying float vLane;
void main() {
  vec3 n = normalize(vNormal);
  bool front = gl_FrontFacing;
  if (!front) n = -n;
  vec3 view = normalize(cameraPosition - vWorld);
  float facing = dot(n, uLight);
  float wrap = facing * 0.5 + 0.5;
  float light = mix(1.0, 0.3 + 0.62 * wrap * wrap + 0.2 * max(facing, 0.0), uShading);
  vec3 halfway = normalize(uLight + view);
  float spec = pow(max(dot(n, halfway), 0.0), 56.0) * uSheen * 0.55;
  float rim = pow(1.0 - abs(dot(n, view)), 4.0) * uSheen * 0.22;
  float glyph = texture2D(uText, vUv).a;
  bool swapped = mod(vLane, 2.0) > 0.5;
  vec3 band = swapped ? uInk : uBand;
  vec3 ink = swapped ? uBand : uInk;
  vec3 color;
  float alpha = 1.0;
  if (uBandOn > 0.5) {
    vec3 surface = front ? mix(band, ink, glyph) : band * 0.6;
    color = surface * light + vec3(spec + rim);
  } else {
    color = ink * light * (front ? 1.0 : 0.55) + vec3(spec * glyph);
    alpha = glyph;
    if (alpha < 0.01) discard;
  }
  gl_FragColor = vec4(color, alpha * uOpacity);
  #include <colorspace_fragment>
}
`;

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));
const finiteOr = (val: any, fallback: number) => (Number.isFinite(val) ? val : fallback);
const smoothstep3 = (val: number) => {
  const t = clamp(val, 0, 1);
  return t * t * (3 - 2 * t);
};

let measureCanvasContext: CanvasRenderingContext2D | null = null;
const parseCssColor = (color: string, fallback: string): string => {
  if (typeof document === 'undefined' || !color || (typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && !CSS.supports('color', color))) {
    return fallback;
  }
  if (!measureCanvasContext) {
    const c = document.createElement('canvas');
    c.width = 1;
    c.height = 1;
    measureCanvasContext = c.getContext('2d', { willReadFrequently: true });
  }
  if (!measureCanvasContext) return fallback;
  measureCanvasContext.clearRect(0, 0, 1, 1);
  measureCanvasContext.fillStyle = '#000';
  measureCanvasContext.fillStyle = color;
  measureCanvasContext.fillRect(0, 0, 1, 1);
  const data = measureCanvasContext.getImageData(0, 0, 1, 1).data;
  return `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
};

const subscribeReducedMotion = (cb: () => void) => {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
};
const getReducedMotionSnapshot = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const RibbonType = forwardRef<RibbonTypeRef, RibbonTypeProps>(function RibbonType(
  {
    text = 'MAKE SPACE FOR IDEAS',
    separator = '  ·  ',
    colors = ['#5227FF', '#FFFFFF'],
    band = true,
    path = 'wave',
    ribbons = 1,
    gap = 120,
    ribbonWidth = 76,
    textScale = 0.5,
    fontFamily = 'inherit',
    fontWeight = 700,
    letterSpacing = 0.06,
    amplitude = 70,
    frequency = 1.1,
    depth = 120,
    twist = 0.12,
    twistSpeed = 0.12,
    speed = 90,
    direction = 'left',
    flow = 0.35,
    tilt = -6,
    perspective = 32,
    shading = 0.6,
    sheen = 0.4,
    hoverSpeed = 0.3,
    draggable = true,
    clickTwist = true,
    autoTwist = 0,
    intro = true,
    paused = false,
    quality = 1,
    className,
    style,
    children,
  },
  forwardedRef
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);

  const reduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false);

  const currentProps = {
    text,
    separator,
    colors,
    band,
    path,
    ribbons,
    gap,
    ribbonWidth,
    textScale,
    fontFamily,
    fontWeight,
    letterSpacing,
    amplitude,
    frequency,
    depth,
    twist,
    twistSpeed,
    speed,
    direction,
    flow,
    tilt,
    perspective,
    shading,
    sheen,
    hoverSpeed,
    draggable,
    clickTwist,
    autoTwist,
    intro,
    paused,
    quality,
    reduced,
  };

  const propsRef = useRef(currentProps);

  useEffect(() => {
    propsRef.current = currentProps;
    instanceRef.current?.sync();
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const initEngine = (container: HTMLElement, getPropsRef: React.MutableRefObject<typeof currentProps>) => {
      const doc = container.ownerDocument;
      const win = doc.defaultView ?? window;
      const canvas = doc.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:pan-y';
      container.insertBefore(canvas, container.firstChild);

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          premultipliedAlpha: true,
        });
      } catch {
        canvas.remove();
        return null;
      }
      renderer.setClearColor(0, 0);

      const getProps = () => getPropsRef.current;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 1, 20000);
      const geometry = new THREE.BufferGeometry();
      const textCanvas = doc.createElement('canvas');
      const textTexture = new THREE.CanvasTexture(textCanvas);
      textTexture.wrapS = THREE.RepeatWrapping;
      textTexture.wrapT = THREE.ClampToEdgeWrapping;
      textTexture.minFilter = THREE.LinearMipmapLinearFilter;
      textTexture.magFilter = THREE.LinearFilter;
      textTexture.generateMipmaps = true;
      textTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const bandColor = new THREE.Color('#5227FF');
      const inkColor = new THREE.Color('#FFFFFF');
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uText: { value: textTexture },
          uBand: { value: bandColor },
          uInk: { value: inkColor },
          uBandOn: { value: 1 },
          uShading: { value: 0.6 },
          uSheen: { value: 0.4 },
          uOpacity: { value: 0 },
          uLight: { value: new THREE.Vector3(-0.35, 0.55, 0.76).normalize() },
        },
        side: THREE.DoubleSide,
        transparent: true,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;
      scene.add(mesh);

      let animFrameId = 0;
      let lastTime = 0;
      let destroyed = false;
      let isVisible = true;
      let hasMountedIntro = false;
      let viewWidth = 1;
      let viewHeight = 1;
      let currentSampleCount = 0;
      let currentRibbonCount = 0;
      let textSignature = '';
      let colorSignature = '';
      let textAspect = 1;
      let simTime = 0;
      let scrollOffset = 0;
      let dragVelocity = 0;
      let hoverMultiplier = 1;
      let introStartTime = 0;
      let nextAutoTwistTime = 0;
      let posArray = new Float32Array(0);
      let normalArray = new Float32Array(0);
      let uvArray = new Float32Array(0);
      const ribbonsData: { points: Float32Array; lengths: Float32Array; total: number }[] = [];
      const twistsList: { lane: number; origin: number; start: number }[] = [];

      const dragPointer = {
        inside: false,
        down: false,
        id: -1,
        startX: 0,
        startY: 0,
        startAt: 0,
        lastX: 0,
        lastAt: 0,
        moved: false,
      };

      const tempProjVec = new THREE.Vector3();

      const rebuildMeshBuffers = () => {
        const p = getProps();
        const sampleCount = Math.round(520 * clamp(finiteOr(p.quality, 1), 0.4, 1));
        const ribbonCount = Math.round(clamp(finiteOr(p.ribbons, 1), 1, 3));
        if (sampleCount === currentSampleCount && ribbonCount === currentRibbonCount) return;

        currentSampleCount = sampleCount;
        currentRibbonCount = ribbonCount;
        const vertexCount = (sampleCount + 1) * 2 * ribbonCount;
        posArray = new Float32Array(3 * vertexCount);
        normalArray = new Float32Array(3 * vertexCount);
        uvArray = new Float32Array(2 * vertexCount);
        const laneArray = new Float32Array(vertexCount);
        const indices: number[] = [];

        for (let r = 0; r < ribbonCount; r++) {
          const laneOffset = r * (sampleCount + 1) * 2;
          for (let s = 0; s <= sampleCount; s++) {
            laneArray[laneOffset + 2 * s] = r;
            laneArray[laneOffset + 2 * s + 1] = r;
          }
          for (let s = 0; s < sampleCount; s++) {
            const idx = laneOffset + 2 * s;
            indices.push(idx, idx + 2, idx + 1, idx + 1, idx + 2, idx + 3);
          }
        }

        ribbonsData.length = 0;
        for (let r = 0; r < ribbonCount; r++) {
          ribbonsData.push({
            points: new Float32Array((sampleCount + 1) * 3),
            lengths: new Float32Array(sampleCount + 1),
            total: 1,
          });
        }

        geometry.dispose();
        geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3).setUsage(THREE.DynamicDrawUsage));
        geometry.setAttribute('normal', new THREE.BufferAttribute(normalArray, 3).setUsage(THREE.DynamicDrawUsage));
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2).setUsage(THREE.DynamicDrawUsage));
        geometry.setAttribute('aLane', new THREE.BufferAttribute(laneArray, 1));
        geometry.setIndex(indices);
      };

      const renderTextToTexture = () => {
        const p = getProps();
        const fontName = p.fontFamily && p.fontFamily !== 'inherit' ? p.fontFamily : win.getComputedStyle(container).fontFamily;
        const weight = Math.round(clamp(finiteOr(p.fontWeight, 700), 100, 900));
        const spacing = clamp(finiteOr(p.letterSpacing, 0.06), -0.2, 1);
        const scale = clamp(finiteOr(p.textScale, 0.5), 0.15, 0.95);
        const textStr = `${p.text ?? ''}${p.separator ?? ''}`;
        const sig = `${textStr}|${fontName}|${weight}|${spacing}|${scale}`;
        if (sig === textSignature) return;
        textSignature = sig;

        const ctx = textCanvas.getContext('2d');
        if (!ctx) return;

        const glyphs =
          textStr.length > 0
            ? typeof Intl !== 'undefined' && 'Segmenter' in Intl
              ? Array.from(new (Intl as any).Segmenter(undefined, { granularity: 'grapheme' }).segment(textStr), (e: any) => e.segment)
              : Array.from(textStr)
            : [' '];

        let fontSize = 120;
        const fontSpec = (size: number) => `${weight} ${size}px ${fontName}`;
        ctx.font = fontSpec(120);

        const measureWidth = (size: number) => {
          ctx.font = fontSpec(size);
          return glyphs.reduce((acc: number, g: any) => acc + ctx.measureText(g).width + spacing * size, 0);
        };

        let totalWidth = measureWidth(fontSize);
        if (totalWidth > 8000) {
          fontSize = Math.max(24, Math.floor((8000 * fontSize) / totalWidth));
          totalWidth = measureWidth(fontSize);
        }

        const canvasHeight = Math.round(fontSize / scale);
        textCanvas.width = Math.max(2, Math.ceil(totalWidth));
        textCanvas.height = Math.max(2, canvasHeight);

        ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);
        ctx.font = fontSpec(fontSize);
        ctx.fillStyle = '#fff';
        ctx.textBaseline = 'alphabetic';

        const baseline = canvasHeight / 2 + (ctx.measureText('H').actualBoundingBoxAscent || 0.7 * fontSize) / 2;
        let penX = (spacing * fontSize) / 2;
        for (const g of glyphs) {
          ctx.fillText(g as string, penX, baseline);
          penX += ctx.measureText(g as string).width + spacing * fontSize;
        }

        textAspect = textCanvas.width / textCanvas.height;
        textTexture.dispose();
        textTexture.needsUpdate = true;
      };

      const syncColors = () => {
        const p = getProps();
        const colorsArr = Array.isArray(p.colors) ? p.colors : [];
        let computedColor = '';
        const resolveColor = (cVal: string | undefined, defaultColor: string) => {
          const trimmed = (cVal ?? '').trim();
          if (trimmed && trimmed.toLowerCase() !== 'currentcolor') {
            return parseCssColor(trimmed, defaultColor);
          }
          if (!computedColor) {
            computedColor = win.getComputedStyle(container).color;
          }
          return parseCssColor(computedColor, defaultColor);
        };

        const band = resolveColor(colorsArr[0], '#5227FF');
        const ink = resolveColor(colorsArr[1], '#FFFFFF');
        const sig = `${band}|${ink}`;
        if (sig !== colorSignature) {
          colorSignature = sig;
          bandColor.setStyle(band);
          inkColor.setStyle(ink);
        }
      };

      const updateViewport = () => {
        const p = getProps();
        const rect = container.getBoundingClientRect();
        viewWidth = Math.max(1, rect.width);
        viewHeight = Math.max(1, rect.height);
        const dpr = Math.min(win.devicePixelRatio || 1, 2) * clamp(finiteOr(p.quality, 1), 0.5, 1);
        renderer.setPixelRatio(dpr);
        renderer.setSize(viewWidth, viewHeight, false);

        const fov = clamp(finiteOr(p.perspective, 32), 10, 80);
        camera.fov = fov;
        camera.aspect = viewWidth / viewHeight;
        camera.position.set(0, 0, viewHeight / 2 / Math.tan((fov * Math.PI) / 360));
        camera.near = 1;
        camera.far = 6 * camera.position.z;
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
      };

      const computeCurvePoint = (lane: number, t: number, outArray: Float32Array, offset: number) => {
        const p = getProps();
        const amp = finiteOr(p.amplitude, 70);
        const freq = clamp(finiteOr(p.frequency, 1.1), 0, 6);
        const dep = finiteOr(p.depth, 120);
        const flowShift = simTime * clamp(finiteOr(p.flow, 0.35), -4, 4) + 1.9 * lane;
        const laneGap = finiteOr(p.gap, 120);
        const laneY = (lane - (currentRibbonCount - 1) / 2) * laneGap;

        if (p.path === 'loop') {
          const radius = Math.min(0.34 * viewWidth, 0.95 * viewHeight);
          const angle = -TWO_PI * t;
          outArray[offset] = radius * Math.cos(angle);
          outArray[offset + 1] = laneY + 0.35 * amp * Math.sin(2 * angle + flowShift);
          outArray[offset + 2] = radius * Math.sin(angle) + 0.15 * dep * Math.sin(3 * angle - flowShift);
          return;
        }

        const span = 1.3 * viewWidth;
        const paramX = ((t - 0.5) * span) / viewWidth;

        if (p.path === 'helix') {
          const angle = TWO_PI * freq * paramX + flowShift;
          const rad = 0.9 * Math.abs(amp) + 1;
          outArray[offset] = (t - 0.5) * span;
          outArray[offset + 1] = laneY + rad * Math.cos(angle);
          outArray[offset + 2] = rad * Math.sin(angle);
          return;
        }

        outArray[offset] = (t - 0.5) * span;
        outArray[offset + 1] = laneY + amp * Math.sin(TWO_PI * freq * paramX + flowShift);
        outArray[offset + 2] = dep * Math.sin(TWO_PI * freq * 0.5 * paramX + 0.6 * flowShift + 1.3 + lane);
      };

      const computeTwistAngle = (lane: number, lengthAtPoint: number, totalLength: number, isLoop: boolean, nowSec: number) => {
        const p = getProps();
        const baseOffset = simTime * clamp(finiteOr(p.twistSpeed, 0.12), -4, 4) * TWO_PI + 1.7 * lane;
        const waveParam = isLoop ? (2 * TWO_PI * lengthAtPoint) / totalLength : (lengthAtPoint / Math.max(1, viewWidth)) * Math.PI;
        let angle = TWO_PI * clamp(finiteOr(p.twist, 0.12), 0, 2) * Math.sin(waveParam + baseOffset);

        for (const tw of twistsList) {
          if (tw.lane !== lane) continue;
          const waveDist = (nowSec - tw.start) * 760;
          let dist = Math.abs(lengthAtPoint - tw.origin);
          if (isLoop) {
            dist = Math.min(dist, totalLength - dist);
          }
          angle += TWO_PI * smoothstep3((waveDist - dist) / 460);
        }
        return angle;
      };

      const spawnTwist = (lane: number, originDist: number, startTime: number) => {
        if (getProps().reduced) return;
        if (twistsList.length > 6) twistsList.shift();
        twistsList.push({ lane, origin: originDist, start: startTime });
      };

      const requestFrameIfNeeded = () => {
        if (!destroyed && isVisible && !animFrameId) {
          animFrameId = win.requestAnimationFrame(renderLoop);
        }
      };

      function renderLoop(timeMs: number) {
        animFrameId = 0;
        if (destroyed) return;

        const p = getProps();
        const delta = lastTime ? clamp((timeMs - lastTime) / 1000, 1 / 240, 0.05) : 1 / 60;
        lastTime = timeMs;

        const nowSec = performance.now() / 1000;
        const isPaused = p.reduced || p.paused;

        if (!hasMountedIntro) {
          hasMountedIntro = true;
          introStartTime = nowSec;
          nextAutoTwistTime = nowSec + Math.max(1.5, finiteOr(p.autoTwist, 0));
          if (p.intro && !p.reduced) {
            for (let r = 0; r < currentRibbonCount; r++) {
              spawnTwist(r, 0, nowSec + 0.12 * r);
            }
          }
        }

        if (!isPaused) {
          simTime += delta;
        }

        const targetHover = dragPointer.inside && !dragPointer.down ? clamp(finiteOr(p.hoverSpeed, 0.3), 0, 1) : 1;
        hoverMultiplier += (targetHover - hoverMultiplier) * (1 - Math.exp(-4 * delta));

        const dirSign = p.direction === 'right' ? -1 : 1;
        const effectiveSpeed = isPaused ? 0 : clamp(finiteOr(p.speed, 90), -2000, 2000) * dirSign * hoverMultiplier;

        if (!dragPointer.down) {
          dragVelocity *= Math.exp(-delta / 0.55);
        }

        scrollOffset += (effectiveSpeed + dragVelocity) * delta;

        const autoTwistInterval = finiteOr(p.autoTwist, 0);
        if (autoTwistInterval > 0 && !isPaused && nowSec >= nextAutoTwistTime) {
          nextAutoTwistTime = nowSec + Math.max(0.5, autoTwistInterval);
          const randLane = Math.floor(Math.random() * currentRibbonCount);
          const rib = ribbonsData[randLane];
          if (rib) spawnTwist(randLane, rib.total * (0.2 + 0.6 * Math.random()), nowSec);
        }

        for (let i = twistsList.length - 1; i >= 0; i--) {
          const tw = twistsList[i];
          const rib = ribbonsData[tw.lane];
          const span = rib ? (p.path === 'loop' ? rib.total / 2 : Math.max(tw.origin, rib.total - tw.origin)) : 0;
          if ((nowSec - tw.start) * 760 - span > 460) {
            twistsList.splice(i, 1);
          }
        }

        const opacityVal = p.intro && !p.reduced ? smoothstep3((nowSec - introStartTime) / 0.6) : 1;
        material.uniforms.uOpacity.value = opacityVal;
        material.uniforms.uBandOn.value = p.band ? 1 : 0;
        material.uniforms.uShading.value = clamp(finiteOr(p.shading, 0.6), 0, 1);
        material.uniforms.uSheen.value = clamp(finiteOr(p.sheen, 0.4), 0, 1);
        material.depthWrite = p.band;
        mesh.rotation.x = (clamp(finiteOr(p.tilt, -6), -80, 80) * Math.PI) / 180;

        // Update mesh geometry coordinates
        const halfWidth = clamp(finiteOr(p.ribbonWidth, 76), 8, 400) / 2;
        const isLoop = p.path === 'loop';

        for (let r = 0; r < currentRibbonCount; r++) {
          const rib = ribbonsData[r];
          const pts = rib.points;

          for (let s = 0; s <= currentSampleCount; s++) {
            computeCurvePoint(r, s / currentSampleCount, pts, 3 * s);
          }

          let accLen = 0;
          rib.lengths[0] = 0;
          for (let s = 1; s <= currentSampleCount; s++) {
            accLen += Math.hypot(
              pts[3 * s] - pts[3 * s - 3],
              pts[3 * s + 1] - pts[3 * s - 2],
              pts[3 * s + 2] - pts[3 * s - 1]
            );
            rib.lengths[s] = accLen;
          }
          rib.total = Math.max(1, accLen);

          const texSpan = 2 * halfWidth * textAspect;
          const repeatCount = isLoop ? Math.max(1, Math.round(rib.total / texSpan)) : 0;
          const unitScale = isLoop ? rib.total / repeatCount : texSpan;
          const laneBaseVertex = r * (currentSampleCount + 1) * 2;

          for (let s = 0; s <= currentSampleCount; s++) {
            const prevIdx = isLoop ? (s === 0 ? currentSampleCount - 1 : s - 1) : Math.max(0, s - 1);
            const nextIdx = isLoop ? (s === currentSampleCount ? 1 : s + 1) : Math.min(currentSampleCount, s + 1);

            let tanX = pts[3 * nextIdx] - pts[3 * prevIdx];
            let tanY = pts[3 * nextIdx + 1] - pts[3 * prevIdx + 1];
            let tanZ = pts[3 * nextIdx + 2] - pts[3 * prevIdx + 2];
            const tanLen = Math.hypot(tanX, tanY, tanZ) || 1;
            tanX /= tanLen;
            tanY /= tanLen;
            tanZ /= tanLen;

            let guideX = 0;
            let guideY = 0;
            let guideZ = 1;

            if (p.path === 'loop') {
              const theta = (-TWO_PI * s) / currentSampleCount;
              guideX = Math.cos(theta);
              guideY = 0;
              guideZ = Math.sin(theta);
            } else if (p.path === 'helix') {
              guideX = 0;
              guideY = pts[3 * s + 1] - (r - (currentRibbonCount - 1) / 2) * finiteOr(p.gap, 120);
              guideZ = pts[3 * s + 2];
              const gLen = Math.hypot(guideY, guideZ) || 1;
              guideY /= gLen;
              guideZ /= gLen;
            }

            const dotGT = guideX * tanX + guideY * tanY + guideZ * tanZ;
            let normX = guideX - dotGT * tanX;
            let normY = guideY - dotGT * tanY;
            let normZ = guideZ - dotGT * tanZ;
            const normLen = Math.hypot(normX, normY, normZ) || 1;
            normX /= normLen;
            normY /= normLen;
            normZ /= normLen;

            const binormX = normY * tanZ - normZ * tanY;
            const binormY = normZ * tanX - normX * tanZ;
            const binormZ = normX * tanY - normY * tanX;

            const twistRad = computeTwistAngle(r, rib.lengths[s], rib.total, isLoop, nowSec);
            const cosT = Math.cos(twistRad);
            const sinT = Math.sin(twistRad);

            const rotatedBinormX = cosT * binormX + sinT * normX;
            const rotatedBinormY = cosT * binormY + sinT * normY;
            const rotatedBinormZ = cosT * binormZ + sinT * normZ;

            const finalNormX = tanY * rotatedBinormZ - tanZ * rotatedBinormY;
            const finalNormY = tanZ * rotatedBinormX - tanX * rotatedBinormZ;
            const finalNormZ = tanX * rotatedBinormY - tanY * rotatedBinormX;

            const vertBase = (laneBaseVertex + 2 * s) * 3;
            const px = pts[3 * s];
            const py = pts[3 * s + 1];
            const pz = pts[3 * s + 2];

            posArray[vertBase] = px - rotatedBinormX * halfWidth;
            posArray[vertBase + 1] = py - rotatedBinormY * halfWidth;
            posArray[vertBase + 2] = pz - rotatedBinormZ * halfWidth;

            posArray[vertBase + 3] = px + rotatedBinormX * halfWidth;
            posArray[vertBase + 4] = py + rotatedBinormY * halfWidth;
            posArray[vertBase + 5] = pz + rotatedBinormZ * halfWidth;

            normalArray[vertBase] = finalNormX;
            normalArray[vertBase + 1] = finalNormY;
            normalArray[vertBase + 2] = finalNormZ;

            normalArray[vertBase + 3] = finalNormX;
            normalArray[vertBase + 4] = finalNormY;
            normalArray[vertBase + 5] = finalNormZ;

            const uCoord = (rib.lengths[s] - scrollOffset * (r % 2 === 1 ? -1 : 1)) / unitScale;
            const uvBase = (laneBaseVertex + 2 * s) * 2;
            uvArray[uvBase] = uCoord;
            uvArray[uvBase + 1] = 0;
            uvArray[uvBase + 2] = uCoord;
            uvArray[uvBase + 3] = 1;
          }
        }

        (geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
        (geometry.getAttribute('normal') as THREE.BufferAttribute).needsUpdate = true;
        (geometry.getAttribute('uv') as THREE.BufferAttribute).needsUpdate = true;

        renderer.render(scene, camera);

        if (!isPaused || Math.abs(dragVelocity) > 1 || twistsList.length > 0 || opacityVal < 1) {
          requestFrameIfNeeded();
        }
      }

      const onPointerEnter = () => {
        dragPointer.inside = true;
        requestFrameIfNeeded();
      };
      const onPointerLeave = () => {
        dragPointer.inside = false;
        requestFrameIfNeeded();
      };

      const onPointerDown = (e: PointerEvent) => {
        if (e.button !== 0 || dragPointer.down) return;
        if (e.target !== canvas && e.target !== container) return;
        dragPointer.down = true;
        dragPointer.id = e.pointerId;
        dragPointer.startX = e.clientX;
        dragPointer.startY = e.clientY;
        dragPointer.lastX = e.clientX;
        dragPointer.startAt = performance.now() / 1000;
        dragPointer.lastAt = dragPointer.startAt;
        dragPointer.moved = false;
        requestFrameIfNeeded();
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!dragPointer.down || e.pointerId !== dragPointer.id) return;
        const p = getProps();
        const deltaX = e.clientX - dragPointer.lastX;
        const nowSec = performance.now() / 1000;

        if (Math.hypot(e.clientX - dragPointer.startX, e.clientY - dragPointer.startY) > 6) {
          dragPointer.moved = true;
        }

        if (p.draggable && dragPointer.moved && e.pointerType !== 'touch') {
          const dirSign = p.direction === 'right' ? -1 : 1;
          scrollOffset -= deltaX * dirSign;
          const dt = Math.max(0.008, nowSec - dragPointer.lastAt);
          dragVelocity = 0.6 * dragVelocity + ((-deltaX / dt) * dirSign * 0.4);
          container.style.cursor = 'grabbing';
        }

        dragPointer.lastX = e.clientX;
        dragPointer.lastAt = nowSec;
        requestFrameIfNeeded();
      };

      const onPointerUp = (e: PointerEvent) => {
        if (!dragPointer.down || e.pointerId !== dragPointer.id) return;
        const p = getProps();
        dragPointer.down = false;
        container.style.cursor = '';

        if (performance.now() / 1000 - dragPointer.lastAt > 0.12) {
          dragVelocity = 0;
        }

        if (!dragPointer.moved && performance.now() / 1000 - dragPointer.startAt < 0.4 && p.clickTwist) {
          const rect = container.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const clickY = e.clientY - rect.top;
          let bestDist = Infinity;
          let bestLane = 0;
          let bestLength = 0;

          mesh.updateMatrixWorld();
          for (let r = 0; r < currentRibbonCount; r++) {
            const rib = ribbonsData[r];
            for (let s = 0; s <= currentSampleCount; s += 3) {
              tempProjVec
                .set(rib.points[3 * s], rib.points[3 * s + 1], rib.points[3 * s + 2])
                .applyMatrix4(mesh.matrixWorld)
                .project(camera);

              const screenX = (0.5 * tempProjVec.x + 0.5) * viewWidth;
              const screenY = (0.5 - 0.5 * tempProjVec.y) * viewHeight;
              const dist = Math.hypot(screenX - clickX, screenY - clickY) - (tempProjVec.z < 1 ? 0 : 1e6);
              if (dist < bestDist) {
                bestDist = dist;
                bestLane = r;
                bestLength = rib.lengths[s];
              }
            }
          }
          spawnTwist(bestLane, bestLength, performance.now() / 1000);
        }
        requestFrameIfNeeded();
      };

      container.addEventListener('pointerenter', onPointerEnter);
      container.addEventListener('pointerleave', onPointerLeave);
      container.addEventListener('pointerdown', onPointerDown);
      win.addEventListener('pointermove', onPointerMove, { passive: true });
      win.addEventListener('pointerup', onPointerUp);
      win.addEventListener('pointercancel', onPointerUp);

      const resizeObs = new ResizeObserver(() => {
        updateViewport();
        requestFrameIfNeeded();
      });
      resizeObs.observe(container);

      const interObs = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          lastTime = 0;
          requestFrameIfNeeded();
        } else if (animFrameId) {
          win.cancelAnimationFrame(animFrameId);
          animFrameId = 0;
        }
      });
      interObs.observe(container);

      rebuildMeshBuffers();
      syncColors();
      renderTextToTexture();
      updateViewport();

      if (doc.fonts && doc.fonts.ready) {
        doc.fonts.ready.then(() => {
          if (!destroyed) {
            textSignature = '';
            renderTextToTexture();
            requestFrameIfNeeded();
          }
        });
      }

      return {
        sync: () => {
          rebuildMeshBuffers();
          syncColors();
          renderTextToTexture();
          updateViewport();
          requestFrameIfNeeded();
        },
        twist: (pos?: number) => {
          const rib = ribbonsData[0];
          if (!rib) return;
          const fraction = typeof pos === 'number' && Number.isFinite(pos) ? clamp(pos, 0, 1) : 0.5;
          spawnTwist(0, rib.total * fraction, performance.now() / 1000);
          requestFrameIfNeeded();
        },
        replay: () => {
          hasMountedIntro = false;
          twistsList.length = 0;
          requestFrameIfNeeded();
        },
        destroy: () => {
          destroyed = true;
          if (animFrameId) win.cancelAnimationFrame(animFrameId);
          resizeObs.disconnect();
          interObs.disconnect();
          container.removeEventListener('pointerenter', onPointerEnter);
          container.removeEventListener('pointerleave', onPointerLeave);
          container.removeEventListener('pointerdown', onPointerDown);
          win.removeEventListener('pointermove', onPointerMove);
          win.removeEventListener('pointerup', onPointerUp);
          win.removeEventListener('pointercancel', onPointerUp);
          geometry.dispose();
          material.dispose();
          textTexture.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
          canvas.remove();
        },
      };
    };

    const instance = initEngine(el, propsRef);
    instanceRef.current = instance;

    return () => {
      instance?.destroy();
      instanceRef.current = null;
    };
  }, []);

  useImperativeHandle(
    forwardedRef,
    () => ({
      twist: (pos?: number) => instanceRef.current?.twist(pos),
      replay: () => instanceRef.current?.replay(),
    }),
    []
  );

  return (
    <div
      ref={containerRef}
      role={text ? 'img' : undefined}
      aria-label={text || undefined}
      className={cn('relative isolate h-full min-h-0 w-full overflow-hidden', className)}
      style={{ touchAction: 'pan-y', ...style }}
    >
      {children && <div className="relative z-10 h-full w-full pointer-events-none">{children}</div>}
    </div>
  );
});

export default RibbonType;
