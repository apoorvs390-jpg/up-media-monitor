const https = require("https");

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
  "Mayawati":"मायावती","arrested":"गिरफ्तार","murder":"हत्या",
  "killed":"मारे गए","dead":"मृत","death":"मौत","accident":"दुर्घटना",
  "fire":"आग","flood":"बाढ़","robbery":"डकैती","rape":"बलात्कार",
  "crime":"अपराध","police":"पुलिस","court":"अदालत","jail":"जेल",
  "protest":"विरोध","fraud":"धोखाधड़ी","corruption":"भ्रष्टाचार",
  "scam":"घोटाला","gang":"गिरोह","encounter":"मुठभेड़","violence":"हिंसा",
  "riot":"दंगा","missing":"लापता","injured":"घायल","attack":"हमला",
  "blast":"विस्फोट","inaugurated":"का उद्घाटन किया",
  "expressway":"एक्सप्रेसवे","road":"सड़क","bridge":"पुल","metro":"मेट्रो",
  "railway":"रेलवे","hospital":"अस्पताल","school":"स्कूल",
  "project":"परियोजना","development":"विकास","crore":"करोड़",
  "investment":"निवेश","government":"सरकार","minister":"मंत्री",
  "BJP":"भाजपा","Congress":"कांग्रेस","election":"चुनाव","scheme":"योजना",
  "farmer":"किसान","farmers":"किसान","crop":"फसल","exam":"परीक्षा",
  "student":"छात्र","health":"स्वास्थ्य","rain":"बारिश","weather":"मौसम",
  "pollution":"प्रदूषण","news":"समाचार","today":"आज","India":"भारत",
  "RSS":"आरएसएस","temple":"मंदिर","Vrindavan":"वृंदावन",
};

