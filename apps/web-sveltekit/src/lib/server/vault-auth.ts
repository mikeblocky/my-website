import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
export const vaultCookie = 'commission_vault_admin';
export const folderCookie = (id: string) => `folder_${id.replaceAll('-', '')}`;
export const randomPassword = () => randomBytes(24).toString('base64url');
export function passwordRecord(password: string, salt = randomBytes(24).toString('hex')) {
  // Only generated 192-bit tokens are accepted, so offline guessing is infeasible
  // without a slow human-password KDF that would exceed the free Worker CPU budget.
  if(!/^[\w-]{32}$/.test(password))throw new Error('Use a generated folder password.');
  return { salt, hash: createHash('sha256').update(salt).update(':').update(password).digest('hex') };
}
export function passwordMatches(password: string, salt: string, hash: string) {
  if (!/^[\w-]{32}$/.test(password) || !/^[a-f0-9]{64}$/.test(hash)) return false;
  return timingSafeEqual(Buffer.from(passwordRecord(password, salt).hash,'hex'),Buffer.from(hash,'hex'));
}
export function secretMatches(candidate: string, secret: string) {
  return secret.length >= 24 && candidate.length <= 256 && timingSafeEqual(createHash('sha256').update(candidate).digest(),createHash('sha256').update(secret).digest());
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
