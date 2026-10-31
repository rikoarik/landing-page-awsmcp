'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { Copy } from '@/lib/content';

/**
 * Interactive viewer for the AWSM Router — the SolidCraft model published through
 * AWSM, converted to GLB by scripts/build-3d.mjs and verified in Chromium by
 * scripts/render-3d.mjs.
 *
 * Design notes:
 * - Framing is fitted to the loaded geometry's bounding sphere, so it holds up on
 *   every aspect ratio instead of relying on a hard-coded camera distance.
 * - Socket markers are projected from the build script's own millimetre → scene
 *   transform and written straight to the DOM, so they stay glued to the machined
 *   collars without re-rendering React every frame.
 * - A single settle-in animates the part to its studio angle and then stops. The
 *   part never spins on its own, so the socket markers never move under the cursor.
 * - The mesh (~718 KB) loads only near the viewport, the render loop stops off
 *   screen, and WebGL, motion and pointer input are all treated as optional.
 */

type PortIndex = 0 | 1 | 2 | 3;

interface SceneApi {
  focus: (port: number | null) => void;
}

/** Socket anchors, emitted by scripts/build-3d.mjs in the mesh's own scene space. */
interface ModelMeta {
  sockets: Array<{ id: string; scene: [number, number, number] }>;
}

