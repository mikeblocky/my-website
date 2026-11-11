import { error } from '@sveltejs/kit';
import { canReadFolder, isVaultAdmin, readFolder, vaultStorage, privateHeaders, validVaultId, type VaultFile } from '$lib/server/vault';
import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({params,cookies}) => {
  const folder=await readFolder(params.id);
  if(!folder||!canReadFolder(cookies,folder))error(404,'Image unavailable.');
  if(!validVaultId(params.file))error(404,'Image unavailable.');
  const {DB,PRIVATE_FILES}=await vaultStorage();
  const file=await DB.prepare('SELECT * FROM vault_files WHERE id=? AND folder_id=?').bind(params.file,folder.id).first<VaultFile>();
  if(!file||(file.archived&&!isVaultAdmin(cookies)))error(404,'Image unavailable.');
  const object=await PRIVATE_FILES.get(file.object_key);if(!object)error(404,'Image unavailable.');
  return new Response(object.body,{headers:{...privateHeaders,'content-type':file.mime,'content-disposition':'inline','content-security-policy':"default-src 'none'; sandbox",'cross-origin-resource-policy':'same-origin'}});
};
