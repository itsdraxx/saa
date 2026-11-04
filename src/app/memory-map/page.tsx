import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import MemoryMap from "@/components/interactive/MemoryMap";
import { mapLocations } from "@/data/map-locations";
import { ArrowLeft, MapPin, Calendar, Heart } from "lucide-react";

export const metadata = {
  title: "The Memory Map — 25 Years of Us",
  description: "An interactive map celebrating all the meaningful destinations in Mom and Dad's 25-year journey.",
};

export default function MemoryMapPage() {
  return (
    <div className="min-h-screen bg-ivory py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-warm-beige bg-warm-white px-5 py-2 text-xs font-medium text-charcoal shadow-2xs transition-all hover:bg-champagne/40 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Anniversary Home</span>
          </Link>
        </div>

        <SectionHeading
          title="The Memory Map"
          subtitle="From the hall in Hyderabad where vows were spoken to quiet family vacations across India, explore the landmarks of a quarter-century of love."
        />

        {/* The Interactive Leaflet Map */}
        <div className="mt-12">
          <MemoryMap />
        </div>

        {/* Full Directory of Locations Below */}
        <div className="mt-20">
          <h3 className="font-heading text-2xl font-semibold text-charcoal sm:text-3xl text-center">
            All Landmark Destinations
          </h3>
          <p className="mt-2 text-center text-xs text-soft-brown">
            {mapLocations.length} meaningful spots where memories were made
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mapLocations.map((loc) => (
              <div
                key={loc.id}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-warm-beige bg-warm-white p-6 shadow-xs transition-all hover:border-gold hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{loc.icon}</span>
                    <span className="font-heading text-xl font-bold text-burgundy">
                      {loc.year}
                    </span>
                  </div>
                  <h4 className="mt-4 font-heading text-xl font-semibold text-charcoal">
                    {loc.name}
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-soft-brown">
                    {loc.story}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-warm-beige/60 pt-3 text-[11px] text-soft-brown">
                  <span className="capitalize font-medium text-gold">
                    {loc.category.replace("-", " ")}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-burgundy" />
                    {loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
