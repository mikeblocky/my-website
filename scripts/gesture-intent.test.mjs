import test from 'node:test';
import assert from 'node:assert/strict';
import {dragIntent,dockDragIntent} from '../apps/web-sveltekit/src/lib/gesture-intent.ts';
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
test('quick phone taps tolerate wobble without moving the menu button',()=>{
  assert.equal(dockDragIntent(16,6,'touch',90),'pending');
  assert.equal(dockDragIntent(22,4,'touch',120),'pending');
  assert.equal(dockDragIntent(0,0,'touch',500),'pending');
});
test('only a deliberate hold-drag repositions the dock on touch screens',()=>{
  assert.equal(dockDragIntent(16,0,'touch',220),'pending');
  assert.equal(dockDragIntent(30,0,'touch',80),'pending');
  assert.equal(dockDragIntent(16,0,'touch',350),'drag');
  assert.equal(dockDragIntent(30,0,'pen',350),'drag');
  assert.equal(dockDragIntent(7,0,'mouse',30),'drag');
});
