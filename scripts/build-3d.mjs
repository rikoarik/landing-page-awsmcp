#!/usr/bin/env node
/**
 * SolidCraft OBJ → optimised GLB pipeline for the AWSM landing page.
 *
 * SolidCraft exports geometry as OBJ plus a flat .mtl colour library. OBJ keeps no
 * PBR values and no browser-ready material grouping, so this script rebuilds the
 * mesh as a single GLB whose primitives carry the page's design tokens — the model
 * seen in the browser is the model that was verified in SolidCraft.
 *
 * It also normalises triangle winding against the CAD kernel's own outward vertex
 * normals, because a mixed-winding OBJ renders with black, culled faces in WebGL.
 *
 * Usage: node scripts/build-3d.mjs
 * Input : public/assets/3d/awsm-router/model.obj
 * Output: public/assets/3d/awsm-router/model.glb
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const ASSET = path.join(ROOT, 'public/assets/3d/awsm-router');
const OBJ = path.join(ASSET, 'model.obj');
const GLB = path.join(ASSET, 'model.glb');

/** Design tokens + the opaque PBR finishes authored in SolidCraft (appearance.assign). */
const MATERIALS = {
  Chassis: { color: '#E9E5D6', metallic: 0, roughness: 0.44, name: 'Chassis — warm paper composite' },
  Platter: { color: '#202320', metallic: 0.25, roughness: 0.45, name: 'Platter — anodised ink alloy' },
  Dial: { color: '#454B4E', metallic: 0.1, roughness: 0.5, name: 'Dial — graphite machined wheel' },
  CollarA: { color: '#FF6B42', metallic: 0.12, roughness: 0.42, name: 'Port collar — coral tool socket' },
  CollarB: { color: '#FF6B42', metallic: 0.12, roughness: 0.42, name: 'Port collar — coral tool socket' },
  CollarC: { color: '#FF6B42', metallic: 0.12, roughness: 0.42, name: 'Port collar — coral tool socket' },
  CollarD: { color: '#FF6B42', metallic: 0.12, roughness: 0.42, name: 'Port collar — coral tool socket' },
  IndexPin: { color: '#F4F34C', metallic: 0.02, roughness: 0.45, name: 'Index pin — acid indicator' },
  LabelPlate: { color: '#F4F34C', metallic: 0.02, roughness: 0.45, name: 'Label plate — acid inlay' },
  StatusLens: { color: '#B9ECF0', metallic: 0, roughness: 0.2, name: 'Status lens — cyan signal' },
};

