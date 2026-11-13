// Password protection for UP Media Monitor
// Stores the password (scrypt hash) in Netlify Blobs, store "vsk-auth".
// Actions (POST JSON {action, ...}):
//   GET                      -> { setup: true|false }
//   setup  {password}        -> first time only; returns {token, adminKey}  (this device becomes admin)
//   login  {password}        -> {token}
//   verify {token}           -> {ok}
//   change {adminKey, current, password} -> only the admin device; logs everyone else out
//   reset  {code}            -> needs Netlify env var ADMIN_RESET_CODE; clears the password

import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

const KEY = "config";
const SESSION_DAYS = 30;
const MIN_LEN = 6;
const fails = globalThis.__VSK_FAILS || (globalThis.__VSK_FAILS = new Map());

const store = () => getStore({ name: "vsk-auth", consistency: "strong" });
const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
});
const sha = (s) => crypto.createHash("sha256").update(String(s)).digest("hex");
const hashPw = (pw, salt) => crypto.scryptSync(String(pw), salt, 64).toString("hex");
const same = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
const b64 = (s) => Buffer.from(s).toString("base64url");

function makeToken(cfg) {
  const body = b64(JSON.stringify({ v: cfg.version, exp: Date.now() + SESSION_DAYS * 86400000 }));
  const sig = crypto.createHmac("sha256", cfg.secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}
function tokenOk(cfg, token) {
  if (!cfg || !token || typeof token !== "string" || !token.includes(".")) return false;
  const [body, sig] = token.split(".");
  const good = crypto.createHmac("sha256", cfg.secret).update(body).digest("base64url");
  if (!same(sig, good)) return false;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString());
    return p.v === cfg.version && p.exp > Date.now();
  } catch { return false; }
}
function newConfig(password, version = 1) {
  const salt = crypto.randomBytes(16).toString("hex");
  const adminKey = crypto.randomBytes(32).toString("hex");
  return {
    adminKey,
    cfg: {
      salt, hash: hashPw(password, salt), adminHash: sha(adminKey),
      secret: crypto.randomBytes(32).toString("hex"), version,
      updatedAt: new Date().toISOString(),
    },
  };
}
const pwOk = (cfg, pw) => same(hashPw(pw || "", cfg.salt), cfg.hash);

// slow down repeated wrong passwords (per IP)
function blocked(ip) {
  const f = fails.get(ip);
  return f && f.n >= 8 && Date.now() - f.t < 10 * 60000;
}
function noteFail(ip) {
  const f = fails.get(ip);
  const n = f && Date.now() - f.t < 10 * 60000 ? f.n + 1 : 1;
  fails.set(ip, { n, t: Date.now() });
}

export default async (req) => {
  const s = store();
  const cfg = await s.get(KEY, { type: "json" });

  if (req.method === "GET") return json({ setup: !!cfg });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  let b = {};
  try { b = await req.json(); } catch { return json({ error: "bad request" }, 400); }
  const ip = req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for") || "?";

  switch (b.action) {
    case "setup": {
      if (cfg) return json({ error: "पासवर्ड पहले से सेट है" }, 409);
      if (!b.password || String(b.password).length < MIN_LEN) return json({ error: `पासवर्ड कम से कम ${MIN_LEN} अक्षर का हो` }, 400);
      const { cfg: c, adminKey } = newConfig(b.password);
      await s.setJSON(KEY, c);
      return json({ ok: true, token: makeToken(c), adminKey });
    }
    case "login": {
      if (!cfg) return json({ error: "पहले पासवर्ड सेट करें", setup: false }, 409);
      if (blocked(ip)) return json({ error: "बहुत बार गलत पासवर्ड — 10 मिनट बाद कोशिश करें" }, 429);
      if (!pwOk(cfg, b.password)) {
        noteFail(ip);
        await new Promise((r) => setTimeout(r, 700));
        return json({ error: "गलत पासवर्ड" }, 401);
      }
      fails.delete(ip);
      return json({ ok: true, token: makeToken(cfg) });
    }
    case "verify":
      return json({ ok: tokenOk(cfg, b.token) }, tokenOk(cfg, b.token) ? 200 : 401);
    case "change": {
      if (!cfg) return json({ error: "पहले पासवर्ड सेट करें" }, 409);
      if (!b.adminKey || !same(sha(b.adminKey), cfg.adminHash))
        return json({ error: "पासवर्ड सिर्फ उसी कंप्यूटर से बदला जा सकता है जिससे सेट किया गया था" }, 403);
      if (blocked(ip)) return json({ error: "बहुत बार गलत पासवर्ड — 10 मिनट बाद कोशिश करें" }, 429);
      if (!pwOk(cfg, b.current)) { noteFail(ip); return json({ error: "मौजूदा पासवर्ड गलत है" }, 401); }
      if (!b.password || String(b.password).length < MIN_LEN) return json({ error: `नया पासवर्ड कम से कम ${MIN_LEN} अक्षर का हो` }, 400);
      const salt = crypto.randomBytes(16).toString("hex");
      const c = {
        ...cfg, salt, hash: hashPw(b.password, salt),
        version: cfg.version + 1, secret: crypto.randomBytes(32).toString("hex"),
        updatedAt: new Date().toISOString(),
      };
      await s.setJSON(KEY, c);
      return json({ ok: true, token: makeToken(c) });
    }
    case "reset": {
      const code = process.env.ADMIN_RESET_CODE;
      if (!code) return json({ error: "Netlify में ADMIN_RESET_CODE सेट नहीं है" }, 403);
      if (blocked(ip)) return json({ error: "बहुत बार गलत कोड — 10 मिनट बाद कोशिश करें" }, 429);
      if (!same(b.code || "", code)) { noteFail(ip); return json({ error: "गलत रीसेट कोड" }, 401); }
      await s.delete(KEY);
      return json({ ok: true });
    }
    default:
      return json({ error: "unknown action" }, 400);
  }
};
