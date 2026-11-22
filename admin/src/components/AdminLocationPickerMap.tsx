"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type * as maplibreglType from "maplibre-gl";
import { Search, MapPin, Loader2, Compass, Plus, Minus, X, Check } from "lucide-react";

interface SearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type?: string;
}

interface AdminLocationPickerMapProps {
  lat?: number | null;
  lng?: number | null;
  icon?: string;
  onChange: (lat: number, lng: number, suggestedName?: string) => void;
}

const CITY_PRESETS = [
  { name: "Vizag (RK Beach)", lat: 17.7142, lng: 83.3235 },
  { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { name: "Goa (Calangute)", lat: 15.5439, lng: 73.7553 },
  { name: "Ooty", lat: 11.4102, lng: 76.695 },
  { name: "Tirupati", lat: 13.6288, lng: 79.4192 },
  { name: "Araku Valley", lat: 18.3273, lng: 82.8775 },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
];

export default function AdminLocationPickerMap({
  lat,
  lng,
  icon = "📍",
  onChange,
}: AdminLocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibreglType.Map | null>(null);
  const markerRef = useRef<maplibreglType.Marker | null>(null);
  const maplibreModuleRef = useRef<typeof maplibreglType | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState("");
  const [isMapReady, setIsMapReady] = useState(false);

  // Default coordinate if none provided (Visakhapatnam)
  const defaultLat = typeof lat === "number" && !isNaN(lat) ? lat : 17.7231;
  const defaultLng = typeof lng === "number" && !isNaN(lng) ? lng : 83.3189;

  // Helper to create or update the marker element
  const createMarkerElement = useCallback(
    (emojiIcon: string) => {
      const el = document.createElement("div");
      el.className = "admin-map-pin-wrapper";
      el.style.display = "flex";
      el.style.flexDirection = "column";
      el.style.alignItems = "center";
      el.style.cursor = "grab";
      el.style.filter = "drop-shadow(0 6px 12px rgba(109, 18, 27, 0.4))";

      el.innerHTML = `
        <div style="
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #FFF9F2 0%, #F5E6D3 100%);
          border: 2.5px solid #C68A2C;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.9);
          transform: translateY(-2px);
          transition: transform 0.15s ease;
        ">
          ${emojiIcon || "📍"}
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid #C68A2C;
          margin-top: -1px;
        "></div>
      `;
      return el;
    },
    []
  );

  // Initialize MapLibre
  useEffect(() => {
    let isCancelled = false;

    if (!mapContainerRef.current || mapInstanceRef.current) return;

    import("maplibre-gl")
      .then((maplibregl) => {
        if (isCancelled || !mapContainerRef.current) return;

        maplibreModuleRef.current = maplibregl;
        if (typeof maplibregl.setWorkerUrl === "function") {
          maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");
        }

        const map = new maplibregl.Map({
          container: mapContainerRef.current,
          style: "https://tiles.openfreemap.org/styles/bright",
          center: [defaultLng, defaultLat],
          zoom: typeof lat === "number" && !isNaN(lat) ? 12 : 6,
          attributionControl: false,
        });

        map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

        // Create draggable marker
        const markerEl = createMarkerElement(icon);
        const marker = new maplibregl.Marker({
          element: markerEl,
          draggable: true,
          anchor: "bottom",
        })
          .setLngLat([defaultLng, defaultLat])
          .addTo(map);

        markerRef.current = marker;

        // When marker is dragged
        marker.on("dragend", () => {
          const pos = marker.getLngLat();
          onChange(
            parseFloat(pos.lat.toFixed(6)),
            parseFloat(pos.lng.toFixed(6))
          );
        });

        // When user clicks anywhere on the map
        map.on("click", (e) => {
          const { lng: clickLng, lat: clickLat } = e.lngLat;
          const roundedLat = parseFloat(clickLat.toFixed(6));
          const roundedLng = parseFloat(clickLng.toFixed(6));

          marker.setLngLat([roundedLng, roundedLat]);
          map.easeTo({ center: [roundedLng, roundedLat], duration: 400 });

          onChange(roundedLat, roundedLng);
        });

        map.on("load", () => {
          if (!isCancelled) {
            setIsMapReady(true);
            map.resize();
          }
        });

        mapInstanceRef.current = map;
      })
      .catch((err) => {
        console.error("Failed to load map in admin:", err);
      });

    return () => {
      isCancelled = true;
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Sync marker position when lat/lng change externally
  useEffect(() => {
    if (!markerRef.current || !mapInstanceRef.current) return;
    if (typeof lat !== "number" || isNaN(lat) || typeof lng !== "number" || isNaN(lng)) return;

    const currentPos = markerRef.current.getLngLat();
    if (
      Math.abs(currentPos.lat - lat) > 0.00001 ||
      Math.abs(currentPos.lng - lng) > 0.00001
    ) {
      markerRef.current.setLngLat([lng, lat]);
      mapInstanceRef.current.easeTo({ center: [lng, lat], duration: 500 });
    }
  }, [lat, lng]);

  // Handle Search using OpenStreetMap Nominatim
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setIsSearching(true);
    setSearchError("");
    setSearchResults([]);

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q
      )}&limit=5&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          "Accept-Language": "en",
        },
      });

      if (!res.ok) throw new Error("Search service unavailable");

      const data: SearchResult[] = await res.json();
      if (!data || data.length === 0) {
        setSearchError(`No locations found for "${q}". Try another landmark or city.`);
      } else {
        setSearchResults(data);
      }
    } catch (err: any) {
      setSearchError(err?.message || "Search failed. Check connection.");
    } finally {
      setIsSearching(false);
    }
  };

  // Select Search Result
  const handleSelectResult = (item: SearchResult) => {
    const itemLat = parseFloat(parseFloat(item.lat).toFixed(6));
    const itemLng = parseFloat(parseFloat(item.lon).toFixed(6));

    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLngLat([itemLng, itemLat]);
      mapInstanceRef.current.flyTo({
        center: [itemLng, itemLat],
        zoom: 13,
        duration: 1200,
      });
    }

    // Extract cleaner short title for the location
    const parts = item.display_name.split(",");
    const suggestedTitle = parts.length > 0 ? parts[0].trim() : item.name;

    onChange(itemLat, itemLng, suggestedTitle);
    setSearchResults([]);
    setSearchQuery(suggestedTitle || "");
  };

  // Jump to City Preset
  const handleSelectPreset = (preset: { name: string; lat: number; lng: number }) => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLngLat([preset.lng, preset.lat]);
      mapInstanceRef.current.flyTo({
        center: [preset.lng, preset.lat],
        zoom: 12,
        duration: 1000,
      });
    }
    onChange(preset.lat, preset.lng, preset.name);
    setSearchResults([]);
  };

  return (
    <div className="space-y-2.5">
      {/* Search Bar */}
      <div className="relative">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-soft-brown/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search place, city, or landmark (e.g. Tenneti Park, Charminar, Goa)..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-warm-beige bg-white text-xs sm:text-sm text-charcoal placeholder:text-soft-brown/50 focus:border-burgundy focus:outline-hidden shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setSearchError("");
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-champagne/40 text-soft-brown/60"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-3.5 py-2 rounded-xl bg-burgundy hover:bg-burgundy/90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 disabled:opacity-50"
          >
            {isSearching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5" />
            )}
            <span>Search</span>
          </button>
        </form>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl bg-white border border-gold/40 shadow-xl p-1 space-y-1 divide-y divide-warm-beige/30">
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-soft-brown/70 flex justify-between items-center">
              <span>Select location to place pin</span>
              <button
                type="button"
                onClick={() => setSearchResults([])}
                className="hover:text-charcoal"
              >
                Close ✕
              </button>
            </div>
            {searchResults.map((result) => {
              const parts = result.display_name.split(",");
              const mainName = parts[0]?.trim();
              const context = parts.slice(1, 4).join(",").trim();

              return (
                <button
                  key={result.place_id}
                  type="button"
                  onClick={() => handleSelectResult(result)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-champagne/40 flex items-start gap-2.5 transition-colors group cursor-pointer"
                >
                  <MapPin className="h-4 w-4 text-burgundy shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-charcoal truncate">{mainName}</p>
                    <p className="text-[11px] text-soft-brown/80 truncate">{context}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {searchError && (
          <p className="text-[11px] text-rose-600 mt-1 px-1 font-medium">{searchError}</p>
        )}
      </div>

      {/* 1-Click Quick City Presets */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-soft-brown shrink-0 mr-1">
          Quick Cities:
        </span>
        {CITY_PRESETS.map((city) => (
          <button
            key={city.name}
            type="button"
            onClick={() => handleSelectPreset(city)}
            className="text-[11px] px-2 py-0.5 rounded-lg border border-warm-beige/80 bg-white/80 hover:bg-champagne/50 hover:border-burgundy/60 text-charcoal font-medium transition-colors shadow-2xs"
          >
            {city.name}
          </button>
        ))}
      </div>

      {/* Interactive Map Container */}
      <div className="relative w-full h-[280px] sm:h-[310px] rounded-2xl border-2 border-[#C68A2C]/40 overflow-hidden shadow-inner bg-[#F5E6D3]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Map Overlay Badge: Current Pin Coordinates */}
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gold/40 shadow-md flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-[11px]">
            <span className="font-bold text-[#6D121B]">📍 Pin:</span>{" "}
            <span className="font-mono text-charcoal font-medium">
              {typeof lat === "number" && !isNaN(lat) ? lat.toFixed(6) : "None"},{" "}
              {typeof lng === "number" && !isNaN(lng) ? lng.toFixed(6) : "None"}
            </span>
          </div>
        </div>

        {/* Bottom Tip Badge */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 pointer-events-none flex justify-center">
          <div className="bg-charcoal/85 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] sm:text-[11px] font-medium shadow-md flex items-center gap-1.5">
            <span>💡</span>
            <span>Click anywhere on the map or drag the pin to set the location</span>
          </div>
        </div>
      </div>
    </div>
  );
}
