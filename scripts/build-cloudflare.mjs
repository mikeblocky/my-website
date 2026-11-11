import { spawnSync } from 'node:child_process';
for(const script of ['scripts/generate-artwork-previews.mjs','scripts/sync-blog-social-images.mjs']){
 const prepared=spawnSync(process.execPath,[script],{stdio:'inherit'});
 if(prepared.status!==0)process.exit(prepared.status??1);
}
const result = spawnSync(process.execPath, ['../../node_modules/vite/bin/vite.js', 'build'], { cwd: 'apps/web-sveltekit', env: { ...process.env, CLOUDFLARE_BUILD: '1' }, stdio: 'inherit' });
if(result.status!==0)process.exit(result.status??1);
const assets=spawnSync(process.execPath,['scripts/prepare-cloudflare-assets.mjs'],{stdio:'inherit'});
process.exit(assets.status??1);
