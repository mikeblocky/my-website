import{sql}from'./cloudflare-api.mjs';import{readFile,writeFile}from'node:fs/promises';import{randomUUID}from'node:crypto';
import{passwordRecord,randomPassword}from'../apps/web-sveltekit/src/lib/server/vault-auth.ts';
const people=(await sql("SELECT DISTINCT json_extract(value,'$.person') AS person FROM redis_hashes WHERE key='private:commissions:v1'"))[0].results;
const settings=JSON.parse(await readFile('.private-backups/cloudflare-secrets.json','utf8'));
let passwords=[];try{passwords=JSON.parse(await readFile('.private-backups/commission-folder-passwords.json','utf8'));}catch{}
let created=0;
for(const row of people){const person=String(row.person||'').trim().replace(/^@/,'');if(!person)continue;
 const existing=(await sql('SELECT id FROM vault_folders WHERE lower(person)=lower(?)',[person]))[0].results;if(existing.length)continue;
 const id=randomUUID(),password=randomPassword(),record=passwordRecord(password,undefined,settings.VAULT_PASSWORD_PEPPER);
 await sql('INSERT INTO vault_folders(id,person,password_hash,salt,created_at) VALUES(?,?,?,?,?)',[id,person,record.hash,record.salt,new Date().toISOString()]);passwords.push({person,url:`https://www.mikeblocky.com/commissions/files/${id}`,password});created++;
}
await writeFile('.private-backups/commission-folder-passwords.json',JSON.stringify(passwords,null,2),{mode:0o600});console.log(`Created ${created} separate galleries for existing commissioned people; passwords saved privately.`);
