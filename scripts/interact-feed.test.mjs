import test from 'node:test';
import assert from 'node:assert/strict';
import { combineFeed, cooldownDeadline, linkedFeedKey } from '../apps/web-sveltekit/src/lib/boards/interact-feed.ts';

test('mixed feed is newest first and preserves colliding legacy IDs', () => {
  const sources = {
    talk: [{ id: 'same', createdAt: '2026-01-01' }],
    draw: [{ id: 'same', createdAt: '2026-03-01' }],
    suggestions: [{ id: 'recommendation', createdAt: '2026-02-01' }],
    sketchbook: [{ id: 'drawing', createdAt: 'invalid' }]
  };
  assert.deepEqual(combineFeed(sources).map(post => post.key), ['draw:same', 'suggestions:recommendation', 'talk:same', 'sketchbook:drawing']);
  assert.equal(sources.talk.length, 1);
});

test('cooldown reads the API remainingMs contract and expiresAt without restarting the wait', () => {
  assert.equal(cooldownDeadline({ remainingMs: 333000 }, 1000), 334000);
  assert.equal(cooldownDeadline({ expiresAt: '2026-01-01T00:00:00Z', remainingMs: 333000 }, 1000), Date.parse('2026-01-01T00:00:00Z'));
  assert.equal(cooldownDeadline(undefined), 0);
  assert.equal(cooldownDeadline({ remainingMs: 0, expiresAt: null }, 1000), 0);
});

test('existing anchors find the correct post type and preserve hyphenated IDs', () => {
  assert.equal(linkedFeedKey('#prompt-a-b'), 'draw:a-b');
  assert.equal(linkedFeedKey('#talk-a-b'), 'talk:a-b');
  assert.equal(linkedFeedKey('#suggestion-a'), 'suggestions:a');
  assert.equal(linkedFeedKey('#drawing-a'), 'sketchbook:a');
  assert.equal(linkedFeedKey('#unrelated'), null);
});
