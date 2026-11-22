"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { mapLocations as seedMapLocations } from "@/data/map-locations";
import type { MapLocation } from "@/lib/types";
import { fetchMapLocations } from "@/lib/api";
import {
  MapPin,
  Calendar,
  Compass,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";
import type * as maplibreglType from "maplibre-gl";
import { useLanguage } from "@/context/LanguageContext";
import { translations, mapLocationsTelugu } from "@/data/translations";

export default function MemoryMap() {
  const { language, isTelugu } = useLanguage();
  const t = translations[language].map;

  const [locations, setLocations] = useState<MapLocation[]>(seedMapLocations);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation>(seedMapLocations[0]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [is3D, setIs3D] = useState(true);
  const is3DRef = useRef(true);
  const locationsRef = useRef<MapLocation[]>(seedMapLocations);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibreglType.Map | null>(null);
  const markersRef = useRef<Record<string, maplibreglType.Marker>>({});
  const maplibreModuleRef = useRef<typeof maplibreglType | null>(null);

  const sliderRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const handleSelectLocationRef = useRef<(loc: MapLocation) => void>(() => {});

  // Bilingual text helpers
  const getLocName = useCallback(
    (loc: MapLocation) => {
      if (isTelugu) return loc.nameTe || mapLocationsTelugu[loc.id]?.name || loc.name;
      return loc.name;
    },
    [isTelugu]
  );

  const getLocCategory = useCallback(
    (loc: MapLocation) => {
      if (isTelugu) return mapLocationsTelugu[loc.id]?.category || loc.category;
      return loc.category;
    },
    [isTelugu]
  );

  const getLocStory = useCallback(
    (loc: MapLocation) => {
      if (isTelugu) return loc.storyTe || mapLocationsTelugu[loc.id]?.story || loc.story;
      return loc.story;
    },
    [isTelugu]
  );

  // Helper to build Apple Maps POI Pin element
  const createMarkerElement = useCallback((loc: MapLocation, isSelected: boolean) => {
    const el = document.createElement("div");
    el.className = "custom-maplibre-marker";
    el.style.cursor = "pointer";

    const locName = getLocName(loc);
    const locCategory = getLocCategory(loc);
    const pinnedText = isTelugu ? "గుర్తించబడింది" : "Pinned";

    if (isSelected) {
      el.innerHTML = `
        <div class="apple-callout-anim" style="
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          filter: drop-shadow(0 10px 22px rgba(0,0,0,0.22));
          transform-origin: bottom center;
        ">
          <!-- Apple Maps POI Photo Callout -->
          <div style="
            width: 184px;
            background: rgba(255, 255, 255, 0.98);
            border-radius: 14px;
            border: 2px solid #D49A32;
            outline: 1.5px solid rgba(153, 31, 43, 0.45);
            overflow: hidden;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(212, 154, 50, 0.2);
          ">
            <!-- Small Image Popup -->
            <div style="
              width: 100%;
              height: 86px;
              background: #f4ede4;
              position: relative;
              overflow: hidden;
            ">
              <img
                src="${loc.image}"
                alt="${locName}"
                style="
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                  display: block;
                "
                onerror="this.src='/Golden South Indian Mandap Setting.png';"
              />
              <div style="
                position: absolute;
                top: 6px;
                right: 6px;
                background: rgba(0,0,0,0.6);
                backdrop-filter: blur(4px);
                color: #ffffff;
                font-size: 9px;
                font-weight: 700;
                padding: 2px 6px;
                border-radius: 8px;
                letter-spacing: 0.5px;
              ">${loc.year}</div>
            </div>

            <!-- Details Area -->
            <div style="padding: 7px 9px 8px; text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="
                font-weight: 700;
                font-size: 11.5px;
                color: #1c1c1e;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                line-height: 1.25;
              ">${locName}</div>
              <div style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 3px;
                font-size: 9.5px;
              ">
                <span style="
                  font-weight: 700;
                  color: #991F2B;
                  text-transform: capitalize;
                ">📍 ${locCategory.replace("-", " ")}</span>
                <span style="color: #8e8e93; font-size: 8.5px;">${pinnedText}</span>
              </div>
            </div>
          </div>

          <!-- Callout Beak Triangle -->
          <div style="
            width: 0;
            height: 0;
            border-left: 7px solid transparent;
            border-right: 7px solid transparent;
            border-top: 8px solid rgba(255, 255, 255, 0.98);
            margin-top: -1px;
          "></div>

          <!-- Apple Maps POI Pin Glyph -->
          <div style="
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: linear-gradient(135deg, #991F2B, #6D141E);
            border: 2.5px solid #ffffff;
            box-shadow: 0 4px 14px rgba(153, 31, 43, 0.55), 0 0 0 3px rgba(212, 154, 50, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 17px;
            margin-top: 2px;
          ">
            ${loc.icon || "📍"}
          </div>
        </div>
      `;
    } else {
      el.innerHTML = `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #D49A32;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          cursor: pointer;
          transition: transform 0.2s ease;
        ">
          ${loc.icon || "📍"}
        </div>
      `;
    }

    return el;
  }, [isTelugu]);

  // Update all map markers to reflect current selection
  const refreshMarkers = useCallback(
    (activeLoc: MapLocation) => {
      const maplibregl = maplibreModuleRef.current;
      const map = mapInstanceRef.current;
      if (!maplibregl || !map) return;

      // Remove existing markers
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};

      // Create updated markers from latest locations
      locationsRef.current.forEach((loc) => {
        const isSelected = loc.id === activeLoc.id;
        const el = createMarkerElement(loc, isSelected);

        el.addEventListener("click", () => {
          handleSelectLocationRef.current(loc);
        });

        const marker = new maplibregl.Marker({
          element: el,
          anchor: isSelected ? "bottom" : "center",
        })
          .setLngLat([loc.lng, loc.lat])
          .addTo(map);

        markersRef.current[loc.id] = marker;
      });
    },
    [createMarkerElement]
  );

  // Keep locationsRef in sync with state
  useEffect(() => {
    locationsRef.current = locations;
  }, [locations]);

  // Fetch dynamic map locations from API
  useEffect(() => {
    let mounted = true;
    fetchMapLocations().then((res) => {
      if (mounted && res.success && res.locations.length > 0) {
        setLocations(res.locations);
        locationsRef.current = res.locations;
        if (mapInstanceRef.current && isMapLoaded) {
          refreshMarkers(res.locations[0]);
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, [isMapLoaded, refreshMarkers]);

  // Handle selecting a destination card or pin
  const handleSelectLocation = useCallback(
    (loc: MapLocation) => {
      setSelectedLocation(loc);

      const current3D = is3DRef.current;

      // Smoothly fly camera to pinned destination with close-up zoom (level 13)
      if (mapInstanceRef.current) {
        const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
        mapInstanceRef.current.flyTo({
          center: [loc.lng, loc.lat],
          offset: [0, isMobile ? -42 : -32],
          zoom: 13,
          pitch: current3D ? (isMobile ? 45 : 55) : 0,
          bearing: current3D ? (isMobile ? -10 : -20) : 0,
          duration: 1200,
          essential: true,
        });
      }

      // Update markers to bloom selected photo callout
      refreshMarkers(loc);

      // Scroll horizontal slider to the selected card WITHOUT scrolling the window/page
      const cardEl = cardRefs.current[loc.id];
      const slider = sliderRef.current;
      if (cardEl && slider) {
        const targetLeft =
          cardEl.offsetLeft - slider.clientWidth / 2 + cardEl.clientWidth / 2;
        slider.scrollTo({
          left: Math.max(0, targetLeft),
          behavior: "smooth",
        });
      }
    },
    [refreshMarkers]
  );

  // Initialize MapLibre GL with OpenFreeMap vector styles
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let isSubscribed = true;

    import("maplibre-gl").then((maplibregl) => {
      if (!isSubscribed || !mapContainerRef.current) return;

      maplibreModuleRef.current = maplibregl;

      // Explicitly set local worker URL so browser loads the MapLibre Web Worker without errors
      if (typeof maplibregl.setWorkerUrl === "function") {
        maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");
      }

      // OpenFreeMap Bright vector style URL (100% free, no API keys)
      const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
      const initialLoc = locationsRef.current[0] || seedMapLocations[0];
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: "https://tiles.openfreemap.org/styles/bright",
        center: [initialLoc.lng, initialLoc.lat],
        zoom: 13,
        pitch: isMobile ? 45 : 55,
        bearing: isMobile ? -10 : -20,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      map.on("load", () => {
        if (!isSubscribed) return;
        setIsMapLoaded(true);
        refreshMarkers(initialLoc);
        if (sliderRef.current) {
          sliderRef.current.scrollLeft = 0;
        }
      });
    });

    return () => {
      isSubscribed = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [refreshMarkers]);

  // Keep handleSelectLocationRef updated
  useEffect(() => {
    handleSelectLocationRef.current = handleSelectLocation;
  }, [handleSelectLocation]);

  // Toggle 3D Bird's-Eye Perspective View
  const toggle3D = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const nextState = !is3D;
    setIs3D(nextState);
    is3DRef.current = nextState;

    map.easeTo({
      pitch: nextState ? 58 : 0,
      bearing: nextState ? -20 : 0,
      duration: 1000,
    });
  };

  // Handle previous/next navigation
  const handleNavigate = (direction: "prev" | "next") => {
    const currentLocs = locationsRef.current;
    const currentIndex = currentLocs.findIndex((l) => l.id === selectedLocation.id);
    let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= currentLocs.length) newIndex = 0;
    if (newIndex < 0) newIndex = currentLocs.length - 1;
    handleSelectLocation(currentLocs[newIndex]);
  };

  // Apple Maps Controls Actions
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn({ duration: 300 });
  };
  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut({ duration: 300 });
  };
  const handleResetOverview = () => {
    setIs3D(false);
    is3DRef.current = false;
    mapInstanceRef.current?.flyTo({
      center: [78.9629, 20.5937],
      zoom: 4.8,
      pitch: 0,
      bearing: 0,
      duration: 1400,
      essential: true,
    });
  };

  const currentIndex = locations.findIndex((l) => l.id === selectedLocation.id);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-black/10 bg-warm-white shadow-2xl">
      {/* ─── 1. MapLibre GL + OpenFreeMap Canvas ─── */}
      <div className="relative h-[550px] w-full sm:h-[620px] md:h-[670px]">
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        {/* Loading Overlay */}
        {!isMapLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-champagne/40 backdrop-blur-xs text-soft-brown">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warm-white shadow-md animate-bounce">
              <MapPin className="h-8 w-8 text-burgundy" />
            </div>
            <p className="mt-4 font-heading text-xl font-semibold text-charcoal">
              Loading OpenFreeMap Vector Tiles...
            </p>
            <p className="mt-1 text-xs text-soft-brown">Connecting to OpenFreeMap Bright style</p>
          </div>
        )}

        {/* ─── 2. Floating Top Controls: Sleek, Unobtrusive & Responsive ─── */}
        <div className="pointer-events-none absolute top-2.5 sm:top-4 left-2.5 sm:left-4 right-2.5 sm:right-4 z-10 flex items-start justify-between gap-2">
          {/* Left: Mobile compact pill (sm:hidden) */}
          <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-gold/40 bg-white/95 px-2.5 py-1 shadow-md backdrop-blur-md sm:hidden">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
              <MapPin className="h-2.5 w-2.5" />
            </div>
            <span className="text-[10px] font-bold text-burgundy">
              {currentIndex >= 0 ? currentIndex + 1 : 1}/{locations.length}
            </span>
            <span className="text-[10px] font-semibold text-charcoal truncate max-w-[110px]">
              {getLocName(selectedLocation)}
            </span>
          </div>

          {/* Left: Desktop Apple Search-Style POI Indicator (hidden sm:flex) */}
          <div className="pointer-events-auto hidden sm:flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-3.5 py-2.5 shadow-xl backdrop-blur-xl transition-all">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-burgundy/10 text-burgundy shadow-xs">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-burgundy">
                  {isTelugu
                    ? `గమ్యస్థానం ${currentIndex >= 0 ? currentIndex + 1 : 1} / ${locations.length}`
                    : `Destination ${currentIndex >= 0 ? currentIndex + 1 : 1} of ${locations.length}`}
                </span>
                {is3D && (
                  <span className="rounded-full bg-burgundy/15 px-1.5 py-0.2 text-[8.5px] font-black text-burgundy tracking-wider uppercase">
                    3D
                  </span>
                )}
              </div>
              <span className="max-w-[130px] xs:max-w-[180px] sm:max-w-[240px] truncate text-xs sm:text-sm font-semibold text-charcoal">
                {getLocName(selectedLocation)}
              </span>
            </div>
          </div>

          {/* Right: Mobile Horizontal Mini-Controls (sm:hidden) */}
          <div className="pointer-events-auto flex items-center rounded-full border border-gold/40 bg-white/95 p-0.5 shadow-md backdrop-blur-md sm:hidden">
            <button
              type="button"
              onClick={toggle3D}
              aria-label={is3D ? "Switch to 2D view" : "Switch to 3D perspective"}
              title={is3D ? "Switch to 2D view" : "Switch to 3D perspective"}
              className={`flex h-7 px-2 items-center justify-center rounded-full font-bold text-[10px] transition-all cursor-pointer ${
                is3D ? "bg-burgundy text-white shadow-2xs font-extrabold" : "text-charcoal hover:bg-black/5"
              }`}
            >
              {is3D ? "2D" : "3D"}
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Zoom in"
              className="flex h-7 w-7 items-center justify-center text-charcoal hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Zoom out"
              className="flex h-7 w-7 items-center justify-center text-charcoal hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetOverview}
              aria-label="Reset overview"
              title={t.allIndiaView || "All India View"}
              className="flex h-7 w-7 items-center justify-center text-burgundy hover:bg-burgundy/10 active:bg-burgundy/20 transition-colors cursor-pointer"
            >
              <Compass className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Right: Desktop Vertical Tool Stack (hidden sm:flex) */}
          <div className="pointer-events-auto hidden sm:flex flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-xl backdrop-blur-xl">
            {/* 3D / 2D Perspective Toggle Button */}
            <button
              type="button"
              onClick={toggle3D}
              aria-label={is3D ? (isTelugu ? "2D వీక్షణకి మార్చండి" : "Switch to 2D view") : (isTelugu ? "3D వీక్షణకి మార్చండి" : "Switch to 3D perspective")}
              title={is3D ? (isTelugu ? "2D వీక్షణ" : "Switch to 2D view") : (isTelugu ? "3D వీక్షణ" : "Switch to 3D perspective")}
              className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center border-b border-black/10 font-black text-[11px] sm:text-xs tracking-wider transition-all cursor-pointer ${
                is3D
                  ? "bg-burgundy text-white shadow-inner font-extrabold"
                  : "text-charcoal hover:bg-black/5 active:bg-black/10"
              }`}
            >
              <span>{is3D ? "2D" : "3D"}</span>
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Zoom in"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center text-charcoal hover:bg-black/5 active:bg-black/10 transition-colors border-b border-black/5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Zoom out"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center text-charcoal hover:bg-black/5 active:bg-black/10 transition-colors border-b border-black/5 cursor-pointer"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleResetOverview}
              aria-label="Reset overview"
              title={t.allIndiaView || "All India View"}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center text-burgundy hover:bg-burgundy/10 active:bg-burgundy/20 transition-colors cursor-pointer"
            >
              <Compass className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ─── 3. Floating Bottom Glass Slider (Snapchat & Apple Style) ─── */}
        <div className="pointer-events-none absolute bottom-3 sm:bottom-5 left-0 right-0 z-10 px-2 sm:px-6">
          <div className="relative mx-auto max-w-5xl">
            {/* Mobile Navigation Header Bar (Buttons + Dots) */}
            <div className="pointer-events-auto mb-2 flex items-center justify-between rounded-full border border-white/60 bg-white/85 px-3 py-1 shadow-md backdrop-blur-md sm:hidden">
              <button
                type="button"
                onClick={() => handleNavigate("prev")}
                className="flex items-center gap-1 text-[11px] font-bold text-burgundy active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>{t.prev}</span>
              </button>

              <div className="flex items-center gap-1.5">
                {locations.map((loc, idx) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleSelectLocation(loc)}
                    aria-label={`Go to ${loc.name}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentIndex
                        ? "w-4 bg-burgundy"
                        : "w-1.5 bg-warm-beige hover:bg-gold"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleNavigate("next")}
                className="flex items-center gap-1 text-[11px] font-bold text-burgundy active:scale-95 cursor-pointer"
              >
                <span>{t.next}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Left Chevron Button (Desktop only, avoiding mobile card overlap) */}
            <button
              type="button"
              onClick={() => handleNavigate("prev")}
              aria-label="Previous destination"
              title={t.prev}
              className="pointer-events-auto hidden sm:flex absolute -left-3 md:-left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full border border-gold/40 bg-white/95 text-burgundy shadow-xl backdrop-blur-md transition-all hover:bg-white hover:scale-105 active:scale-90 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Right Chevron Button (Desktop only, avoiding mobile card overlap) */}
            <button
              type="button"
              onClick={() => handleNavigate("next")}
              aria-label="Next destination"
              title={t.next}
              className="pointer-events-auto hidden sm:flex absolute -right-3 md:-right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full border border-gold/40 bg-white/95 text-burgundy shadow-xl backdrop-blur-md transition-all hover:bg-white hover:scale-105 active:scale-90 cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Slideable Cards Container (Calculated padding ensures Card 1 and all cards center in mobile view) */}
            <div
              ref={sliderRef}
              className="pointer-events-auto flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 px-[calc(50%-135px)] sm:px-4 scroll-smooth"
            >
              {locations.map((loc) => {
                const isSelected = loc.id === selectedLocation.id;
                const cardLocName = getLocName(loc);
                const cardLocCategory = getLocCategory(loc);
                const cardLocStory = getLocStory(loc);

                return (
                  <div
                    key={loc.id}
                    ref={(el) => {
                      cardRefs.current[loc.id] = el;
                    }}
                    onClick={() => handleSelectLocation(loc)}
                    className={`shrink-0 snap-center w-[270px] sm:w-[320px] md:w-[340px] cursor-pointer rounded-2xl p-3 sm:p-3.5 transition-all duration-300 ${
                      isSelected
                        ? "border-2 border-burgundy bg-white shadow-2xl ring-2 ring-gold/80 outline outline-2 outline-gold/50 scale-[1.02] backdrop-blur-2xl"
                        : "border-2 border-warm-beige/90 bg-white/95 shadow-md ring-1 ring-gold/25 hover:border-gold/80 hover:ring-gold/40 opacity-95 hover:opacity-100"
                    }`}
                  >
                    {/* Top Row: Thumbnail + Title + Pill */}
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-champagne shadow-xs border border-warm-beige/80">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={loc.image}
                          alt={cardLocName}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "/Golden South Indian Mandap Setting.png";
                          }}
                        />
                        <span className="absolute bottom-0 right-0 rounded-tl-md bg-white/90 px-1 text-[9px] leading-tight shadow-xs">
                          {loc.icon}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="truncate font-heading text-xs sm:text-sm font-bold text-charcoal">
                            {cardLocName}
                          </h4>
                          {isSelected && (
                            <span className="flex shrink-0 items-center gap-1 rounded-full bg-burgundy/10 px-1.5 py-0.5 text-[8.5px] font-bold text-burgundy">
                              <span className="h-1.5 w-1.5 rounded-full bg-burgundy animate-ping" />
                              {isTelugu ? "వీక్షించండి" : "View"}
                            </span>
                          )}
                        </div>

                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold text-soft-brown">
                          <span className="flex items-center gap-0.5">
                            <Calendar className="h-2.5 w-2.5 text-gold" />
                            {loc.year}
                          </span>
                          <span>•</span>
                          <span className="capitalize text-gold font-medium truncate">
                            {cardLocCategory.replace("-", " ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Story Snippet */}
                    <p className="mt-2 line-clamp-2 text-left font-body text-[11px] leading-relaxed text-charcoal/80">
                      {cardLocStory}
                    </p>

                    {/* Card Footer with Quick Navigation Hint */}
                    <div className="mt-2 flex items-center justify-between border-t border-black/5 pt-1.5 text-[10px] text-soft-brown">
                      <span className="flex items-center gap-1 text-gold font-medium">
                        <Sparkles className="h-2.5 w-2.5 text-gold" />
                        <span>{t.tapToZoom || "Tap to zoom in (Level 13)"}</span>
                      </span>
                      <span className="font-mono text-[9px] text-soft-brown/60">
                        {loc.lat.toFixed(2)}°, {loc.lng.toFixed(2)}°
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* OpenFreeMap Attribution */}
            <div className="mt-1 flex justify-end">
              <span className="rounded-md bg-white/60 px-2 py-0.5 text-[9px] text-stone-500 backdrop-blur-xs">
                Map data © <a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-burgundy">OpenFreeMap</a> & <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline hover:text-burgundy">OpenStreetMap</a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
