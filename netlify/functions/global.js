const https = require("https");

// ── वैश्विक मीडिया: how global outlets cover UP / India / RSS ─────────
// Uses Google News "site:" queries (headline + link only).
// NOTE: FT, WSJ, NYT, WaPo, The Times, Telegraph etc. are paywalled —
// the headline appears here but the full article may need a subscription.
const W = {
  "India":"भारत","Hindu":"हिंदू","Muslim":"मुस्लिम","Christian":"ईसाई",
  "RSS":"आरएसएस","BJP":"भाजपा","Congress":"कांग्रेस","Modi":"मोदी",
  "army":"सेना","border":"सीमा","terrorism":"आतंकवाद","China":"चीन",
  "women":"महिलाएं","youth":"युवा","temple":"मंदिर",
  "Ram temple":"राम मंदिर","Ayodhya":"अयोध्या","Yoga":"योग",
  "Ayurveda":"आयुर्वेद","halal":"हलाल","farmer":"किसान",
  "farmers":"किसान","election":"चुनाव","reservation":"आरक्षण",
  "conversion":"धर्मांतरण","love jihad":"लव जिहाद",
  "emergency":"आपातकाल","education":"शिक्षा","health":"स्वास्थ्य",
  "employment":"रोजगार","unity":"एकता","history":"इतिहास",
  "culture":"संस्कृति","religion":"धर्म","Vivekananda":"विवेकानंद",
  "Savarkar":"सावरकर","Shivaji":"शिवाजी","Bhagwat":"भागवत",
  "Lucknow":"लखनऊ","government":"सरकार","development":"विकास",
  "crore":"करोड़","minister":"मंत्री","protest":"विरोध",
  "killed":"मारे गए","arrested":"गिरफ्तार","dead":"मृत",
  "death":"मौत","violence":"हिंसा","tribal":"आदिवासी",
  "Rashtriya Swayamsevak Sangh":"राष्ट्रीय स्वयंसेवक संघ",
  "Akhil Bharatiya":"अखिल भारतीय","news":"समाचार","today":"आज",
  "Uttar Pradesh":"उत्तर प्रदेश","UP":"यूपी",
  "meeting":"बैठक","event":"कार्यक्रम","program":"कार्यक्रम",
};

function hi(t) {
  if (!t) return "";
  let r = t;
  for (const [e, h] of Object.entries(W).sort((a,b) => b[0].length - a[0].length)) {
    try { r = r.replace(new RegExp("\\b" + e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + "\\b","gi"), h); } catch(_) {}
  }
  return r;
}

function clean(s) {
  if (!s) return "";
  s = String(s).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  // Decode entities FIRST (feeds send escaped HTML like &lt;a href=...&gt;), repeat for double-encoding
  const dec = x => x.replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, "&");
  for (let i = 0; i < 3; i++) { const d = dec(s); if (d === s) break; s = d; }
  // THEN strip any tags that were hiding in the text
  s = s.replace(/<\/?[a-zA-Z][^>]*>/g, " ");
  return s.replace(/\s+/g, " ").trim();
}

