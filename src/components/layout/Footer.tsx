import Link from "next/link";
import { Heart, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-warm-beige/50 bg-champagne/40">
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h3 className="font-heading text-3xl font-semibold text-charcoal sm:text-4xl">
          Bujji Weds Satya
        </h3>

        <p className="mt-2 font-heading text-xl italic tracking-wide text-burgundy">
          25 Years of Love ❤️
        </p>
        <p className="mt-1 text-xs font-semibold tracking-widest text-soft-brown uppercase">
          23 November 2001 • Silver Jubilee
        </p>

        <div className="mt-6 flex justify-center">
          <Heart
            className="h-5 w-5 text-burgundy"
            fill="currentColor"
          />
        </div>

        <p className="mt-4 text-xs font-medium text-soft-brown/75">
          Made with all our love by your family
        </p>

        <div className="mt-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-[11px] text-soft-brown/50 hover:text-burgundy transition-colors"
          >
            <Shield className="h-3 w-3" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
