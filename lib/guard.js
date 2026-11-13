// Checks the password session token before any news function runs.
// The token is checked by the auth function on the main Netlify site (vsknews),
// so the Vercel copy uses the same password.
const MAIN_SITE = "https://vsknews.netlify.app";
const cache = new Map(); // token -> time it was last confirmed

function authBase(event) {
  if (process.env.AUTH_HOST) return process.env.AUTH_HOST.replace(/\/$/, "");
  if (process.env.VERCEL) return MAIN_SITE;
  const h = (event && event.headers) || {};
  const host = h.host || h.Host;
  return host ? `https://${host}` : MAIN_SITE;
}

const deny = (msg) => ({
  statusCode: 401,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  body: JSON.stringify({ ok: false, locked: true, error: msg }),
});

async function guard(event) {
  const h = (event && event.headers) || {};
  const token = h["x-vsk-token"] || h["X-Vsk-Token"];
  if (!token) return deny("पासवर्ड ज़रूरी है");
  const seen = cache.get(token);
  if (seen && Date.now() - seen < 60000) return null;
  try {
    const r = await fetch(`${authBase(event)}/.netlify/functions/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", token }),
      signal: AbortSignal.timeout(6000),
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.ok) { cache.set(token, Date.now()); return null; }
    return deny("सत्र समाप्त — फिर से पासवर्ड डालें");
  } catch (e) {
    return deny("पासवर्ड जाँच नहीं हो सकी — फिर कोशिश करें");
  }
}

// Wrap a Netlify (Lambda-style) handler so it only runs after the check
function protect(handler) {
  return async (event, context) => {
    const blocked = await guard(event);
    if (blocked) return blocked;
    return handler(event, context);
  };
}

module.exports = { guard, protect };
