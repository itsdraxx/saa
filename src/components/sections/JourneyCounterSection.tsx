"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import LoveClock from "@/components/ui/LoveClock";

export default function JourneyCounterSection() {
  return (
    <section className="relative w-full bg-ivory py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-y border-warm-beige/60">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#F5E3C7_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      <div className="mx-auto max-w-6xl text-center">
        <SectionHeading
          eyebrow="23 November 2001 — Present"
          title="Every Second of Our 25 Years"
          subtitle="From the moment sacred vows were exchanged under the mandap, every day has added another blessing to our family's story."
        />

        <div className="mt-10 sm:mt-12 flex justify-center">
          <LoveClock weddingDate="2001-11-23T00:00:00" align="center" />
        </div>
      </div>
    </section>
  );
}

