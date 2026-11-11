import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
await mkdir('.private-backups',{recursive:true});
let secrets;
try{secrets=JSON.parse(await readFile('.private-backups/cloudflare-secrets.json','utf8'));}
catch{secrets={VAULT_ADMIN_PASSWORD:randomBytes(32).toString('base64url'),VAULT_SESSION_SECRET:randomBytes(48).toString('base64url')};}
const local=await readFile('apps/web-sveltekit/.env.local','utf8');
secrets.ADMIN_PASSCODE=local.match(/^ADMIN_PASSCODE=(.+)$/m)?.[1]?.trim()?.replace(/^['"]|['"]$/g,'')||randomBytes(32).toString('base64url');
try{Object.assign(secrets,JSON.parse(await readFile('.private-backups/integration-env.json','utf8')));}catch{}
if(secrets.NEXT_PUBLIC_VAPID_PUBLIC_KEY)secrets.PUBLIC_VAPID_PUBLIC_KEY=secrets.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
await writeFile('.private-backups/cloudflare-secrets.json',JSON.stringify(secrets),{mode:0o600});
await writeFile('.private-backups/private-folder-admin.txt',`Private folder administration\nURL: /commissions/files\nPassword: ${secrets.VAULT_ADMIN_PASSWORD}\n\nThis password only unlocks private-folder administration. Folder recipients receive separate random passwords.\n`,{mode:0o600});
let next=local;
for(const key of ['VAULT_ADMIN_PASSWORD','VAULT_SESSION_SECRET']){next=next.replace(new RegExp(`^${key}=.*\\r?\\n?`,'m'),'');next+=`\n${key}=${secrets[key]}\n`;}
await writeFile('apps/web-sveltekit/.env.local',next,{mode:0o600});
console.log('Private folder credentials saved locally; no secret values printed.');
