const https = require("https");

// ── STRATEGY: Fewer, broader queries per topic = more reliable results
// Each topic gets 1-2 broad queries. Narrow queries often return 0 results.
// We take top 8 per topic so each topic has enough articles.
const TOPICS = [
  {q:"RSS+Rashtriya+Swayamsevak+Sangh",         label:"RSS, स्वयंसेवक"},
  {q:"Mohan+Bhagwat+news",                       label:"पू. सरसंघचालक डॉ. मोहन भागवत"},
  {q:"Dattatreya+Hosabale+RSS",                  label:"मा. सरकार्यवाह दत्तात्रेय होसबाले"},
  {q:"Ram+temple+Ayodhya",                       label:"श्रीराम मंदिर/अयोध्या"},
  {q:"Hindu+Hindutva+India",                     label:"हिंदू, हिन्दुत्व, धर्म संस्कृति"},
  {q:"VHP+Bajrang+Dal+news",                     label:"हिंदू, हिन्दुत्व, धर्म संस्कृति"},
  {q:"Cow+Ganga+India+news",                     label:"गो, गंगा-गीता, वेद-पुराण"},
  {q:"Muslim+Islam+India+news",                  label:"मुगल-मुस्लिम-इस्लाम"},
  {q:"population+demographic+India",             label:"जनसंख्या-डेमोग्राफिक चेंज"},
  {q:"Jammu+Kashmir+news",                       label:"जम्मू-कश्मीर"},
  {q:"national+unity+India",                     label:"राष्ट्रीय एकता"},
  {q:"temple+heritage+India",                    label:"मंदिर-धरोहर"},
  {q:"Kashi+Vishwanath+Mathura+Vrindavan",       label:"मंदिर-धरोहर"},
  {q:"Indian+history+freedom+fighter",           label:"महापुरुष-इतिहास"},
  {q:"Hindi+language+education+India",           label:"शिक्षा-भाषा"},
  {q:"farmers+kisan+India+news",                 label:"गाँव-खेती-किसानी"},
  {q:"Ram+Mandir+Ayodhya+pilgrims",              label:"श्रीराम मंदिर/अयोध्या"},
  {q:"environment+pollution+India",              label:"पर्यावरण संरक्षण-प्रकृति"},
  {q:"social+harmony+caste+India",              label:"समाज, सामाजिक समरसता"},
  {q:"partition+1947+India+Pakistan",            label:"विभाजन की विभीषिका"},
  {q:"Indian+Constitution+rights+India",         label:"तिरंगा, संविधान दिवस"},
  {q:"family+marriage+India+values",             label:"कुटुंब प्रबोधन, विवाह"},
  {q:"mob+lynching+communal+India",              label:"मॉब लिंचिंग, हिंसा"},
  {q:"India+2047+development+Viksit+Bharat",    label:"भविष्य का भारत"},
  {q:"CAA+NRC+citizenship+India",               label:"CAA नागरिकता संशोधन"},
  {q:"Indian+army+military+defence",            label:"भारतीय अखंडता, शौर्य, सेना"},
  {q:"terrorism+naxal+India+news",              label:"आतंकवाद-नक्सलवाद"},
  {q:"Akhand+Bharat+nationalism",               label:"अखंड भारत"},
  {q:"Atmanirbhar+Bharat+Make+in+India",        label:"आत्मनिर्भर, स्वावलंबन"},
  {q:"reservation+OBC+SC+ST+India",            label:"आरक्षण"},
  {q:"China+India+border+news",                 label:"CHINA"},
  {q:"women+empowerment+India",                 label:"नारी शक्ति"},
  {q:"youth+jobs+unemployment+India",           label:"रोजगार, युवा"},
  {q:"Yoga+Ayurveda+India+health",              label:"स्वास्थ्य-योग/आयुर्वेद"},
  {q:"religious+conversion+India",              label:"कन्वर्जन-ईसाई मिशनरी"},
  {q:"halal+India+controversy",                 label:"हलाल"},
  {q:"Guru+Purnima+Hindu+festival",             label:"भगवा ध्वज, गुरु पूर्णिमा"},
  {q:"India+independence+freedom+history",      label:"स्वाधीनता का अमृत महोत्सव"},
  {q:"Hedgewar+RSS+Nagpur+history",             label:"आद्य सरसंघचालक डॉ. हेडगेवार"},
  {q:"Dattopant+Thengadi+BMS+Swadeshi",         label:"श्रद्धेय दत्तोपंत ठेंगड़ी"},
  {q:"Swami+Vivekananda+India+inspiration",     label:"स्वामी विवेकानंद"},
  {q:"Aurobindo+Ghosh+philosophy",              label:"महर्षि अरविन्द"},
  {q:"Veer+Savarkar+Hindutva+history",          label:"वीर सावरकर"},
  {q:"Golwalkar+Guruji+RSS+history",            label:"श्री गुरूजी"},
  {q:"love+jihad+forced+conversion",            label:"लव जिहाद/मतांतरण"},
  {q:"Bhagavad+Gita+Gita+Jayanti",             label:"गीता जयंती"},
  {q:"Shivaji+Maharaj+Hindu+Swaraj",            label:"छत्रपति शिवाजी/हिंदू स्वराज्य दिवस"},
  {q:"Emergency+1975+India+Indira",             label:"आपातकाल"},
  {q:"tribal+adivasi+vanvasi+India",            label:"जनजाति/वनवासी समाज"},
  {q:"social+harmony+samrasta+India",           label:"सामाजिक समरसता"},
];

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
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1")
    .replace(/<[^>]+>/g," ")
    .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">")
    .replace(/&quot;/g,'"').replace(/&#39;/g,"'")
    .replace(/\s+/g," ").trim();
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


// ── SOURCE GROUPS — extra publishers searched for EVERY topic ─────────
// Searched through Google News "site:" queries (reliable; no guessing of
// each publisher's own RSS path).
const SRC_GROUPS = [
  { name: "भारत/एशिया", sites: ["statetimes.in","tribuneindia.com","economictimes.indiatimes.com",
      "thehindubusinessline.com","financialexpress.com","mid-day.com","gulfnews.com","scmp.com"] },
  { name: "US/Europe", sites: ["ft.com","wsj.com","nytimes.com","washingtonpost.com","latimes.com",
      "nydailynews.com","chicagotribune.com","nationalpost.com","theglobeandmail.com","bild.de","elpais.com"] },
  { name: "UK", sites: ["theguardian.com","telegraph.co.uk","independent.co.uk","thetimes.com",
      "dailymail.com","thesun.co.uk","mirror.co.uk"] },
];

function gnUrl(q) {
  return "https://news.google.com/rss/search?q=" + encodeURIComponent(q) + "&hl=en-IN&gl=IN&ceid=IN:en";
}
function siteQuery(topicQ, sites) {
  return topicQ + " (" + sites.map(s => "site:" + s).join(" OR ") + ") when:7d";
}

// Run tasks with limited concurrency; stop starting new ones after the deadline
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
  const deadline = t0 + 16000;          // stop launching new requests after 16s
  const LIMIT_30D = 30 * 24 * 3600 * 1000;
  const LIMIT_14D = 14 * 24 * 3600 * 1000;
  const PER_LABEL_MAX = 25;
  const stats = { started: 0, ok: 0, failed: 0, skipped: 0, tasksTotal: 0 };

  const buckets = {};   // label -> items
  function push(label, items, max, limitMs) {
    if (!buckets[label]) buckets[label] = [];
    let n = 0;
    for (const it of items) {
      if (n >= max) break;
      if (it.pubDate) {
        const p = new Date(it.pubDate).getTime();
        if (!isNaN(p) && (t0 - p) > limitMs) continue;
      }
      buckets[label].push(it);
      n++;
    }
  }

  const tasks = [];

  // 1) Base query for every topic
  TOPICS.forEach(({ q, label }) => {
    tasks.push(async () => {
      const xml = await fetchUrl(gnUrl(q.replace(/\+/g, " ")), 0, 6000);
      push(label, parseRSS(xml, label), 15, LIMIT_30D);
    });
  });

  // 2) Same topic restricted to each extra source group
  const firstQ = {};
  TOPICS.forEach(t => { if (!firstQ[t.label]) firstQ[t.label] = t.q.replace(/\+/g, " "); });
  SRC_GROUPS.forEach(g => {
    Object.keys(firstQ).forEach(label => {
      tasks.push(async () => {
        const xml = await fetchUrl(gnUrl(siteQuery(firstQ[label], g.sites)), 0, 6000);
        push(label, parseRSS(xml, label), 8, LIMIT_14D);
      });
    });
  });

  stats.tasksTotal = tasks.length;
  await runPool(tasks, 16, deadline, stats);

  // Per label: dedup, newest first, cap; then global dedup across labels
  const seen = new Set();
  const out = [];
  Object.keys(buckets).forEach(label => {
    const arr = buckets[label].sort((a, b) => {
      const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return db - da;
    });
    let kept = 0;
    for (const a of arr) {
      if (kept >= PER_LABEL_MAX) break;
      const k = a.raw.replace(/\W/g, "").toLowerCase().slice(0, 42);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(a);
      kept++;
    }
  });

  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({
      ok: true,
      count: out.length,
      items: out,
      debug: Object.assign({ ms: Date.now() - t0 }, stats),
    }),
  };
};
