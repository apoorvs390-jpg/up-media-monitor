const https = require("https");
const http = require("http");

// ── SOCIAL MEDIA BUZZ ─────────────────────────────────────────
const SOCIAL_QUERIES = [
  "UP+viral+video","UP+viral+news","Uttar+Pradesh+viral",
  "Lucknow+viral","UP+trending","Yogi+Adityanath+statement",
  "Yogi+Adityanath+reacts","Akhilesh+Yadav+statement",
  "UP+controversy","UP+social+media","Noida+viral+video",
  "UP+twitter","UP+netizens","UP+outrage",
  "Uttar+Pradesh+slams","Uttar+Pradesh+reacts",
  "UP+police+viral+video","Kanpur+Agra+viral",
  "Yogi+Adityanath+news","Akhilesh+Yadav+news",
  "UP+BJP+SP+news","Uttar+Pradesh+politics",
];

// ── PRINT EDITION — Google News site: queries (reliable) ──────
const PRINT_QUERIES = [
  {q:"Uttar+Pradesh+site:amarujala.com",        name:"अमर उजाला"},
  {q:"Lucknow+site:amarujala.com",              name:"अमर उजाला लखनऊ"},
  {q:"Uttar+Pradesh+site:livehindustan.com",    name:"हिंदुस्तान"},
  {q:"Lucknow+site:livehindustan.com",          name:"हिंदुस्तान लखनऊ"},
  {q:"Uttar+Pradesh+site:jagran.com",           name:"दैनिक जागरण"},
  {q:"Lucknow+site:jagran.com",                 name:"जागरण लखनऊ"},
  {q:"Uttar+Pradesh+site:bhaskar.com",          name:"दैनिक भास्कर"},
  {q:"Uttar+Pradesh+site:navbharattimes.indiatimes.com", name:"नवभारत टाइम्स"},
  {q:"Uttar+Pradesh+site:abplive.com",          name:"एबीपी लाइव"},
  {q:"Uttar+Pradesh+site:news18.com",           name:"न्यूज़18"},
  {q:"Uttar+Pradesh+site:aajtak.in",            name:"आज तक"},
  {q:"Uttar+Pradesh+site:zeenews.india.com",    name:"ज़ी न्यूज़"},
  {q:"Uttar+Pradesh+site:patrika.com",          name:"पत्रिका"},
  {q:"Uttar+Pradesh+site:indiatv.in",           name:"इंडिया टीवी"},
  {q:"Uttar+Pradesh+site:timesofindia.indiatimes.com", name:"Times of India"},
  {q:"Uttar+Pradesh+site:hindustantimes.com",   name:"Hindustan Times"},
  {q:"Uttar+Pradesh+site:ndtv.com",             name:"NDTV"},
  {q:"Uttar+Pradesh+site:thehindu.com",         name:"The Hindu"},
  {q:"Uttar+Pradesh+site:statetimes.in",                    name:"State Times"},
  {q:"Uttar+Pradesh+site:tribuneindia.com",                 name:"The Tribune"},
  {q:"Uttar+Pradesh+site:economictimes.indiatimes.com",     name:"Economic Times"},
  {q:"Uttar+Pradesh+site:thehindubusinessline.com",         name:"Hindu BusinessLine"},
  {q:"Uttar+Pradesh+site:financialexpress.com",             name:"Financial Express"},
  {q:"Uttar+Pradesh+site:mid-day.com",                      name:"Mid-Day"},
];

// ── RSS NATIONAL — meetings, events, programs ─────────────────
const RSS_NATIONAL_QUERIES = [
  "RSS+meeting+news",
  "Rashtriya+Swayamsevak+Sangh+meeting",
  "RSS+baithak+news",
  "RSS+karyakram+news",
  "RSS+event+program+2026",
  "RSS+Akhil+Bharatiya+baithak",
  "RSS+Pratinidhi+Sabha+meeting",
  "Mohan+Bhagwat+RSS+program",
  "Dattatreya+Hosabale+meeting",
  "RSS+sangh+shiksha+varg",
  "RSS+national+meeting+India",
  "Sangh+parivar+meeting+news",
  "RSS+Nagpur+meeting+news",
  "VHP+Bajrang+Dal+meeting+news",
  "RSS+swayamsevak+camp+news",
];

