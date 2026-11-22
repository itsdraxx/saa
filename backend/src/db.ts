import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db: SqlJsDatabase;
let dbPath: string;
let saveTimer: ReturnType<typeof setInterval> | null = null;

// Master Telugu seeds for Instagram posts
const teluguSeedMap: Record<string, { title: string; caption: string; location: string }> = {
  "post-1999": {
    title: "పరిణయ శుభవేళ — 23 నవంబర్ 2001",
    caption: "హైదరాబాద్‌లో బంతిపూల పందిరి కింద పెద్దల ఆశీస్సులతో ఒక్కటైన పవిత్ర క్షణం. 25 ఏళ్ల మన ప్రయాణానికి పునాది పడిన రోజు.",
    location: "కళ్యాణ మండపం, సికింద్రాబాద్",
  },
  "post-2000": {
    title: "మన తొలి కాపురం — 2000",
    caption: "రెండు గదుల చిన్న ఇల్లు, ఎన్నో పెద్ద కలలు. ఇద్దరం కలిసి జీవితాన్ని మొదలుపెట్టిన తొలి అడుగులు.",
    location: "కూకట్‌పల్లి, హైదరాబాద్",
  },
  "post-2001": {
    title: "మొదటి సంతానం — కుటుంబంలోకి కొత్త వెలుగు",
    caption: "మన చేతుల్లోకి పసికందు రాకతో మన జీవితంలో సరికొత్త అధ్యాయం మొదలైంది.",
    location: "హైదరాబాద్",
  },
  "post-2002": {
    title: "తొలి అడుగులు — 2002",
    caption: "ఇంటి నిండా చిన్నారి నవ్వులు, బోసినవ్వుల కేరింతలు.",
    location: "మన ఇల్లు, హైదరాబాద్",
  },
  "post-2005": {
    title: "నలుగురి సంసారం — 2005",
    caption: "మన చిన్న గూడు మరింత సందడిగా మారింది. ఇద్దరు పిల్లలతో మన లోకం పరిపూర్ణమైంది.",
    location: "హైదరాబాద్",
  },
  "post-2008": {
    title: "సొంతింటి స్వప్నం నెరవేరిన వేళ — 2008",
    caption: "మన స్వంత గడపపై అడుగుపెట్టిన ఆనందం. పిల్లల నవ్వులతో నిండిన కలల ఇల్లు.",
    location: "మాదాపూర్, హైదరాబాద్",
  },
  "post-2010": {
    title: "గోవా బీచ్‌లో సందడి — 2010",
    caption: "సముద్రపు ఒడ్డున ఇసుక గూళ్లు, సూర్యాస్తమయపు వేళ కుటుంబంతో మధుర క్షణాలు.",
    location: "బాగా బీచ్, గోవా",
  },
  "post-2014": {
    title: "తాజ్ మహల్ సందర్శన — 2014",
    caption: "ప్రేమకు చిహ్నమైన తాజ్ మహల్ ఎదుట మన ప్రేమకు 15 ఏళ్ల నిదర్శనం.",
    location: "తాజ్ మహల్, ఆగ్రా",
  },
  "post-2017": {
    title: "సిమ్లా మంచు కొండల్లో — 2017",
    caption: "చల్లని మంచు కురుస్తున్న వేళ, కుటుంబ సభ్యుల వెచ్చని నవ్వులు.",
    location: "మాల్ రోడ్, సిమ్లా",
  },
  "post-2019": {
    title: "20 సంవత్సరాల మైలురాయి — 2019",
    caption: "ఇరవై ఏళ్ల సహజీవనం. ఎన్నో ఎత్తుపల్లాలు, అంతకుమించిన తియ్యటి జ్ఞాపకాలు.",
    location: "హైదరాబాద్",
  },
  "post-2022": {
    title: "కేరళ బ్యాక్‌వాటర్స్ ప్రశాంతత — 2022",
    caption: "హౌస్‌బోట్‌లో తేలుతూ పచ్చని ప్రకృతి నడుమ ఇద్దరం కలిసి గడిపిన ప్రశాంత క్షణాలు.",
    location: "ఆలప్పుళ, కేరళ",
  },
  "post-2024": {
    title: "25వ రజతోత్సవం వైపుగా — 2024",
    caption: "అనంతమైన ప్రేమ, త్యాగాలు మరియు తరగని నవ్వుల 25 సంవత్సరాల వెండి పండుగ.",
    location: "మన ఇల్లు, హైదరాబాద్",
  },
};

