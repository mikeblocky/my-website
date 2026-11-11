import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCommission, publicCommission } from '../apps/web-sveltekit/src/lib/commissions.ts';
import { createCommissionSession, verifyCommissionSession, matchesPasscode } from '../apps/web-sveltekit/src/lib/server/commission-auth.ts';
import { friendGroups } from '../packages/site-data/src/friends.ts';

function form(changes = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ title: 'A little drawing', person: '@Meownie3', direction: 'making for', kind: 'commission', status: 'planned', currency: 'USD', amount: '35.50', paid: '10', dueDate: '2026-12-01', ...changes })) data.set(key, value);
  return data;
}
test('commission input retains precise amounts, notes and recipient', () => {
  const entry = parseCommission(form({ notes: 'Private revision notes', referenceUrl: 'https://x.com/Meownie3' }));
  assert.equal(entry.amountCents, 3550);
  assert.equal(entry.paidCents, 1000);
  assert.equal(entry.person, 'Meownie3');
  assert.equal(entry.notes, 'Private revision notes');
});
test('rejects invalid dates, unsafe links, invalid statuses, and overpayment', () => {
  for (const changes of [{ dueDate: '2026-02-30' }, { referenceUrl: 'javascript:alert(1)' }, { status: 'anything' }, { paid: '99' }, { amount: '-3' }, { amount: '1.234' }, { title: '' }]) assert.throws(() => parseCommission(form(changes)));
});
test('admin authentication fails closed without configuration and on incorrect secrets', () => {
  assert.equal(matchesPasscode('', ''), false);
  assert.equal(matchesPasscode('wrong', 'test-only-secret'), false);
  assert.equal(matchesPasscode('test-only-secret', 'test-only-secret'), true);
  assert.equal(verifyCommissionSession(undefined, 'test-only-secret'), false);
  assert.throws(() => createCommissionSession(''));
});
test('private sessions reject tampering, expiry, and credential rotation', () => {
  const now = 1_800_000_000_000, secret = 'test-only-secret';
  const token = createCommissionSession(secret, now);
  assert.equal(verifyCommissionSession(token, secret, now), true);
  assert.equal(verifyCommissionSession(token + 'changed', secret, now), false);
  assert.equal(verifyCommissionSession(token, secret, now + 13 * 3600_000), false);
  assert.equal(verifyCommissionSession(token, 'new-secret', now), false);
  assert.equal(verifyCommissionSession(token, '', now), false);
});
test('all three new profiles belong to the admired supporters group', () => {
  assert.deepEqual(friendGroups.find(group => group.id === 'admired').friends.map(friend => friend.username), ['Meownie3', 'CiciCustomz', 'TbhkWOOO']);
});

test('public tracker records expose progress without internal notes, finance or edit credentials', () => {
 const entry = { ...parseCommission(form()), id:'test', revision:'private-edit-token', createdAt:'2026-11-11', updatedAt:'2026-11-11', archived:false, notes:'private-note', referenceUrl:'https://example.com/private-conversation', deliveryUrl:'https://example.com/private-tracking' };
 const visible = publicCommission(entry);
 assert.equal(visible.title,entry.title);
 assert.equal(visible.status,'planned');
 for(const field of ['revision','amountCents','paidCents','currency','notes','referenceUrl','deliveryUrl']) assert.equal(field in visible,false);
});
