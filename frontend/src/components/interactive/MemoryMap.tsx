"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { mapLocations } from "@/data/map-locations";
import type { MapLocation } from "@/lib/types";
import {
  MapPin,
  Calendar,
  Compass,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface LeafletBundle {
  MapContainer: React.ComponentType<{
    center: [number, number];
    zoom: number;
    scrollWheelZoom: boolean;
    className: string;
    children: React.ReactNode;
  }>;
  TileLayer: React.ComponentType<{
    attribution: string;
    url: string;
  }>;
  Marker: React.ComponentType<{
    position: [number, number];
    icon: unknown;
    eventHandlers: { click: () => void };
    children?: React.ReactNode;
  }>;
  useMap: () => {
    flyTo: (latlng: [number, number], zoom: number, options?: object) => void;
  };
  createCustomIcon: (loc: MapLocation, isSelected: boolean) => unknown;
}

// Child component inside MapContainer to smoothly pan/fly when selection changes
function MapFlyController({
  target,
  useMapHook,
}: {
  target: [number, number, number] | null;
  useMapHook: LeafletBundle["useMap"];
}) {
  const map = useMapHook();

  useEffect(() => {
    if (target && map) {
      map.flyTo([target[0], target[1]], target[2], {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [target, map]);

  return null;
}

export default function MemoryMap() {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation>(mapLocations[0]);
  const [flyTarget, setFlyTarget] = useState<[number, number, number] | null>([
    mapLocations[0].lat,
    mapLocations[0].lng,
    8,
  ]);
  const [leafletBundle, setLeafletBundle] = useState<LeafletBundle | null>(null);

  const sliderRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    // Dynamically import Leaflet and react-leaflet on client
    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
    ]).then(([reactLeaflet, L]) => {
      // Create Snapchat-style story pin icon with emoji avatar
      const createCustomIcon = (loc: MapLocation, isSelected: boolean) =>
        L.divIcon({
          className: `custom-snap-marker ${isSelected ? "marker-active" : ""}`,
          html: `
            <div style="
              position: relative;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <div style="
                width: ${isSelected ? "46px" : "38px"};
                height: ${isSelected ? "46px" : "38px"};
                border-radius: 50%;
                background: ${isSelected ? "linear-gradient(135deg, #7A1C2E, #5C1523)" : "#FAF7F2"};
                border: ${isSelected ? "3px solid #C9A96E" : "2px solid #C9A96E"};
                box-shadow: ${
                  isSelected
                    ? "0 8px 24px rgba(122, 28, 46, 0.5), 0 0 0 4px rgba(201, 169, 110, 0.4)"
                    : "0 4px 12px rgba(0, 0, 0, 0.2)"
                };
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: ${isSelected ? "22px" : "18px"};
                transition: transform 0.25s ease;
                transform: ${isSelected ? "scale(1.1)" : "scale(1)"};
              ">
                ${loc.icon || "📍"}
              </div>
              ${
                isSelected
                  ? `<div style="
                      width: 0;
                      height: 0;
                      border-left: 6px solid transparent;
                      border-right: 6px solid transparent;
                      border-top: 8px solid #C9A96E;
                      margin-top: -1px;
                      filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
                    "></div>`
                  : ""
              }
            </div>
          `,
          iconSize: isSelected ? [46, 54] : [38, 38],
          iconAnchor: isSelected ? [23, 53] : [19, 19],
        });

      setLeafletBundle({
        MapContainer: reactLeaflet.MapContainer as unknown as LeafletBundle["MapContainer"],
        TileLayer: reactLeaflet.TileLayer as unknown as LeafletBundle["TileLayer"],
        Marker: reactLeaflet.Marker as unknown as LeafletBundle["Marker"],
        useMap: reactLeaflet.useMap as unknown as LeafletBundle["useMap"],
        createCustomIcon,
      });
    });
  }, []);

  // Handle selecting a destination card or pin
  const handleSelectLocation = useCallback((loc: MapLocation) => {
    setSelectedLocation(loc);
    setFlyTarget([loc.lat, loc.lng, 8]);

    // Scroll card in the in-map slider into view
    const cardEl = cardRefs.current[loc.id];
    if (cardEl && sliderRef.current) {
      cardEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, []);

  // Handle previous/next navigation
  const handleNavigate = (direction: "prev" | "next") => {
    const currentIndex = mapLocations.findIndex((l) => l.id === selectedLocation.id);
    let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= mapLocations.length) newIndex = 0;
    if (newIndex < 0) newIndex = mapLocations.length - 1;
    handleSelectLocation(mapLocations[newIndex]);
  };

  // Reset to nationwide view
  const handleResetOverview = () => {
    setFlyTarget([20.5937, 78.9629, 5]);
  };

  if (!leafletBundle) {
    return (
      <div className="flex h-[520px] w-full flex-col items-center justify-center rounded-3xl border-2 border-gold/40 bg-champagne/20 text-soft-brown shadow-xl sm:h-[600px]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warm-white shadow-md animate-bounce">
          <MapPin className="h-8 w-8 text-gold" />
        </div>
        <p className="mt-4 font-heading text-xl font-semibold text-charcoal">
          Loading The Memory Map...
        </p>
        <p className="mt-1 text-xs text-soft-brown">Gathering 25 years of destinations across India</p>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, useMap, createCustomIcon } = leafletBundle;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border-2 border-gold/40 bg-warm-white shadow-2xl">
      {/* ─── 1. Interactive Map Canvas ─── */}
      <div className="relative h-[520px] w-full sm:h-[600px] md:h-[650px]">
        <MapContainer
          center={[selectedLocation.lat, selectedLocation.lng]}
          zoom={8}
          scrollWheelZoom={false}
          className="h-full w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapFlyController target={flyTarget} useMapHook={useMap} />

          {mapLocations.map((loc) => {
            const isSelected = loc.id === selectedLocation.id;
            return (
              <Marker
                key={loc.id}
                position={[loc.lat, loc.lng]}
                icon={createCustomIcon(loc, isSelected)}
                eventHandlers={{
                  click: () => handleSelectLocation(loc),
                }}
              />
            );
          })}
        </MapContainer>

        {/* ─── 2. Floating Top Header Overlay (Snapchat Map Style) ─── */}
        <div className="pointer-events-none absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between">
          {/* Destination Badge */}
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/60 bg-warm-white/90 px-4 py-2 text-xs font-semibold text-charcoal shadow-lg backdrop-blur-md">
            <Compass className="h-4 w-4 text-burgundy" />
            <span>25-Year Journey Map</span>
            <span className="hidden sm:inline text-[11px] font-normal text-soft-brown">
              • {mapLocations.length} Destinations
            </span>
          </div>

          {/* Reset Overview Button */}
          <button
            type="button"
            onClick={handleResetOverview}
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-warm-white/90 px-3.5 py-2 text-xs font-semibold text-burgundy shadow-lg backdrop-blur-md transition-all hover:bg-warm-white hover:shadow-xl active:scale-95 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-gold" />
            <span className="hidden xs:inline">All India View</span>
          </button>
        </div>

        {/* ─── 3. Floating Bottom Glass Slider (Snapchat Snap Map Style) ─── */}
        <div className="pointer-events-none absolute bottom-4 sm:bottom-6 left-0 right-0 z-[1000] px-3 sm:px-6">
          <div className="relative mx-auto max-w-5xl">
            {/* Left Nav Arrow (Desktop) */}
            <button
              type="button"
              onClick={() => handleNavigate("prev")}
              aria-label="Previous destination"
              className="pointer-events-auto absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-warm-white/90 text-burgundy shadow-xl backdrop-blur-md transition-all hover:bg-warm-white hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Right Nav Arrow (Desktop) */}
            <button
              type="button"
              onClick={() => handleNavigate("next")}
              aria-label="Next destination"
              className="pointer-events-auto absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-warm-white/90 text-burgundy shadow-xl backdrop-blur-md transition-all hover:bg-warm-white hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Slideable Cards Container */}
            <div
              ref={sliderRef}
              className="pointer-events-auto flex gap-3.5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 px-1 scroll-smooth"
            >
              {mapLocations.map((loc) => {
                const isSelected = loc.id === selectedLocation.id;
                return (
                  <div
                    key={loc.id}
                    ref={(el) => {
                      cardRefs.current[loc.id] = el;
                    }}
                    onClick={() => handleSelectLocation(loc)}
                    className={`shrink-0 snap-center w-[290px] sm:w-[330px] md:w-[350px] cursor-pointer rounded-2xl p-4 transition-all duration-300 ${
                      isSelected
                        ? "border-2 border-gold bg-warm-white/95 shadow-[0_12px_36px_rgba(122,28,46,0.3)] ring-2 ring-gold/50 scale-[1.02] backdrop-blur-xl"
                        : "border border-white/70 bg-warm-white/80 shadow-lg backdrop-blur-md hover:bg-warm-white/90 hover:border-gold/50 opacity-90 hover:opacity-100"
                    }`}
                  >
                    {/* Top Row: Icon avatar + Title + Badge */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl shadow-xs ring-2 transition-all ${
                          isSelected
                            ? "bg-champagne/90 ring-gold"
                            : "bg-champagne/60 ring-warm-beige"
                        }`}
                      >
                        {loc.icon || "📍"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="truncate font-heading text-sm sm:text-base font-semibold text-charcoal">
                            {loc.name}
                          </h4>
                          {isSelected && (
                            <span className="flex shrink-0 items-center gap-1 rounded-full bg-burgundy/10 px-2 py-0.5 text-[9px] font-bold text-burgundy">
                              <span className="h-1.5 w-1.5 rounded-full bg-burgundy animate-ping" />
                              Active
                            </span>
                          )}
                        </div>

                        <div className="mt-0.5 flex items-center gap-2 text-[11px] font-semibold text-soft-brown">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gold" />
                            {loc.year}
                          </span>
                          <span>•</span>
                          <span className="capitalize text-gold font-medium">
                            {loc.category.replace("-", " ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Story Snippet */}
                    <p className="mt-2.5 line-clamp-2 font-body text-xs leading-relaxed text-charcoal/80">
                      {loc.story}
                    </p>

                    {/* Card Footer */}
                    <div className="mt-2.5 flex items-center justify-between border-t border-warm-beige/40 pt-2 text-[10px] text-soft-brown">
                      <span className="flex items-center gap-1 text-gold font-medium">
                        <Sparkles className="h-3 w-3 text-gold" />
                        <span>Tap to view pin on map</span>
                      </span>
                      <span className="font-mono text-soft-brown/60">
                        {loc.lat.toFixed(2)}°, {loc.lng.toFixed(2)}°
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
