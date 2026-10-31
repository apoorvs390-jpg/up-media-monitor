// Vercel adapter — runs the same Netlify function code (netlify/functions/global.js)
const { handler } = require("../netlify/functions/global.js");

module.exports = async (req, res) => {
  try {
    const r = await handler({ httpMethod: req.method, headers: req.headers, queryStringParameters: req.query || {} }, {});
    res.statusCode = r.statusCode || 200;
    for (const [k, v] of Object.entries(r.headers || {})) res.setHeader(k, v);
    res.end(r.body || "");
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, error: String((e && e.message) || e) }));
  }
};
