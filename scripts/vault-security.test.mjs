import test from 'node:test';import assert from 'node:assert/strict';import ts from 'typescript';import {readFile}from'node:fs/promises';
import {createHash,createHmac} from 'node:crypto';
const source=(await readFile('apps/web-sveltekit/src/lib/server/vault-auth.ts','utf8')).replace("'./passphrase-words.json'",JSON.stringify(new URL('../apps/web-sveltekit/src/lib/server/passphrase-words.json',import.meta.url).href));
const auth=await import('data:text/javascript;base64,'+Buffer.from(ts.transpile(source,{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022})).toString('base64'));
const secret='s'.repeat(48);
test('folder sessions reject other folders, tampering, expiry and password rotation',()=>{
 const token=auth.signAccess('folder-a',1,secret,1000);
 assert.equal(auth.verifyAccess(token,'folder-a',1,secret,2000),true);
 for(const args of [[token,'folder-b',1,secret,2000],[token,'folder-a',2,secret,2000],[token+'x','folder-a',1,secret,2000],[token,'folder-a',1,secret,4000000],[token,'admin',1,secret,2000]])assert.equal(auth.verifyAccess(...args),false);
});
test('memorable phrases are unique, accept spaces, and require the separate server secret',()=>{
 const passwords=Array.from({length:500},()=>auth.randomPassword());assert.equal(new Set(passwords).size,500);assert.ok(passwords.every(x=>/^[a-z]+(?:-[a-z]+){3}$/.test(x)));
 const record=auth.passwordRecord(passwords[0],undefined,secret);assert.notEqual(record.hash,passwords[0]);assert.equal(auth.passwordMatches(passwords[0],record.salt,record.hash,secret),true);assert.equal(auth.passwordMatches(passwords[0].replaceAll('-',' ').toUpperCase(),record.salt,record.hash,secret),false);assert.equal(auth.passwordMatches(passwords[0],record.salt,record.hash,'wrong'),false);assert.equal(auth.passwordMatches(record.hash,record.salt,record.hash,secret),false);assert.throws(()=>auth.passwordRecord(passwords[0]));
 assert.equal(auth.secretMatches(passwords[0].replaceAll('-',' '),passwords[0]),true);
});
test('vault administration rejects weak or missing secrets',()=>{
 assert.equal(auth.secretMatches('mike','mike'),false);assert.equal(auth.secretMatches('',''),false);assert.throws(()=>auth.signAccess('admin',1,''));assert.equal(auth.secretMatches(secret,secret),true);
});
test('legacy random tokens remain usable until the owner rotates access',()=>{
 const password='a'.repeat(32),salt='legacy-salt',hash=createHash('sha256').update(salt).update(':').update(password).digest('hex');
 assert.equal(auth.passwordMatches(password,salt,hash),true);assert.equal(auth.passwordMatches('b'.repeat(32),salt,hash),false);
});

test('custom passwords preserve case and punctuation; old phrases still accept spaces',()=>{
 const password="My lovely gallery!",record=auth.passwordRecord(password,undefined,secret);
 assert.equal(auth.passwordMatches(password,record.salt,record.hash,secret),true);
 assert.equal(auth.passwordMatches(password.toLowerCase(),record.salt,record.hash,secret),false);
 for(const invalid of ['mike',' '.repeat(12),'a'.repeat(129),'hello\nthere!'])assert.throws(()=>auth.passwordRecord(invalid,undefined,secret));
 const phrase=auth.randomPassword(),salt='old-salt',hash='v2:'+createHmac('sha256',secret).update(salt+':'+phrase).digest('hex');
 assert.equal(auth.passwordMatches(phrase.replaceAll('-',' ').toUpperCase(),salt,hash,secret),true);
});

test('custom admin passwords retain exact identity and rotating them revokes only admin sessions',()=>{
 const before='A memorable password!',after='A different password!';
 assert.equal(auth.secretMatches(before,before),true);assert.equal(auth.secretMatches(before.toLowerCase(),before),false);
 const token=auth.signAccess('admin',auth.adminAccessVersion(before,secret),secret);
 assert.equal(auth.verifyAccess(token,'admin',auth.adminAccessVersion(before,secret),secret),true);
 assert.equal(auth.verifyAccess(token,'admin',auth.adminAccessVersion(after,secret),secret),false);
});
