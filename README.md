# यूपी मीडिया मॉनिटर (UP Media Monitor)

UP news report: last 12 hours of UP news, 48 special topics, social buzz, print edition, and RSS national/Awadh news, all from free Google News RSS (plus optional GNews).

## Files
- `public/index.html`: the page
- `netlify/functions/`: the news functions (`upnews`, `special`, `extras`, `global`)
- `api/`: small Vercel adapters that run the same functions
- `lib/guard.js`: password check used by every news function
- `netlify.toml` / `vercel.json`: settings for each host

The page calls `/.netlify/functions/...`. On Vercel, `vercel.json` sends those calls to `/api/...`, so the same page works on both.

## Deploy
**Netlify:** Add new project → Import an existing project → GitHub → pick the repo. Leave the build command empty. Netlify reads the publish folder (`public`) from `netlify.toml`.

**Vercel:** Add New → Project → Import the repo. Set Framework Preset to **Other** and leave the build settings empty.

## Password protection
- First visit to the site shows **पासवर्ड सेट करें**. The browser that sets it becomes the **admin**: only it sees **🔑 पासवर्ड बदलें**.
- Everyone else must enter the password. Each browser stays logged in for 30 days. Changing the password logs everyone out.
- The password is stored securely (scrypt hash) in Netlify Blobs (`netlify/functions/auth.mjs`). The news functions refuse requests without a valid login (`lib/guard.js`).
- The Vercel copy uses the same password through `vsknews.netlify.app` (change with a Vercel env var `AUTH_HOST`).
- **Forgot password / lost admin browser:** add a Netlify environment variable `ADMIN_RESET_CODE` (any secret text), redeploy, then use "पासवर्ड भूल गए?" on the login screen. This clears the password so you can set a new one.

## Optional key
`GNEWS_KEY` (gnews.io, free 100 requests/day) adds extra English UP news. Without it, Google News RSS alone still works. Each report uses 10 GNews requests, so the free plan covers about 10 reports a day.
