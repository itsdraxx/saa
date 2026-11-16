"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import SectionHeading from "@/components/ui/SectionHeading";
import InstagramPostCard from "@/components/interactive/InstagramPostCard";
import { instagramPosts } from "@/data/instagramPosts";
import { Sparkles, Heart, Camera, Compass, Users, Flame } from "lucide-react";

type FilterCategory = "all" | "wedding" | "family" | "travel" | "celebration";

export default function TimelineSection() {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");

  const filteredPosts =
    activeCategory === "all"
      ? instagramPosts
      : instagramPosts.filter((post) => post.category === activeCategory);

  // Story highlights at the top
  const storyHighlights = [
    { id: "post-2001", label: "Mandap 2001", emoji: "💍", category: "wedding" },
    { id: "post-2002", label: "Baby Rahul", emoji: "👶", category: "family" },
    { id: "post-2008", label: "Dream Home", emoji: "🏡", category: "milestone" },
    { id: "post-2010", label: "Goa Beach", emoji: "🏖️", category: "travel" },
    { id: "post-2017", label: "Shimla Snow", emoji: "❄️", category: "travel" },
    { id: "post-2024", label: "Silver Jubilee", emoji: "🥂", category: "celebration" },
  ];

  const handleStoryClick = (postId: string) => {
    setActiveCategory("all");
    setTimeout(() => {
      const element = document.getElementById(postId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  return (
    <section id="story" className="relative w-full overflow-hidden bg-ivory py-16 sm:py-24 px-3 sm:px-6 lg:px-8">
      {/* Background Soft Ambience */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#F5D0C0_1px,transparent_1px)] [background-size:24px_24px] sm:[background-size:28px_28px] opacity-40" />

      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <SectionHeading
          eyebrow="Chronicle of Love"
          title="Our 25-Year Journey"
          subtitle="Explore our family's photo feed — swipe through memories, double-tap to send love ❤️, and leave your blessings in the comments!"
        />

        {/* =========================================================
            INSTAGRAM STORY HIGHLIGHTS BAR
            ========================================================= */}
        <div className="mt-8 sm:mt-12 flex justify-start sm:justify-center overflow-x-auto no-scrollbar py-2 px-1 gap-4 sm:gap-6">
          {storyHighlights.map((story) => (
            <button
              key={story.id}
              onClick={() => handleStoryClick(story.id)}
              className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer focus:outline-hidden"
            >
              {/* Story Gradient Ring */}
              <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-sm transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-warm-white border-2 border-warm-white text-xl sm:text-2xl shadow-inner">
                  <span>{story.emoji}</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-charcoal group-hover:text-burgundy transition-colors tracking-tight">
                {story.label}
              </span>
            </button>
          ))}
        </div>

        {/* =========================================================
            CATEGORY FILTER TABS
            ========================================================= */}
        <div className="mt-8 flex justify-center flex-wrap gap-1.5 sm:gap-2">
          {[
            { id: "all", label: "All Posts", icon: Sparkles, count: instagramPosts.length },
            {
              id: "wedding",
              label: "Wedding & Vows",
              icon: Heart,
              count: instagramPosts.filter((p) => p.category === "wedding").length,
            },
            {
              id: "family",
              label: "Family Moments",
              icon: Users,
              count: instagramPosts.filter((p) => p.category === "family").length,
            },
            {
              id: "travel",
              label: "Travels",
              icon: Compass,
              count: instagramPosts.filter((p) => p.category === "travel").length,
            },
            {
              id: "celebration",
              label: "Celebrations",
              icon: Flame,
              count: instagramPosts.filter((p) => p.category === "celebration").length,
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
            INSTAGRAM FEED: 2-COLUMN DESKTOP / 1-COLUMN MOBILE
            ========================================================= */}
        <div className="mt-10 sm:mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 max-w-6xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="w-full flex justify-center"
              >
                <InstagramPostCard post={post} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom Feed Notice */}
        <div className="mt-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-champagne/60 border border-warm-beige px-5 py-2 text-xs font-semibold text-soft-brown">
            <Camera className="h-4 w-4 text-burgundy" />
            <span>You&apos;ve caught up with all 25 years of memories! ❤️</span>
          </div>
        </div>
      </div>
    </section>
  );
}
