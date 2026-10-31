/**
 * Types for the plain-ESM studio module shared by the React viewer and the offline
 * render script (both must load it without a build step, so the implementation stays
 * a .mjs file and only its surface is declared here).
 */
import type { Object3D, Scene, PerspectiveCamera, WebGLRenderer, Texture } from 'three';

type Vec3 = [number, number, number];

export interface CameraView {
  azimuth: number;
  elevation: number;
  distance: number;
  target: Vec3;
  fov: number;
}

export declare const SCENE: {
  camera: CameraView;
  detail: { dial: CameraView; ports: CameraView };
  exposure: number;
  environmentIntensity: number;
  lights: {
    hemisphere: { sky: number; ground: number; intensity: number };
    key: { color: number; intensity: number; position: Vec3 };
    fill: { color: number; intensity: number; position: Vec3 };
    rim: { color: number; intensity: number; position: Vec3 };
  };
  ground: { radius: number; y: number; opacity: number };
};

export declare const PORT_POINTS: Array<{ id: string; label: string; mm: Vec3 }>;

export declare function toSceneSpace(mm: Vec3): Vec3;

export declare function createRenderer(
  THREE: unknown,
  canvas: HTMLCanvasElement,
  options: { ground: boolean },
): WebGLRenderer;

export declare function createStudio(
  THREE: unknown,
  scene: Scene,
  options: { ground: boolean; environment?: Texture | null },
): { shadowPlane: Object3D | null };

export declare function placeCamera(
  THREE: unknown,
  camera: PerspectiveCamera,
  view: CameraView,
): void;
