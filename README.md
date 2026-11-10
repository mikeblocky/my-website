# Website for my blog 

The blog design & codebase is based on summi's repo, check his stuffs out there! [link](https://github.com/sumitdotml/website)


## To-Do

- [ ] Make the navbar sticky for mobile and make the navbar move its original Y position a little higher and stick to the very top when the user scrolls down
- [ ] Add a search bar
- [ ] Add a graph visualization (similar to the [Obsidian graph view](https://help.obsidian.md/Plugins/Graph+view))
- [ ] Add a "On this page" (like a ToC) section to the top right of the page in the PC version. It should be hidden on mobile.
## Artwork folders

Add the 2026 series images to public/artworks/15-days-of-kemutai-hanashi-2026/. The Gallery lists this section even before its folder exists. PNG, JPEG, WebP, and AVIF files are loaded automatically on the next build.

## Local Interact preview

Run `npm run sync:interact` to copy the public posts, recommendations, drawing prompts, and sketchbook drawings from mikeblocky.com into ignored `.dev-data` snapshots. This replaces local feed edits; restart the dev server after refreshing snapshots. Run `npm run dev` and open `/interact`. Without `REDIS_URL`, development loads those snapshots and persists new edits locally across restarts. Production continues to use its existing Redis keys, including legacy `ask:questions` posts.

Page and blog social thumbnails are generated at `/api/thumbnail?title=...`. Board detail routes retain image-aware previews; the feed's Share action links to those detail routes.
