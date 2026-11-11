import test from 'node:test';import assert from 'node:assert/strict';import ts from 'typescript';import {readFile}from'node:fs/promises';
const source=await readFile('apps/web-sveltekit/src/lib/server/vault-auth.ts','utf8');
const auth=await import('data:text/javascript;base64,'+Buffer.from(ts.transpile(source,{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022})).toString('base64'));
const secret='s'.repeat(48);
test('folder sessions reject other folders, tampering, expiry and password rotation',()=>{
 const token=auth.signAccess('folder-a',1,secret,1000);
 assert.equal(auth.verifyAccess(token,'folder-a',1,secret,2000),true);
 for(const args of [[token,'folder-b',1,secret,2000],[token,'folder-a',2,secret,2000],[token+'x','folder-a',1,secret,2000],[token,'folder-a',1,secret,4000000],[token,'admin',1,secret,2000]])assert.equal(auth.verifyAccess(...args),false);
});
test('random passwords have 192 bits of entropy and stored hashes cannot authenticate',()=>{
 const passwords=Array.from({length:500},()=>auth.randomPassword());assert.equal(new Set(passwords).size,500);assert.ok(passwords.every(x=>/^[\w-]{32}$/.test(x)));
 const record=auth.passwordRecord(passwords[0]);assert.notEqual(record.hash,passwords[0]);assert.equal(auth.passwordMatches(passwords[0],record.salt,record.hash),true);assert.equal(auth.passwordMatches(record.hash,record.salt,record.hash),false);assert.equal(auth.passwordMatches('wrong',record.salt,record.hash),false);
});
test('vault administration rejects weak or missing secrets',()=>{
 assert.equal(auth.secretMatches('mike','mike'),false);assert.equal(auth.secretMatches('',''),false);assert.throws(()=>auth.signAccess('admin',1,''));assert.equal(auth.secretMatches(secret,secret),true);
});
