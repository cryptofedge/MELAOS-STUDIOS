'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// ─────────────────────────────────────────────────────────────────────────
// The home page's 3D piece: the MELAOS logo taken apart and rebuilt in space.
// A circle of sound bars (the logo's waveform) pulses to a dembow pattern,
// and a chrome ring (the logo's orbit) mirrors them. The "M" itself is laid
// over the canvas in the page, so the logo keeps its exact colors.
//
// Rendering follows the cinematic recipe in the Tesana skill:
//   ACES tone mapping, a bloom pass with a high threshold so only the loud
//   peaks glow, a warm/cool grade after the output pass, the scene captured
//   into a cube map and used as the chrome's reflection, instancing for the
//   bars, and quality tiers so phones and old laptops stay smooth.
// ─────────────────────────────────────────────────────────────────────────

type Tier = { name: 'low' | 'medium' | 'high'; pixelRatio: number; bars: number; bloom: boolean; envSize: number; envEvery: number; dust: number };

function pickTier(): Tier {
  const dpr = window.devicePixelRatio || 1;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as any).deviceMemory as number | undefined;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 600;
  if ((memory !== undefined && memory <= 3) || cores <= 4 || (coarse && small && dpr >= 3 && cores <= 6)) {
    return { name: 'low', pixelRatio: 1, bars: 64, bloom: false, envSize: 64, envEvery: 0, dust: 120 };
  }
  if (coarse || cores <= 8) {
    return { name: 'medium', pixelRatio: Math.min(dpr, 1.5), bars: 96, bloom: true, envSize: 128, envEvery: 10, dust: 220 };
  }
  return { name: 'high', pixelRatio: Math.min(dpr, 1.75), bars: 128, bloom: true, envSize: 256, envEvery: 4, dust: 320 };
}

