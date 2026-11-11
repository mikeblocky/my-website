import test from 'node:test';
import assert from 'node:assert/strict';
import { thoughtWidth, placeThought } from '../apps/web-sveltekit/src/lib/thought-placement.ts';
const bounds = {left:12,right:900,top:12,bottom:708};
test('long thoughts widen within the available space', () => {
  assert.equal(thoughtWidth(800,true),520);
  assert.equal(thoughtWidth(800,true,520,true),600);
  assert.equal(thoughtWidth(340,true,520,true),340);
  assert.equal(thoughtWidth(800,false),300);
});
test('bubbles prefer above near the bottom and flip below near the top', () => {
  assert.equal(placeThought({left:400,right:440,top:600,bottom:640},bounds,520,400).side,'above');
  assert.equal(placeThought({left:400,right:440,top:50,bottom:90},bounds,520,400).side,'below');
});
test('long bubbles stay in the viewport when neither side fits completely', () => {
  const position=placeThought({left:850,right:890,top:350,bottom:390},bounds,620,600);
  assert.ok(position.x>=bounds.left&&position.x+620<=bounds.right);
  assert.ok(position.y>=bounds.top&&position.y+600<=bounds.bottom);
});

test('long thoughts can stay at the top instead of being forced under the avatar', () => {
 const position=placeThought({left:400,right:440,top:120,bottom:160},bounds,620,450,true);
 assert.equal(position.side,'above');
 assert.equal(position.y,bounds.top);
 assert.ok(position.y+450<=bounds.bottom);
});
