import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface EntropyLogo3DProps {
  className?: string;
  autoRotateSpeed?: number; // radians per second
  scaleMultiplier?: number;
}

/**
 * ENTROPY 3D LOGO COMPONENT
 * 
 * Renders the brand's four-slice circular 3D emblem inside the hero wordmark O slot.
 * Features:
 * - Direct WebGL rendering with Three.js (preserving original geometry and PBR materials).
 * - High-contrast studio lighting & RoomEnvironment reflections for true metallic chrome sheen.
 * - Exact geometrical centering around the circular pivot for seamless Z-axis spinning.
 * - Continuous smooth automatic rotation around the Z-axis.
 * - Horizontal pointer/touch drag interaction with velocity tracking.
 * - Inertial release easing: smoothly decays back to auto-rotation with zero abrupt jumps.
 * - Non-interfering interaction (`touch-action: none`, preventDefault on drag).
 */
export const EntropyLogo3D: React.FC<EntropyLogo3DProps> = ({
  className = '',
  autoRotateSpeed = 0.55, // steady, elegant Y-axis rotation (turns horizontally like a 3D coin)
  scaleMultiplier = 1.0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const pivotGroupRef = useRef<THREE.Group | null>(null);
  const baseFitScaleRef = useRef<number>(2.0);

  // References for animation and interaction state
  const stateRef = useRef({
    isDragging: false,
    lastPointerX: 0,
    lastPointerTime: 0,
    currentRotationY: 0,
    currentVelocityY: autoRotateSpeed,
    targetAutoSpeed: autoRotateSpeed,
    pointerId: null as number | null,
  });

  // Keep targetAutoSpeed updated if prop changes
  useEffect(() => {
    stateRef.current.targetAutoSpeed = autoRotateSpeed;
  }, [autoRotateSpeed]);

  // Dynamically update pivotGroup scale when scaleMultiplier changes without recreating WebGL context
  useEffect(() => {
    if (pivotGroupRef.current) {
      const s = baseFitScaleRef.current * scaleMultiplier;
      pivotGroupRef.current.scale.set(s, s, s);
    }
  }, [scaleMultiplier]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let pivotGroup: THREE.Group | null = null;
    let pmremGenerator: THREE.PMREMGenerator | null = null;
    let envMapTexture: THREE.Texture | null = null;
    let disposed = false;

    // WebGL Context Lost & Restored Handlers
    const onContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(animationFrameId);
    };

    const onContextRestored = () => {
      setLoadError(null);
    };

    // 1. Scene setup
    scene = new THREE.Scene();

    // 2. Camera setup
    const width = container.clientWidth || 100;
    const height = container.clientHeight || 100;
    camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 2.7);

    // 3. WebGL Renderer
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.pointerEvents = 'none';

      renderer.domElement.addEventListener('webglcontextlost', onContextLost);
      renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

      container.appendChild(renderer.domElement);

      // 4. Studio Environment for Chrome Reflections
      pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();
      const roomEnv = new RoomEnvironment();
      const envMap = pmremGenerator.fromScene(roomEnv, 0.04);
      envMapTexture = envMap.texture;
      scene.environment = envMapTexture;
    } catch (err) {
      console.warn('WebGL context unavailable for 3D logo, using fallback', err);
      setLoadError('WebGL unavailable');
      return;
    }

    // Studio Lights for specular brilliance on chrome bevels
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Key light (top-left front)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(2.5, 3.5, 3.0);
    scene.add(keyLight);

    // Rim specular light (bottom-right front)
    const rimLight = new THREE.DirectionalLight(0xdde6f5, 1.8);
    rimLight.position.set(-2.5, -2.5, 2.5);
    scene.add(rimLight);

    // Head-on fill light for center emblem clarity
    const fillLight = new THREE.DirectionalLight(0xffffff, 1.2);
    fillLight.position.set(0, 0, 4.0);
    scene.add(fillLight);

    // Rear key light for back face brilliance during 360 Y-axis rotation
    const backKeyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    backKeyLight.position.set(-2.5, 3.0, -3.5);
    scene.add(backKeyLight);

    // Rear rim specular light
    const backRimLight = new THREE.DirectionalLight(0xdde6f5, 1.8);
    backRimLight.position.set(2.5, -2.5, -3.0);
    scene.add(backRimLight);

    // 6. Pivot Group for accurate centered rotation
    pivotGroup = new THREE.Group();
    scene.add(pivotGroup);

    // 7. Load GLB Model
    const loader = new GLTFLoader();
    // Support URL-encoded primary filename and clean fallback
    const primaryUrl = '/circle%20four-slice%20logo%203d%20model.glb';
    const fallbackUrl = '/models/entropy-logo.glb';

    const setupModel = (gltfScene: THREE.Group) => {
      if (disposed || !pivotGroup) return;

      // Calculate bounding box and geometric center
      const box = new THREE.Box3().setFromObject(gltfScene);
      const center = new THREE.Vector3();
      box.getCenter(center);
      const size = new THREE.Vector3();
      box.getSize(size);

      // Center model geometry at (0, 0, 0) inside pivotGroup
      gltfScene.position.set(-center.x, -center.y, -center.z);

      // Enhance material specular reflectivity while keeping original textures
      gltfScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          if (mesh.material) {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.envMapIntensity = 1.6;
                mat.roughness = Math.min(mat.roughness, 0.22);
                mat.metalness = Math.max(mat.metalness, 0.92);
                mat.side = THREE.DoubleSide; // Render both front and back on Y-axis 360 spin
                mat.needsUpdate = true;
              }
            });
          }
        }
      });

      // Fit scale naturally within the camera view frustum
      const maxDim = Math.max(size.x, size.y);
      const baseScale = maxDim > 0 ? 1.95 / maxDim : 2.0;
      baseFitScaleRef.current = baseScale;
      const fitScale = baseScale * scaleMultiplier;

      pivotGroup.scale.set(fitScale, fitScale, fitScale);
      pivotGroup.add(gltfScene);
      pivotGroupRef.current = pivotGroup;

      setIsLoaded(true);
    };

    loader.load(
      primaryUrl,
      (gltf) => {
        setupModel(gltf.scene);
      },
      undefined,
      (err) => {
        console.warn('Primary GLB URL load failed, trying fallback path...', err);
        loader.load(
          fallbackUrl,
          (fallbackGltf) => {
            setupModel(fallbackGltf.scene);
          },
          undefined,
          (fallbackErr) => {
            console.error('All GLB paths failed to load:', fallbackErr);
            if (!disposed) {
              setLoadError('Failed to load 3D logo model');
            }
          }
        );
      }
    );

    // 8. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!camera || !renderer) return;
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // 9. Animation render loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.05);
      const state = stateRef.current;

      if (pivotGroup) {
        if (!state.isDragging) {
          // Advance rotation by current velocity around Y-axis
          state.currentRotationY += state.currentVelocityY * delta;

          // Smoothly lerp velocity towards the target auto-rotate speed (no abrupt jumps)
          state.currentVelocityY = THREE.MathUtils.lerp(
            state.currentVelocityY,
            state.targetAutoSpeed,
            0.035
          );
        }

        // Apply Y-axis rotation
        pivotGroup.rotation.y = state.currentRotationY;
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };

    animate();

    const onWindowPointerUp = () => {
      const state = stateRef.current;
      if (state.isDragging) {
        state.isDragging = false;
        state.pointerId = null;
      }
    };
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerUp);

    // 10. Cleanup
    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerUp);

      if (pmremGenerator) {
        pmremGenerator.dispose();
      }
      if (envMapTexture) {
        envMapTexture.dispose();
      }

      if (pivotGroup) {
        pivotGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry?.dispose();
            if (mesh.material) {
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach((mat) => mat.dispose());
            }
          }
        });
      }

      if (renderer) {
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
        renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
        try {
          renderer.forceContextLoss();
        } catch {
          // ignore
        }
        renderer.dispose();
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
      pivotGroupRef.current = null;
    };
  }, []);

  // Pointer & Touch Drag Handlers
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Prevent default browser gestures like page selection / text dragging
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const state = stateRef.current;
    state.isDragging = true;
    state.pointerId = e.pointerId;
    state.lastPointerX = e.clientX;
    state.lastPointerTime = performance.now();
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const state = stateRef.current;
    if (!state.isDragging || state.pointerId !== e.pointerId) return;

    e.preventDefault();
    e.stopPropagation();

    const now = performance.now();
    const dt = Math.max(0.008, (now - state.lastPointerTime) / 1000);
    const dx = e.clientX - state.lastPointerX;

    // Horizontal drag sensitivity
    // Moving pointer to right rotates emblem around Y-axis
    const sensitivity = 0.015;
    const deltaAngle = dx * sensitivity;

    state.currentRotationY += deltaAngle;

    // Calculate instantaneous velocity with dampening
    const instantaneousVelocity = deltaAngle / dt;
    // Blend with previous velocity for smoother gesture response
    state.currentVelocityY = THREE.MathUtils.clamp(
      THREE.MathUtils.lerp(state.currentVelocityY, instantaneousVelocity, 0.4),
      -12,
      12
    );

    state.lastPointerX = e.clientX;
    state.lastPointerTime = now;
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const state = stateRef.current;
    if (state.pointerId === e.pointerId) {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          // ignore if already released
        }
      }
      state.isDragging = false;
      state.pointerId = null;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Interactive ENTROPY 3D Emblem"
      title="Drag horizontally to spin the 3D logo"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-full h-full cursor-grab active:cursor-grabbing select-none touch-none overflow-visible ${className}`}
      style={{
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Instant visual fallback: renders immediately so the hero 'o' slot is never empty */}
      {(!isLoaded || loadError) && (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center pointer-events-none p-[5%] transition-opacity duration-300"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]" fill="currentColor">
            <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.35" />
            <path d="M50 8 A42 42 0 0 1 92 50 L50 50 Z" opacity="0.95" />
            <path d="M92 50 A42 42 0 0 1 50 92 L50 50 Z" opacity="0.75" />
            <path d="M50 92 A42 42 0 0 1 8 50 L50 50 Z" opacity="0.9" />
            <path d="M8 50 A42 42 0 0 1 50 8 L50 50 Z" opacity="0.7" />
          </svg>
        </div>
      )}
    </div>
  );
};
