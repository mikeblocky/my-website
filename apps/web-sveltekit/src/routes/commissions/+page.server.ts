import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { randomUUID } from 'node:crypto';
import { friendGroups } from '@mikeblocky/site-data/friends';
import { parseCommission, publicCommission } from '$lib/commissions';
import { createCommissionSession, matchesPasscode, sessionName, verifyCommissionSession } from '$lib/server/commission-auth';
import { listCommissions, saveCommission } from '$lib/server/commissions';
import { commissionFolderLinks } from '$lib/server/vault';

export const prerender = false;
const attempts = new Map<string, { count: number; until: number }>();
const validId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

export const load: PageServerLoad = async ({ cookies, setHeaders }) => {
  setHeaders({ 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex, nofollow' });
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const authenticated = verifyCommissionSession(cookies.get(sessionName), env.ADMIN_PASSCODE || '');
  const people = authenticated ? friendGroups.flatMap(group => group.friends.map(friend => friend.username)) : [];
  try {
    const all = (await listCommissions()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const entries=authenticated?all:all.filter(entry=>!entry.archived).map(publicCommission);
    let folderIds:Record<string,string>={};try{folderIds=await commissionFolderLinks(entries.map(entry=>entry.person));}catch{}
    return { today, authenticated, configured: !!env.ADMIN_PASSCODE, entries, people, storageError: '',folderIds };
  } catch (error) {
    return { today, authenticated, configured: !!env.ADMIN_PASSCODE, entries: [], people, storageError: authenticated && error instanceof Error ? error.message : 'Order updates are temporarily unavailable.',folderIds:{} as Record<string,string> };
  }
};

export const actions: Actions = {
  unlock: async ({ request, cookies, getClientAddress }) => {
    if (!env.ADMIN_PASSCODE) return fail(503, { error: 'Set ADMIN_PASSCODE on the server to enable this private tracker.' });
    const now = Date.now(), ip = getClientAddress();
    for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
    const attempt = attempts.get(ip);
    if (attempt && attempt.count >= 5) return fail(429, { error: 'Too many attempts. Try again in 15 minutes.' });
    const form = await request.formData();
    if (!matchesPasscode(String(form.get('passcode') || ''), env.ADMIN_PASSCODE)) {
      if (attempts.size > 256) attempts.delete(attempts.keys().next().value!);
      attempts.set(ip, { count: (attempt?.count || 0) + 1, until: attempt?.until || now + 15 * 60 * 1000 });
      return fail(401, { error: 'Incorrect admin passcode.' });
    }
    attempts.delete(ip);
    cookies.set(sessionName, createCommissionSession(env.ADMIN_PASSCODE), { path: '/commissions', httpOnly: true, sameSite: 'strict', secure: !dev, maxAge: 12 * 60 * 60 });
    redirect(303, '/commissions');
  },
  lock: async ({ cookies }) => { cookies.delete(sessionName, { path: '/commissions' }); redirect(303, '/commissions'); },
  save: async ({ request, cookies }) => {
    if (!verifyCommissionSession(cookies.get(sessionName), env.ADMIN_PASSCODE || '')) return fail(401, { error: 'Unlock the tracker before making changes.' });
    try {
      const form = await request.formData();
      const id = String(form.get('id') || ''), revision = String(form.get('revision') || '');
      if (id && !validId(id)) return fail(400, { error: 'Invalid order.' });
      const input = parseCommission(form);
      const entries = await listCommissions(), existing = entries.find(entry => entry.id === id);
      if (id && !existing) return fail(404, { error: 'Order not found. Refresh and try again.' });
      if (!id && revision) return fail(400, { error: 'Invalid new order.' });
      const now = new Date().toISOString();
      await saveCommission({ ...input, id: id || randomUUID(), revision: randomUUID(), archived: existing?.archived || false, createdAt: existing?.createdAt || now, updatedAt: now }, revision);
      return { saved: true, message: 'Order saved.' };
    } catch (error) { return fail(400, { error: error instanceof Error ? error.message : 'Could not save. Your draft is preserved.' }); }
  },
  archive: async ({ request, cookies }) => {
    if (!verifyCommissionSession(cookies.get(sessionName), env.ADMIN_PASSCODE || '')) return fail(401, { error: 'Unlock the tracker before making changes.' });
    try {
      const form = await request.formData(), id = String(form.get('id') || '');
      if (!validId(id)) return fail(400, { error: 'Invalid order.' });
      const entry = (await listCommissions()).find(item => item.id === id);
      if (!entry) return fail(404, { error: 'Order not found.' });
      await saveCommission({ ...entry, archived: !entry.archived, revision: randomUUID(), updatedAt: new Date().toISOString() }, String(form.get('revision') || ''));
      return { message: entry.archived ? 'Order restored.' : 'Order archived.' };
    } catch (error) { return fail(400, { error: error instanceof Error ? error.message : 'Could not update order.' }); }
  }
};
