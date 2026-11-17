"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import MemoryMap from "@/components/interactive/MemoryMap";

export default function MapPreview() {
  return (
    <section id="map" className="w-full bg-ivory py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          title="The Memory Map"
          subtitle="Love isn't just measured in years, but in the places that hold your laughter, your vows, and your greatest adventures. Slide through destinations below to journey across Mom & Dad's India."
        />

        {/* The Snapchat-Style In-Map Interactive View */}
        <div className="mt-12">
          <MemoryMap />
        </div>
      </div>
    </section>
  );
}
