"use client";

import { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "motion/react";
import SectionHeading from "@/components/ui/SectionHeading";
import InstagramPostCard from "@/components/interactive/InstagramPostCard";
import { instagramPosts, type InstagramPost } from "@/data/instagramPosts";
import { fetchInstagramPosts } from "@/lib/api";
import {
  Sparkles,
  Heart,
  Camera,
  Compass,
  Users,
  Flame,
  Columns3,
  List,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/data/translations";

type FilterCategory = "all" | "wedding" | "family" | "travel" | "celebration";
type ViewMode = "masonry" | "feed";

function useColumnCount(): number {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("resize", onStoreChange);
      return () => window.removeEventListener("resize", onStoreChange);
    },
    () => {
      if (typeof window === "undefined") return 3;
      const w = window.innerWidth;
      if (w < 768) return 1;
      if (w < 1024) return 2;
      return 3;
    },
    () => 3
  );
}

// Relative weight factors based on aspect ratio to balance waterfall column heights
function getPostHeightWeight(post: InstagramPost): number {
  switch (post.aspectRatio) {
    case "portrait":
    case "4:5":
      return 1.45;
    case "square":
    case "1:1":
      return 1.25;
    case "4:3":
      return 1.1;
    case "landscape":
    case "3:2":
    case "16:9":
    default:
      return 1.0;
  }
}

// Distribute posts across columns so total heights end balanced and there are zero blank voids
function distributePostsToColumns(
  posts: InstagramPost[],
  numColumns: number
): InstagramPost[][] {
  if (numColumns <= 1) return [posts];

  const cols: InstagramPost[][] = Array.from({ length: numColumns }, () => []);
  const heights = new Array(numColumns).fill(0);

  for (const post of posts) {
    let minCol = 0;
    for (let c = 1; c < numColumns; c++) {
      if (heights[c] < heights[minCol]) {
        minCol = c;
      }
    }
    cols[minCol].push(post);
    heights[minCol] += getPostHeightWeight(post);
  }

  return cols;
}

export default function TimelineSection() {
  const [posts, setPosts] = useState<InstagramPost[]>(instagramPosts);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("masonry");
  const { language, isTelugu } = useLanguage();
  const t = translations[language].timeline;
  const colCount = useColumnCount();

  useEffect(() => {
    let isMounted = true;
    fetchInstagramPosts().then((res) => {
      if (isMounted && res.posts && res.posts.length > 0) {
        setPosts(res.posts);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPosts =
    activeCategory === "all"
      ? posts
      : posts.filter((post) => post.category === activeCategory);

  // Distribute posts evenly across current column count
  const columns = useMemo(
    () => distributePostsToColumns(filteredPosts, colCount),
    [filteredPosts, colCount]
  );

  return (
    <section id="story" className="relative w-full overflow-hidden bg-ivory pt-14 pb-8 sm:pt-20 sm:pb-10 px-3 sm:px-6 lg:px-8">
      {/* Background Soft Ambience */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#F5D0C0_1px,transparent_1px)] [background-size:24px_24px] sm:[background-size:28px_28px] opacity-40" />

      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <SectionHeading
          eyebrow={t.chronicle || "Chronicle of Love"}
          title={t.heading}
          subtitle={t.subtitle}
        />

        {/* =========================================================
            CATEGORY FILTER TABS
            ========================================================= */}
        <div className="mt-8 flex justify-center flex-wrap gap-1.5 sm:gap-2">
          {[
            { id: "all", label: t.filterAll, icon: Sparkles, count: posts.length },
            {
              id: "wedding",
              label: t.filterWedding,
              icon: Heart,
              count: posts.filter((p) => p.category === "wedding").length,
            },
            {
              id: "family",
              label: t.filterFamily,
              icon: Users,
              count: posts.filter((p) => p.category === "family").length,
            },
            {
              id: "travel",
              label: t.filterTravel,
              icon: Compass,
              count: posts.filter((p) => p.category === "travel").length,
            },
            {
              id: "celebration",
              label: t.filterCelebration,
              icon: Flame,
              count: posts.filter((p) => p.category === "celebration").length,
            },
          ].map((tab) => {
            const isActive = activeCategory === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as FilterCategory)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-burgundy text-warm-white shadow-md scale-105"
                    : "bg-warm-white/90 text-soft-brown border border-warm-beige hover:border-gold/60 hover:text-burgundy"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-white/25 text-white" : "bg-champagne text-soft-brown/70"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* =========================================================
            VIEW SWITCHER: MASONRY WATERFALL vs SINGLE STREAM
            ========================================================= */}
        <div className="hidden md:flex items-center justify-center mt-5">
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-champagne/60 border border-warm-beige/80 shadow-2xs">
            <button
              onClick={() => setViewMode("masonry")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "masonry"
                  ? "bg-burgundy text-warm-white shadow-xs scale-102"
                  : "text-soft-brown hover:text-burgundy"
              }`}
            >
              <Columns3 className="h-3.5 w-3.5" />
              <span>{isTelugu ? "గ్యాలరీ కొల్లేజ్" : "Masonry Gallery"}</span>
            </button>

            <button
              onClick={() => setViewMode("feed")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "feed"
                  ? "bg-burgundy text-warm-white shadow-xs scale-102"
                  : "text-soft-brown hover:text-burgundy"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>{isTelugu ? "సింగిల్ ఫీడ్" : "Single Feed"}</span>
            </button>
          </div>
        </div>

        {/* =========================================================
            INSTAGRAM FEED CONTAINER
            ========================================================= */}

        {/* MODE 1: MASONRY GALLERY (Balanced vertical waterfall with pure, unconstrained aspect ratios) */}
        {viewMode === "masonry" && (
          <div
            className={`mt-8 sm:mt-12 mx-auto items-start ${
              colCount === 1
                ? "flex flex-col gap-6 sm:gap-7 max-w-md"
                : colCount === 2
                ? "grid grid-cols-2 gap-6 sm:gap-7 max-w-5xl"
                : "grid grid-cols-3 gap-6 lg:gap-7 xl:gap-8 max-w-7xl"
            }`}
          >
            {columns.map((colPosts, colIdx) => (
              <div
                key={colIdx}
                className="flex flex-col gap-6 sm:gap-7 lg:gap-7 xl:gap-8 w-full"
              >
                {colPosts.map((post) => (
                  <InstagramPostCard key={post.id} post={post} viewMode={viewMode} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* MODE 2: SINGLE FEED STREAM (Full Instagram centered focus feed) */}
        {viewMode === "feed" && (
          <div className="mt-8 sm:mt-12 max-w-xl mx-auto space-y-8">
            {filteredPosts.map((post) => (
              <InstagramPostCard key={post.id} post={post} viewMode={viewMode} />
            ))}
          </div>
        )}

        {/* Bottom Feed Notice */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-champagne/60 border border-warm-beige px-5 py-2 text-xs font-semibold text-soft-brown">
            <Camera className="h-4 w-4 text-burgundy" />
            <span>{t.caughtUp}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