function getLink(b) {
  for (const p of [
    /<link\/>\s*(https?:\/\/[^\s<"]{10,})/,
    /<link[^>]*>\s*(https?:\/\/[^\s<"]{10,})/,
    /<guid[^>]*>\s*(https?:\/\/[^\s<"]{10,})/,
    /(https?:\/\/[^\s"<>]{15,})/
  ]) { const m = b.match(p); if (m) return m[1].trim(); }
  return "";
}

function parseRSS(xml, label) {
  const out = [];
  if (!xml || !xml.includes("<item>")) return out;
  const re = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const b = m[1];
    const tM = b.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const dM = b.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    const sM = b.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
    const pM = b.match(/<pubDate[^>]*>([^<]+)<\/pubDate>/i);
    const raw = tM ? clean(tM[1]) : "";
    if (!raw || raw.length < 8) continue;
    const desc = dM ? clean(dM[1]) : "";
    const source = sM ? clean(sM[1]) : "Google News";
    out.push({
      raw, title: hi(raw),
      desc: hi(desc) || hi(raw),
      link: getLink(b),
      pubDate: pM ? pM[1].trim() : "",
      source, label
    });
  }
  return out;
}

function fetchUrl(url, hops, tmo) {
  tmo = tmo || 9000;
  hops = hops || 0;
  if (hops > 3) return Promise.reject(new Error("too many redirects"));
  return new Promise((res, rej) => {
    const req = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml,application/xml,text/xml,*/*",
        "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
      },
      timeout: tmo,
    }, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        r.resume();
        return fetchUrl(r.headers.location, hops + 1, tmo).then(res).catch(rej);
      }
      if (r.statusCode >= 400) { r.resume(); return rej(new Error("HTTP " + r.statusCode)); }
      let d = ""; r.on("data", c => d += c); r.on("end", () => res(d));
    });
    req.on("error", rej);
    req.on("timeout", () => { req.destroy(); rej(new Error("timeout")); });
  });
}



const GROUPS = [
  { name: "भारत/एशिया", sites: ["statetimes.in","tribuneindia.com","economictimes.indiatimes.com",
      "thehindubusinessline.com","financialexpress.com","mid-day.com","gulfnews.com","scmp.com"] },
  { name: "US/Europe", sites: ["ft.com","wsj.com","nytimes.com","washingtonpost.com","latimes.com",
      "nydailynews.com","chicagotribune.com","nationalpost.com","theglobeandmail.com","bild.de","elpais.com"] },
  { name: "UK", sites: ["theguardian.com","telegraph.co.uk","independent.co.uk","thetimes.com",
      "dailymail.com","thesun.co.uk","mirror.co.uk"] },
];

// UP-focused themes first, then wider India context
const THEMES = [
  '"Uttar Pradesh" OR Yogi OR Lucknow',
  'RSS OR "Rashtriya Swayamsevak Sangh" OR Hindutva',
  'Ayodhya OR Varanasi OR Kashi OR Mathura',
  'India Modi government',
  'India Kashmir OR Pakistan',
  'India China border',
  'India Hindu OR Muslim OR minorities',
  'India economy OR investment OR industry',
];

function gnUrl(q) {
  return "https://news.google.com/rss/search?q=" + encodeURIComponent(q) + "&hl=en-IN&gl=IN&ceid=IN:en";
}

async function runPool(tasks, limit, deadline, stats) {
  let i = 0;
  async function worker() {
    while (i < tasks.length && Date.now() < deadline) {
      const t = tasks[i++];
      stats.started++;
      try { await t(); stats.ok++; } catch (_) { stats.failed++; }
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  stats.skipped = tasks.length - stats.started;
}

exports.handler = async () => {
  const CORS = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
  const t0 = Date.now();
  const deadline = t0 + 16000;
  const LIMIT_14D = 14 * 24 * 3600 * 1000;
  const stats = { started: 0, ok: 0, failed: 0, skipped: 0, tasksTotal: 0 };
  const all = [];

  const tasks = [];
  THEMES.forEach(theme => {
    GROUPS.forEach(g => {
      tasks.push(async () => {
        const q = "(" + theme + ") (" + g.sites.map(s => "site:" + s).join(" OR ") + ") when:7d";
        const xml = await fetchUrl(gnUrl(q), 0, 6000);
        parseRSS(xml, "global").slice(0, 12).forEach(it => {
          if (it.pubDate) {
            const p = new Date(it.pubDate).getTime();
            if (!isNaN(p) && (t0 - p) > LIMIT_14D) return;
          }
          all.push(it);
        });
      });
    });
  });

  stats.tasksTotal = tasks.length;
  await runPool(tasks, 12, deadline, stats);

  const seen = new Set();
  const unique = all.filter(a => {
    const k = a.raw.replace(/\W/g, "").toLowerCase().slice(0, 45);
    if (seen.has(k)) return false; seen.add(k); return true;
  });
  unique.sort((a, b) => {
    const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return db - da;
  });

  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({
      ok: true,
      count: unique.length,
      items: unique.slice(0, 150),
      debug: Object.assign({ ms: Date.now() - t0 }, stats),
    }),
  };
};
