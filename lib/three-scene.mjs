/**
 * Shared studio setup for the AWSM Router 3D asset.
 *
 * Used by the React viewer (`components/router-scene.tsx`) and by the offline
 * verification/poster script (`scripts/render-3d.mjs`), so the frame verified before
 * shipping is produced by the same camera, lighting, environment and material
 * treatment that the browser actually renders.
 */

export const SCENE = {
  /** Product framing in metres (the GLB is converted from SolidCraft mm and centred). */
  camera: { azimuth: 0.68, elevation: 0.33, distance: 0.4, target: [0, 0, 0], fov: 26 },
  detail: {
    dial: { azimuth: 0.5, elevation: 0.66, distance: 0.15, target: [0, 0.008, 0], fov: 24 },
    ports: { azimuth: 0.02, elevation: 0.26, distance: 0.2, target: [0, 0.002, 0.05], fov: 26 },
  },
  exposure: 0.8,
  environmentIntensity: 0.35,
  lights: {
    hemisphere: { sky: 0xffffff, ground: 0x3a3f3a, intensity: 0.5 },
    key: { color: 0xfff4e2, intensity: 1.5, position: [1.6, 2.4, 1.4] },
    fill: { color: 0xdce7ff, intensity: 0.5, position: [-2.2, 1.1, 1.6] },
    rim: { color: 0xffffff, intensity: 1, position: [-0.8, 1.4, -2.4] },
  },
  ground: { radius: 0.42, y: -0.0196, opacity: 0.2 },
};

/**
 * Port collar centres in SolidCraft millimetres (Z-up, origin at the chassis centre).
 * The four machined sockets carry the model's product story: one body, four tool families.
 */
export const PORT_POINTS = [
  { id: 'context', label: 'Context', mm: [-36, -45.8, 13] },
  { id: 'assets', label: 'Assets', mm: [-12, -45.8, 13] },
  { id: 'handoff', label: 'Handoff', mm: [12, -45.8, 13] },
  { id: 'qa', label: 'Visual QA', mm: [36, -45.8, 13] },
];

/** SolidCraft millimetre (Z-up) → scene metres (Y-up), centred like the GLB pipeline. */
export function toSceneSpace(mm) {
  // The pipeline centres on the chassis bounding box: 124 × 86 × 38 mm at the origin.
  const centre = [0, 0, 19];
  return [(mm[0] - centre[0]) * 0.001, (mm[2] - centre[2]) * 0.001, -(mm[1] - centre[1]) * 0.001];
}

export function createRenderer(THREE, canvas, { ground }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = SCENE.exposure;
  renderer.shadowMap.enabled = Boolean(ground);
  // PCFSoftShadowMap was deprecated in three r186; PCF with a tuned bias reads the
  // same at this scale and avoids a console deprecation warning.
  renderer.shadowMap.type = THREE.PCFShadowMap;
  return renderer;
}

/**
 * Studio lighting plus an optional contact-shadow catcher.
 * `environment` is a pre-filtered PMREM texture (RoomEnvironment) supplied by the
 * caller, so this module never depends on an addon path.
 */
export function createStudio(THREE, scene, { ground, environment = null }) {
  const { lights, environmentIntensity, ground: groundSpec } = SCENE;

  scene.add(new THREE.HemisphereLight(lights.hemisphere.sky, lights.hemisphere.ground, lights.hemisphere.intensity));

  const addLight = (spec, shadow) => {
    const light = new THREE.DirectionalLight(spec.color, spec.intensity);
    light.position.set(...spec.position);
    if (shadow) {
      light.castShadow = true;
      light.shadow.mapSize.set(1024, 1024);
      light.shadow.camera.near = 0.2;
      light.shadow.camera.far = 6;
      light.shadow.bias = -0.0012;
      light.shadow.normalBias = 0.0016;
    }
    scene.add(light);
    return light;
  };
  addLight(lights.key, ground);
  addLight(lights.fill, false);
  addLight(lights.rim, false);

  if (environment) {
    scene.environment = environment;
    scene.environmentIntensity = environmentIntensity;
  }

  let shadowPlane = null;
  if (ground) {
    shadowPlane = new THREE.Mesh(
      new THREE.CircleGeometry(groundSpec.radius, 64),
      new THREE.ShadowMaterial({ color: 0x191c1a, opacity: groundSpec.opacity }),
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = groundSpec.y;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);
  }

  return { shadowPlane };
}

export function placeCamera(THREE, camera, view) {
  const { azimuth, elevation, distance, target, fov } = view;
  camera.fov = fov;
  camera.updateProjectionMatrix();
  camera.position.set(
    target[0] + Math.cos(elevation) * Math.sin(azimuth) * distance,
    target[1] + Math.sin(elevation) * distance,
    target[2] + Math.cos(elevation) * Math.cos(azimuth) * distance,
  );
  camera.lookAt(target[0], target[1], target[2]);
}
