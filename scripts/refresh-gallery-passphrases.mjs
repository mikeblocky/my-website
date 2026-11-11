import{readFile,writeFile}from'node:fs/promises';import{randomBytes}from'node:crypto';
import{sql}from'./cloudflare-api.mjs';import{passwordRecord,randomPassword}from'../apps/web-sveltekit/src/lib/server/vault-auth.ts';
const location='.private-backups/cloudflare-secrets.json',settings=JSON.parse(await readFile(location,'utf8'));
if(!settings.VAULT_PASSWORD_PEPPER)throw Error('Configure the password-protection secret before replacing gallery passphrases.');
const folders=(await sql('SELECT * FROM vault_folders'))[0].results;
await writeFile('.private-backups/gallery-access-before-redesign.json',JSON.stringify({folders,admin:settings.VAULT_ADMIN_PASSWORD,session:settings.VAULT_SESSION_SECRET}),{mode:0o600});
const used=new Set(),unique=()=>{let phrase;do{phrase=randomPassword();}while(used.has(phrase));used.add(phrase);return phrase;};
const credentials=[];
for(const folder of folders){if(/^QA-gallery-/.test(folder.person))continue;const password=unique(),record=passwordRecord(password,undefined,settings.VAULT_PASSWORD_PEPPER);await sql('UPDATE vault_folders SET password_hash=?,salt=?,version=version+1 WHERE id=?',[record.hash,record.salt,folder.id]);credentials.push({person:folder.person,url:`https://www.mikeblocky.com/commissions/files/${folder.id}`,password});}
settings.VAULT_ADMIN_PASSWORD=unique();settings.VAULT_SESSION_SECRET=randomBytes(48).toString('base64url');
await writeFile(location,JSON.stringify(settings),{mode:0o600});await writeFile('.private-backups/commission-folder-passwords.json',JSON.stringify(credentials,null,2),{mode:0o600});
console.log(`Replaced access for ${credentials.length} galleries with distinct four-word passphrases. Saved privately; no passphrases printed.`);