const srgbToLinear = (channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
const linearColor = (hex) => {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((offset) => srgbToLinear(parseInt(value.slice(offset, offset + 2), 16) / 255));
};

/** Parse OBJ into per-material triangle lists that keep their OBJ vertex/normal ids. */
function parseObj(text) {
  const positions = [];
  const normals = [];
  const groups = new Map(); // material → [ [ [pi, ni] x3 ] ]
  let current = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('v ')) {
      const [, x, y, z] = line.split(/\s+/);
      positions.push([Number(x), Number(y), Number(z)]);
    } else if (line.startsWith('vn ')) {
      const [, x, y, z] = line.split(/\s+/);
      normals.push([Number(x), Number(y), Number(z)]);
    } else if (line.startsWith('usemtl ')) {
      const material = line.slice(7).trim();
      if (!groups.has(material)) groups.set(material, []);
      current = groups.get(material);
    } else if (line.startsWith('f ')) {
      if (!current) throw new Error('Face before usemtl; cannot attribute a material.');
      const refs = line.slice(2).trim().split(/\s+/).map((token) => {
        const [p, , n] = token.split('/');
        const pi = p.startsWith('-') ? positions.length + Number(p) : Number(p) - 1;
        const ni = n === undefined ? -1 : n.startsWith('-') ? normals.length + Number(n) : Number(n) - 1;
        return [pi, ni];
      });
      // Fan triangulation: SolidCraft writes convex B-rep faces.
      for (let i = 1; i + 1 < refs.length; i++) current.push([refs[0], refs[i], refs[i + 1]]);
    }
  }
  return { positions, normals, groups };
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function buildGlb({ positions, normals, groups }) {
  // SolidCraft is Z-up in millimetres; glTF is Y-up in metres.
  const scale = 0.001;
  // Centre on the bounding box, not the vertex mean: B-rep exports weight dense
  // regions (filleted rims, patterned dimples) far more heavily, which would push
  // the part off-centre in the frame.
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (const [, tris] of groups) {
    for (const tri of tris) {
      for (const [pi] of tri) {
        const p = positions[pi];
        if (p[0] < minX) minX = p[0];
        if (p[0] > maxX) maxX = p[0];
        if (p[1] < minY) minY = p[1];
        if (p[1] > maxY) maxY = p[1];
        if (p[2] < minZ) minZ = p[2];
        if (p[2] > maxZ) maxZ = p[2];
      }
    }
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const cz = (minZ + maxZ) / 2;
  const toGl = (p) => [(p[0] - cx) * scale, (p[2] - cz) * scale, -(p[1] - cy) * scale];

  const bin = [];
  let binLength = 0;
  const bufferViews = [];
  const accessors = [];
  const meshes = [];
  const materials = [];
  const nodes = [];
  let flipped = 0;

  const pushView = (buffer, target) => {
    const padding = (4 - (binLength % 4)) % 4;
    if (padding) { bin.push(Buffer.alloc(padding)); binLength += padding; }
    bufferViews.push({ buffer: 0, byteOffset: binLength, byteLength: buffer.byteLength, target });
    bin.push(buffer);
    binLength += buffer.byteLength;
    return bufferViews.length - 1;
  };

  for (const [materialName, tris] of groups) {
    const spec = MATERIALS[materialName];
    if (!spec) throw new Error(`No design token mapped for material "${materialName}".`);

    const vertices = [];
    const lookup = new Map();
    const indices = [];
    const vertex = (pi, ni) => {
      const key = `${pi}/${ni}`;
      const cached = lookup.get(key);
      if (cached !== undefined) return cached;
      const index = vertices.length / 6;
      const p = toGl(positions[pi]);
      const raw = ni >= 0 ? normals[ni] : [0, 0, 1];
      // Rotate the normal with the same axis swap, then re-normalise.
      const normal = [(raw[0]) * scale, (raw[2]) * scale, -(raw[1]) * scale];
      const length = Math.hypot(...normal) || 1;
      vertices.push(p[0], p[1], p[2], normal[0] / length, normal[1] / length, normal[2] / length);
      lookup.set(key, index);
      return index;
    };

    for (const tri of tris) {
      let [a, b, c] = tri;
      if (a[1] >= 0 && b[1] >= 0 && c[1] >= 0) {
        const pa = positions[a[0]], pb = positions[b[0]], pc = positions[c[0]];
        const geometric = cross(sub(pb, pa), sub(pc, pa));
        const average = [0, 1, 2].map((axis) => normals[a[1]][axis] + normals[b[1]][axis] + normals[c[1]][axis]);
        if (dot(geometric, average) < 0) { const swap = b; b = c; c = swap; flipped++; }
      }
      indices.push(vertex(a[0], a[1]), vertex(b[0], b[1]), vertex(c[0], c[1]));
    }

    const count = vertices.length / 6;
    const position = new Float32Array(count * 3);
    const normal = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      position[i * 3] = vertices[i * 6];
      position[i * 3 + 1] = vertices[i * 6 + 1];
      position[i * 3 + 2] = vertices[i * 6 + 2];
      normal[i * 3] = vertices[i * 6 + 3];
      normal[i * 3 + 1] = vertices[i * 6 + 4];
      normal[i * 3 + 2] = vertices[i * 6 + 5];
    }
    const index = new Uint32Array(indices);

    const positionView = pushView(Buffer.from(position.buffer), 34962);
    const normalView = pushView(Buffer.from(normal.buffer), 34962);
    const indexView = pushView(Buffer.from(index.buffer), 34963);

    const bounds = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
    for (let i = 0; i < position.length; i += 3) {
      for (let axis = 0; axis < 3; axis++) {
        bounds.min[axis] = Math.min(bounds.min[axis], position[i + axis]);
        bounds.max[axis] = Math.max(bounds.max[axis], position[i + axis]);
      }
    }

    accessors.push(
      { bufferView: positionView, componentType: 5126, count, type: 'VEC3', min: bounds.min, max: bounds.max },
      { bufferView: normalView, componentType: 5126, count, type: 'VEC3' },
      { bufferView: indexView, componentType: 5125, count: index.length, type: 'SCALAR' },
    );
    const accessorBase = accessors.length - 3;

    materials.push({
      name: spec.name,
      doubleSided: false,
      pbrMetallicRoughness: {
        baseColorFactor: [...linearColor(spec.color), 1],
        metallicFactor: spec.metallic,
        roughnessFactor: spec.roughness,
      },
    });

    meshes.push({
      name: `${materialName}Mesh`,
      primitives: [{
        attributes: { POSITION: accessorBase, NORMAL: accessorBase + 1 },
        indices: accessorBase + 2,
        material: materials.length - 1,
      }],
    });
    nodes.push({ name: materialName, mesh: meshes.length - 1 });
  }

  const binary = Buffer.concat(bin);
  const gltf = {
    asset: { version: '2.0', generator: 'awsm-site/scripts/build-3d.mjs (SolidCraft OBJ → GLB)' },
    scene: 0,
    scenes: [{ name: 'AWSM Router', nodes: nodes.map((_, index) => index) }],
    nodes,
    meshes,
    materials,
    accessors,
    bufferViews,
    buffers: [{ byteLength: binary.byteLength }],
  };

  const jsonChunk = Buffer.from(JSON.stringify(gltf), 'utf8');
  const jsonPadded = Buffer.concat([jsonChunk, Buffer.alloc((4 - (jsonChunk.byteLength % 4)) % 4, 0x20)]);
  const binPadded = Buffer.concat([binary, Buffer.alloc((4 - (binary.byteLength % 4)) % 4)]);

  const total = 12 + 8 + jsonPadded.byteLength + 8 + binPadded.byteLength;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0); // 'glTF'
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(total, 8);
  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonPadded.byteLength, 0);
  jsonHeader.writeUInt32LE(0x4e4f534a, 4); // 'JSON'
  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(binPadded.byteLength, 0);
  binHeader.writeUInt32LE(0x004e4942, 4); // 'BIN'

  return { glb: Buffer.concat([header, jsonHeader, jsonPadded, binHeader, binPadded]), gltf, flipped, centre: [cx, cy, cz] };
}

