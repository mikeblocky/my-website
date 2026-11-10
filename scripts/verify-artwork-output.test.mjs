import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyArtworkOutput } from './verify-artwork-output.mjs';

function fixture(t, payload) {
  const directory = mkdtempSync(join(tmpdir(), 'gallery-output-'));
  t.after(() => {
    if (dirname(resolve(directory)) !== resolve(tmpdir())) throw new Error('Unexpected fixture path');
    rmSync(directory, { recursive: true, force: true });
  });
  if (payload) {
    mkdirSync(join(directory, 'static/artworks'), { recursive: true });
    writeFileSync(join(directory, 'static/artworks/__data.json'), JSON.stringify(payload));
  }
  return directory;
}

test('rejects a dynamic gallery without prerendered data', t => {
  assert.throws(() => verifyArtworkOutput(fixture(t)), /not prerendered/);
});
test('rejects a generated gallery with zero artworks', t => {
  assert.throws(() => verifyArtworkOutput(fixture(t, { nodes: [null, { data: [{ sections: 1 }, []] }] })), /no artworks/);
});
test('rejects an artwork missing from the static deployment', t => {
  const directory = fixture(t, { nodes: [null, { data: [{ src: 1 }, '/artworks/test/one.jpg'] }] });
  assert.throws(() => verifyArtworkOutput(directory), /missing from deployment/);
});
test('accepts serialized gallery data with published assets', t => {
  const directory = fixture(t, { nodes: [null, { data: [{ src: 1 }, '/artworks/test/one.jpg'] }] });
  mkdirSync(join(directory, 'static/artworks/test'), { recursive: true });
  writeFileSync(join(directory, 'static/artworks/test/one.jpg'), 'fixture');
  assert.doesNotThrow(() => verifyArtworkOutput(directory));
});
