export interface InstagramComment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  avatarText?: string;
  avatarBg?: string;
  isCurrentUser?: boolean;
}

export interface InstagramMedia {
  src: string;
  alt: string;
  caption?: string;
  tag?: string;
  themeGradient?: string;
  iconName?: "camera" | "heart" | "plane" | "home" | "sparkles" | "ring";
}

export type InstagramAspectRatio =
  | "landscape"
  | "portrait"
  | "square"
  | "4:5"
  | "1:1"
  | "4:3"
  | "16:9"
  | "3:2";

export interface InstagramPost {
  id: string;
  year: number;
  dateStr: string;
  title: string;
  titleTe?: string;
  location: string;
  locationTe?: string;
  aspectRatio?: InstagramAspectRatio;
  images: InstagramMedia[];
  likesCount: number;
  caption: string;
  captionTe?: string;
  category: "wedding" | "family" | "milestone" | "travel" | "celebration";
  hashtags: string[];
  comments: InstagramComment[];
}

export const instagramPosts: InstagramPost[] = [
  // 1. The Day We Met (1999) - LANDSCAPE (3:2)
  {
    id: "post-1999",
    year: 1999,
    dateStr: "14 February 1999",
    title: "The Day We Met",
    location: "Banjara Hills, Hyderabad",
    aspectRatio: "landscape",
    images: [
      {
        src: "/instagram/first_sight.png",
        alt: "The fateful day Bujji and Satya first crossed paths",
        caption: "A chance meeting that changed our destinies forever",
        tag: "First Glance",
        themeGradient: "from-amber-200 via-rose-100 to-amber-100",
        iconName: "heart",
      },
      {
        src: "/instagram/first_sight_2.png",
        alt: "Endless conversation under the evening twilight",
        caption: "Two nervous smiles, sweet conversation, and the start of a lifetime",
        tag: "Sweet Conversations",
        themeGradient: "from-rose-100 via-peach-100 to-amber-100",
        iconName: "sparkles",
      },
    ],
    likesCount: 0,
    caption:
      "A chance encounter at a friend's gathering in Hyderabad changed everything. Two strangers, nervous smiles, one endless conversation, and a spark that set 25 years into motion.",
    category: "milestone",
    hashtags: ["#FirstMeeting", "#Fate", "#WhereItAllBegan", "#BujjiAndSatya"],
    comments: [],
  },

  // 2. Our Wedding Day (2001) - LANDSCAPE (16:9 / 3:2)
  {
    id: "post-2001",
    year: 2001,
    dateStr: "23 November 2001",
    title: "Our Wedding Day • Sacred Mandap",
    location: "Tirumala Tirupati Mandap, Andhra Pradesh",
    aspectRatio: "landscape",
    images: [
      {
        src: "/images/art/golden_mandap_bg.png",
        alt: "The Grand Golden Wedding Mandap decorated with marigolds and jasmine",
        caption: "The sacred mandap where eternal vows were sealed",
        tag: "The Mandap",
        themeGradient: "from-amber-300 via-rose-400 to-amber-200",
        iconName: "ring",
      },
      {
        src: "/images/art/couple_sittinga_and_welcoming.png",
        alt: "Bujji and Satya seated in traditional wedding attire welcoming guests",
        caption: "Bujji & Satya welcoming loved ones with sacred folded hands 🙏",
        tag: "Bujji Weds Satya",
        themeGradient: "from-rose-200 via-amber-100 to-rose-300",
        iconName: "heart",
      },
      {
        src: "/images/art/mandap_backdrop_2.png",
        alt: "Wedding Jaimala garland exchange ceremony under the bells",
        caption: "Jaimala exchange surrounded by Vedic chants and rose petal showers",
        tag: "Jaimala Ceremony",
        themeGradient: "from-amber-200 via-rose-300 to-amber-100",
        iconName: "sparkles",
      },
      {
        src: "/Golden South Indian Mandap Setting.png",
        alt: "Grand Golden South Indian Wedding Mandap Setting",
        caption: "Sacred South Indian temple mandap adorned in royal gold and fresh blooms",
        tag: "Divine Mandap",
        themeGradient: "from-amber-400 via-yellow-200 to-rose-300",
        iconName: "ring",
      },
    ],
    likesCount: 0,
    caption:
      "On 23 November 2001, surrounded by family, sacred Vedic mantras, and the divine fragrance of jasmine, Bujji and Satya became one. 25 years later, every promise made under this mandap stands stronger than ever.",
    category: "wedding",
    hashtags: [
      "#BujjiWedsSatya",
      "#23Nov2001",
      "#SilverJubilee",
      "#SouthIndianWedding",
      "#SacredVows",
    ],
    comments: [],
  },

  // 3. Our First Home (2000) - PORTRAIT (4:5)
  {
    id: "post-2000",
    year: 2000,
    dateStr: "10 August 2000",
    title: "Our First Cozy Apartment",
    location: "Begumpet, Hyderabad",
    aspectRatio: "portrait",
    images: [
      {
        src: "/instagram/portrait/couple_welcoming_portrait.png",
        alt: "Bujji and Satya smiling in their first apartment",
        caption: "Balcony evenings sipping cardamom chai and dreaming of the future",
        tag: "Sweet Chai Moments",
        themeGradient: "from-rose-100 via-amber-100 to-orange-100",
        iconName: "heart",
      },
      {
        src: "/instagram/portrait/botanical_frame_portrait.jpg",
        alt: "A cozy first home flat filled with wedding memories",
        caption: "Our very first 2BHK flat — painting walls and sipping sweet chai",
        tag: "First Nest",
        themeGradient: "from-amber-100 via-orange-100 to-amber-200",
        iconName: "home",
      },
    ],
    likesCount: 0,
    caption:
      "Our very first little flat that became our whole world. We painted the walls together, argued for two hours over curtain colours, and filled every corner with the scent of fresh cardamom chai.",
    category: "milestone",
    hashtags: ["#FirstHome", "#ChaiAndMemories", "#BuildingALife", "#YoungLove"],
    comments: [],
  },

  // 4. Welcome, Little One (2002) - LANDSCAPE (3:2)
  {
    id: "post-2002",
    year: 2002,
    dateStr: "18 August 2002",
    title: "Welcome, Little One • First Child",
    location: "Rainbow Children's Hospital, Hyderabad",
    aspectRatio: "landscape",
    images: [
      {
        src: "/images/art/couple_sittinga_and_welcoming.png",
        alt: "Bujji and Satya stepping into parenthood with immense love",
        caption: "The day our hearts learned to beat outside our bodies",
        tag: "Bundle of Joy",
        themeGradient: "from-rose-100 via-pink-100 to-peach-100",
        iconName: "heart",
      },
      {
        src: "/instagram/landscape/botanical_frame_landscape.jpg",
        alt: "Sweet beginnings of parenthood and sleepless joyful nights",
        caption: "Tiny fingers wrapped around ours — our world changed forever",
        tag: "New Parents",
        themeGradient: "from-peach-100 via-rose-100 to-amber-100",
        iconName: "sparkles",
      },
    ],
    likesCount: 0,
    caption:
      "Our first child arrived, turning our universe upside down in the most beautiful way. Sleepless nights became our sweetest memories, and our family of two blossomed into three.",
    category: "family",
    hashtags: ["#FirstChild", "#ParentsAtLast", "#Parenthood", "#OurWorld"],
    comments: [],
  },

  // 5. Growing Family (2005) - PORTRAIT (4:5)
  {
    id: "post-2005",
    year: 2005,
    dateStr: "5 May 2005",
    title: "Growing Family • Two Little Treasures",
    location: "Hyderabad, India",
    aspectRatio: "portrait",
    images: [
      {
        src: "/instagram/portrait/couple_welcoming_portrait.png",
        alt: "Bujji and Satya rejoicing as parents of two",
        caption: "Tiny footsteps echoing through the hallway and happy bedtime tales",
        tag: "Double Blessing",
        themeGradient: "from-amber-100 via-rose-100 to-pink-100",
        iconName: "heart",
      },
      {
        src: "/instagram/portrait/botanical_frame_portrait.jpg",
        alt: "The family grows complete with laughter and giggles",
        caption: "Double the laughter, double the joy, double the love",
        tag: "Family Complete",
        themeGradient: "from-peach-100 via-amber-100 to-rose-100",
        iconName: "sparkles",
      },
    ],
    likesCount: 0,
    caption:
      "Our second bundle of joy completed our circle of love. The house grew louder, messier, and infinitely more joyful. Every room echoed with tiny footsteps, laughter, and bedtime stories.",
    category: "family",
    hashtags: ["#FamilyOfFour", "#DoubleTrouble", "#JoyUnfiltered", "#Blessed"],
    comments: [],
  },

  // 6. Dream Home (2008) - LANDSCAPE (16:9 / 3:2)
  {
    id: "post-2008",
    year: 2008,
    dateStr: "12 October 2008",
    title: "Our Forever Dream Home",
    location: "Jubilee Hills, Hyderabad",
    aspectRatio: "landscape",
    images: [
      {
        src: "/South Indian Wedding Mandap Backdrop.png",
        alt: "Traditional flower decorations for Griha Pravesh",
        caption: "Auspicious Griha Pravesh ceremonies surrounded by blessing elders",
        tag: "Griha Pravesh",
        themeGradient: "from-amber-300 via-rose-200 to-amber-100",
        iconName: "sparkles",
      },
      {
        src: "/instagram/landscape/botanical_frame_landscape.jpg",
        alt: "The dream forever home with garden and spacious balcony",
        caption: "Housewarming pooja and warm blessings in our forever home",
        tag: "Forever Home",
        themeGradient: "from-amber-200 via-yellow-100 to-amber-100",
        iconName: "home",
      },
    ],
    likesCount: 0,
    caption:
      "After years of patient dreaming and working hand-in-hand, we opened the doors to our forever home. A green garden for the children to run, and that famous quiet balcony for our evening cup of chai together.",
    category: "milestone",
    hashtags: ["#DreamHome", "#GrihaPravesh", "#SacredBlessings", "#HomeIsWhereTheHeartIs"],
    comments: [],
  },

  // 7. Goa Holiday (2010) - LANDSCAPE (3:2)
  {
    id: "post-2010",
    year: 2010,
    dateStr: "20 May 2010",
    title: "Goa Getaway • First Family Beach Holiday",
    location: "Calangute & Candolim Beach, Goa",
    aspectRatio: "landscape",
    images: [
      {
        src: "/images/art/couple_sittinga_and_welcoming.png",
        alt: "Bujji and Satya laughing together enjoying the cool sea breeze",
        caption: "Seaside breeze, tender smiles, and 100% unplugged joy",
        tag: "Pure Joy",
        themeGradient: "from-cyan-100 via-blue-100 to-amber-100",
        iconName: "heart",
      },
      {
        src: "/instagram/landscape/botanical_frame_landscape.jpg",
        alt: "Golden hour sunset walks hand-in-hand on the sandy beach",
        caption: "Golden hour skies and waves kissing our bare feet",
        tag: "Goa Sunset",
        themeGradient: "from-amber-300 via-rose-300 to-indigo-200",
        iconName: "camera",
      },
      {
        src: "/Golden South Indian Mandap Setting.png",
        alt: "Family celebration moments in beachside Goa",
        caption: "Building sandcastles that the tide washed away with laughter",
        tag: "Sandcastles",
        themeGradient: "from-amber-100 via-sky-200 to-amber-200",
        iconName: "plane",
      },
    ],
    likesCount: 0,
    caption:
      "Our very first family trip to the coast! Warm sand between our toes, sunset strolls along the waves, and the kids touching the sea for the first time. Pure, unadulterated happiness.",
    category: "travel",
    hashtags: ["#GoaDiaries", "#BeachVacation", "#SunsetLovers", "#FamilyFirsts"],
    comments: [],
  },

  // 8. Silver Streak — 15th Anniversary (2014) - LANDSCAPE (16:9 / 3:2)
  {
    id: "post-2014",
    year: 2014,
    dateStr: "23 November 2014",
    title: "15 Years of Togetherness • Crystal Milestone",
    location: "Secunderabad Club, Hyderabad",
    aspectRatio: "landscape",
    images: [
      {
        src: "/images/art/golden_mandap_bg.png",
        alt: "15th Anniversary surprise party planned by the children",
        caption: "15 years of smiles, secrets, and unconditional love",
        tag: "15th Anniversary",
        themeGradient: "from-rose-200 via-amber-200 to-rose-100",
        iconName: "sparkles",
      },
      {
        src: "/images/art/couple_sittinga_and_welcoming.png",
        alt: "Bujji and Satya cutting the anniversary cake",
        caption: "Fifteen years hand in hand — each year sweeter than the last",
        tag: "Crystal Milestone",
        themeGradient: "from-amber-200 via-rose-100 to-peach-100",
        iconName: "heart",
      },
    ],
    likesCount: 0,
    caption:
      "Fifteen years together! The kids planned an unforgettable surprise party. There were happy tears, hilarious speeches, and a homemade chocolate cake that leaned slightly to the left but tasted of pure magic.",
    category: "celebration",
    hashtags: ["#15YearsStrong", "#CrystalAnniversary", "#SurpriseParty", "#FamilyLove"],
    comments: [],
  },

  // 9. Shimla Snow Trip (2017) - PORTRAIT (4:5)
  {
    id: "post-2017",
    year: 2017,
    dateStr: "15 January 2017",
    title: "Shimla Winter Wonderland • First Snow",
    location: "Mall Road & Kufri, Shimla, Himachal Pradesh",
    aspectRatio: "portrait",
    images: [
      {
        src: "/instagram/portrait/couple_welcoming_portrait.png",
        alt: "Bujji and Satya bundled up in woolen mufflers and winter coats",
        caption: "Warm hearts in cold weather — sharing one hot cocoa",
        tag: "Mountain Warmth",
        themeGradient: "from-blue-100 via-indigo-100 to-rose-100",
        iconName: "heart",
      },
      {
        src: "/instagram/portrait/botanical_frame_portrait.jpg",
        alt: "Dancing in our very first mountain snowfall together in Shimla",
        caption: "Dancing in our very first mountain snowfall together",
        tag: "First Snowfall",
        themeGradient: "from-sky-200 via-indigo-100 to-amber-100",
        iconName: "plane",
      },
      {
        src: "/instagram/portrait/mandap_backdrop_portrait.png",
        alt: "Family snowman memories and winter wonderland laughter",
        caption: "Our questionable snowman that barely survived an hour!",
        tag: "Snowman Fun",
        themeGradient: "from-cyan-200 via-blue-100 to-slate-100",
        iconName: "sparkles",
      },
    ],
    likesCount: 0,
    caption:
      "Packed the car and headed straight for the Himalayas! We witnessed snow for the very first time, built a hilariously wobbly snowman, and drank steaming hot chocolate by the fireplace.",
    category: "travel",
    hashtags: ["#ShimlaSnow", "#WinterInHimalayas", "#SnowmanMakers", "#MountainAir"],
    comments: [],
  },

  // 10. 20 Years of Us (2019) - LANDSCAPE (16:9 / 3:2)
  {
    id: "post-2019",
    year: 2019,
    dateStr: "23 November 2019",
    title: "20 Years of Us • Renewing Our Vows",
    location: "Home Sanctuary, Hyderabad",
    aspectRatio: "landscape",
    images: [
      {
        src: "/images/art/mandap_backdrop_2.png",
        alt: "A cozy vow renewal at home surrounded by the closest family",
        caption: "Two decades of loving each other more with each passing dawn",
        tag: "20 Years Strong",
        themeGradient: "from-amber-200 via-rose-200 to-amber-100",
        iconName: "ring",
      },
      {
        src: "/images/art/couple_sittinga_and_welcoming.png",
        alt: "Bujji and Satya smiling warmly renewing eternal vows",
        caption: "Surrounded by our children, reaffirming our lifelong devotion",
        tag: "Vows Renewed",
        themeGradient: "from-rose-200 via-amber-100 to-peach-100",
        iconName: "heart",
      },
    ],
    likesCount: 0,
    caption:
      "Two decades of growth, partnership, and laughter. We renewed our sacred vows in a cozy ceremony at home with our children by our side. Some loves truly grow richer and sweeter with time.",
    category: "celebration",
    hashtags: ["#20YearsOfLove", "#TwoDecades", "#VowRenewal", "#ForeverLove"],
    comments: [],
  },

  // 11. Empty Nest, Full Hearts (2022) - PORTRAIT (4:5)
  {
    id: "post-2022",
    year: 2022,
    dateStr: "1 September 2022",
    title: "Empty Nest, Full Hearts",
    location: "Hyderabad, India",
    aspectRatio: "portrait",
    images: [
      {
        src: "/instagram/portrait/couple_welcoming_portrait.png",
        alt: "Bujji and Satya enjoying sunset dates and peaceful morning walks",
        caption: "Rediscovering each other all over again in our quiet home",
        tag: "Second Honeymoon",
        themeGradient: "from-rose-100 via-amber-100 to-rose-200",
        iconName: "heart",
      },
      {
        src: "/instagram/portrait/botanical_frame_portrait.jpg",
        alt: "Peaceful evening walks and coffee dates together",
        caption: "Hand-in-hand evening strolls, reminiscing about the early days",
        tag: "Quiet Romance",
        themeGradient: "from-peach-100 via-amber-100 to-rose-100",
        iconName: "sparkles",
      },
    ],
    likesCount: 0,
    caption:
      "The kids stepped out into the world for college, and our home grew quiet. But in that stillness, we rediscovered the rhythms of our early courtship. Long romantic walks, spontaneous coffee dates, and endless talks.",
    category: "milestone",
    hashtags: ["#EmptyNest", "#SecondCourtship", "#LifelongPartners", "#Soulmates"],
    comments: [],
  },

  // 12. 25 Years — Silver Jubilee (2024 / 2026) - LANDSCAPE (16:9 / 3:2)
  {
    id: "post-2024",
    year: 2024,
    dateStr: "23 November 2024",
    title: "25 Years — Silver Wedding Jubilee! 🥂",
    location: "The Royal Kanjeevaram Mandap, Hyderabad",
    aspectRatio: "landscape",
    images: [
      {
        src: "/images/art/couple_sittinga_and_welcoming.png",
        alt: "Bujji and Satya in radiant wedding attire welcoming all with folded hands",
        caption: "Bujji Weds Satya — Celebrating 25 Years of Divine Love ❤️",
        tag: "Silver Jubilee",
        themeGradient: "from-amber-300 via-rose-300 to-amber-200",
        iconName: "sparkles",
      },
      {
        src: "/images/art/golden_mandap_bg.png",
        alt: "The Grand Mandap decorated with golden temple pillars and garlands",
        caption: "Under the golden mandap once more, blessed by 25 years of memories",
        tag: "Golden Mandap",
        themeGradient: "from-amber-400 via-yellow-200 to-rose-300",
        iconName: "ring",
      },
      {
        src: "/images/art/mandap_backdrop_2.png",
        alt: "Cutting the grand 25th Silver Jubilee cake surrounded by family",
        caption: "Cutting the anniversary cake surrounded by 3 generations of family",
        tag: "Celebration Feast",
        themeGradient: "from-rose-200 via-amber-200 to-rose-300",
        iconName: "heart",
      },
      {
        src: "/Golden South Indian Mandap Setting.png",
        alt: "Family portrait with children, elders, and lifelong friends",
        caption: "To the next 25 years and beyond — together forever!",
        tag: "Generations of Love",
        themeGradient: "from-amber-200 via-peach-200 to-amber-100",
        iconName: "sparkles",
      },
    ],
    likesCount: 0,
    caption:
      "A quarter-century of unwavering love, deep laughter, and beautiful sacrifices. From that very first glance in 1999 to this Silver Jubilee, every single heartbeat has been a blessing. Here is to Bujji & Satya — 25 Years of Love, and forever more to come! 🥂👑❤️",
    category: "celebration",
    hashtags: [
      "#BujjiWedsSatya",
      "#SilverJubilee",
      "#25YearsOfLove",
      "#QuarterCentury",
      "#CoupleGoals",
      "#TogetherForever",
    ],
    comments: [],
  },
];
