import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

/**
 * Guards the published 3D asset: the landing page claims specific numbers about the
 * SolidCraft model, and the interactive viewer depends on the GLB plus the anchor
 * metadata being present and consistent. If any of that drifts, the page would be
 * telling the truth about a file that no longer exists.
 */

const ASSET = 'public/assets/3d/awsm-router';

async function readGlb(file: string) {
  const buffer = await fs.readFile(file);
  assert.equal(buffer.readUInt32LE(0), 0x46546c67, 'GLB magic');
  assert.equal(buffer.readUInt32LE(4), 2, 'glTF version 2');
  assert.equal(buffer.readUInt32LE(8), buffer.byteLength, 'declared length matches file size');
  const jsonLength = buffer.readUInt32LE(12);
  assert.equal(buffer.readUInt32LE(16), 0x4e4f534a, 'first chunk is JSON');
  const json = JSON.parse(buffer.subarray(20, 20 + jsonLength).toString('utf8'));
  return { buffer, json };
}

test('the published GLB is a valid, single-scene glTF with 10 material primitives', async () => {
  const { buffer, json } = await readGlb(path.join(ASSET, 'model.glb'));
  assert.equal(json.asset.version, '2.0');
  assert.equal(json.scenes.length, 1);
  assert.equal(json.materials.length, 10);
  assert.equal(json.meshes.length, 10);
  assert.equal(json.nodes.length, 10);
  // Every primitive must carry positions, normals and indices, or it will not shade.
  for (const mesh of json.meshes) {
    for (const primitive of mesh.primitives) {
      assert.ok('POSITION' in primitive.attributes);
      assert.ok('NORMAL' in primitive.attributes);
      assert.equal(typeof primitive.indices, 'number');
      assert.equal(typeof primitive.material, 'number');
    }
  }
  // Opaque finishes only: the page does not claim glass or transmission.
  for (const material of json.materials) {
    assert.equal(material.pbrMetallicRoughness.baseColorFactor.length, 4);
    assert.equal(material.pbrMetallicRoughness.baseColorFactor[3], 1);
    assert.ok(!('KHR_materials_transmission' in (material.extensions ?? {})));
    assert.equal(material.alphaMode ?? 'OPAQUE', 'OPAQUE');
  }
  // Reasonable delivery size for a lazy-loaded hero model.
  assert.ok(buffer.byteLength < 1.5 * 1024 * 1024, `GLB is ${(buffer.byteLength / 1024).toFixed(0)} KiB`);
});

test('the GLB mesh matches the numbers the page now prints', async () => {
  const { json } = await readGlb(path.join(ASSET, 'model.glb'));
  const meta = JSON.parse(await fs.readFile(path.join(ASSET, 'model.json'), 'utf8'));
  const { seoCopy } = await import('../lib/seo-content.ts');
  const { v2 } = await import('../lib/content-v2.ts');

  interface Accessor { type: string; count: number }
  const accessors = json.accessors as Accessor[];
  const triangles = accessors
    .filter((accessor) => accessor.type === 'SCALAR')
    .reduce((total, accessor) => total + accessor.count / 3, 0);
  assert.equal(triangles, meta.mesh.triangles);
  assert.equal(meta.mesh.triangles, 25186);
  assert.equal(meta.mesh.materials, json.materials.length);

  // The V2 page states the envelope, bore pitch and dial size. Those were
  // re-measured from this OBJ because the design frame carried different
  // values (86 mm depth, Ø 42 mm dial, 12 mm pitch) than the model has.
  const output = execFileSync('python3', ['-c', `
import json
mn=[9e9]*3; mx=[-9e9]*3
for line in open('${ASSET}/model.obj'):
    if line.startswith('v '):
        p=[float(x) for x in line.split()[1:4]]
        for i in range(3):
            mn[i]=min(mn[i],p[i]); mx[i]=max(mx[i],p[i])
print(json.dumps([round(mx[i]-mn[i],2) for i in range(3)]))
`], { encoding: 'utf8' });
  const [width, depth, height] = JSON.parse(output) as [number, number, number];
  assert.equal(width, 124);
  assert.equal(height, 38);

  for (const locale of ['en', 'id'] as const) {
    const specs = v2[locale].solo.specs.map(([, value]) => value).join(' ');
    const decimal = locale === 'en' ? '.' : ',';
    assert.ok(specs.includes(`124 × 88${decimal}8 × 38`), `${locale} envelope must match the mesh`);
    assert.ok(/(24 MM PITCH|PITCH 24 MM)/.test(specs), `${locale} bore pitch must match the mesh`);
    assert.ok(/70[.,]9/.test(specs), `${locale} dial diameter must match the mesh`);
    // The frame's unverified figures must not survive into the page.
    assert.ok(!/86 × 24|Ø 42|4 DETENT/i.test(specs), `${locale} must not repeat the unverified frame numbers`);
    const heroSpec = v2[locale].hero.spec + ' ' + v2[locale].hero.dialNote;
    assert.ok(!/86 × 24|Ø 42|4 DETENT/i.test(heroSpec));
  }
  assert.ok(depth > 80 && depth < 95, `depth ${depth}`);
  assert.ok(seoCopy.en.facts.some(([, value]) => value.includes('24 typed tools')));
});

test('socket anchors are emitted in scene space and land on the collar ring', async () => {
  interface Socket { id: string; scene: [number, number, number] }
  const meta: { sockets: Socket[] } = JSON.parse(await fs.readFile(path.join(ASSET, 'model.json'), 'utf8'));
  assert.equal(meta.sockets.length, 4);
  assert.deepEqual(meta.sockets.map((socket) => socket.id), ['context', 'assets', 'handoff', 'qa']);
  for (const socket of meta.sockets) {
    assert.equal(socket.scene.length, 3);
    // The four collars sit on the front face at z = 13 mm, 12 mm apart in pairs.
    assert.ok(Math.abs(socket.scene[1] - -0.006) < 0.002, `${socket.id} height`);
    assert.ok(Math.abs(socket.scene[2] - 0.0444) < 0.002, `${socket.id} depth`);
  }
  const xs = meta.sockets.map((socket) => socket.scene[0]);
  assert.deepEqual(xs, [...xs].sort((a, b) => a - b), 'sockets ordered left to right');
  assert.ok(Math.abs(xs[1] - xs[0] - 0.024) < 0.001, 'socket pitch is 24 mm');
});

test('the poster and detail renders exist for the no-WebGL and below-the-fold paths', async () => {
  for (const file of ['poster.webp', 'detail-dial.webp', 'detail-ports.webp', 'preview.png']) {
    const stats = await fs.stat(path.join(ASSET, file));
    assert.ok(stats.size > 4 * 1024, `${file} should be a real image`);
  }
  const board = await fs.stat('public/assets/3d/figcraft-board.webp');
  assert.ok(board.size > 10 * 1024, 'the FigCraft board render should be a real image');
  // Source geometry is kept next to the optimised delivery formats.
  const obj = await fs.stat(path.join(ASSET, 'model.obj'));
  assert.ok(obj.size > 1024 * 1024, 'the SolidCraft OBJ export should be preserved');
});
