import { json } from '@sveltejs/kit';
import { listCommissions } from '$lib/server/commissions';
import { commissionFolderLinks } from '$lib/server/vault';
export const GET = async () => {
  const entries=(await listCommissions()).filter(entry=>!entry.archived);
  return json(await commissionFolderLinks(entries.map(entry=>entry.person)),{headers:{'cache-control':'no-store'}});
};