export function RouterScene({ t }: { t: Copy }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pinLayer = useRef<HTMLDivElement>(null);
  const captionBar = useRef<HTMLDivElement>(null);
  const api = useRef<SceneApi | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'fallback'>('idle');
  const [hovered, setHovered] = useState<PortIndex | null>(null);
  const [selected, setSelected] = useState<PortIndex | null>(null);
  const active = selected ?? hovered;
  const [pinCount, setPinCount] = useState(0);

  /** Hover only previews the caption; the camera does not move under the cursor. */
  const preview = useCallback((port: PortIndex | null) => setHovered(port), []);

  /** Clicking commits: the camera moves to that socket, or back home when cleared. */
  const focus = useCallback((port: PortIndex | null) => {
    setSelected(port);
    api.current?.focus(port);
  }, []);

  /** Selecting the same socket again returns the camera to the studio angle. */
  const toggle = useCallback((port: PortIndex) => {
    focus(selected === port ? null : port);
  }, [focus, selected]);

  useEffect(() => {
    const host = wrap.current;
    const element = canvas.current;
    if (!host || !element) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') ?? probe.getContext('webgl'))) {
      setState('fallback');
      return;
    }

    let cancelled = false;
    let teardown: (() => void) | null = null;

    const boot = async () => {
      setState('loading');
      try {
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
        const { SCENE, createRenderer, createStudio, placeCamera } = await import('@/lib/three-scene.mjs');
        if (cancelled) return;

        const renderer = createRenderer(THREE, element, { ground: true });
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(SCENE.camera.fov, 1, 0.01, 20);

        const pmrem = new THREE.PMREMGenerator(renderer);
        pmrem.compileEquirectangularShader();
        const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        createStudio(THREE, scene, { ground: true, environment });

        const gltf = await new GLTFLoader().loadAsync('/assets/3d/awsm-router/model.glb');
        if (cancelled) return;
        gltf.scene.traverse((object) => {
          const mesh = object as unknown as { isMesh?: boolean; castShadow?: boolean; receiveShadow?: boolean };
          if (!mesh.isMesh) return;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        });
        scene.add(gltf.scene);

        const meta: ModelMeta = await fetch('/assets/3d/awsm-router/model.json')
          .then((response) => (response.ok ? response.json() : { sockets: [] }))
          .catch(() => ({ sockets: [] }));
        if (cancelled) return;

        // Fit to the real geometry, against the area the caption bar does not cover.
        // On phones the caption wraps to two rows, so a fixed margin would crop the
        // part; measuring the visible box keeps it whole at every size.
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const sphere = box.getBoundingSphere(new THREE.Sphere());
        const fitFor = () => {
          const caption = captionBar.current?.offsetHeight ?? 0;
          const visibleHeight = Math.max(120, element.clientHeight - caption);
          const verticalFov = (SCENE.camera.fov * Math.PI) / 180;
          const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * (element.clientWidth / visibleHeight));
          const limiting = Math.min(verticalFov, horizontalFov);
          return (sphere.radius / Math.sin(limiting / 2)) * 1.06;
        };
        const fitDistance = fitFor();

        const home = {
          ...SCENE.camera,
          distance: fitDistance,
          target: [sphere.center.x, sphere.center.y, sphere.center.z] as [number, number, number],
        };
        // Selecting a socket pulls the camera in a little and swings it toward that
        // side, but never so far that the part is cropped: the framing stays whole.
        let closeUp = { distance: fitDistance * 0.8 };

        const socketPoints = meta.sockets.map((socket) => new THREE.Vector3(...socket.scene));

        // A single, short settle-in replaces a permanent auto-spin: the part arrives
        // at its studio angle once and then holds still. Constant rotation would move
        // the socket markers under the cursor and make them a moving target.
        // Reduced motion skips the settle-in entirely: the first frame is the final frame.
        const view = { ...home, azimuth: reduced.matches ? home.azimuth : home.azimuth + 0.42 };
        let spin = 0;
        let targetAzimuth = home.azimuth;
        let targetElevation = home.elevation;
        let targetDistance = home.distance;
        let targetFov = home.fov;
        let frame = 0;
        let disposed = false;
        let onScreen = false;

        const resize = () => {
          const { clientWidth, clientHeight } = element;
          if (!clientWidth || !clientHeight) return;
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          renderer.setSize(clientWidth, clientHeight, false);
          camera.aspect = clientWidth / clientHeight;
          // The caption bar sits on top of the canvas, so the visible picture area is
          // shorter than the canvas. Shifting the view window keeps the part centred in
          // what you can actually see instead of hiding its base behind the bar.
          // A positive offsetY renders a window lower in the frame, which moves the
          // subject up — exactly what is needed to clear the caption bar.
          const caption = captionBar.current?.offsetHeight ?? 0;
          if (caption > 0) camera.setViewOffset(clientWidth, clientHeight, 0, caption / 2, clientWidth, clientHeight);
          else camera.clearViewOffset();
          camera.updateProjectionMatrix();
          if (frame === 0 && onScreen) { publishPins(); renderer.render(scene, camera); }
        };
        resize();

        const projected = socketPoints.map(() => new THREE.Vector3());
        // The pin buttons are rendered by React after this effect resolves, so the
        // node list is resolved lazily and refreshed if the count changes.
        let nodes: HTMLElement[] = [];
        const publishPins = () => {
          if (nodes.length !== socketPoints.length) {
            nodes = pinLayer.current
              ? Array.from(pinLayer.current.querySelectorAll<HTMLElement>('[data-pin]')).sort(
                (a, b) => Number(a.dataset.pin) - Number(b.dataset.pin),
              )
              : [];
          }
          if (!nodes.length) return;
          for (let index = 0; index < nodes.length; index++) {
            const point = projected[index].copy(socketPoints[index]).project(camera);
            const node = nodes[index];
            const inFrame = point.z < 1 && Math.abs(point.x) < 1.05 && Math.abs(point.y) < 1.05;
            node.style.transform = `translate(-50%,-50%) translate(${(point.x * 0.5 + 0.5) * element.clientWidth}px, ${(-point.y * 0.5 + 0.5) * element.clientHeight}px)`;
            node.style.opacity = inFrame ? '1' : '0';
            node.style.pointerEvents = inFrame ? 'auto' : 'none';
          }
        };

        const EPSILON = 1e-5;
        const render = () => {
          if (disposed) return;
          view.azimuth += (targetAzimuth - view.azimuth) * 0.085;
          view.elevation += (targetElevation - view.elevation) * 0.085;
          view.distance += (targetDistance - view.distance) * 0.085;
          camera.fov += (targetFov - camera.fov) * 0.085;
          camera.updateProjectionMatrix();
          placeCamera(THREE, camera, view);
          renderer.render(scene, camera);
          publishPins();

          // Stop entirely once the camera has settled: still markers, no idle cost.
          const settled = Math.abs(targetAzimuth - view.azimuth) < EPSILON
            && Math.abs(targetElevation - view.elevation) < EPSILON
            && Math.abs(targetDistance - view.distance) < EPSILON
            && Math.abs(targetFov - camera.fov) < EPSILON;
          if (settled) { frame = 0; return; }
          frame = requestAnimationFrame(render);
        };
        const start = () => { if (!frame) frame = requestAnimationFrame(render); };
        const stop = () => { if (frame) { cancelAnimationFrame(frame); frame = 0; } };
        const wake = () => start();

        const visibility = new IntersectionObserver(([entry]) => {
          onScreen = entry.isIntersecting;
          if (onScreen) start(); else stop();
        }, { rootMargin: '180px' });
        visibility.observe(element);

        const onReducedChange = () => {
          if (!reduced.matches) wake();
        };
        reduced.addEventListener('change', onReducedChange);
        window.addEventListener('resize', resize);

        // Drag to orbit, clamped so the part never rolls under the floor.
        let pointer: { x: number; y: number; azimuth: number; elevation: number } | null = null;
        const down = (event: PointerEvent) => {
          if (event.pointerType === 'mouse' && event.button !== 0) return;
          element.setPointerCapture(event.pointerId);
          pointer = { x: event.clientX, y: event.clientY, azimuth: view.azimuth, elevation: view.elevation };
          targetAzimuth = view.azimuth;
          targetElevation = view.elevation;
        };
        const move = (event: PointerEvent) => {
          if (!pointer) return;
          const dx = (event.clientX - pointer.x) / element.clientWidth;
          const dy = (event.clientY - pointer.y) / element.clientHeight;
          targetAzimuth = pointer.azimuth - dx * 2.6;
          targetElevation = Math.max(-0.02, Math.min(1.02, pointer.elevation + dy * 1.3));
          wake();
        };
        const up = () => { pointer = null; };
        element.addEventListener('pointerdown', down);
        element.addEventListener('pointermove', move);
        element.addEventListener('pointerup', up);
        element.addEventListener('pointercancel', up);

        teardown = () => {
          disposed = true;
          stop();
          visibility.disconnect();
          reduced.removeEventListener('change', onReducedChange);
          window.removeEventListener('resize', resize);
          element.removeEventListener('pointerdown', down);
          element.removeEventListener('pointermove', move);
          element.removeEventListener('pointerup', up);
          element.removeEventListener('pointercancel', up);
          scene.traverse((object) => {
            const node = object as unknown as {
              geometry?: { dispose: () => void };
              material?: { dispose: () => void } | Array<{ dispose: () => void }>;
            };
            node.geometry?.dispose();
            const material = node.material;
            if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
            else material?.dispose();
          });
          environment.dispose();
          pmrem.dispose();
          renderer.dispose();
        };

        api.current = {
          focus: (port) => {
            if (port === null) {
              targetAzimuth = home.azimuth;
              targetElevation = home.elevation;
              targetDistance = home.distance;
              targetFov = home.fov;
            } else {
              targetAzimuth = home.azimuth - 0.22 + port * 0.15;
              targetElevation = home.elevation - 0.06;
              targetDistance = closeUp.distance;
              targetFov = home.fov;
            }
            wake();
          },
        };

        setPinCount(socketPoints.length);
        // Paint one frame before revealing, so pins never appear at the origin.
        renderer.render(scene, camera);
        publishPins();
        setState('ready');
        if (onScreen) start();
      } catch {
        if (!cancelled) setState('fallback');
      }
    };

    const loader = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      loader.disconnect();
      void boot();
    }, { rootMargin: '320px' });
    loader.observe(host);

    return () => {
      cancelled = true;
      loader.disconnect();
      api.current = null;
      teardown?.();
    };
  }, []);

  const interactive = state === 'ready';

  return (
    <div ref={wrap} className="router-stage" data-router-state={state}>
      <canvas
        ref={canvas}
        className="router-canvas"
        aria-label={t.routerLabel}
        role="img"
        tabIndex={interactive ? 0 : -1}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
          event.preventDefault();
          focus((((selected ?? 0) + (event.key === 'ArrowRight' ? 1 : 3)) % 4) as PortIndex);
        }}
      />

      {!interactive && (
        <Image
          src="/assets/3d/awsm-router/poster.webp"
          alt={t.routerFallback}
          width={1100}
          height={1100}
          sizes="(max-width: 950px) 92vw, 52vw"
          className="router-poster"
        />
      )}

      {state === 'loading' && (
        <p className="router-loading" role="status">
          <span aria-hidden="true" /> {t.routerNote}
        </p>
      )}

      {interactive && pinCount > 0 && (
        <div ref={pinLayer} className="router-pins" role="group" aria-label={t.routerLegend}>
          {t.ports.slice(0, pinCount).map((port, index) => (
            <button
              key={port.name}
              type="button"
              data-pin={index}
              className={`router-pin ${active === index ? 'is-active' : ''} ${selected === index ? 'is-selected' : ''}`}
              aria-pressed={selected === index}
              onMouseEnter={() => preview(index as PortIndex)}
              onMouseLeave={() => preview(null)}
              onBlur={() => preview(null)}
              onFocus={() => preview(index as PortIndex)}
              onClick={() => toggle(index as PortIndex)}
            >
              <span aria-hidden="true" className="router-pin-dot" />
              <span className="router-pin-label">0{index + 1} {port.name}</span>
            </button>
          ))}
        </div>
      )}

      <div ref={captionBar} className="router-caption" aria-live="polite">
        <span className="micro-label">{active === null ? t.routerLegend : `0${active + 1} ${t.ports[active].name}`}</span>
        <p>{active === null ? t.routerNote : t.ports[active].detail}</p>
        {selected !== null && (
          <button type="button" className="router-reset" onClick={() => focus(null)}>
            Reset view <span aria-hidden="true">↺</span>
          </button>
        )}
      </div>
    </div>
  );
}
