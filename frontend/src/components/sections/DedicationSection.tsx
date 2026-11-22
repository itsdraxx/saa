"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "motion/react";
import {
  Calendar,
  MapPin,
  Sparkles,
  Heart,
  Mail,
  ChevronDown,
  ChevronUp,
  Share2,
  ExternalLink,
  Clock,
  UtensilsCrossed,
} from "lucide-react";
import ConfettiCelebration from "@/components/ui/ConfettiCelebration";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/data/translations";

export default function DedicationSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  // 1 to 25 count-up animation state
  const [currentYear, setCurrentYear] = useState<number>(1);
  const [isCountingFinished, setIsCountingFinished] = useState<boolean>(false);
  const [showAutoConfetti, setShowAutoConfetti] = useState<boolean>(false);
  const [showTributeLetter, setShowTributeLetter] = useState<boolean>(false);
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  const { language, isTelugu } = useLanguage();
  const t = translations[language].dedication;
  const inv = translations[language].invitation;

  // Exact Google Maps location link provided by the user
  const googleMapsUrl = "https://maps.app.goo.gl/BrbYy6BHYddDxY6m7";

  // Google Calendar invitation link prefilled for 27 Dec 2026
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    isTelugu
      ? "ఆది & సత్య 25వ వివాహ రజతోత్సవ సంబరం"
      : "Adhi & Satya - 25th Silver Wedding Jubilee Celebration"
  )}&dates=20261227T183000/20261227T233000&details=${encodeURIComponent(
    isTelugu
      ? "రండి అందరం కలిసి సందడి చేద్దాం... ఆది & సత్య 25 వసంతాల అద్భుత దాంపత్య వేడుకను ఘనంగా జరుపుకుందాం! Kranthi Convention Hall, విశాఖపట్నం (వైజాగ్)\n\nGoogle Maps: " +
          googleMapsUrl
      : "Let's all party and celebrate Adhi & Satya's 25 years of togetherness at Kranthi Convention Hall, Visakhapatnam (Vizag)! 🎉🥂\n\nGoogle Maps: " +
          googleMapsUrl
  )}&location=${encodeURIComponent("Kranthi Convention Hall, Visakhapatnam (Vizag), " + googleMapsUrl)}`;

  // Cinematic 1 to 25 count-up: slow at start, accelerating in the middle, dramatic finish on 25
  useEffect(() => {
    if (!isInView || isCountingFinished) return;

    let year = 1;
    let timer: NodeJS.Timeout;

    const tick = () => {
      if (year >= 25) {
        setCurrentYear(25);
        setIsCountingFinished(true);
        setShowAutoConfetti(true);
        return;
      }

      year += 1;
      setCurrentYear(year);

      // Timing curve: Slow -> Fast -> Suspense deceleration at 22..24 -> 25
      let delay = 180;
      if (year <= 4) {
        delay = 240 - year * 20; // 220ms, 200ms, 180ms
      } else if (year <= 10) {
        delay = 140 - (year - 4) * 12; // 128ms down to 68ms
      } else if (year <= 21) {
        delay = 42; // very fast ticking through 11..21
      } else if (year <= 24) {
        delay = 110 + (year - 21) * 35; // suspense deceleration at 22, 23, 24
      } else {
        delay = 260;
      }

      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, 350);

    return () => clearTimeout(timer);
  }, [isInView, isCountingFinished]);

  const handleSkipToInvitation = () => {
    setCurrentYear(25);
    setIsCountingFinished(true);
    setShowAutoConfetti(true);
  };

  const handleShareInvite = async () => {
    const text = isTelugu
      ? `🎉 ఆది & సత్య 25 ఏళ్ల వివాహ రజతోత్సవ మహోత్సవం! 🥂✨\n\nతేదీ: 27 డిసెంబర్ 2026 (ఆదివారం సాయంత్రం)\nవేదిక: Krathi Convention Hall\n\nరండి అందరం కలిసి సందడి చేద్దాం... వారి 25 వసంతాల అద్భుత దాంపత్యాన్ని ఘనంగా జరుపుకుందాం!\n\nమ్యాప్ దారి: ${googleMapsUrl}`
      : `🎉 Adhi & Satya - 25th Silver Wedding Jubilee Celebration! 🥂✨\n\nDate: 27th December 2026 (Sunday Evening)\nVenue: Krathi Convention Hall\n\n"25 Years Celebrations Are on Hold... Just Wait! Let's all party and celebrate their 25 years of togetherness!"\n\nGoogle Maps Location: ${googleMapsUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Adhi & Satya 25th Silver Jubilee Celebration Invitation",
          text,
          url: googleMapsUrl,
        });
        return;
      } catch {
        // User dismissed share dialog
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
    } catch {}
  };

  return (
    <section
      id="dedication"
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#FAF4ED] py-20 sm:py-32 px-3 sm:px-6 lg:px-8 text-center"
    >
      {/* =========================================================
          ATMOSPHERIC MANDAP BACKDROP (SUBTLE WATERMARK)
          ========================================================= */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-25">
        <Image
          src="/images/art/golden_mandap_bg.png"
          alt="South Indian Mandap Backdrop"
          fill
          priority={false}
          className="object-cover object-center filter blur-[1px] scale-105"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF4ED]/80 via-[#FAF4ED]/50 to-[#FAF4ED] pointer-events-none" />
      </div>

      {/* Floating Golden Radial Orbs */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
        <div className="h-[650px] w-[650px] rounded-full bg-peach-300/40 blur-3xl animate-pulse" />
      </div>

      {/* Auto Confetti Cannon upon reaching 25 */}
      <ConfettiCelebration autoFire={showAutoConfetti} showButton={false} />

      <div className="relative z-10 mx-auto max-w-4xl">
        <AnimatePresence mode="wait">
          {!isCountingFinished ? (
            // =========================================================
            // PHASE 1: THE ACCELERATING 1 TO 25 COUNTER EXPERIENCE
            // =========================================================
            <motion.div
              key="counter"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="py-12 flex flex-col items-center justify-center"
            >
              {/* Pulsing Auspicious Kalash / Heart with Golden Halo */}
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-2 border-gold/70 bg-warm-white text-burgundy shadow-[0_10px_35px_rgba(196,87,67,0.3)] mb-6"
              >
                <Heart className="h-8 w-8 sm:h-10 sm:w-10 fill-burgundy text-burgundy" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-gold" />
                </span>
              </motion.div>

              {/* Sacred Inscription */}
              <p className="font-heading text-xs sm:text-sm font-semibold tracking-widest text-burgundy/80 uppercase mb-2">
                {inv.auspiciousShloka}
              </p>

              {/* Counting Progress Title */}
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-warm-white/95 px-5 py-1.5 shadow-sm mb-8">
                <Sparkles className="h-4 w-4 text-gold animate-spin" />
                <span className="text-xs sm:text-sm font-bold text-soft-brown">
                  {inv.countingTitle}
                </span>
                <Sparkles className="h-4 w-4 text-gold animate-spin" />
              </div>

              {/* Giant Glowing Celestial Number Dial */}
              <div
                onClick={handleSkipToInvitation}
                className="relative flex items-center justify-center w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-warm-white via-peach-50 to-champagne/90 border-4 border-gold shadow-[0_20px_60px_rgba(153,31,43,0.25)] cursor-pointer group hover:scale-105 transition-transform"
                title="Tap to reveal invitation immediately"
              >
                {/* Outer SVG Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="44%"
                    fill="none"
                    stroke="#F4E2C7"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="44%"
                    fill="none"
                    stroke="#991F2B"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={720}
                    strokeDashoffset={720 - (720 * currentYear) / 25}
                    className="transition-all duration-150 ease-out"
                  />
                </svg>

                {/* Decorative Inner Ring with Dashes */}
                <div className="absolute inset-4 rounded-full border border-dashed border-gold/40 pointer-events-none animate-[spin_40s_linear_infinite]" />

                <div className="flex flex-col items-center">
                  <span className="font-heading text-6xl sm:text-8xl font-black text-burgundy tracking-tighter drop-shadow-sm tabular-nums">
                    {currentYear}
                  </span>
                  <span className="font-sans text-[11px] sm:text-xs font-extrabold tracking-[0.25em] text-gold uppercase mt-1">
                    {isTelugu ? "వసంతాలు • YEARS" : "GOLDEN YEARS"}
                  </span>
                </div>
              </div>

              {/* Tap to skip button */}
              <button
                onClick={handleSkipToInvitation}
                className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-warm-beige bg-warm-white/80 px-4 py-1.5 text-xs font-semibold text-burgundy hover:bg-warm-white shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <span>{inv.skipToInvitation}</span>
                <span className="text-gold font-bold">➔</span>
              </button>
            </motion.div>
          ) : (
            // =========================================================
            // PHASE 2: THE ROYAL HANDCRAFTED SILVER JUBILEE INVITATION CARD
            // =========================================================
            <motion.div
              key="invitation"
              initial={{ opacity: 0, scale: 0.93, y: 35 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, type: "spring", bounce: 0.2 }}
              className="relative mx-auto max-w-3xl rounded-3xl sm:rounded-[32px] border-4 border-double border-gold/80 bg-gradient-to-b from-[#FFFDF9] via-[#FAF3EC] to-[#FFFDF9] p-5 sm:p-9 md:p-12 shadow-[0_30px_90px_rgba(122,20,30,0.25)] overflow-hidden text-center"
            >
              {/* Royal Temple Zari Top Header Bar */}
              <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-gold via-burgundy via-gold to-burgundy" />

              {/* Traditional Floral Corner Flourishes */}
              <div className="absolute top-3 left-3 sm:top-5 sm:left-5 text-gold text-lg sm:text-xl select-none font-serif">
                ❦
              </div>
              <div className="absolute top-3 right-3 sm:top-5 sm:right-5 text-gold text-lg sm:text-xl select-none font-serif">
                ❦
              </div>
              <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 text-gold text-lg sm:text-xl select-none font-serif">
                ❦
              </div>
              <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 text-gold text-lg sm:text-xl select-none font-serif">
                ❦
              </div>

              {/* Auspicious Sacred Shloka Invocation */}
              <div className="pt-2 mb-3">
                <p className="font-heading text-xs sm:text-sm font-semibold tracking-widest text-burgundy/90 uppercase">
                  {inv.auspiciousShloka}
                </p>
                <div className="mt-1 flex items-center justify-center gap-2 text-gold">
                  <span className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-gold" />
                  <span className="text-xs">✦</span>
                  <span className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-gold" />
                </div>
              </div>

              {/* =========================================================
                  THE WELCOMING COUPLE ARCH: ADHI & SATYA (NAMASKARAM)
                  ========================================================= */}
              <div className="relative mx-auto my-3 sm:my-4 max-w-sm sm:max-w-md">
                {/* Mandap Silhouette Arch Frame */}
                <div className="relative rounded-t-full border-2 border-gold/70 bg-gradient-to-b from-champagne/80 via-peach-50/60 to-transparent p-3 pt-6 sm:pt-8 shadow-inner overflow-hidden">
                  <div className="absolute top-2 inset-x-0 flex justify-center">
                    <span className="text-xs sm:text-sm text-gold tracking-widest font-serif">
                      ❖ WELCOMING OUR LOVED ONES ❖
                    </span>
                  </div>

                  {/* Couple welcoming in traditional silk attire */}
                  <div className="relative mx-auto w-full h-48 sm:h-56 md:h-64 flex items-end justify-center">
                    <Image
                      src="/images/art/couple_sittinga_and_welcoming.png"
                      alt="Adhi & Satya Welcoming"
                      width={1536}
                      height={1024}
                      priority
                      className="h-full w-auto object-contain drop-shadow-[0_10px_20px_rgba(70,10,15,0.35)]"
                    />
                  </div>
                </div>

                {/* 3D Royal Wax Seal / Jubilee Medallion Overlay */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full wax-seal text-warm-white text-sm sm:text-base font-bold shadow-xl border-2 border-gold/80 select-none z-10">
                  XXV
                </div>
              </div>

              {/* Save The Date Eyebrow Badge */}
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-peach-100/90 border border-gold/60 px-4 py-1 text-[11px] sm:text-xs font-extrabold text-burgundy uppercase tracking-widest shadow-2xs">
                <Sparkles className="h-3 w-3 text-gold" />
                <span>{inv.badge}</span>
                <Sparkles className="h-3 w-3 text-gold" />
              </div>

              {/* Dramatic Teaser Hook */}
              <h2 className="mt-4 font-heading text-2xl sm:text-4xl md:text-5xl font-extrabold text-burgundy tracking-tight leading-snug sm:leading-tight">
                {inv.heading}
              </h2>

              {/* Couple's Names in Calligraphy Gold */}
              <div className="mt-2">
                <p className="font-cursive text-4xl sm:text-5xl md:text-6xl text-gold drop-shadow-xs">
                  {inv.coupleTitle}
                </p>
                <p className="text-xs sm:text-sm font-bold text-soft-brown uppercase tracking-widest mt-1">
                  {inv.coupleSubtitle}
                </p>
              </div>

              {/* Cordial Family Greeting */}
              <p className="mt-3 mx-auto max-w-xl text-xs sm:text-sm text-charcoal/80 font-medium leading-relaxed italic">
                &ldquo;{inv.welcomingGuests}&rdquo;
              </p>

              {/* =========================================================
                  ROYAL SILK BANNER: THE PARTY PROCLAMATION
                  ========================================================= */}
              <div className="relative my-6 mx-auto max-w-2xl">
                <div className="relative rounded-2xl border-2 border-gold/70 bg-gradient-to-r from-burgundy via-deep-burgundy to-burgundy text-warm-white p-4 sm:p-5 shadow-lg overflow-hidden">
                  {/* Subtle Shimmer highlight */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                  <p className="font-heading text-base sm:text-2xl font-bold tracking-wide leading-snug drop-shadow-sm text-peach-100">
                    &ldquo;{inv.partyCall}&rdquo;
                  </p>
                </div>
              </div>

              {/* =========================================================
                  EVENT DETAILS: DATE & KRATHI CONVENTION HALL
                  Handcrafted wedding card style with gold zari frames
                  ========================================================= */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 my-6 text-left">
                {/* 1. Auspicious Date Panel */}
                <div className="relative rounded-2xl border-2 border-gold/50 bg-warm-white/95 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-peach-500 to-burgundy text-warm-white shadow-xs">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-burgundy block">
                        {inv.dateLabel}
                      </span>
                      <h4 className="font-heading text-lg sm:text-xl font-bold text-charcoal leading-snug">
                        {inv.dateValue}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-soft-brown font-medium">
                        <Clock className="h-3 w-3 text-gold shrink-0" />
                        <span>{inv.timeValue}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-charcoal/75 font-medium">
                        <UtensilsCrossed className="h-3 w-3 text-peach-500 shrink-0" />
                        <span>{inv.dinnerCelebration}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Venue Panel with Direct Maps Callout */}
                <div className="relative rounded-2xl border-2 border-gold/50 bg-warm-white/95 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-amber-600 text-warm-white shadow-xs">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold block">
                        {inv.venueLabel}
                      </span>
                      <h4 className="font-heading text-lg sm:text-xl font-bold text-charcoal leading-snug">
                        {inv.venueValue}
                      </h4>
                      <p className="text-[11px] font-medium text-charcoal/80 mt-0.5">
                        {inv.venueSubtext}
                      </p>
                      {/* One-click direct Google Maps link */}
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-burgundy hover:text-deep-burgundy underline decoration-gold underline-offset-2 mt-2 cursor-pointer"
                      >
                        <span>{inv.getDirections}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* =========================================================
                  INTERACTIVE ACTIONS: MAPS, CALENDAR, SHARE & CELEBRATE
                  ========================================================= */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                {/* 1. PRIMARY GOLD CTA: Open in Google Maps */}
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-gold bg-gradient-to-r from-amber-500 via-gold to-amber-600 px-6 py-3 text-xs sm:text-sm font-bold text-warm-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <MapPin className="h-4 w-4 text-warm-white" />
                  <span>{inv.getDirections}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                {/* 2. Add to Google Calendar */}
                <a
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-gold/70 bg-warm-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-charcoal hover:text-burgundy hover:border-burgundy shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Calendar className="h-4 w-4 text-burgundy" />
                  <span>{inv.addToCalendar}</span>
                </a>

                {/* 3. Share Invite Button */}
                <button
                  type="button"
                  onClick={handleShareInvite}
                  className="inline-flex items-center gap-2 rounded-full border border-warm-beige bg-champagne/60 px-5 py-2.5 text-xs sm:text-sm font-semibold text-charcoal hover:bg-champagne/90 transition-all active:scale-95 cursor-pointer"
                >
                  <Share2 className="h-4 w-4 text-soft-brown" />
                  <span>
                    {hasCopied
                      ? isTelugu
                        ? "లింక్ కాపీ చేయబడింది! ✓"
                        : "Invite Copied! ✓"
                      : isTelugu
                      ? "ఆహ్వానం షేర్ చేయండి"
                      : "Share Invite"}
                  </span>
                </button>

                {/* 4. Celebrate with Confetti Cannon */}
                <ConfettiCelebration
                  buttonLabel={inv.showerConfetti}
                  className="px-6 py-2.5 text-xs sm:text-sm"
                />
              </div>

              {/* =========================================================
                  FAMILY DEDICATION TRIBUTE LETTER ACCORDION
                  ========================================================= */}
              <div className="mt-9 pt-6 border-t border-warm-beige/80">
                <button
                  type="button"
                  onClick={() => setShowTributeLetter(!showTributeLetter)}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-burgundy hover:text-deep-burgundy transition-colors cursor-pointer py-1"
                >
                  <Mail className="h-4 w-4 text-gold" />
                  <span>{showTributeLetter ? inv.hideTribute : inv.tributeTitle}</span>
                  {showTributeLetter ? (
                    <ChevronUp className="h-3.5 w-3.5 text-gold" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-gold" />
                  )}
                </button>

                <AnimatePresence>
                  {showTributeLetter && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                      className="overflow-hidden mt-4 text-left"
                    >
                      <div className="parchment-sheet rounded-2xl p-6 sm:p-8 border border-warm-beige/90 shadow-inner">
                        <p className="font-heading text-base sm:text-xl font-normal leading-relaxed text-charcoal">
                          &ldquo;{t.letterP1}&rdquo;
                        </p>
                        <p className="mt-4 font-body text-xs sm:text-sm leading-relaxed text-soft-brown">
                          {t.letterP2}
                        </p>
                        <div className="mt-6 pt-4 border-t border-warm-beige/60 text-center">
                          <p className="font-cursive text-2xl sm:text-3xl text-burgundy">
                            {isTelugu
                              ? "రజతోత్సవ శుభాకాంక్షలు, ఆది & సత్య"
                              : "Happy 25th Silver Anniversary, Adhi & Satya"}
                          </p>
                          <p className="text-[11px] font-bold text-soft-brown/80 uppercase tracking-widest mt-1">
                            {t.yourFamily || "Your Family ❤️"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
