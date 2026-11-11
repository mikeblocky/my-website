import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import words from './passphrase-words.json' with { type: 'json' };
const vocabulary = new Set(words);
const normalize = (value:string) => value.trim().toLowerCase().replace(/[\s-]+/g,'-');
const isPhrase = (value:string) => { const parts=normalize(value).split('-');return parts.length===4&&parts.every(word=>vocabulary.has(word)); };
export const vaultCookie = 'commission_vault_admin';
export const folderCookie = (id: string) => `folder_${id.replaceAll('-', '')}`;
export const randomPassword = () => Array.from({length:4},()=>words[randomInt(words.length)]).join('-');
export const validFolderPassword = (password:string) => password.length>=10&&password.length<=128&&password.trim().length>=10&&!/[\x00-\x1f\x7f]/.test(password);
export function passwordRecord(password: string, salt = randomBytes(24).toString('hex'), pepper = '') {
  if(!validFolderPassword(password)||pepper.length<32)throw new Error('Use a password between 10 and 128 characters.');
  return { salt, hash: 'v3:'+createHmac('sha256',pepper).update(salt).update(':').update(password).digest('hex') };
}
export function passwordMatches(password: string, salt: string, hash: string, pepper = '') {
  if(password.length>256)return false;
  if(hash.startsWith('v3:')) {
    if(!validFolderPassword(password)||pepper.length<32||!/^v3:[a-f0-9]{64}$/.test(hash))return false;
    return timingSafeEqual(Buffer.from(passwordRecord(password,salt,pepper).hash.slice(3),'hex'),Buffer.from(hash.slice(3),'hex'));
  }
  if(hash.startsWith('v2:')) {
    if(!isPhrase(password)||pepper.length<32||!/^v2:[a-f0-9]{64}$/.test(hash))return false;
    const expected=createHmac('sha256',pepper).update(salt).update(':').update(normalize(password)).digest('hex');
    return timingSafeEqual(Buffer.from(expected,'hex'),Buffer.from(hash.slice(3),'hex'));
  }
  // Existing high-entropy tokens keep working until their owner replaces them.
  if(!/^[\w-]{32}$/.test(password)||!/^[a-f0-9]{64}$/.test(hash))return false;
  return timingSafeEqual(createHash('sha256').update(salt).update(':').update(password).digest(),Buffer.from(hash,'hex'));
}
export function secretMatches(candidate: string, secret: string) {
  return (secret.length>=24||isPhrase(secret))&&candidate.length<=256&&timingSafeEqual(createHash('sha256').update(isPhrase(secret)?normalize(candidate):candidate).digest(),createHash('sha256').update(isPhrase(secret)?normalize(secret):secret).digest());
}
export function signAccess(scope: string, version: number, secret: string, now = Date.now()) {
  if (secret.length < 32) throw new Error('Private access is not configured.');
  const payload=Buffer.from(JSON.stringify({scope,version,expires:now+3600000,nonce:randomBytes(16).toString('hex')})).toString('base64url');
  return `${payload}.${createHmac('sha256',secret).update(payload).digest('base64url')}`;
}
export function verifyAccess(token: string | undefined, scope: string, version: number, secret: string, now = Date.now()) {
  if (!token || token.length>1024 || secret.length<32) return false;
  try {
    const [payload,signature,extra]=token.split('.'); if(!payload||!signature||extra)return false;
    const expected=createHmac('sha256',secret).update(payload).digest(),received=Buffer.from(signature,'base64url');
    if(received.length!==expected.length||!timingSafeEqual(received,expected))return false;
    const data=JSON.parse(Buffer.from(payload,'base64url').toString());
    return data.scope===scope&&data.version===version&&Number.isFinite(data.expires)&&data.expires>now&&data.expires<=now+3600000;
  } catch { return false; }
}
