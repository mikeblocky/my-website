import { error } from '@sveltejs/kit';
import { createHmac } from 'node:crypto';
import { imageSize } from 'image-size';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { cloudBindings, type CloudBindings } from './cloudflare';
import { folderCookie, vaultCookie, verifyAccess } from './vault-auth';
import type { Cookies } from '@sveltejs/kit';
export const validVaultId = (id: string) => /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(id);
export type Folder = {id:string;person:string;password_hash:string;salt:string;version:number;created_at:string};
export type VaultFile = {id:string;folder_id:string;object_key:string;name:string;mime:string;size:number;created_at:string;archived:number};
export type VaultComment = {id:string;folder_id:string;file_id:string|null;x:number|null;y:number|null;author:string;role:'admin'|'viewer';body:string;created_at:string};
export function vaultSecrets() { const cloud=cloudBindings(); return { admin:cloud?.VAULT_ADMIN_PASSWORD || env.VAULT_ADMIN_PASSWORD || '',session:cloud?.VAULT_SESSION_SECRET || env.VAULT_SESSION_SECRET || '',pepper:String(cloud?.VAULT_PASSWORD_PEPPER || env.VAULT_PASSWORD_PEPPER || '') }; }
export const isVaultAdmin = (cookies: Cookies) => verifyAccess(cookies.get(vaultCookie),'admin',1,vaultSecrets().session);
export function canReadFolder(cookies: Cookies, folder: Folder) { return isVaultAdmin(cookies)||verifyAccess(cookies.get(folderCookie(folder.id)),folder.id,folder.version,vaultSecrets().session); }
export const privateHeaders = { 'cache-control':'private, no-store, max-age=0', 'cdn-cache-control':'no-store', 'cloudflare-cdn-cache-control':'no-store', 'x-robots-tag':'noindex, nofollow, noarchive, noimageindex', 'referrer-policy':'same-origin', 'x-content-type-options':'nosniff' };
export async function vaultStorage(): Promise<CloudBindings> {
  const cloud=cloudBindings(); if(cloud?.DB&&cloud.PRIVATE_FILES)return cloud;
  // Local development uses the same SQL and private storage contract through Wrangler.
  if(dev) {
    const {getPlatformProxy}=await import('wrangler');
    localProxy ??= getPlatformProxy({configPath:'wrangler.jsonc',persist:{path:'.wrangler/state/v3'}}).then(proxy=>proxy.env as unknown as CloudBindings);
    return localProxy;
  }
  error(503,'Private storage is unavailable.');
}
let localProxy: Promise<CloudBindings>|undefined;
export async function commissionFolderLinks(people:string[]) {
  if(!people.length)return {} as Record<string,string>;
  const {DB}=await vaultStorage(),names=[...new Set(people.map(name=>name.replace(/^@/,'').toLowerCase()))];
  const rows=(await DB.prepare(`SELECT id,person FROM vault_folders WHERE lower(person) IN (${names.map(()=>'?').join(',')})`).bind(...names).all<{id:string;person:string}>()).results;
  return Object.fromEntries(rows.map(row=>[row.person.toLowerCase(),row.id]));
}
export async function readFolder(id: string) { if(!validVaultId(id))error(404,'Folder unavailable.'); const {DB}=await vaultStorage(); return DB.prepare('SELECT * FROM vault_folders WHERE id=?').bind(id).first<Folder>(); }
export async function limitAttempt(ip: string, scope: string, maximum = 8) {
  const {DB}=await vaultStorage(), secret=vaultSecrets().session;if(!secret)error(503,'Private access is not configured.');
  const key=createHmac('sha256',secret).update(`${ip}:${scope}`).digest('hex'),now=Date.now();
  const row=await DB.prepare('INSERT INTO auth_attempts(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at<=? THEN 1 ELSE count+1 END, expires_at=CASE WHEN expires_at<=? THEN excluded.expires_at ELSE expires_at END RETURNING count').bind(key,now+900000,now,now).first<{count:number}>();
  if(!row||row.count>maximum)error(429,'Too many attempts. Try again in 15 minutes.');
}
export function checkedImage(bytes: Uint8Array, mime: string) {
  if(!['image/png','image/jpeg','image/webp'].includes(mime)||bytes.length>15000000||bytes.length<12)throw new Error('Choose a PNG, JPEG or WebP image up to 15 MB.');
  const info=imageSize(bytes),types:{[key:string]:string}={png:'image/png',jpg:'image/jpeg',webp:'image/webp'};
  if(types[info.type||'']!==mime||info.width*info.height>24000000||!info.width||!info.height)throw new Error('Unsupported image or dimensions.');
  return info;
}
export const safeFileName = (name: string) => name.normalize('NFKC').replace(/[\x00-\x1f\x7f<>"'\/\\]/g,'').slice(0,120)||'Image';
