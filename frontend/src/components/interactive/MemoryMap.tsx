"use client";

import { useEffect, useState } from "react";
import { mapLocations } from "@/data/map-locations";
import type { MapLocation } from "@/lib/types";
import { MapPin, Calendar, Heart } from "lucide-react";

// Dynamic Leaflet import handling to guarantee clean client-only execution
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
    children: React.ReactNode;
  }>;
  Popup: React.ComponentType<{
    children: React.ReactNode;
  }>;
  createCustomIcon: (emoji: string) => unknown;
}

export default function MemoryMap() {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation>(mapLocations[0]);
  const [leafletBundle, setLeafletBundle] = useState<LeafletBundle | null>(null);

  useEffect(() => {
    // Dynamically import Leaflet and react-leaflet on client
    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
    ]).then(([reactLeaflet, L]) => {
      // Create custom divIcon for pins
      const createCustomIcon = (emoji: string) =>
        L.divIcon({
          className: "custom-map-marker",
          html: `<div style="
            background: #FAF7F2;
            border: 2px solid #C9A96E;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            cursor: pointer;
          ">${emoji}</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -20],
        });

      setLeafletBundle({
        MapContainer: reactLeaflet.MapContainer as unknown as LeafletBundle["MapContainer"],
        TileLayer: reactLeaflet.TileLayer as unknown as LeafletBundle["TileLayer"],
        Marker: reactLeaflet.Marker as unknown as LeafletBundle["Marker"],
        Popup: reactLeaflet.Popup as unknown as LeafletBundle["Popup"],
        createCustomIcon,
      });
    });
  }, []);

  if (!leafletBundle) {
    return (
      <div className="flex aspect-16/9 w-full flex-col items-center justify-center rounded-3xl border border-warm-beige bg-champagne/20 text-soft-brown">
        <MapPin className="mb-2 h-8 w-8 animate-bounce text-gold" />
        <p className="font-heading text-lg">Loading Memory Map...</p>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, createCustomIcon } = leafletBundle;

  return (
    <div className="space-y-8">
      {/* Interactive Leaflet Map View */}
      <div className="relative z-0 overflow-hidden rounded-3xl border-2 border-warm-beige bg-champagne/20 shadow-xl">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          scrollWheelZoom={false}
          className="aspect-16/9 w-full min-h-[420px] sm:min-h-[500px]"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mapLocations.map((loc) => (
            <Marker
              key={loc.id}
              position={[loc.lat, loc.lng]}
              icon={createCustomIcon(loc.icon || "📍")}
              eventHandlers={{
                click: () => setSelectedLocation(loc),
              }}
            >
              <Popup>
                <div className="p-1 text-center font-sans">
                  <span className="text-xl">{loc.icon}</span>
                  <h4 className="mt-1 font-bold text-burgundy">{loc.name}</h4>
                  <p className="text-xs text-stone-600">Year {loc.year}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Selected Location Feature Card */}
      {selectedLocation && (
        <div className="overflow-hidden rounded-3xl border-2 border-gold/40 bg-warm-white p-6 shadow-md transition-all sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-warm-beige/60 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedLocation.icon || "📍"}</span>
              <div>
                <h3 className="font-heading text-2xl font-semibold text-charcoal sm:text-3xl">
                  {selectedLocation.name}
                </h3>
                <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-gold uppercase tracking-wider">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Year {selectedLocation.year}</span>
                </div>
              </div>
            </div>

            <span className="rounded-full bg-champagne/70 px-4 py-1 text-xs font-medium text-soft-brown capitalize">
              {selectedLocation.category.replace("-", " ")}
            </span>
          </div>

          <p className="mt-5 font-body text-base leading-relaxed text-charcoal/90 sm:text-lg">
            {selectedLocation.story}
          </p>

          <div className="mt-6 flex items-center gap-2 text-xs text-soft-brown">
            <Heart className="h-3.5 w-3.5 fill-gold text-gold" />
            <span>Click any marker on the map to explore its memory</span>
          </div>
        </div>
      )}
    </div>
  );
}