function hi(t) {
  if (!t) return "";
  let r = t;
  for (const [e, h] of Object.entries(W).sort((a,b) => b[0].length - a[0].length)) {
    try { r = r.replace(new RegExp("\\b"+e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\b","gi"),h); } catch(_) {}
  }
  return r;
}

const UP_KW = [
  "uttar pradesh","yogi","lucknow","varanasi","prayagraj","kanpur","agra",
  "gorakhpur","meerut","noida","ghaziabad","ayodhya","mathura","bareilly",
  "aligarh","moradabad","jhansi","allahabad","saharanpur","muzaffarnagar",
  "azamgarh","bahraich","gonda","unnao","hardoi","lakhimpur","mirzapur",
  "jaunpur","ghazipur","kushinagar","basti","etawah","fatehpur","deoria",
  "mau","rampur","bijnor","sitapur","sultanpur","rae bareli","sambhal",
  "bulandshahr","hapur","firozabad","up police","up government","up news",
  "akhilesh","mayawati","up bjp","yogi adityanath",
];

function isUP(t) {
  const l = t.toLowerCase();
  return UP_KW.some(k => l.includes(k));
}

function fetchUrl(url, hops) {
  hops = hops||0;
  if(hops>3) return Promise.reject(new Error("too many redirects"));
  return new Promise((res,rej)=>{
    const req = https.get(url,{
      headers:{
        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122",
        "Accept":"application/json, application/rss+xml, */*",
      },
      timeout:10000,
    },(r)=>{
      if(r.statusCode>=300&&r.statusCode<400&&r.headers.location){
        r.resume(); return fetchUrl(r.headers.location,hops+1).then(res).catch(rej);
      }
      if(r.statusCode>=400){r.resume();return rej(new Error("HTTP "+r.statusCode));}
      let d=""; r.on("data",c=>d+=c); r.on("end",()=>res(d));
    });
    req.on("error",rej);
    req.on("timeout",()=>{req.destroy();rej(new Error("timeout"));});
  });
}

// ── GNews.io — correct API format ────────────────────────────
// Free plan: English only, no country filter, 10 results/req
const GNEWS_QUERIES = [
  "Uttar Pradesh news",
  "Lucknow news",
  "Yogi Adityanath",
  "Varanasi news",
  "Gorakhpur news",
  "Prayagraj news",
  "Ayodhya news",
  "Noida Ghaziabad UP",
  "Kanpur Agra UP news",
  "UP crime police",
  "UP government",
  "UP development project",
  "UP farmers",
  "UP politics BJP SP",
  "Meerut Aligarh UP",
  "UP flood accident",
  "UP education health",
  "Akhilesh Yadav UP",
  "UP BJP election",
  "UP Yogi scheme",
];

async function fetchGNews(apiKey) {
  const all = [];
  // Use only 10 queries to stay within free plan (100 req/day)
  const queries = GNEWS_QUERIES.slice(0, 10);

  await Promise.allSettled(queries.map(async q => {
    try {
      // GNews free plan: use lang=en, no country param needed
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=en&max=10&apikey=${apiKey}`;
      const raw = await fetchUrl(url);
      const json = JSON.parse(raw);

      if (json.errors) {
        console.error("GNews error:", json.errors);
        return;
      }

      const articles = json.articles || [];
      articles.forEach(a => {
        const titleRaw = a.title || "";
        if (!titleRaw || titleRaw.length < 8) return;
        // Filter: must be UP related
        const combined = titleRaw + " " + (a.description||"") + " " + (a.content||"");
        if (!isUP(combined)) return;

        const descRaw = a.description || a.content || "";
        all.push({
          raw: titleRaw,
          title: hi(titleRaw),
          desc: hi(descRaw.length>280 ? descRaw.slice(0,280)+"…" : descRaw) || hi(titleRaw),
          link: a.url || "",
          pubDate: a.publishedAt || "",
          source: (a.source && a.source.name) || "GNews",
        });
      });
    } catch(e) {
      // Silent fail per query
    }
  }));
  return all;
}

// ── Google News RSS — always runs as additional source ────────
function clean(s) {
  if(!s)return"";
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1")
    .replace(/<[^>]+>/g," ")
    .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">")
    .replace(/&quot;/g,'"').replace(/&#39;/g,"'")
    .replace(/\s+/g," ").trim();
}
function getLink(b) {
  for(const p of[/<link\/>\s*(https?:\/\/[^\s<"]{10,})/,/<link[^>]*>\s*(https?:\/\/[^\s<"]{10,})/,/<guid[^>]*>\s*(https?:\/\/[^\s<"]{10,})/,/(https?:\/\/[^\s"<>]{15,})/]){
    const m=b.match(p); if(m)return m[1].trim();
  }
  return "";
}
function parseRSS(xml) {
  const out=[];
  if(!xml||!xml.includes("<item>"))return out;
  const re=/<item>([\s\S]*?)<\/item>/gi; let m;
  while((m=re.exec(xml))!==null){
    const b=m[1];
    const tM=b.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const dM=b.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    const sM=b.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
    const pM=b.match(/<pubDate[^>]*>([^<]+)<\/pubDate>/i);
    const raw=tM?clean(tM[1]):"";
    if(!raw||raw.length<8)continue;
    const desc=dM?clean(dM[1]):"";
    out.push({raw,title:hi(raw),desc:hi(desc)||hi(raw),link:getLink(b),pubDate:pM?pM[1].trim():"",source:sM?clean(sM[1]):"Google News"});
  }
  return out;
}

const GN_QUERIES = [
  "Uttar+Pradesh+news","Yogi+Adityanath","Lucknow+news",
  "Varanasi+news","Gorakhpur+news","Prayagraj+news","Ayodhya+news",
  "Noida+news","Kanpur+news","Agra+news","UP+crime+police",
  "UP+government","UP+development","UP+farmers",
  "UP+politics+BJP","UP+accident","Meerut+news",
  "Uttar+Pradesh+site:amarujala.com",
  "Uttar+Pradesh+site:jagran.com",
  "Uttar+Pradesh+site:livehindustan.com",
  "Uttar+Pradesh+site:abplive.com",
  "Uttar+Pradesh+site:aajtak.in",
  "Uttar+Pradesh+site:navbharattimes.indiatimes.com",
  "Uttar+Pradesh+site:statetimes.in",
  "Uttar+Pradesh+site:tribuneindia.com",
  "Uttar+Pradesh+site:economictimes.indiatimes.com",
  "Uttar+Pradesh+site:thehindubusinessline.com",
  "Uttar+Pradesh+site:financialexpress.com",
  "Uttar+Pradesh+site:mid-day.com",
];

async function fetchGoogleNews() {
  const all=[];
  await Promise.allSettled(GN_QUERIES.map(async q=>{
    try{
      const xml=await fetchUrl(`https://news.google.com/rss/search?q=${q}&hl=en-IN&gl=IN&ceid=IN:en&tbs=qdr:d`);
      parseRSS(xml).forEach(item=>{
        if(!isUP(item.raw+" "+item.desc))return;
        all.push(item);
      });
    }catch(_){}
  }));
  return all;
}

exports.handler = async () => {
  const CORS={"Access-Control-Allow-Origin":"*","Content-Type":"application/json"};
  const gnewsKey=process.env.GNEWS_KEY;
  const all=[];

  // Run GNews + Google News in parallel
  const [gnewsItems, googleItems] = await Promise.all([
    gnewsKey ? fetchGNews(gnewsKey) : Promise.resolve([]),
    fetchGoogleNews()
  ]);

  all.push(...gnewsItems, ...googleItems);

  // Dedup
  const seen=new Set();
  const unique=all.filter(a=>{
    const k=a.raw.replace(/\W/g,"").toLowerCase().slice(0,45);
    if(seen.has(k))return false; seen.add(k); return true;
  });

  // Sort latest first
  unique.sort((a,b)=>{
    const da=a.pubDate?new Date(a.pubDate).getTime():0;
    const db=b.pubDate?new Date(b.pubDate).getTime():0;
    return db-da;
  });

  return {
    statusCode:200,
    headers:CORS,
    body:JSON.stringify({
      ok:true,
      count:unique.length,
      gnewsCount: gnewsItems.length,
      googleCount: googleItems.length,
      source: gnewsKey?"GNews+GoogleNews":"GoogleNews",
      items:unique
    }),
  };
};
