// The about page is fully static prose with no dynamic data. Prerendering it
// emits about/__data.json as a static file, so adapter-vercel no longer tries
// to route it to the catchall serverless function (which produced the
// "Could not find target Lambda or EdgeFunction for path about/__data.json"
// warning during the Vercel build).
export const prerender = true;
