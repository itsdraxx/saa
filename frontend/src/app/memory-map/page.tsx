import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import MemoryMap from "@/components/interactive/MemoryMap";
import { ArrowLeft } from "lucide-react";

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
            href="/#map"
            className="inline-flex items-center gap-2 rounded-full border border-warm-beige bg-warm-white px-5 py-2 text-xs font-medium text-charcoal shadow-2xs transition-all hover:bg-champagne/40 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Anniversary Home</span>
          </Link>
        </div>

        <SectionHeading
          title="The Memory Map"
          subtitle="From the hall in Hyderabad where vows were spoken to quiet family vacations across India, slide through the cards below to fly to each memory pin."
        />

        {/* The Snapchat-Style In-Map Interactive View */}
        <div className="mt-12">
          <MemoryMap />
        </div>
      </div>
    </div>
  );
}