// ── RSS AWADH PRANT — Lucknow region specific ─────────────────
const RSS_AWADH_QUERIES = [
  "RSS+Lucknow+news",
  "RSS+Awadh+Prant+news",
  "RSS+Lucknow+karyakram",
  "Rashtriya+Swayamsevak+Sangh+Lucknow",
  "RSS+Lucknow+meeting+2026",
  "RSS+Awadh+meeting+news",
  "RSS+kshetra+pracharak+news",
  "RSS+prant+pracharak+Lucknow",
  "Sangh+Lucknow+baithak",
  "RSS+UP+karyakram+news",
  "RSS+Awadh+prant+karyakram",
  "Lucknow+sangh+news",
  "RSS+Gorakhpur+Varanasi+news",
  "RSS+Prayagraj+Kanpur+news",
  "RSS+Uttar+Pradesh+news",
];

// ── Direct RSS feeds (bonus, best-effort) ─────────────────────
const DIRECT_FEEDS = [
  {url:"https://www.amarujala.com/rss/uttar-pradesh.xml",    name:"अमर उजाला"},
  {url:"https://www.livehindustan.com/rss/uttar-pradesh.xml", name:"हिंदुस्तान"},
  {url:"https://www.jagran.com/rss/uttar-pradesh.xml",       name:"दैनिक जागरण"},
  {url:"https://timesofindia.indiatimes.com/rssfeeds/913168846.cms", name:"TOI UP"},
];

const UP_KW = [
  "uttar pradesh","yogi","lucknow","varanasi","prayagraj","kanpur","agra",
  "gorakhpur","meerut","noida","ghaziabad","ayodhya","mathura","bareilly",
  "aligarh","moradabad","jhansi","allahabad","saharanpur","muzaffarnagar",
  "azamgarh","ballia","bahraich","gonda","unnao","hardoi","lakhimpur",
  "mirzapur","jaunpur","ghazipur","kushinagar","basti","etawah","fatehpur",
  "deoria","mau","rampur","bijnor","sitapur","sultanpur","rae bareli",
  "raebareli","sambhal","amroha","hapur","shamli","baghpat","chitrakoot",
  "banda","pratapgarh","maharajganj","siddharthnagar","shravasti","balrampur",
  "firozabad","mainpuri","etah","farrukhabad","kannauj","auraiya","hamirpur",
  "mahoba","lalitpur","jalaun","sonbhadra","bulandshahr","gautam buddha nagar",
  "up police","up government","up news","up crime","up flood","up farmer",
  "akhilesh","mayawati","up bjp","yogi adityanath","awadh","oudh",
];

const W = {
  "Uttar Pradesh":"उत्तर प्रदेश","Lucknow":"लखनऊ","Varanasi":"वाराणसी",
  "Prayagraj":"प्रयागराज","Allahabad":"प्रयागराज","Kanpur":"कानपुर",
  "Agra":"आगरा","Gorakhpur":"गोरखपुर","Meerut":"मेरठ","Noida":"नोएडा",
  "Ghaziabad":"गाजियाबाद","Ayodhya":"अयोध्या","Mathura":"मथुरा",
  "Bareilly":"बरेली","Aligarh":"अलीगढ़","Moradabad":"मुरादाबाद",
  "Jhansi":"झांसी","Saharanpur":"सहारनपुर","Muzaffarnagar":"मुजफ्फरनगर",
  "Mirzapur":"मिर्जापुर","Jaunpur":"जौनपुर","Ghazipur":"गाजीपुर",
  "Kushinagar":"कुशीनगर","Basti":"बस्ती","Bahraich":"बहराइच",
  "Gonda":"गोंडा","Sultanpur":"सुल्तानपुर","Unnao":"उन्नाव",
  "Hardoi":"हरदोई","Sitapur":"सीतापुर","Lakhimpur":"लखीमपुर",
  "Etawah":"इटावा","Fatehpur":"फतेहपुर","Deoria":"देवरिया","Mau":"मऊ",
  "Sambhal":"संभल","Bulandshahr":"बुलंदशहर","Hapur":"हापुड़",
  "Yogi Adityanath":"योगी आदित्यनाथ","Chief Minister":"मुख्यमंत्री",
  "CM Yogi":"सीएम योगी","Modi":"मोदी","Akhilesh Yadav":"अखिलेश यादव",
  "Mayawati":"मायावती","RSS":"आरएसएस","Sangh":"संघ",
  "viral":"वायरल","trending":"ट्रेंडिंग","video":"वीडियो",
  "reaction":"प्रतिक्रिया","controversy":"विवाद","statement":"बयान",
  "meeting":"बैठक","program":"कार्यक्रम","event":"कार्यक्रम",
  "pracharak":"प्रचारक","baithak":"बैठक","karyakram":"कार्यक्रम",
  "arrested":"गिरफ्तार","murder":"हत्या","killed":"मारे गए",
  "dead":"मृत","death":"मौत","accident":"दुर्घटना","fire":"आग",
  "flood":"बाढ़","crime":"अपराध","police":"पुलिस","protest":"विरोध",
  "inaugurated":"का उद्घाटन किया","expressway":"एक्सप्रेसवे",
  "hospital":"अस्पताल","project":"परियोजना","development":"विकास",
  "crore":"करोड़","government":"सरकार","minister":"मंत्री",
  "BJP":"भाजपा","Congress":"कांग्रेस","election":"चुनाव",
  "scheme":"योजना","farmer":"किसान","news":"समाचार",
  "today":"आज","India":"भारत","Awadh":"अवध",
  "Rashtriya Swayamsevak Sangh":"राष्ट्रीय स्वयंसेवक संघ",
  "Akhil Bharatiya":"अखिल भारतीय","Pratinidhi":"प्रतिनिधि",
};

