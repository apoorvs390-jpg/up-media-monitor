// Vercel: forwards password requests to the main Netlify site (vsknews),
// so both sites share one password. Change AUTH_HOST to point elsewhere.
const MAIN_SITE = (process.env.AUTH_HOST || "https://vsknews.netlify.app").replace(/\/$/, "");

module.exports = async (req, res) => {
  try {
    const opts = { method: req.method, headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(10000) };
    if (req.method === "POST") opts.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
    const r = await fetch(`${MAIN_SITE}/.netlify/functions/auth`, opts);
    res.statusCode = r.status;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.end(await r.text());
  } catch (e) {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "पासवर्ड सर्वर से संपर्क नहीं हो सका" }));
  }
};
