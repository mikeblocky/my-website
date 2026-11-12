import test from 'node:test';
import assert from 'node:assert/strict';
import {dragIntent} from '../apps/web-sveltekit/src/lib/gesture-intent.ts';
test('finger jitter stays a tap instead of dragging a control',()=>{
  for(const [x,y] of [[0,0],[7,4],[-6,8],[11,0]])assert.equal(dragIntent(x,y,'touch'),'pending');
  assert.equal(dragIntent(13,0,'touch'),'drag');
});
test('vertical swipes scroll the artwork page while horizontal swipes browse',()=>{
  assert.equal(dragIntent(3,30,'touch','horizontal'),'scroll');
  assert.equal(dragIntent(-40,4,'touch','horizontal'),'drag');
  assert.equal(dragIntent(5,4,'touch','horizontal'),'pending');
});
test('mouse drags remain precise and pen taps tolerate hand movement',()=>{
  assert.equal(dragIntent(7,0,'mouse'),'drag');
  assert.equal(dragIntent(7,0,'pen'),'pending');
  assert.equal(dragIntent(0,-30,'touch'),'drag');
});
