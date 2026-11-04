"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Our Story", href: "#story" },
  { label: "Gallery", href: "#gallery" },
  { label: "Glass Jar", href: "#glass-jar" },
  { label: "Then & Now", href: "#then-now" },
  { label: "Messages", href: "#messages" },
  { label: "Trivia", href: "#trivia" },
  { label: "Map", href: "#map" },
  { label: "Dedication", href: "#dedication" },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
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
      window.location.href = "/" + href;
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-warm-white/90 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between sm:h-20">
            {/* Brand */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-2"
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-colors duration-300",
                  isScrolled ? "text-burgundy" : "text-gold"
                )}
                fill="currentColor"
              />
              <span
                className={cn(
                  "font-heading text-xl font-semibold tracking-tight transition-colors duration-300 sm:text-2xl",
                  isScrolled ? "text-charcoal" : "text-charcoal"
                )}
              >
                25 Years of Us
              </span>
            </a>

            {/* Desktop Nav Links */}
            <div className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 hover:bg-champagne/60",
                    isScrolled
                      ? "text-soft-brown hover:text-charcoal"
                      : "text-soft-brown hover:text-charcoal"
                  )}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-champagne/60 md:hidden"
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            >
              {isMobileOpen ? (
                <X className="h-5 w-5 text-charcoal" />
              ) : (
                <Menu className="h-5 w-5 text-charcoal" />
              )}
            </button>
          </div>
        </div>

        {/* Gold accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isScrolled ? 1 : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="h-[1px] origin-left bg-gold/40"
        />
      </motion.nav>

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
              className="fixed inset-0 z-40 bg-charcoal/30 backdrop-blur-sm md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-warm-white shadow-2xl md:hidden"
            >
              <div className="flex h-full flex-col">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-warm-beige/50 px-6 py-5">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-burgundy" fill="currentColor" />
                    <span className="font-heading text-lg font-semibold text-charcoal">
                      Menu
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-champagne/60"
                    aria-label="Close menu"
                  >
                    <X className="h-4 w-4 text-charcoal" />
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
                        className="block w-full rounded-xl px-4 py-3 text-left font-medium text-soft-brown transition-all hover:bg-champagne/40 hover:text-charcoal"
                      >
                        {link.label}
                      </motion.button>
                    ))}
                  </div>
                </nav>

                {/* Drawer Footer */}
                <div className="border-t border-warm-beige/50 px-6 py-4">
                  <p className="text-center text-xs text-soft-brown/60">
                    1999 — 2024
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