// Warm highlights, cool shadows. Applied after the output pass.
const GradeShader = {
  uniforms: { tDiffuse: { value: null as THREE.Texture | null }, amount: { value: 0.85 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float amount; varying vec2 vUv;
    void main(){
      vec4 t = texture2D(tDiffuse, vUv);
      vec3 c = t.rgb;
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      vec3 cool = c * vec3(0.94, 0.99, 1.08);
      vec3 warm = c * vec3(1.06, 1.0, 0.93);
      vec3 graded = mix(cool, warm, smoothstep(0.12, 0.8, l));
      gl_FragColor = vec4(mix(c, graded, amount), t.a);
    }`,
};

const BRAND = [new THREE.Color('#F28C28'), new THREE.Color('#E91E8C'), new THREE.Color('#AE06ED')];
function brandAt(t: number, out: THREE.Color) {
  // 0..1 around the ring: orange → pink → magenta → back to orange.
  const x = ((t % 1) + 1) % 1 * 3;
  const i = Math.floor(x);
  return out.copy(BRAND[i % 3]).lerp(BRAND[(i + 1) % 3], x - i);
}

export default function HeroScene({ className = '' }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    } catch {
      return; // No WebGL: the page's CSS backdrop stays.
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let tier = pickTier();

    renderer.setPixelRatio(tier.pixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x050507, 1);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050507);
    scene.fog = new THREE.Fog(0x050507, 12, 28);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    const target = new THREE.Vector3(0, 0.55, 0);

    // ── Sound ring: instanced bars ─────────────────────────────────────
    const RADIUS = 2.6;
    const barGeo = new THREE.BoxGeometry(0.05, 1, 0.05);
    barGeo.translate(0, 0.5, 0);
    const barMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: true });
    const bars = new THREE.InstancedMesh(barGeo, barMat, tier.bars);
    bars.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const baseColors: THREE.Color[] = [];
    const tmpColor = new THREE.Color();
    for (let i = 0; i < tier.bars; i++) {
      baseColors.push(brandAt(i / tier.bars, new THREE.Color()));
      bars.setColorAt(i, baseColors[i]);
    }
    scene.add(bars);

    // Mirror of the bars on the floor: same instances, flipped, faint.
    const echoMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16, depthWrite: false });
    const echo = new THREE.InstancedMesh(barGeo, echoMat, tier.bars);
    echo.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < tier.bars; i++) echo.setColorAt(i, baseColors[i]);
    scene.add(echo);

    // Floor: dark polished disc with a hairline circle.
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(7, 96),
      new THREE.MeshStandardMaterial({ color: 0x07070a, metalness: 0.85, roughness: 0.32 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.002;
    scene.add(floor);

    const ringLine = new THREE.Mesh(
      new THREE.RingGeometry(RADIUS + 0.35, RADIUS + 0.355, 160),
      new THREE.MeshBasicMaterial({ color: 0x33333f, side: THREE.DoubleSide }),
    );
    ringLine.rotation.x = -Math.PI / 2;
    ringLine.position.y = 0.001;
    scene.add(ringLine);

    // ── Chrome orbit rings, reflecting the scene ─────────────────────────
    const envTarget = new THREE.WebGLCubeRenderTarget(tier.envSize, { type: THREE.HalfFloatType });
    const cubeCam = new THREE.CubeCamera(0.1, 40, envTarget);
    cubeCam.position.set(0, 1.0, 0);
    scene.add(cubeCam);

    const chrome = new THREE.MeshPhysicalMaterial({
      color: 0xd9dbe4,
      metalness: 1,
      roughness: 0.06,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMap: envTarget.texture,
      envMapIntensity: 1.6,
    });
    const orbit = new THREE.Group();
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(3.25, 0.028, 24, 256), chrome);
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(3.42, 0.008, 12, 256), chrome);
    orbit.add(ringA, ringB);
    orbit.position.y = 1.15;
    orbit.rotation.set(Math.PI / 2 - 0.42, 0.18, 0);
    scene.add(orbit);

    // Soft light so the floor picks up some shape.
    scene.add(new THREE.HemisphereLight(0xbfd9ff, 0x2a1a10, 0.35));

    // ── Dust ─────────────────────────────────────────────────────────────
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(tier.dust * 3);
    for (let i = 0; i < tier.dust; i++) {
      const r = 1 + Math.random() * 6;
      const a = Math.random() * Math.PI * 2;
      dustPos[i * 3] = Math.cos(a) * r;
      dustPos[i * 3 + 1] = Math.random() * 4.5;
      dustPos[i * 3 + 2] = Math.sin(a) * r;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      color: 0xf2b27a, size: 0.018, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    scene.add(dust);

    // ── Post chain ───────────────────────────────────────────────────────
    let composer: EffectComposer | null = null;
    let bloom: UnrealBloomPass | null = null;
    const buildComposer = () => {
      composer?.dispose();
      composer = null;
      if (!tier.bloom) return;
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.5, 0.92);
      composer.addPass(bloom);
      composer.addPass(new OutputPass());
      composer.addPass(new ShaderPass(GradeShader));
    };
    buildComposer();

    // ── Sizing ───────────────────────────────────────────────────────────
    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      composer?.setSize(w, h);
      camera.aspect = w / h;
      // Narrow screens: pull back so the whole ring fits.
      const dist = camera.aspect < 0.9 ? 16.5 : camera.aspect < 1.3 ? 14 : 12.5;
      camera.userData.dist = dist;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // ── Pointer parallax ─────────────────────────────────────────────────
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    // ── Rhythm: a dembow bar at 116 BPM ──────────────────────────────────
    // Kick on every beat; snare on the tresillo (3+3+2) of each half bar.
    const BPM = 116;
    const STEP = 60 / BPM / 4; // a sixteenth note, in seconds
    const KICK = [0, 4, 8, 12];
    const SNARE = [3, 6, 11, 14];
    const env = (steps: number[], t: number, decay: number) => {
      const pos = (t / STEP) % 16;
      let v = 0;
      for (const s of steps) {
        const d = (pos - s + 16) % 16;
        v = Math.max(v, Math.exp(-d * decay));
      }
      return v;
    };

    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);

    const updateBars = (t: number) => {
      const kick = env(KICK, t, 0.9);
      const snare = env(SNARE, t, 1.4);
      const n = tier.bars;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        // A spectrum-like shape that slowly turns, plus the two drums
        // landing on opposite sides of the ring.
        const wave = 0.5 + 0.5 * Math.sin(a * 3 + t * 0.6) * Math.sin(a * 5 - t * 0.35);
        const kickSide = Math.pow(Math.max(0, Math.cos(a - t * 0.25)), 6);
        const snareSide = Math.pow(Math.max(0, Math.cos(a - t * 0.25 + Math.PI)), 6);
        const shimmer = 0.15 * Math.sin(t * 7 + i * 1.7) * Math.sin(t * 3.1 + i * 0.6);
        const level = Math.max(0.04, 0.18 + 0.55 * wave * 0.6 + kick * kickSide * 1.1 + snare * snareSide * 0.9 + shimmer * 0.4);
        const height = 0.08 + level * 1.15;

        p.set(Math.cos(a) * RADIUS, 0, Math.sin(a) * RADIUS);
        q.setFromAxisAngle(up, -a);
        s.set(1, height, 1);
        m.compose(p, q, s);
        bars.setMatrixAt(i, m);
        s.set(1, -height * 0.55, 1);
        m.compose(p, q, s);
        echo.setMatrixAt(i, m);

        // Loud bars push past 1.0 so the bloom pass catches them.
        tmpColor.copy(baseColors[i]).multiplyScalar(0.75 + level * 1.6);
        bars.setColorAt(i, tmpColor);
      }
      bars.instanceMatrix.needsUpdate = true;
      echo.instanceMatrix.needsUpdate = true;
      if (bars.instanceColor) bars.instanceColor.needsUpdate = true;
    };

    // Capture the scene into the cube map with the chrome hidden, so the
    // rings mirror the bars and the floor but not themselves.
    const captureEnv = () => {
      orbit.visible = false;
      cubeCam.update(renderer, scene);
      orbit.visible = true;
    };

    const draw = () => {
      if (composer) composer.render();
      else renderer.render(scene, camera);
    };

    // ── Loop ─────────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let frame = 0;
    let raf = 0;
    let running = false;
    let slowFrames = 0;
    let last = performance.now();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = now - last;
      last = now;
      const t = clock.getElapsedTime();

      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      const dist = camera.userData.dist ?? 12.5;
      const yaw = t * 0.06 + pointer.x * 0.25;
      camera.position.set(Math.sin(yaw) * dist, 4.4 - pointer.y * 0.6, Math.cos(yaw) * dist);
      camera.lookAt(target);

      updateBars(t);
      orbit.rotation.z = t * 0.12;
      dust.rotation.y = t * 0.02;

      if (tier.envEvery && frame % tier.envEvery === 0) captureEnv();
      draw();
      frame++;

      // If this device can't hold ~35 fps, step down once: no bloom, 1x pixels.
      if (frame > 30 && frame < 150) {
        if (dt > 28) slowFrames++;
        if (slowFrames > 40 && tier.name !== 'low') {
          tier = { ...tier, name: 'low', pixelRatio: 1, bloom: false, envEvery: 0 };
          renderer.setPixelRatio(1);
          buildComposer();
          resize();
        }
      }
    };

    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // First frame: build the reflections once, then draw.
    updateBars(0.4);
    captureEnv();
    camera.position.set(Math.sin(0.4) * (camera.userData.dist ?? 12.5), 4.4, Math.cos(0.4) * (camera.userData.dist ?? 12.5));
    camera.lookAt(target);
    draw();

    // Only animate while the hero is on screen and the tab is visible.
    const io = new IntersectionObserver(([entry]) => { entry.isIntersecting ? start() : stop(); }, { threshold: 0.01 });
    io.observe(mount);
    const onVisibility = () => { document.hidden ? stop() : start(); };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
      composer?.dispose();
      envTarget.dispose();
      scene.traverse(obj => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach(mm => {
          (mm as THREE.MeshBasicMaterial).map?.dispose();
          mm.dispose();
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden />;
}
