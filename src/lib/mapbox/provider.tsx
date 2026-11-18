"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapContext } from "@/context/map-context";
import { MAP_WORLDVIEW } from "@/lib/mapbox/worldview";

type MapProviderProps = {
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  initialViewState: {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch?: number;
  };
  children?: React.ReactNode;
};

export default function MapProvider({
  mapContainerRef,
  initialViewState,
  children,
}: MapProviderProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setSetupError(
        "Add NEXT_PUBLIC_MAPBOX_TOKEN to .env. Copy .env.example to start.",
      );
      return;
    }

    const styleId = process.env.NEXT_PUBLIC_MAPBOX_STYLE_ID;
    if (!styleId) {
      setSetupError(
        "Add NEXT_PUBLIC_MAPBOX_STYLE_ID to .env. Copy .env.example to start.",
      );
      return;
    }

    mapboxgl.accessToken = token;

    const narrow = mapContainerRef.current.clientWidth < 768;
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: styleId,
      center: narrow
        ? [initialViewState.longitude, 28]
        : [initialViewState.longitude, initialViewState.latitude],
      zoom: narrow ? 2.5 : initialViewState.zoom,
      pitch: narrow ? 0 : (initialViewState.pitch ?? 0),
      minZoom: 2.5,
      attributionControl: false,
      logoPosition: "bottom-right",
      projection: "globe",
      worldview: MAP_WORLDVIEW,
      language: "en",
    });

    mapRef.current = mapInstance;
    setMap(mapInstance);

    mapInstance.on("load", () => {
      setLoaded(true);
    });

    return () => {
      if (mapInstance) {
        mapInstance.remove();
        mapRef.current = null;
        setMap(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapContainerRef]);

  return (
    <MapContext.Provider value={{ map }}>
      {children}
      {setupError ? (
        <div className="absolute inset-0 z-1000 flex items-center justify-center bg-background/80 p-6">
          <p className="max-w-sm text-center text-sm text-foreground">
            {setupError}
          </p>
        </div>
      ) : (
        !loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-1000">
            <div className="text-lg font-medium">Loading map...</div>
          </div>
        )
      )}
    </MapContext.Provider>
  );
}
