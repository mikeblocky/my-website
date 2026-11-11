import { fail, redirect, error } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { dev } from '$app/environment';
import { isVaultAdmin, vaultStorage, vaultSecrets, privateHeaders, limitAttempt } from '$lib/server/vault';
import { randomPassword, passwordRecord, secretMatches, signAccess, vaultCookie } from '$lib/server/vault-auth';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = async ({cookies,setHeaders,url}) => {
  setHeaders(privateHeaders);
  const authenticated=isVaultAdmin(cookies);
  if(!authenticated)return {authenticated,folders:[],suggestedPerson:''};
  const {DB}=await vaultStorage();
  return {authenticated,suggestedPerson:(url.searchParams.get('person')||'').slice(0,80),folders:(await DB.prepare('SELECT f.id,f.person,f.created_at,(SELECT count(*) FROM vault_files v WHERE v.folder_id=f.id AND v.archived=0) AS image_count,(SELECT v.id FROM vault_files v WHERE v.folder_id=f.id AND v.archived=0 ORDER BY v.created_at DESC LIMIT 1) AS cover_id FROM vault_folders f ORDER BY f.created_at DESC').all<{id:string;person:string;created_at:string;image_count:number;cover_id:string|null}>()).results};
};
export const actions: Actions = {
  unlock: async ({cookies,request,getClientAddress}) => {
    await limitAttempt(getClientAddress(),'vault-admin');
    const data=await request.formData(),secrets=vaultSecrets();
    if(!secretMatches(String(data.get('password')||''),secrets.admin))return fail(401,{error:'Access denied.'});
    cookies.set(vaultCookie,signAccess('admin',1,secrets.session),{path:'/commissions/files',secure:!dev,httpOnly:true,sameSite:'strict',maxAge:3600});
    redirect(303,'/commissions/files');
  },
  lock: async ({cookies})=>{cookies.delete(vaultCookie,{path:'/commissions/files'});redirect(303,'/commissions/files');},
  create: async ({cookies,request}) => {
    if(!isVaultAdmin(cookies))error(401,'Access denied.');
    const data=await request.formData(),person=String(data.get('person')||'').trim().replace(/^@/,'');
    if(!person||person.length>80||/[\x00-\x1f]/.test(person))return fail(400,{error:'Enter a person’s name, up to 80 characters.'});
    const password=randomPassword(),record=passwordRecord(password,undefined,vaultSecrets().pepper),id=randomUUID(),{DB}=await vaultStorage();
    if(await DB.prepare('SELECT id FROM vault_folders WHERE lower(person)=lower(?)').bind(person).first())return fail(409,{error:'This person already has a folder. Open it from the list below.'});
    await DB.prepare('INSERT INTO vault_folders(id,person,password_hash,salt,created_at) VALUES(?,?,?,?,?)').bind(id,person,record.hash,record.salt,new Date().toISOString()).run();
    return {created:true,password,folderId:id};
  }
};
