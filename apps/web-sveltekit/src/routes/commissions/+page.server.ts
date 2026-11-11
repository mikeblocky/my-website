import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { dev } from '$app/environment';
import { randomUUID } from 'node:crypto';
import { friendGroups } from '@mikeblocky/site-data/friends';
import { parseCommission, publicCommission } from '$lib/commissions';
import { vaultCookie, signAccess, secretMatches, randomPassword, adminAccessVersion, passwordRecord, validFolderPassword } from '$lib/server/vault-auth';
import { listCommissions, saveCommission } from '$lib/server/commissions';
import { commissionFolderLinks, isVaultAdmin, vaultSecrets, vaultStorage, limitAttempt, privateHeaders } from '$lib/server/vault';

export const prerender = false;
const validId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

export const load: PageServerLoad = async ({ cookies, setHeaders }) => {
  setHeaders(privateHeaders);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const authenticated = isVaultAdmin(cookies);
  const people = authenticated ? friendGroups.flatMap(group => group.friends.map(friend => friend.username)) : [];
  try {
    const all = (await listCommissions()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const entries=authenticated?all:all.filter(entry=>!entry.archived).map(publicCommission);
    let folderIds:Record<string,string>={};try{folderIds=await commissionFolderLinks(entries.map(entry=>entry.person));}catch{}
    let galleries:{id:string;person:string;image_count:number}[]=[];if(authenticated){const {DB}=await vaultStorage();galleries=(await DB.prepare('SELECT f.id,f.person,(SELECT count(*) FROM vault_files v WHERE v.folder_id=f.id AND v.archived=0) AS image_count FROM vault_folders f ORDER BY f.person').all<{id:string;person:string;image_count:number}>()).results;}
    return { galleries, today, authenticated, configured: !!vaultSecrets().admin, entries, people, storageError: '',folderIds };
  } catch (error) {
    return { galleries:[], today, authenticated, configured: !!vaultSecrets().admin, entries: [], people, storageError: authenticated && error instanceof Error ? error.message : 'Order updates are temporarily unavailable.',folderIds:{} as Record<string,string> };
  }
};

export const actions: Actions = {
  unlock: async ({ request, cookies, getClientAddress }) => {
    await limitAttempt(getClientAddress(),'vault-admin');
    const form=await request.formData(),secrets=vaultSecrets();
    if(!secretMatches(String(form.get('passcode')||''),secrets.admin))return fail(401,{error:'Incorrect password.'});
    if(cookies.get(vaultCookie))cookies.delete(vaultCookie,{path:'/commissions/files'});
    cookies.set(vaultCookie,signAccess('admin',adminAccessVersion(secrets.admin,secrets.session),secrets.session),{path:'/commissions',httpOnly:true,sameSite:'strict',secure:!dev,maxAge:3600});
    redirect(303, '/commissions');
  },
  lock: async ({ cookies }) => { cookies.delete(vaultCookie,{path:'/commissions'});cookies.delete(vaultCookie,{path:'/commissions/files'}); redirect(303, '/commissions'); },
  createGallery:async({request,cookies})=>{
    if(!isVaultAdmin(cookies))return fail(401,{error:'Sign in first.'});
    const data=await request.formData(),person=String(data.get('person')||'').trim().replace(/^@/,'');
    if(!person||person.length>80||/[\x00-\x1f]/.test(person))return fail(400,{error:'Enter a valid name.'});
    const password=String(data.get('password')||'')||randomPassword();if(!validFolderPassword(password))return fail(400,{error:'Use 10–128 characters.'});
    const {DB}=await vaultStorage();if(await DB.prepare('SELECT id FROM vault_folders WHERE lower(person)=lower(?)').bind(person).first())return fail(409,{error:'A gallery already exists for this person.'});
    const id=randomUUID(),record=passwordRecord(password,undefined,vaultSecrets().pepper);
    await DB.prepare('INSERT INTO vault_folders(id,person,password_hash,salt,created_at) VALUES(?,?,?,?,?)').bind(id,person,record.hash,record.salt,new Date().toISOString()).run();
    return {created:true,password,folderId:id};
  },
  save: async ({ request, cookies }) => {
    if (!isVaultAdmin(cookies)) return fail(401, { error: 'Unlock the tracker before making changes.' });
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
    if (!isVaultAdmin(cookies)) return fail(401, { error: 'Unlock the tracker before making changes.' });
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
