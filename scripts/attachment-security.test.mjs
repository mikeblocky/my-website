import test from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';import ts from'typescript';import sharp from'sharp';
let source=await readFile('apps/web-sveltekit/src/lib/images/attachment-limits.ts','utf8');source=source.replace("'image-size'",JSON.stringify(import.meta.resolve('image-size')));
const {validateImageUrls}=await import('data:text/javascript;base64,'+Buffer.from(ts.transpile(source,{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022})).toString('base64'));
test('public attachments reject active content, remote fetches, forged MIME and oversized dimensions',async()=>{
 for(const url of ['javascript:alert(1)','data:image/svg+xml;base64,PHN2Zz4=','https://127.0.0.1/secret','data:image/png;base64,ZmFrZQ=='])assert.ok(validateImageUrls([],url));
 const png=await sharp({create:{width:2,height:3,channels:3,background:'#fff'}}).png().toBuffer(),url='data:image/png;base64,'+png.toString('base64');assert.equal(validateImageUrls([url],url),null);assert.ok(validateImageUrls([],url.replace('image/png','image/jpeg')));
});
