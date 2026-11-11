import test from 'node:test';
import assert from 'node:assert/strict';
import { friendOrbit, connectionGroups } from '../apps/web-sveltekit/src/lib/friend-orbit.ts';
import { friendGroups } from '../packages/site-data/src/friends.ts';
const friends = friendGroups.flatMap(group => group.friends.map(friend => ({...friend,groupId:group.id})));

test('everyone spreads across two paths while groups retain distinct line patterns', () => {
  const nodes=friendOrbit(friends);
  assert.equal(new Set(nodes.map(node=>node.radius)).size,2);
  assert.equal(new Set(Object.values(connectionGroups).map(group=>group.dash)).size,friendGroups.length);
  assert.ok(nodes.every(node=>Number.isFinite(node.x)&&Number.isFinite(node.y)&&node.x>=7&&node.x<=93&&node.y>=11&&node.y<=89));
});
test('filtering a connection group gives it a consistent readable orbit', () => {
  const nodes=friendOrbit(friends.filter(friend=>friend.groupId==='admired'),false);
  assert.equal(nodes.length,3);
  assert.ok(nodes.every(node=>node.radius===39));
  assert.equal(new Set(nodes.map(node=>`${node.x},${node.y}`)).size,3);
});