function hi(t) {
  if (!t) return "";
  let r = t;
  for (const [e, h] of Object.entries(W).sort((a,b)=>b[0].length-a[0].length)) {
    try { r = r.replace(new RegExp("\\b"+e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\b","gi"),h); } catch(_) {}
  }
  return r;
}

function isUP(t) {
  const l = t.toLowerCase();
  return UP_KW.some(k => l.includes(k));
}

// RSS news doesn't always mention UP — include all RSS news
function isRSS(t) {
  const l = t.toLowerCase();
  return ["rss","sangh","swayamsevak","bhagwat","hosabale","pracharak",
    "baithak","karyakram","vhp","bajrang","awadh","prant"].some(k=>l.includes(k));
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

function parseRSS(xml, defaultSource) {
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
    const source = sM ? clean(sM[1]) : (defaultSource||"Google News");
    out.push({
      raw, title:hi(raw), desc:hi(desc)||hi(raw),
      link:getLink(b), pubDate:pM?pM[1].trim():"", source
    });
  }
  return out;
}

function fetchUrl(url, hops) {
  hops = hops||0;
  if (hops>4) return Promise.reject(new Error("too many redirects"));
  return new Promise((res,rej)=>{
    const client = url.startsWith("https")?https:http;
    const req = client.get(url,{
      headers:{
        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
        "Accept":"application/rss+xml,application/xml,text/xml,*/*",
        "Accept-Language":"en-IN,en;q=0.9,hi;q=0.8",
      },
      timeout:8000,
    },(r)=>{
      if(r.statusCode>=300&&r.statusCode<400&&r.headers.location){
        r.resume();
        return fetchUrl(r.headers.location,hops+1).then(res).catch(rej);
      }
      if(r.statusCode>=400){r.resume();return rej(new Error("HTTP "+r.statusCode));}
      let d=""; r.on("data",c=>d+=c); r.on("end",()=>res(d));
    });
    req.on("error",rej);
    req.on("timeout",()=>{req.destroy();rej(new Error("timeout"));});
  });
}

function dedup(arr) {
  const seen = new Set();
  return arr.filter(a=>{
    const k = a.raw.replace(/\W/g,"").toLowerCase().slice(0,45);
    if(seen.has(k))return false; seen.add(k); return true;
  });
}

exports.handler = async () => {
  const CORS = {"Access-Control-Allow-Origin":"*","Content-Type":"application/json"};
  const now = Date.now();
  const H24 = 24*3600*1000;
  const H48 = 48*3600*1000;
  const H7D = 7*24*3600*1000;

  function gnUrl(q, tp) {
    const b = `https://news.google.com/rss/search?q=${q}&hl=en-IN&gl=IN&ceid=IN:en`;
    return tp ? b + `&tbs=qdr:${tp}` : b;
  }

  const socialAll=[], printAll=[], rssNatAll=[], rssAwadhAll=[];

  // ── 1. SOCIAL (last 24h: tbs=qdr:d) ──
  await Promise.allSettled(SOCIAL_QUERIES.map(async q=>{
    try{
      const xml=await fetchUrl(gnUrl(q,"d"));
      parseRSS(xml,"Google News").forEach(item=>{
        if(item.pubDate){const p=new Date(item.pubDate).getTime();if(!isNaN(p)&&(now-p)>H24)return;}
        if(!isUP(item.raw+" "+item.desc))return;
        socialAll.push(item);
      });
    }catch(_){
      try{
        const xml=await fetchUrl(gnUrl(q,""));
        parseRSS(xml,"Google News").forEach(item=>{
          if(item.pubDate){const p=new Date(item.pubDate).getTime();if(!isNaN(p)&&(now-p)>H24)return;}
          if(!isUP(item.raw+" "+item.desc))return;
          socialAll.push(item);
        });
      }catch(_){}
    }
  }));

  // ── 2. PRINT (last 2 days: tbs=qdr:2d) ──
  await Promise.allSettled(PRINT_QUERIES.map(async({q,name})=>{
    let items=[];
    try{
      const xml=await fetchUrl(gnUrl(q,"2d"));
      items=parseRSS(xml,name);
    }catch(_){}
    if(!items.length){
      try{
        const xml=await fetchUrl(gnUrl(q,""));
        items=parseRSS(xml,name);
      }catch(_){}
    }
    items.forEach(item=>{
      if(item.pubDate){const p=new Date(item.pubDate).getTime();if(!isNaN(p)&&(now-p)>H48)return;}
      if(!isUP(item.raw+" "+item.desc))return;
      printAll.push(item);
    });
  }));

  // ── 2b. Direct RSS feeds (bonus) ──
  await Promise.allSettled(DIRECT_FEEDS.map(async({url,name})=>{
    try{
      const xml=await fetchUrl(url);
      parseRSS(xml,name).forEach(item=>{
        if(item.pubDate){const p=new Date(item.pubDate).getTime();if(!isNaN(p)&&(now-p)>H48)return;}
        if(!isUP(item.raw+" "+item.desc))return;
        printAll.push(item);
      });
    }catch(_){}
  }));

  // ── 3. RSS NATIONAL (last week: tbs=qdr:w) ──
  await Promise.allSettled(RSS_NATIONAL_QUERIES.map(async q=>{
    let items=[];
    try{
      const xml=await fetchUrl(gnUrl(q,"w"));
      items=parseRSS(xml,"Google News");
    }catch(_){}
    if(!items.length){
      try{
        const xml=await fetchUrl(gnUrl(q,""));
        items=parseRSS(xml,"Google News");
      }catch(_){}
    }
    items.forEach(item=>{
      if(item.pubDate){const p=new Date(item.pubDate).getTime();if(!isNaN(p)&&(now-p)>H7D)return;}
      if(!isRSS(item.raw+" "+item.desc))return;
      rssNatAll.push(item);
    });
  }));

  // ── 4. RSS AWADH (last week: tbs=qdr:w) ──
  await Promise.allSettled(RSS_AWADH_QUERIES.map(async q=>{
    let items=[];
    try{
      const xml=await fetchUrl(gnUrl(q,"w"));
      items=parseRSS(xml,"Google News");
    }catch(_){}
    if(!items.length){
      try{
        const xml=await fetchUrl(gnUrl(q,""));
        items=parseRSS(xml,"Google News");
      }catch(_){}
    }
    items.forEach(item=>{
      if(item.pubDate){const p=new Date(item.pubDate).getTime();if(!isNaN(p)&&(now-p)>H7D)return;}
      if(!isRSS(item.raw+" "+item.desc))return;
      rssAwadhAll.push(item);
    });
  }));

  let socialUnique=dedup(socialAll);
  let printUnique=dedup(printAll);
  let rssNatUnique=dedup(rssNatAll);
  let rssAwadhUnique=dedup(rssAwadhAll);

  // Print fallback
  if(printUnique.length<8){
    const fb=[];
    await Promise.allSettled(["Uttar+Pradesh+news","Lucknow+news"].map(async q=>{
      try{
        const xml=await fetchUrl(gnUrl(q,"2d"));
        parseRSS(xml,"Google News").forEach(item=>{
          if(!isUP(item.raw+" "+item.desc))return;
          fb.push(item);
        });
      }catch(_){}
    }));
    printUnique=dedup([...printUnique,...fb]);
  }

  const sortFn=(a,b)=>{
    const da=a.pubDate?new Date(a.pubDate).getTime():0;
    const db=b.pubDate?new Date(b.pubDate).getTime():0;
    return db-da;
  };

  return {
    statusCode:200,
    headers:CORS,
    body:JSON.stringify({
      ok:true,
      socialItems:socialUnique.sort(sortFn),
      printItems:printUnique.sort(sortFn),
      rssNationalItems:rssNatUnique.sort(sortFn),
      rssAwadhItems:rssAwadhUnique.sort(sortFn),
    }),
  };
};
