import HeroSection from "@/components/sections/HeroSection";
import TimelineSection from "@/components/sections/TimelineSection";
import GalleryPreview from "@/components/sections/GalleryPreview";
import GlassJarSection from "@/components/sections/GlassJarSection";
import ThenVsNowSection from "@/components/sections/ThenVsNowSection";
import MessagesSection from "@/components/sections/MessagesSection";
import TriviaPreview from "@/components/sections/TriviaPreview";
import MapPreview from "@/components/sections/MapPreview";
import DedicationSection from "@/components/sections/DedicationSection";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* 1. Cinematic Hero Section */}
      <HeroSection />

      {/* 2. 25-Year Timeline (Our Story) */}
      <TimelineSection />

      {/* 3. Memory Gallery Teaser */}
      <GalleryPreview />

      {/* 4. The Interactive Glass Jar */}
      <GlassJarSection />

      {/* 5. Then vs Now Photo Comparison */}
      <ThenVsNowSection />

      {/* 6. Family Voice & Video Messages */}
      <MessagesSection />

      {/* 7. Family Trivia Quiz Teaser */}
      <TriviaPreview />

      {/* 8. The Memory Map Teaser */}
      <MapPreview />

      {/* 9. Final Emotional Dedication */}
      <DedicationSection />
    </div>
  );
}
