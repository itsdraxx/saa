import HeroSection from "@/components/sections/HeroSection";
import JourneyCounterSection from "@/components/sections/JourneyCounterSection";
import TimelineSection from "@/components/sections/TimelineSection";
import GalleryPreview from "@/components/sections/GalleryPreview";
import GlassJarSection from "@/components/sections/GlassJarSection";
import ThenVsNowSection from "@/components/sections/ThenVsNowSection";
import MessagesSection from "@/components/sections/MessagesSection";
import TriviaPreview from "@/components/sections/TriviaPreview";
import MapPreview from "@/components/sections/MapPreview";
import WishesWallSection from "@/components/sections/WishesWallSection";
import DedicationSection from "@/components/sections/DedicationSection";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* 1. Welcoming Hero Section (Bujji Weds Satya - 25 Years of Love ❤️) */}
      <HeroSection />

      {/* 2. Live Journey Love Clock (Every Second of 25 Years since 23-11-2001) */}
      <JourneyCounterSection />

      {/* 3. 25-Year Timeline (Our Story) */}
      <TimelineSection />

      {/* 4. Memory Gallery Teaser */}
      <GalleryPreview />

      {/* 5. The Interactive Glass Jar */}
      <GlassJarSection />

      {/* 6. Then vs Now Photo Comparison */}
      <ThenVsNowSection />

      {/* 7. Family Voice & Video Messages */}
      <MessagesSection />

      {/* 8. Family Trivia Quiz Teaser */}
      <TriviaPreview />

      {/* 9. The Memory Map Teaser */}
      <MapPreview />

      {/* 10. Guest Wishes Wall (Anniversary Blessings) */}
      <WishesWallSection />

      {/* 11. Final Emotional Dedication */}
      <DedicationSection />
    </div>
  );
}
