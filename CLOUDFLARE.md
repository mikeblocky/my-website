# Hosting and private commission galleries

This site uses its own `mikeblocky-site` Worker and D1 database, and the private `mikeblocky-private` R2 bucket. The Skip and Loafer project is separate.

## Free plan

Run `node scripts/build-cloudflare.mjs`, then `wrangler deploy --config apps/web-sveltekit/wrangler.jsonc`. Generated deployment copies of oversized artwork are optimized; repository originals are preserved.

Existing public thumbnails are generated locally with `node scripts/warm-cloudflare-social.mjs` and cached in R2. New cards use Browser Run rather than CPU-intensive WASM inside the Worker. A daily 40-render cap and a cached default card keep rendering bounded. No paid plan is required; Cloudflare's free request, storage, and browser allowances still apply.

Public attachments are content-addressed under `/media/`. Only objects registered in `public_media` and stored under `public-media/` can use that endpoint. Commission objects are never registered there.

## Private galleries

- Open `/commissions/files` with the independent, randomly generated gallery admin password. The local credential is stored in the Git-ignored `.private-backups/private-folder-admin.txt`.
- Manage orders and private galleries together at `/commissions`, using the gallery admin password. Choose a 10–128 character gallery password or leave it blank to generate four words. New passwords are case-sensitive and used exactly as entered. Existing four-word passwords still accept spaces or hyphens. Recipients can change their folder password under Access after confirming the current password; this signs other viewers out. Share the URL and password directly with its intended recipient.
- Recipients may view, comment, and pin annotations to images. Only the gallery administrator can upload, archive, restore, or reset access.
- Resetting a folder password revokes existing viewer sessions. Sessions expire after one hour and use HttpOnly, Secure, SameSite=Strict, host-only cookies scoped to the folder.
- Image requests independently verify the session and folder membership. No public bucket URL or unauthenticated signed download is issued. Pages, data, and images are no-store and noindex; authentication is the access boundary.
- Generated passphrases use four independently selected words from an attributed EFF short-word list. Their salted HMAC hashes require the separate `VAULT_PASSWORD_PEPPER` Worker secret, protecting against offline guessing after a database-only leak. Login and comment attempts have persistent limits. Existing high-entropy tokens remain verifiable until replaced.
- Uploaded PNG/JPEG/WebP files are checked for signatures, dimensions, and size. SVG/HTML uploads are rejected. Comments and names render as escaped text. Private writes require a same-origin request.

Do not place commission files in `public/`, public social cards, or the public attachment endpoint.

## Migration and fallback

The complete Redis export is AES-256-GCM encrypted under the Git-ignored `.private-backups/` directory, with its decryption key stored separately. `migration-audit.json` records the initial full-content verification. Source Redis is retained for rollback. Public media extraction changes the storage representation while preserving image bytes.

The Worker is primary through routes for exactly `mikeblocky.com/*` and `www.mikeblocky.com/*`. Existing proxied DNS remains pointed at Vercel, so disabling those two routes restores the Vercel origin without deleting DNS records. Other subdomains and the fansite are unaffected.

The Vercel production alias is retained as a fallback. Set `MIGRATION_READ_ONLY=1` on Vercel so requests cannot create a second writable copy of the site. The Cloudflare entry can fall back to public Vercel GET pages when the application returns a server error. It never forwards credentials, private galleries, private images, or writes to that fallback. An outage of Cloudflare itself requires using the direct Vercel alias or changing DNS; the Worker cannot provide failover while its platform is unavailable.

Existing commissioned people were provisioned with separate galleries. Their initial recipient passwords are in the Git-ignored `.private-backups/commission-folder-passwords.json`. Future passwords appear once on creation or reset; they are not retrievable from the database.

Keep all `.env*`, `.dev.vars*`, `.private-backups/`, and `.wrangler/` files out of Git. Cloudflare integration credentials are configured as Worker secrets.
