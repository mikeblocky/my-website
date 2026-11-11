import { getRequestEvent } from '$app/server';
import { cloudBindings } from '$lib/server/cloudflare';
const escape=(value:unknown)=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const unitless=new Set(['fontWeight','lineHeight','opacity','flexGrow','flexShrink','order','zIndex']);
function html(node:any):string {
  if(node===null||node===undefined||typeof node==='boolean')return '';
  if(Array.isArray(node))return node.map(html).join('');
  if(typeof node!=='object')return escape(node);
  const tag=['div','span','img','strong','em'].includes(node.type)?node.type:'div',props=node.props||{};
  const style=Object.entries(props.style||{}).map(([key,value])=>`${key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}:${key==='fontFamily'?value+', Noto Sans, Noto Sans Symbols':typeof value==='number'&&!unitless.has(key)?value+'px':value}`).join(';');
  if(tag==='img')return `<img style="${escape(style)}" src="${escape(props.src)}" alt="">`;
  return `<${tag} style="${escape(style)}">${html(props.children)}</${tag}>`;
}
/** Browser Run's free browser minutes handle layout and PNG encoding outside Worker CPU. */
export async function generatePng(element:any,width=1200,height=630):Promise<ArrayBuffer>{
  const cloud=cloudBindings();if(!cloud?.BROWSER)throw new Error('Thumbnail browser is not configured.');
  const day=Math.floor(Date.now()/86400000),key=`thumbnail-renders:${day}`;
  const allowance=await cloud.DB.prepare('INSERT INTO auth_attempts(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,(day+1)*86400000).first<{count:number}>();
  if(!allowance||allowance.count>40)throw new Error('Daily thumbnail rendering allowance reached.');
  const {default:puppeteer}=await import('@cloudflare/puppeteer');
  const browser=await puppeteer.launch(cloud.BROWSER as any,{keep_alive:10000});
  try{
    const page=await browser.newPage();page.setDefaultTimeout(10000);
    await page.setViewport({width,height:Math.min(16000,height),deviceScaleFactor:1});
    await page.setJavaScriptEnabled(false);
    await page.setRequestInterception(true);
    const origin=getRequestEvent().url.origin;
    page.on('request',request=>{const url=request.url();if(url.startsWith(origin+'/')||url.startsWith('data:')||url==='about:blank')void request.continue();else void request.abort();});
    await page.goto(origin+'/og-shell.html',{waitUntil:'load',timeout:10000});
    await page.setContent(`<!doctype html><base href="${escape(origin)}/"><style>@font-face{font-family:'DM Sans';src:url('/og-fonts/DM-Sans-400.ttf')}@font-face{font-family:'DM Sans';font-weight:700;src:url('/og-fonts/DM-Sans-700.ttf')}@font-face{font-family:'Noto Sans';src:url('/og-fonts/Noto-Sans-Fallback.ttf')}@font-face{font-family:'Noto Sans Symbols';src:url('/og-fonts/Noto-Sans-Symbols.ttf')}*{box-sizing:border-box}html,body{margin:0;width:${width}px;height:${Math.min(16000,height)}px;font-family:'DM Sans','Noto Sans','Noto Sans Symbols'}</style>${html(element)}`,{waitUntil:'load',timeout:10000});
    await page.evaluate(()=>document.fonts.ready);
    const png=await page.screenshot({type:'png',clip:{x:0,y:0,width,height:Math.min(16000,height)}});
    return new Uint8Array(png).buffer;
  }finally{await browser.close();}
}