const text = await fs.readFile(OBJ, 'utf8');
const parsed = parseObj(text);
const { glb, gltf, flipped, centre } = buildGlb(parsed);
await fs.writeFile(GLB, glb);

/**
 * Socket anchors for the page's interactive markers. They are computed here, with
 * the same millimetre → scene transform the mesh used, so the browser never has to
 * re-derive (or guess) the offset.
 */
const SOCKETS_MM = [
  { id: 'context', mm: [-36, -45.8, 13] },
  { id: 'assets', mm: [-12, -45.8, 13] },
  { id: 'handoff', mm: [12, -45.8, 13] },
  { id: 'qa', mm: [36, -45.8, 13] },
];
const toScene = (mm) => [
  (mm[0] - centre[0]) * 0.001,
  (mm[2] - centre[2]) * 0.001,
  -(mm[1] - centre[1]) * 0.001,
];
await fs.writeFile(
  path.join(ASSET, 'model.json'),
  `${JSON.stringify({
    name: 'awsm-router',
    source: 'SolidCraft awsm-router.sc',
    units: { model: 'mm', scene: 'm' },
    centreMm: centre.map((value) => Number(value.toFixed(3))),
    sockets: SOCKETS_MM.map((socket) => ({ id: socket.id, scene: toScene(socket.mm).map((value) => Number(value.toFixed(4))) })),
    mesh: { triangles: [...parsed.groups.values()].reduce((total, tris) => total + tris.length, 0), materials: gltf.materials.length },
  }, null, 2)}\n`,
);

const triangles = [...parsed.groups.values()].reduce((total, tris) => total + tris.length, 0);
console.log(`materials: ${gltf.materials.length} | triangles: ${triangles} | winding corrected: ${flipped}`);
console.log(`wrote ${path.relative(ROOT, GLB)} — ${(glb.byteLength / 1024).toFixed(1)} KiB`);
