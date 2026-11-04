import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import { mapLocations } from "@/data/map-locations";
import { MapPin, ArrowRight, Compass, Navigation } from "lucide-react";

export default function MapPreview() {
  const previewLocations = mapLocations.slice(0, 4);

  return (
    <section id="map" className="w-full bg-ivory py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          title="The Memory Map"
          subtitle="Love isn't just measured in years, but in the places that hold your laughter, your vows, and your greatest adventures."
        />

        {/* Location Cards Preview */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {previewLocations.map((loc) => (
            <div
              key={loc.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-warm-beige bg-warm-white p-5 shadow-xs transition-all duration-300 hover:border-gold hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{loc.icon || "📍"}</span>
                  <span className="font-heading text-lg font-bold text-burgundy">
                    {loc.year}
                  </span>
                </div>
                <h3 className="mt-3 font-heading text-lg font-semibold text-charcoal group-hover:text-burgundy transition-colors">
                  {loc.name}
                </h3>
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-soft-brown">
                  {loc.story}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-1.5 border-t border-warm-beige/60 pt-3 text-[11px] font-medium text-gold uppercase tracking-wider">
                <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
                <span className="capitalize">{loc.category.replace("-", " ")}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA to Interactive Map */}
        <div className="mt-12 text-center">
          <Link
            href="/memory-map"
            className="inline-flex items-center gap-2 rounded-full border border-burgundy bg-warm-white px-8 py-3.5 text-sm font-medium text-burgundy shadow-xs transition-all duration-300 hover:bg-burgundy hover:text-warm-white hover:shadow-md active:scale-95"
          >
            <Compass className="h-4 w-4" />
            <span>Open Interactive Map of All {mapLocations.length} Destinations</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
