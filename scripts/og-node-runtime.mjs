import{readFile}from'node:fs/promises';import ts from'typescript';
const dir=new URL('../apps/web-sveltekit/src/lib/og/',import.meta.url);
export async function nodeImageRenderer(){
 let source=await readFile(new URL('generate.ts',dir),'utf8');
 source=source.replace("import { satori, rendererReady } from '$ogRenderer'","import satori from 'satori'; const rendererReady=()=>Promise.resolve();");
 for(const pkg of ['satori','@cf-wasm/resvg','@cf-wasm/photon'])source=source.replace(`'${pkg}'`,JSON.stringify(import.meta.resolve(pkg)));
 for(const[name,file]of [['regularFontUrl','DM-Sans-400.ttf'],['boldFontUrl','DM-Sans-700.ttf'],['symbolsFontUrl','Noto-Sans-Symbols.ttf'],['fallbackFontUrl','Noto-Sans-Fallback.ttf']])source=source.replace(new RegExp(`import ${name} from [^;]+;`),`const ${name}='data:font/ttf;base64,${(await readFile(new URL('fonts/'+file,dir))).toString('base64')}';`);
 return (await import('data:text/javascript;base64,'+Buffer.from(ts.transpile(source,{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022})).toString('base64'))).generatePng;
}
export async function nodeBoardCard(){const url=new URL('BoardOgCard.ts',dir);let source=await readFile(url,'utf8');source=source.replace("'image-size'",JSON.stringify(import.meta.resolve('image-size'))).replace("'./PageOgCard'",JSON.stringify(new URL('PageOgCard.ts',dir).href));return(await import('data:text/javascript;base64,'+Buffer.from(ts.transpile(source,{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022})).toString('base64'))).boardOgCard;}
