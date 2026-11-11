import { fail, error, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { randomUUID } from 'node:crypto';
import { canReadFolder, isVaultAdmin, readFolder, vaultStorage, vaultSecrets, privateHeaders, limitAttempt, checkedImage, safeFileName, type VaultFile, type VaultComment } from '$lib/server/vault';
import { folderCookie, passwordMatches, passwordRecord, randomPassword, signAccess } from '$lib/server/vault-auth';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = async ({params,cookies,setHeaders}) => {
  setHeaders(privateHeaders);
  const folder=await readFolder(params.id);if(!folder)error(404,'Folder unavailable.');
  const authenticated=canReadFolder(cookies,folder),admin=isVaultAdmin(cookies);
  if(!authenticated)return {authenticated,admin:false,person:'',id:params.id,files:[],comments:[]};
  const {DB}=await vaultStorage();
  const files=(await DB.prepare('SELECT id,name,mime,size,created_at,archived FROM vault_files WHERE folder_id=? AND (archived=0 OR ?=1) ORDER BY created_at DESC').bind(folder.id,admin?1:0).all<Pick<VaultFile,'id'|'name'|'mime'|'size'|'created_at'|'archived'>>()).results;
  const comments=(await DB.prepare('SELECT * FROM vault_comments WHERE folder_id=? ORDER BY created_at').bind(folder.id).all<VaultComment>()).results.filter(comment=>!comment.file_id||files.some(file=>file.id===comment.file_id));
  return {authenticated,admin,person:folder.person,id:folder.id,files,comments};
};
export const actions: Actions = {
  rename:async({params,cookies,request})=>{
    if(!isVaultAdmin(cookies))error(401,'Access denied.');
    const data=await request.formData(),fileId=String(data.get('fileId')||''),raw=String(data.get('name')||'').trim();
    if(!raw||raw.length>120)return fail(400,{error:'Use an image name up to 120 characters.'});
    const {DB}=await vaultStorage();
    await DB.prepare('UPDATE vault_files SET name=? WHERE id=? AND folder_id=?').bind(safeFileName(raw),fileId,params.id).run();
    return {renamed:true};
  },
  archive:async({params,cookies,request})=>{
    if(!isVaultAdmin(cookies))error(401,'Access denied.');
    const data=await request.formData(),fileId=String(data.get('fileId')||''),{DB}=await vaultStorage();
    await DB.prepare('UPDATE vault_files SET archived=1-archived WHERE id=? AND folder_id=?').bind(fileId,params.id).run();
    return {archived:true};
  },
  comment:async({params,cookies,request,getClientAddress})=>{
    const folder=await readFolder(params.id);if(!folder||!canReadFolder(cookies,folder))error(401,'Access denied.');
    await limitAttempt(getClientAddress(),`comments:${folder.id}`,40);
    const data=await request.formData(),body=String(data.get('body')||'').trim(),fileId=String(data.get('fileId')||''),{DB}=await vaultStorage();
    if(!body||body.length>2000||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(body))return fail(400,{error:'Write a comment up to 2,000 characters.'});
    let x:number|null=null,y:number|null=null;
    if(fileId){if(!await DB.prepare('SELECT id FROM vault_files WHERE id=? AND folder_id=? AND archived=0').bind(fileId,folder.id).first())error(404,'Image unavailable.');x=Number(data.get('x'));y=Number(data.get('y'));if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>1||y<0||y>1)return fail(400,{error:'Choose a point on the image.'});}
    const admin=isVaultAdmin(cookies);
    await DB.prepare('INSERT INTO vault_comments(id,folder_id,file_id,x,y,author,role,body,created_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(randomUUID(),folder.id,fileId||null,x,y,admin?'Mike':folder.person,admin?'admin':'viewer',body,new Date().toISOString()).run();
    return {commented:true};
  },
  unlock:async({params,cookies,request,getClientAddress})=>{
    await limitAttempt(getClientAddress(),'folder');
    const folder=await readFolder(params.id),data=await request.formData();
    if(!folder||!passwordMatches(String(data.get('password')||''),folder.salt,folder.password_hash,vaultSecrets().pepper))return fail(401,{error:'Access denied.'});
    cookies.set(folderCookie(folder.id),signAccess(folder.id,folder.version,vaultSecrets().session),{path:`/commissions/files/${folder.id}`,httpOnly:true,secure:!dev,sameSite:'strict',maxAge:3600});
    redirect(303,`/commissions/files/${folder.id}`);
  },
  lock:async({params,cookies})=>{cookies.delete(folderCookie(params.id),{path:`/commissions/files/${params.id}`});redirect(303,`/commissions/files/${params.id}`);},
  upload:async({params,cookies,request})=>{
    if(!isVaultAdmin(cookies))error(401,'Access denied.');
    if(Number(request.headers.get('content-length'))>16000000)error(413,'Image is too large.');
    const folder=await readFolder(params.id);if(!folder)error(404,'Folder unavailable.');
    const data=await request.formData(),files=data.getAll('image');
    if(!files.length||files.length>8||files.some(file=>!(file instanceof File))||files.reduce((total,file)=>total+(file as File).size,0)>15000000)return fail(400,{error:'Choose up to 8 images, totalling no more than 15 MB.'});
    const prepared=[];
    for(const file of files as File[]){const bytes=new Uint8Array(await file.arrayBuffer());try{checkedImage(bytes,file.type);}catch(e){return fail(400,{error:e instanceof Error?e.message:'Invalid image.'});}prepared.push({file,bytes});}
    const {DB,PRIVATE_FILES}=await vaultStorage();
    for(const {file,bytes} of prepared){const id=randomUUID(),key=`commissions/${folder.id}/${id}`,name=safeFileName(file.name);
      await PRIVATE_FILES.put(key,bytes,{httpMetadata:{contentType:file.type,cacheControl:'private, no-store'}});
      try{await DB.prepare('INSERT INTO vault_files(id,folder_id,object_key,name,mime,size,created_at) VALUES(?,?,?,?,?,?,?)').bind(id,folder.id,key,name,file.type,file.size,new Date().toISOString()).run();}catch(e){await PRIVATE_FILES.delete(key);throw e;}
    }
    return {uploaded:true};
  },
  rotate:async({params,cookies})=>{
    if(!isVaultAdmin(cookies))error(401,'Access denied.');
    const folder=await readFolder(params.id);if(!folder)error(404,'Folder unavailable.');
    const password=randomPassword(),record=passwordRecord(password,undefined,vaultSecrets().pepper),{DB}=await vaultStorage();
    await DB.prepare('UPDATE vault_folders SET password_hash=?,salt=?,version=version+1 WHERE id=?').bind(record.hash,record.salt,folder.id).run();
    return {password};
  }
};
