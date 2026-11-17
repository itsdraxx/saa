"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Our Story", href: "#story" },
  { label: "Gallery", href: "#gallery" },
  { label: "Glass Jar", href: "#glass-jar" },
  { label: "Then & Now", href: "#then-now" },
  { label: "Trivia", href: "#trivia" },
  { label: "Memory Map", href: "#map" },
  { label: "Wishes", href: "#wishes" },
  { label: "Dedication", href: "#dedication" },
];

export default function Navigation() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 40);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const handleNavClick = (href: string) => {
    setIsMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/" + href);
    }
  };

  return (
    <>
      {/* =========================================================
          FLOATING BUBBLE / GLASS PILL NAVBAR
          Centered, rounded-full, with white/beige glass effect
          ========================================================= */}
      <div className="fixed top-3 sm:top-5 inset-x-0 z-50 flex justify-center px-2 sm:px-4 pointer-events-none">
        <motion.nav
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn(
            "pointer-events-auto flex items-center justify-between rounded-full border px-4 py-2 sm:px-6 sm:py-2.5 transition-all duration-300",
            isScrolled
              ? "bg-warm-white/95 shadow-[0_12px_36px_rgba(122,20,30,0.14)] border-warm-beige"
              : "bg-warm-white/90 backdrop-blur-md border-warm-beige/90 shadow-[0_10px_30px_rgba(122,20,30,0.08)]",
            "hover:border-gold/50 hover:shadow-[0_12px_36px_rgba(122,20,30,0.18)] hover:bg-warm-white/95",
            "w-full max-w-6xl"
          )}
        >
          {/* Brand */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-peach-100 text-burgundy shadow-2xs transition-transform duration-300 group-hover:scale-115 group-hover:bg-peach-200 group-hover:rotate-6">
              <Heart className="h-4 w-4 fill-burgundy text-burgundy transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="font-heading text-lg sm:text-xl font-bold tracking-tight text-burgundy transition-colors duration-300 group-hover:text-deep-burgundy">
              Bujji & Satya
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div
            className="hidden items-center gap-1 lg:flex"
            onMouseLeave={() => setHoveredLink(null)}
          >
            {navLinks.map((link) => {
              const isHovered = hoveredLink === link.href;

              return (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  onMouseEnter={() => setHoveredLink(link.href)}
                  className="relative rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-soft-brown transition-colors duration-200 hover:text-burgundy cursor-pointer"
                >
                  {/* Floating Pill Hover Highlight */}
                  {isHovered && (
                    <motion.span
                      layoutId="nav-pill-hover"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-peach-100 via-champagne to-peach-100 border border-gold/30 shadow-xs"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  )}

                  <span className="relative z-10 transition-transform duration-200 inline-block hover:scale-105">
                    {link.label}
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => {
                const el = document.getElementById("dedication");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-burgundy to-deep-burgundy px-4 py-1.5 text-xs font-semibold tracking-wide text-warm-white shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_4px_16px_rgba(153,31,43,0.35)] active:scale-95 cursor-pointer group"
            >
              <span>For Bujji & Satya</span>
              <Heart className="h-3 w-3 fill-warm-white transition-transform duration-300 group-hover:scale-125" />
            </button>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-burgundy hover:bg-champagne/80 hover:scale-110 active:scale-95 transition-all lg:hidden cursor-pointer"
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          >
            {isMobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </motion.nav>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-warm-white shadow-2xl lg:hidden"
            >
              <div className="flex h-full flex-col">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-warm-beige/50 px-6 py-5">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-burgundy fill-burgundy" />
                    <span className="font-heading text-lg font-bold text-burgundy">
                      Bujji & Satya
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-burgundy hover:bg-champagne/60 cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Drawer Links */}
                <nav className="flex-1 px-4 py-6">
                  <div className="space-y-1">
                    {navLinks.map((link, index) => (
                      <motion.button
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        onClick={() => handleNavClick(link.href)}
                        className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-soft-brown transition-all hover:bg-champagne/50 hover:text-burgundy cursor-pointer"
                      >
                        {link.label}
                      </motion.button>
                    ))}
                  </div>
                </nav>

                {/* Drawer Footer */}
                <div className="border-t border-warm-beige/50 px-6 py-5 flex flex-col gap-3">
                  <button
                    onClick={() => handleNavClick("#dedication")}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-burgundy py-3 text-xs font-semibold tracking-wider text-warm-white uppercase shadow-sm active:scale-95 cursor-pointer"
                  >
                    <span>For Bujji & Satya</span>
                    <Heart className="h-3.5 w-3.5 fill-warm-white" />
                  </button>
                  <p className="text-center text-[11px] font-medium text-soft-brown/70">
                    Bujji Weds Satya • 25 Years of Love
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