// ─── Initialization (call once before app.listen) ─────
export async function initDb(): Promise<void> {
  const SQL = await initSqlJs();

  dbPath = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.join(__dirname, "..", "data", "saa.db");

  // Ensure the data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Load existing DB from file or create a fresh one
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Performance pragmas
  db.run("PRAGMA journal_mode = WAL;");
  db.run("PRAGMA foreign_keys = ON;");

  // Create all tables
  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id     TEXT NOT NULL,
      author_name TEXT NOT NULL,
      text        TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      ip_hash     TEXT,
      visitor_id  TEXT
    );
  `);
  try {
    db.run("ALTER TABLE comments ADD COLUMN visitor_id TEXT;");
  } catch {}
  db.run("CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);");
  db.run("CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);");

  db.run(`
    CREATE TABLE IF NOT EXISTS likes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id     TEXT NOT NULL,
      visitor_id  TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(post_id, visitor_id)
    );
  `);
  db.run("CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);");

  db.run(`
    CREATE TABLE IF NOT EXISTS trivia_scores (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL,
      score       INTEGER NOT NULL,
      total       INTEGER NOT NULL,
      percentage  REAL NOT NULL,
      time_taken  INTEGER,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      visitor_id  TEXT
    );
  `);
  db.run("CREATE INDEX IF NOT EXISTS idx_trivia_scores ON trivia_scores(score DESC, time_taken ASC);");

  db.run(`
    CREATE TABLE IF NOT EXISTS wishes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      author_name TEXT NOT NULL,
      relation    TEXT,
      message     TEXT NOT NULL,
      emoji       TEXT DEFAULT '❤️',
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      ip_hash     TEXT
    );
  `);
  db.run("CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON wishes(created_at DESC);");

  // Instagram posts table
  db.run(`
    CREATE TABLE IF NOT EXISTS instagram_posts (
      id            TEXT PRIMARY KEY,
      year          INTEGER NOT NULL,
      date_str      TEXT NOT NULL DEFAULT '',
      title         TEXT NOT NULL,
      title_te      TEXT NOT NULL DEFAULT '',
      location      TEXT NOT NULL DEFAULT '',
      location_te   TEXT NOT NULL DEFAULT '',
      aspect_ratio  TEXT NOT NULL DEFAULT 'landscape',
      category      TEXT NOT NULL DEFAULT 'milestone',
      caption       TEXT NOT NULL DEFAULT '',
      caption_te    TEXT NOT NULL DEFAULT '',
      hashtags      TEXT NOT NULL DEFAULT '[]',
      images        TEXT NOT NULL DEFAULT '[]',
      likes_count   INTEGER NOT NULL DEFAULT 0,
      order_index   INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Memory Map locations table
  db.run(`
    CREATE TABLE IF NOT EXISTS map_locations (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      name_te       TEXT NOT NULL DEFAULT '',
      lat           REAL NOT NULL,
      lng           REAL NOT NULL,
      year          INTEGER NOT NULL,
      story         TEXT NOT NULL DEFAULT '',
      story_te      TEXT NOT NULL DEFAULT '',
      image         TEXT NOT NULL DEFAULT '',
      category      TEXT NOT NULL DEFAULT 'holiday',
      icon          TEXT NOT NULL DEFAULT '📍',
      order_index   INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  db.run("CREATE INDEX IF NOT EXISTS idx_map_locations_order ON map_locations(order_index ASC, year ASC);");

  // Migration: ensure title_te, caption_te, and location_te exist in instagram_posts
  try {
    const tableInfo = dbAll<{ name: string }>("PRAGMA table_info(instagram_posts)");
    const colNames = tableInfo.map((c) => c.name);
    if (!colNames.includes("title_te")) {
      db.run("ALTER TABLE instagram_posts ADD COLUMN title_te TEXT NOT NULL DEFAULT ''");
    }
    if (!colNames.includes("caption_te")) {
      db.run("ALTER TABLE instagram_posts ADD COLUMN caption_te TEXT NOT NULL DEFAULT ''");
    }
    if (!colNames.includes("location_te")) {
      db.run("ALTER TABLE instagram_posts ADD COLUMN location_te TEXT NOT NULL DEFAULT ''");
    }
    if (!colNames.includes("order_index")) {
      db.run("ALTER TABLE instagram_posts ADD COLUMN order_index INTEGER NOT NULL DEFAULT 0");
    }

    // Initialize order_index sequentially if unassigned (e.g. all 0)
    const existingPosts = dbAll<{ id: string; order_index: number }>(
      "SELECT id, order_index FROM instagram_posts ORDER BY year ASC, created_at ASC"
    );
    const allZero = existingPosts.every((p) => p.order_index === 0);
    if (allZero && existingPosts.length > 0) {
      existingPosts.forEach((p, idx) => {
        db.run("UPDATE instagram_posts SET order_index = ? WHERE id = ?", [idx, p.id]);
      });
      saveDb();
    }
  } catch (err) {
    console.warn("Migration notice for instagram_posts columns:", err);
  }

  // Populate Telugu defaults for existing seeded posts if caption_te is empty
  for (const [id, val] of Object.entries(teluguSeedMap)) {
    try {
      db.run(
        "UPDATE instagram_posts SET title_te = ?, caption_te = ?, location_te = ? WHERE id = ? AND (caption_te IS NULL OR caption_te = '')",
        [val.title, val.caption, val.location, id]
      );
    } catch {}
  }

  // Auto-seed instagram posts from curated data if table is empty
  await seedInstagramPosts();

  // Auto-seed memory map locations if table is empty
  await seedMapLocations();

  // Auto-save to disk every 10 seconds (sql.js is in-memory, we persist periodically)
  saveTimer = setInterval(() => saveDb(), 10_000);

  // Save on process exit
  process.on("SIGINT", () => { saveDb(); process.exit(0); });
  process.on("SIGTERM", () => { saveDb(); process.exit(0); });

  console.log(`  📦 SQLite database initialized at ${dbPath}`);
}

// ─── Auto-seed the 12 curated Instagram posts ─
async function seedInstagramPosts(): Promise<void> {
  const count = dbGet<{ count: number }>("SELECT COUNT(*) as count FROM instagram_posts");
  if (count && count.count > 0) return; // Already seeded

  console.log("  🌱 Seeding curated Instagram posts...");

  const seeds = [
    {
      id: "post-1999", year: 1999, date_str: "14 February 1999",
      title: "The Day We Met", location: "Banjara Hills, Hyderabad",
      aspect_ratio: "landscape", category: "milestone",
      caption: "A chance encounter at a friend's gathering in Hyderabad changed everything. Two strangers, nervous smiles, one endless conversation, and a spark that set 25 years into motion.",
      hashtags: JSON.stringify(["#FirstMeeting","#Fate","#WhereItAllBegan","#AdhiAndSatya"]),
      images: JSON.stringify([
        { src: "/instagram/first_sight.png", alt: "The fateful day Adhi and Satya first crossed paths", caption: "A chance meeting that changed our destinies forever", tag: "First Glance", themeGradient: "from-amber-200 via-rose-100 to-amber-100", iconName: "heart" },
        { src: "/instagram/first_sight_2.png", alt: "Endless conversation under the evening twilight", caption: "Two nervous smiles, sweet conversation, and the start of a lifetime", tag: "Sweet Conversations", themeGradient: "from-rose-100 via-peach-100 to-amber-100", iconName: "sparkles" },
      ]),
    },
    {
      id: "post-2001", year: 2001, date_str: "23 November 2001",
      title: "Our Wedding Day • Sacred Mandap", location: "Tirumala Tirupati Mandap, Andhra Pradesh",
      aspect_ratio: "landscape", category: "wedding",
      caption: "On 23 November 2001, surrounded by family, sacred Vedic mantras, and the divine fragrance of jasmine, Adhi and Satya became one. 25 years later, every promise made under this mandap stands stronger than ever.",
      hashtags: JSON.stringify(["#AdhiWedsSatya","#23Nov2001","#SilverJubilee","#SouthIndianWedding","#SacredVows"]),
      images: JSON.stringify([
        { src: "/images/art/golden_mandap_bg.png", alt: "The Grand Golden Wedding Mandap", caption: "The sacred mandap where eternal vows were sealed", tag: "The Mandap", themeGradient: "from-amber-300 via-rose-400 to-amber-200", iconName: "ring" },
        { src: "/images/art/couple_sittinga_and_welcoming.png", alt: "Adhi and Satya seated in traditional wedding attire", caption: "Adhi & Satya welcoming loved ones with sacred folded hands 🙏", tag: "Adhi Weds Satya", themeGradient: "from-rose-200 via-amber-100 to-rose-300", iconName: "heart" },
        { src: "/images/art/mandap_backdrop_2.png", alt: "Wedding Jaimala garland exchange ceremony", caption: "Jaimala exchange surrounded by Vedic chants and rose petal showers", tag: "Jaimala Ceremony", themeGradient: "from-amber-200 via-rose-300 to-amber-100", iconName: "sparkles" },
        { src: "/Golden South Indian Mandap Setting.png", alt: "Grand Golden South Indian Wedding Mandap", caption: "Sacred South Indian temple mandap adorned in royal gold and fresh blooms", tag: "Divine Mandap", themeGradient: "from-amber-400 via-yellow-200 to-rose-300", iconName: "ring" },
      ]),
    },
    {
      id: "post-2000", year: 2000, date_str: "10 August 2000",
      title: "Our First Cozy Apartment", location: "Begumpet, Hyderabad",
      aspect_ratio: "portrait", category: "milestone",
      caption: "Our very first little flat that became our whole world. We painted the walls together, argued for two hours over curtain colours, and filled every corner with the scent of fresh cardamom chai.",
      hashtags: JSON.stringify(["#FirstHome","#ChaiAndMemories","#BuildingALife","#YoungLove"]),
      images: JSON.stringify([
        { src: "/instagram/portrait/couple_welcoming_portrait.png", alt: "Adhi and Satya smiling in their first apartment", caption: "Balcony evenings sipping cardamom chai and dreaming of the future", tag: "Sweet Chai Moments", themeGradient: "from-rose-100 via-amber-100 to-orange-100", iconName: "heart" },
        { src: "/instagram/portrait/botanical_frame_portrait.jpg", alt: "A cozy first home flat", caption: "Our very first 2BHK flat — painting walls and sipping sweet chai", tag: "First Nest", themeGradient: "from-amber-100 via-orange-100 to-amber-200", iconName: "home" },
      ]),
    },
    {
      id: "post-2002", year: 2002, date_str: "18 August 2002",
      title: "Welcome, Little One • First Child", location: "Rainbow Children's Hospital, Hyderabad",
      aspect_ratio: "landscape", category: "family",
      caption: "Our first child arrived, turning our universe upside down in the most beautiful way. Sleepless nights became our sweetest memories, and our family of two blossomed into three.",
      hashtags: JSON.stringify(["#FirstChild","#ParentsAtLast","#Parenthood","#OurWorld"]),
      images: JSON.stringify([
        { src: "/images/art/couple_sittinga_and_welcoming.png", alt: "Adhi and Satya stepping into parenthood", caption: "The day our hearts learned to beat outside our bodies", tag: "Bundle of Joy", themeGradient: "from-rose-100 via-pink-100 to-peach-100", iconName: "heart" },
        { src: "/instagram/landscape/botanical_frame_landscape.jpg", alt: "Sweet beginnings of parenthood", caption: "Tiny fingers wrapped around ours — our world changed forever", tag: "New Parents", themeGradient: "from-peach-100 via-rose-100 to-amber-100", iconName: "sparkles" },
      ]),
    },
    {
      id: "post-2005", year: 2005, date_str: "5 May 2005",
      title: "Growing Family • Two Little Treasures", location: "Hyderabad, India",
      aspect_ratio: "portrait", category: "family",
      caption: "Our second bundle of joy completed our circle of love. The house grew louder, messier, and infinitely more joyful.",
      hashtags: JSON.stringify(["#FamilyOfFour","#DoubleTrouble","#JoyUnfiltered","#Blessed"]),
      images: JSON.stringify([
        { src: "/instagram/portrait/couple_welcoming_portrait.png", alt: "Adhi and Satya rejoicing as parents of two", caption: "Tiny footsteps echoing through the hallway and happy bedtime tales", tag: "Double Blessing", themeGradient: "from-amber-100 via-rose-100 to-pink-100", iconName: "heart" },
        { src: "/instagram/portrait/botanical_frame_portrait.jpg", alt: "The family grows complete", caption: "Double the laughter, double the joy, double the love", tag: "Family Complete", themeGradient: "from-peach-100 via-amber-100 to-rose-100", iconName: "sparkles" },
      ]),
    },
    {
      id: "post-2008", year: 2008, date_str: "12 October 2008",
      title: "Our Forever Dream Home", location: "Jubilee Hills, Hyderabad",
      aspect_ratio: "landscape", category: "milestone",
      caption: "After years of patient dreaming and working hand-in-hand, we opened the doors to our forever home.",
      hashtags: JSON.stringify(["#DreamHome","#GrihaPravesh","#SacredBlessings","#HomeIsWhereTheHeartIs"]),
      images: JSON.stringify([
        { src: "/South Indian Wedding Mandap Backdrop.png", alt: "Traditional flower decorations for Griha Pravesh", caption: "Auspicious Griha Pravesh ceremonies surrounded by blessing elders", tag: "Griha Pravesh", themeGradient: "from-amber-300 via-rose-200 to-amber-100", iconName: "sparkles" },
        { src: "/instagram/landscape/botanical_frame_landscape.jpg", alt: "The dream forever home", caption: "Housewarming pooja and warm blessings in our forever home", tag: "Forever Home", themeGradient: "from-amber-200 via-yellow-100 to-amber-100", iconName: "home" },
      ]),
    },
    {
      id: "post-2010", year: 2010, date_str: "20 May 2010",
      title: "Goa Getaway • First Family Beach Holiday", location: "Calangute & Candolim Beach, Goa",
      aspect_ratio: "landscape", category: "travel",
      caption: "Our very first family trip to the coast! Warm sand between our toes, sunset strolls along the waves, and the kids touching the sea for the first time.",
      hashtags: JSON.stringify(["#GoaDiaries","#BeachVacation","#SunsetLovers","#FamilyFirsts"]),
      images: JSON.stringify([
        { src: "/images/art/couple_sittinga_and_welcoming.png", alt: "Adhi and Satya laughing together", caption: "Seaside breeze, tender smiles, and 100% unplugged joy", tag: "Pure Joy", themeGradient: "from-cyan-100 via-blue-100 to-amber-100", iconName: "heart" },
        { src: "/instagram/landscape/botanical_frame_landscape.jpg", alt: "Golden hour sunset walks", caption: "Golden hour skies and waves kissing our bare feet", tag: "Goa Sunset", themeGradient: "from-amber-300 via-rose-300 to-indigo-200", iconName: "camera" },
        { src: "/Golden South Indian Mandap Setting.png", alt: "Family celebration moments", caption: "Building sandcastles that the tide washed away with laughter", tag: "Sandcastles", themeGradient: "from-amber-100 via-sky-200 to-amber-200", iconName: "plane" },
      ]),
    },
    {
      id: "post-2014", year: 2014, date_str: "23 November 2014",
      title: "15 Years of Togetherness • Crystal Milestone", location: "Secunderabad Club, Hyderabad",
      aspect_ratio: "landscape", category: "celebration",
      caption: "Fifteen years together! The kids planned an unforgettable surprise party.",
      hashtags: JSON.stringify(["#15YearsStrong","#CrystalAnniversary","#SurpriseParty","#FamilyLove"]),
      images: JSON.stringify([
        { src: "/images/art/golden_mandap_bg.png", alt: "15th Anniversary surprise party", caption: "15 years of smiles, secrets, and unconditional love", tag: "15th Anniversary", themeGradient: "from-rose-200 via-amber-200 to-rose-100", iconName: "sparkles" },
        { src: "/images/art/couple_sittinga_and_welcoming.png", alt: "Adhi and Satya cutting the anniversary cake", caption: "Fifteen years hand in hand — each year sweeter than the last", tag: "Crystal Milestone", themeGradient: "from-amber-200 via-rose-100 to-peach-100", iconName: "heart" },
      ]),
    },
    {
      id: "post-2017", year: 2017, date_str: "15 January 2017",
      title: "Shimla Winter Wonderland • First Snow", location: "Mall Road & Kufri, Shimla, Himachal Pradesh",
      aspect_ratio: "portrait", category: "travel",
      caption: "Packed the car and headed straight for the Himalayas! We witnessed snow for the very first time.",
      hashtags: JSON.stringify(["#ShimlaSnow","#WinterInHimalayas","#SnowmanMakers","#MountainAir"]),
      images: JSON.stringify([
        { src: "/instagram/portrait/couple_welcoming_portrait.png", alt: "Bundled up in woolen mufflers", caption: "Warm hearts in cold weather — sharing one hot cocoa", tag: "Mountain Warmth", themeGradient: "from-blue-100 via-indigo-100 to-rose-100", iconName: "heart" },
        { src: "/instagram/portrait/botanical_frame_portrait.jpg", alt: "Dancing in snowfall in Shimla", caption: "Dancing in our very first mountain snowfall together", tag: "First Snowfall", themeGradient: "from-sky-200 via-indigo-100 to-amber-100", iconName: "plane" },
        { src: "/instagram/portrait/mandap_backdrop_portrait.png", alt: "Family snowman memories", caption: "Our questionable snowman that barely survived an hour!", tag: "Snowman Fun", themeGradient: "from-cyan-200 via-blue-100 to-slate-100", iconName: "sparkles" },
      ]),
    },
    {
      id: "post-2019", year: 2019, date_str: "23 November 2019",
      title: "20 Years of Us • Renewing Our Vows", location: "Home Sanctuary, Hyderabad",
      aspect_ratio: "landscape", category: "celebration",
      caption: "Two decades of growth, partnership, and laughter. We renewed our sacred vows in a cozy ceremony at home.",
      hashtags: JSON.stringify(["#20YearsOfLove","#TwoDecades","#VowRenewal","#ForeverLove"]),
      images: JSON.stringify([
        { src: "/images/art/mandap_backdrop_2.png", alt: "A cozy vow renewal at home", caption: "Two decades of loving each other more with each passing dawn", tag: "20 Years Strong", themeGradient: "from-amber-200 via-rose-200 to-amber-100", iconName: "ring" },
        { src: "/images/art/couple_sittinga_and_welcoming.png", alt: "Adhi and Satya smiling warmly", caption: "Surrounded by our children, reaffirming our lifelong devotion", tag: "Vows Renewed", themeGradient: "from-rose-200 via-amber-100 to-peach-100", iconName: "heart" },
      ]),
    },
    {
      id: "post-2022", year: 2022, date_str: "1 September 2022",
      title: "Empty Nest, Full Hearts", location: "Hyderabad, India",
      aspect_ratio: "portrait", category: "milestone",
      caption: "The kids stepped out into the world for college, and our home grew quiet. But in that stillness, we rediscovered the rhythms of our early courtship.",
      hashtags: JSON.stringify(["#EmptyNest","#SecondCourtship","#LifelongPartners","#Soulmates"]),
      images: JSON.stringify([
        { src: "/instagram/portrait/couple_welcoming_portrait.png", alt: "Enjoying sunset dates and peaceful morning walks", caption: "Rediscovering each other all over again in our quiet home", tag: "Second Honeymoon", themeGradient: "from-rose-100 via-amber-100 to-rose-200", iconName: "heart" },
        { src: "/instagram/portrait/botanical_frame_portrait.jpg", alt: "Peaceful evening walks and coffee dates", caption: "Hand-in-hand evening strolls, reminiscing about the early days", tag: "Quiet Romance", themeGradient: "from-peach-100 via-amber-100 to-rose-100", iconName: "sparkles" },
      ]),
    },
    {
      id: "post-2024", year: 2024, date_str: "23 November 2024",
      title: "25 Years — Silver Wedding Jubilee! 🥂", location: "The Royal Kanjeevaram Mandap, Hyderabad",
      aspect_ratio: "landscape", category: "celebration",
      caption: "A quarter-century of unwavering love, deep laughter, and beautiful sacrifices. Here is to Adhi & Satya — 25 Years of Love, and forever more to come! 🥂👑❤️",
      hashtags: JSON.stringify(["#AdhiWedsSatya","#SilverJubilee","#25YearsOfLove","#QuarterCentury","#CoupleGoals","#TogetherForever"]),
      images: JSON.stringify([
        { src: "/images/art/couple_sittinga_and_welcoming.png", alt: "Adhi and Satya in radiant wedding attire", caption: "Adhi Weds Satya — Celebrating 25 Years of Divine Love ❤️", tag: "Silver Jubilee", themeGradient: "from-amber-300 via-rose-300 to-amber-200", iconName: "sparkles" },
        { src: "/images/art/golden_mandap_bg.png", alt: "The Grand Mandap decorated with golden temple pillars", caption: "Under the golden mandap once more, blessed by 25 years of memories", tag: "Golden Mandap", themeGradient: "from-amber-400 via-yellow-200 to-rose-300", iconName: "ring" },
        { src: "/images/art/mandap_backdrop_2.png", alt: "Cutting the grand 25th Silver Jubilee cake", caption: "Cutting the anniversary cake surrounded by 3 generations of family", tag: "Celebration Feast", themeGradient: "from-rose-200 via-amber-200 to-rose-300", iconName: "heart" },
        { src: "/Golden South Indian Mandap Setting.png", alt: "Family portrait with children, elders, and lifelong friends", caption: "To the next 25 years and beyond — together forever!", tag: "Generations of Love", themeGradient: "from-amber-200 via-peach-200 to-amber-100", iconName: "sparkles" },
      ]),
    },
  ];

  seeds.forEach((seed, seedIdx) => {
    const te = teluguSeedMap[seed.id] || { title: "", caption: "", location: "" };
    dbRun(
      `INSERT OR IGNORE INTO instagram_posts (id, year, date_str, title, title_te, location, location_te, aspect_ratio, category, caption, caption_te, hashtags, images, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [seed.id, seed.year, seed.date_str, seed.title, te.title, seed.location, te.location, seed.aspect_ratio, seed.category, seed.caption, te.caption, seed.hashtags, seed.images, seedIdx]
    );
  });

  saveDb();
  console.log("  ✅ Seeded 12 curated Instagram posts");
}

