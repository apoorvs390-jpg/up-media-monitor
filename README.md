# यूपी मीडिया मॉनिटर (UP Media Monitor)

UP news report: last 12 hours of UP news, 48 special topics, social buzz, print edition, and RSS national/Awadh news, all from free Google News RSS (plus optional GNews).

## Files
- `public/index.html`: the page
- `netlify/functions/`: the news functions (`upnews`, `special`, `extras`, `global`)
- `api/`: small Vercel adapters that run the same functions
- `netlify.toml` / `vercel.json`: settings for each host

The page calls `/.netlify/functions/...`. On Vercel, `vercel.json` sends those calls to `/api/...`, so the same page works on both.

## Deploy
**Netlify:** Add new project → Import an existing project → GitHub → pick the repo. Leave the build command empty. Netlify reads the publish folder (`public`) from `netlify.toml`.

**Vercel:** Add New → Project → Import the repo. Set Framework Preset to **Other** and leave the build settings empty.

## Optional key
`GNEWS_KEY` (gnews.io, free 100 requests/day) adds extra English UP news. Without it, Google News RSS alone still works. Each report uses 10 GNews requests, so the free plan covers about 10 reports a day.
