import test from 'node:test';
import assert from 'node:assert/strict';
import { createArtworkScenes, getBackgroundSlots } from '../apps/web-sveltekit/src/lib/background-scenes.ts';

const portrait = { width: 600, height: 900 };
const landscape = { width: 1200, height: 800 };

test('portrait rounds use groups of three or four without losing or repeating works', () => {
  for (const count of [6, 7, 8, 9, 12, 22, 30, 40, 46]) {
    const scenes = createArtworkScenes(Array.from({ length: count }, () => portrait));
    assert(scenes.every(scene => scene.length === 3 || scene.length === 4));
    assert.deepEqual(scenes.flat().sort((a, b) => a - b), Array.from({ length: count }, (_, index) => index));
  }
});

test('landscapes occupy their own scenes and are never grouped with portraits', () => {
  const works = [landscape, ...Array.from({ length: 10 }, () => portrait), landscape];
  const scenes = createArtworkScenes(works);
  for (const scene of scenes) {
    if (scene.length === 1) assert(works[scene[0]].width > works[scene[0]].height);
    else assert(scene.every(index => works[index].height > works[index].width));
  }
  assert.equal(new Set(scenes.flat()).size, works.length);
});

test('the next round starts with a scene different from the previous one', () => {
  const scenes = createArtworkScenes(Array.from({ length: 8 }, () => landscape), [0], () => .5);
  assert(!scenes[0].includes(0));
});

test('empty and small collections remain usable', () => {
  assert.deepEqual(createArtworkScenes([]), []);
  assert.deepEqual(createArtworkScenes([portrait]), [[0]]);
  assert.equal(createArtworkScenes([portrait, portrait]).flat().length, 2);
});

test('portrait panels cover the entire desktop and phone viewport without gaps or overlap', () => {
  for (const [width, height] of [[1920, 1080], [390, 844]]) {
    for (const count of [1, 3, 4]) {
      const slots = getBackgroundSlots(count, width, height);
      assert(Math.abs(slots.reduce((area, slot) => area + slot.width * slot.height, 0) - width * height) < .0001);
      for (let index = 0; index < slots.length; index++) {
        const slot = slots[index];
        assert(slot.x >= 0 && slot.y >= 0 && slot.x + slot.width <= width && slot.y + slot.height <= height);
        for (const other of slots.slice(index + 1)) {
          const overlapWidth = Math.min(slot.x + slot.width, other.x + other.width) - Math.max(slot.x, other.x);
          const overlapHeight = Math.min(slot.y + slot.height, other.y + other.height) - Math.max(slot.y, other.y);
          assert(overlapWidth <= .0001 || overlapHeight <= .0001);
        }
      }
    }
  }
});