// ─── Auto-seed the 8 curated Memory Map locations ─
async function seedMapLocations(): Promise<void> {
  const count = dbGet<{ count: number }>("SELECT COUNT(*) as count FROM map_locations");
  if (count && count.count > 0) return; // Already seeded

  console.log("  🌱 Seeding curated Memory Map locations...");

  const locationSeeds = [
    {
      id: "first-meeting",
      name: "Where It All Began",
      name_te: "పరిచయ వేదిక — 1997",
      lat: 17.385,
      lng: 78.4867,
      year: 1997,
      story: "A friend's get-together in Hyderabad. Two strangers across a crowded room, one awkward introduction, and a conversation that lasted until the hosts politely asked everyone to leave. The rest, as they say, is history.",
      story_te: "హైదరాబాద్‌లో స్నేహితుల విందులో మొదలైన పరిచయం. ఒకరినొకరు చూసుకున్న ఆ క్షణం, గంటల తరబడి సాగిన సంభాషణ మన 25 ఏళ్ల అందమైన ప్రయాణానికి నాంది పలికింది.",
      image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&auto=format&fit=crop&q=80",
      category: "first-meeting",
      icon: "💕",
      order_index: 0,
    },
    {
      id: "wedding-venue",
      name: "The Wedding Venue",
      name_te: "పరిణయ వేదిక — 2001",
      lat: 17.4399,
      lng: 78.4983,
      year: 2001,
      story: "The grand wedding hall in Secunderabad where they exchanged vows surrounded by 500 guests, mountains of food, and enough flowers to fill a garden. The mandap was draped in marigolds and jasmine, and love was absolutely everywhere.",
      story_te: "సికింద్రాబాద్ కళ్యాణ మండపంలో బంధుమిత్రుల ఆశీస్సులు, వేద మంత్రోచ్ఛారణల నడుమ ఒక్కటైన పవిత్ర క్షణం. బంతిపూలు, మల్లెల సువాసనలతో నిండిన ఆ కల్యాణ వేదిక ఎప్పటికీ చిరస్మరణీయం.",
      image: "/Golden South Indian Mandap Setting.png",
      category: "wedding",
      icon: "💒",
      order_index: 1,
    },
    {
      id: "first-home",
      name: "Our First Home",
      name_te: "తొలి కాపురం — 2000",
      lat: 17.4485,
      lng: 78.3908,
      year: 2000,
      story: "A modest two-bedroom flat in Kukatpally. The kitchen was barely big enough for two, the balcony overlooked a busy road, and it was absolutely perfect. This is where they learned to be a team, one burnt roti at a time.",
      story_te: "కూకట్‌పల్లిలోని చిన్న రెండు గదుల ఇల్లు. చిన్న వంటగది, రద్దీ రోడ్డు కనిపించే బాల్కనీ... అయినా అది మాకెంతో ప్రత్యేకం. ఇద్దరం కలిసి ఒకరికొకరం తోడుగా జీవితాన్ని నిర్మించుకున్న తొలి గూడు.",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80",
      category: "home",
      icon: "🏠",
      order_index: 2,
    },
    {
      id: "dream-home",
      name: "Our Forever Home",
      name_te: "మన కలల సౌధం — 2008",
      lat: 17.4401,
      lng: 78.3489,
      year: 2008,
      story: "The home they'd been dreaming of for years. A garden where the kids could play, a kitchen big enough for Satya's legendary biryani operations, a balcony for evening chai, and walls that would eventually be covered in family photos and children's art.",
      story_te: "ఎన్నో ఏళ్ల కల నెరవేరిన వేళ. పిల్లల ఆటపాటలు, సత్య ఘుమఘుమలాడే బిర్యానీలు, సాయంత్రపు టీ కబుర్లతో నిండిన మన శాశ్వత ఇల్లు.",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80",
      category: "home",
      icon: "🏡",
      order_index: 3,
    },
    {
      id: "goa-holiday",
      name: "Goa — The Family Happy Place",
      name_te: "గోవా సముద్రతీరం — 2010",
      lat: 15.2993,
      lng: 74.124,
      year: 2010,
      story: "Their first family beach holiday. The kids screamed when the waves touched their feet, Adhi got sunburned, Satya found the perfect seaside café, and they all agreed: this is what happiness feels like. They've been back three times since.",
      story_te: "కుటుంబంతో మొదటి బీచ్ వెకేషన్. సముద్రపు కెరటాలు చూసి పిల్లల కేరింతలు, సత్య ఎంచుకున్న బీచ్ కేఫ్... కుటుంబమంతా కలిసి గడిపిన ఆనంద క్షణాలు.",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80",
      category: "holiday",
      icon: "🏖️",
      order_index: 4,
    },
    {
      id: "delhi-trip",
      name: "Delhi — Taj Mahal Day Trip",
      name_te: "తాజ్ మహల్ సందర్శన — 2013",
      lat: 27.1751,
      lng: 78.0421,
      year: 2013,
      story: "They drove from Delhi to Agra to see the Taj Mahal at sunrise. Adhi drove eight hours, the kids slept the whole way, and Satya navigated with a paper map (the GPS had given up). Worth every minute when they saw it glowing in the morning light.",
      story_te: "సూర్యోదయ వేళ తాజ్ మహల్ అందాలను వీక్షించిన మధుర క్షణం. ఎనిమిది గంటల డ్రైవింగ్ తర్వాత తెల్లటి పాలరాతి సౌధం ఎదుట మన కుటుంబం నిలిచిన వేళ.",
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&auto=format&fit=crop&q=80",
      category: "holiday",
      icon: "🕌",
      order_index: 5,
    },
    {
      id: "shimla-snow",
      name: "Shimla — First Snow",
      name_te: "సిమ్లా మంచు కొండలు — 2017",
      lat: 31.1048,
      lng: 77.1734,
      year: 2017,
      story: "The family's mountain adventure. None of them had seen snow before, and the excitement was uncontainable. They built a lopsided snowman, had an epic snowball fight, and drank enough hot chocolate to last a lifetime. The photos are priceless.",
      story_te: "కుటుంబమంతా కలిసి మొదటిసారి మంచును చూసిన క్షణం. మంచు ముద్దలతో ఆడుకుంటూ, చలిలో వేడి వేడి హాట్ చాక్లెట్ తాగుతూ గడిపిన తీపి జ్ఞాపకం.",
      image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80",
      category: "holiday",
      icon: "❄️",
      order_index: 6,
    },
    {
      id: "kerala-backwaters",
      name: "Kerala — Backwater Bliss",
      name_te: "కేరళ బ్యాక్‌వాటర్స్ — 2022",
      lat: 9.4981,
      lng: 76.3388,
      year: 2022,
      story: "A houseboat journey through the Kerala backwaters — just the two of them, after the kids left for college. Floating through palm-lined canals, eating fresh fish curry, and watching the sunset paint the water gold. A second honeymoon, twenty-three years later.",
      story_te: "హౌస్‌బోట్‌లో ప్రయాణిస్తూ, కొబ్బరి తోటల నడుమ సూర్యాస్తమయాన్ని వీక్షించిన అపురూప క్షణాలు. ఇరవై మూడేళ్ల తర్వాత ఆది, సత్యల ప్రత్యేక ప్రశాంత యాత్ర.",
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format&fit=crop&q=80",
      category: "special",
      icon: "🚤",
      order_index: 7,
    },
  ];

  locationSeeds.forEach((loc) => {
    dbRun(
      `INSERT OR IGNORE INTO map_locations (id, name, name_te, lat, lng, year, story, story_te, image, category, icon, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [loc.id, loc.name, loc.name_te, loc.lat, loc.lng, loc.year, loc.story, loc.story_te, loc.image, loc.category, loc.icon, loc.order_index]
    );
  });

  saveDb();
  console.log("  ✅ Seeded 8 curated Memory Map locations");
}

// ─── Persist in-memory DB to disk ─────────────────────
export function saveDb(): void {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error("Failed to save database:", err);
  }
}

// ─── Helper: Run a SELECT and return all rows as objects ─
export function dbAll<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
  if (!db) throw new Error("Database not initialized — call initDb() first");
  const stmt = db.prepare(sql);
  stmt.bind(params as (string | number | null | Uint8Array)[]);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

// ─── Helper: Run a SELECT and return the first row ────
export function dbGet<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T | undefined {
  const rows = dbAll<T>(sql, params);
  return rows[0];
}

// ─── Helper: Run INSERT/UPDATE/DELETE ─────────────────
export function dbRun(sql: string, params: unknown[] = []): { lastId: number } {
  if (!db) throw new Error("Database not initialized — call initDb() first");
  db.run(sql, params as (string | number | null | Uint8Array)[]);

  // Get last insert rowid
  const row = dbGet<{ id: number }>("SELECT last_insert_rowid() as id");
  return { lastId: row?.id ?? 0 };
}
