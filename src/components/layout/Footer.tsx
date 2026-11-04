import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-warm-beige/50 bg-champagne/40">
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h3 className="font-heading text-3xl font-semibold text-charcoal sm:text-4xl">
          25 Years of Us
        </h3>

        <p className="mt-3 font-heading text-xl tracking-wide text-soft-brown">
          1999 — 2024
        </p>

        <div className="mt-6 flex justify-center">
          <Heart
            className="h-5 w-5 text-burgundy"
            fill="currentColor"
          />
        </div>

        <p className="mt-6 text-sm text-soft-brown/70">
          Made with love
        </p>
      </div>
    </footer>
  );
}
