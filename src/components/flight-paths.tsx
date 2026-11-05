"use client";

import { useEffect, useState } from "react";
import { useMap } from "@/context/map-context";
import * as turf from "@turf/turf";
import { flightKey, getFlightsForYear } from "@/lib/flights-by-year";
import { isMapStyleReady } from "@/lib/mapbox/style-ready";

type ViewMode = "gallery" | "scratch-map" | "flights";

type FlightPathsProps = {
  viewMode: ViewMode;
  selectedYear: string;
  hoveredKey: string | null;
  selectedKey: string | null;
  onHoverChange: (key: string | null) => void;
};

export default function FlightPaths({
  viewMode,
  selectedYear,
  hoveredKey,
  selectedKey,
  onHoverChange,
}: FlightPathsProps) {
  const { map } = useMap();
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    routes: { origin: string; destination: string; count: number; keys: string[] }[];
    x: number;
    y: number;
  }>({
    show: false,
    routes: [],
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (!map || viewMode !== "flights") {
      if (isMapStyleReady(map)) {
        try {
          const handlers = (map as any)._flightPathHandlers;
          if (handlers) {
            map.off("mousemove", "flight-paths-hover", handlers.pathMousemove);
            map.off(
              "mouseleave",
              "flight-paths-hover",
              handlers.pathMouseleave,
            );
            delete (map as any)._flightPathHandlers;
          }
          for (const id of [
            "flight-paths-hover",
            "flight-paths-highlight",
            "flight-paths",
            "flight-path-points",
          ]) {
            if (map.getLayer(id)) map.removeLayer(id);
          }
          for (const id of ["flight-paths", "flight-path-points"]) {
            if (map.getSource(id)) map.removeSource(id);
          }
        } catch (e) {
          console.warn("Error removing flight paths:", e);
        }
      }
      return;
    }

    const removeFlightPaths = () => {
      if (!isMapStyleReady(map)) return;
      try {
        const handlers = (map as any)._flightPathHandlers;
        if (handlers) {
          map.off("mousemove", "flight-paths-hover", handlers.pathMousemove);
          map.off("mouseleave", "flight-paths-hover", handlers.pathMouseleave);
          delete (map as any)._flightPathHandlers;
        }
        for (const id of [
          "flight-paths-hover",
          "flight-paths-highlight",
          "flight-paths",
          "flight-path-points",
        ]) {
          if (map.getLayer(id)) map.removeLayer(id);
        }
        for (const id of ["flight-paths", "flight-path-points"]) {
          if (map.getSource(id)) map.removeSource(id);
        }
      } catch (e) {
        console.warn("Error removing flight paths:", e);
      }
    };

    const addFlightPaths = () => {
      if (!isMapStyleReady(map)) return;

      try {
        removeFlightPaths();

        const yearFlights = getFlightsForYear(selectedYear);

        const features = yearFlights.map((path) => {
          const distance = turf.distance(path.origin, path.destination, {
            units: "kilometers",
          });
          const steps = Math.max(32, Math.floor(distance / 80));
          const line = turf.greatCircle(
            turf.point(path.origin),
            turf.point(path.destination),
            { npoints: steps },
          );

          return {
            type: "Feature" as const,
            properties: {
              origin: path.originName,
              destination: path.destinationName,
              upcoming: path.upcoming || false,
              key: flightKey(path),
            },
            geometry: line.geometry,
          };
        });

        const pointFeatures: GeoJSON.Feature[] = [];
        for (const path of yearFlights) {
          pointFeatures.push(
            {
              type: "Feature",
              properties: {
                type: "origin",
                name: path.originName,
                upcoming: path.upcoming || false,
              },
              geometry: { type: "Point", coordinates: path.origin },
            },
            {
              type: "Feature",
              properties: {
                type: "destination",
                name: path.destinationName,
                upcoming: path.upcoming || false,
              },
              geometry: { type: "Point", coordinates: path.destination },
            },
          );
        }

        map.addSource("flight-paths", {
          type: "geojson",
          data: { type: "FeatureCollection", features },
        });
        map.addSource("flight-path-points", {
          type: "geojson",
          data: { type: "FeatureCollection", features: pointFeatures },
        });

        map.addLayer({
          id: "flight-paths-hover",
          type: "line",
          source: "flight-paths",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "transparent",
            "line-width": 18,
            "line-opacity": 0,
          },
        });

        map.addLayer({
          id: "flight-paths",
          type: "line",
          source: "flight-paths",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": [
              "case",
              ["get", "upcoming"],
              "#f59e0b",
              "#3b82f6",
            ],
            "line-width": 3.2,
            "line-opacity": 0.85,
          },
        });

        map.addLayer({
          id: "flight-paths-highlight",
          type: "line",
          source: "flight-paths",
          layout: { "line-join": "round", "line-cap": "round" },
          filter: ["in", ["get", "key"], ["literal", []]],
          paint: {
            "line-color": "#ffffff",
            "line-width": 5,
            "line-opacity": 1,
          },
        });

        map.addLayer({
          id: "flight-path-points",
          type: "circle",
          source: "flight-path-points",
          paint: {
            "circle-radius": 4,
            "circle-color": [
              "case",
              ["get", "upcoming"],
              "#f59e0b",
              "#3b82f6",
            ],
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#ffffff",
            "circle-opacity": 0.9,
          },
        });

        const orderByKey = new Map<string, number>(
          yearFlights.map((p, i) => [flightKey(p), i]),
        );

        const handlePathMouseMove = (e: mapboxgl.MapLayerMouseEvent) => {
          if (!e.features || e.features.length === 0) return;

          // Group identical origin→destination legs (flown many times)
          // into a single tooltip row with a count.
          const groups = new Map<
            string,
            {
              origin: string;
              destination: string;
              count: number;
              keys: string[];
              order: number;
            }
          >();

          for (const feature of e.features) {
            const key = (feature.properties?.key as string) || "";
            const origin = feature.properties?.origin || "Unknown";
            const destination = feature.properties?.destination || "Unknown";
            const routeId = `${origin}→${destination}`;
            const existing = groups.get(routeId);
            if (existing) {
              // Count unique flights only — Mapbox can return the same
              // feature more than once under the cursor.
              if (key && !existing.keys.includes(key)) {
                existing.keys.push(key);
                existing.count += 1;
              }
            } else {
              groups.set(routeId, {
                origin,
                destination,
                count: 1,
                keys: key ? [key] : [],
                order: orderByKey.get(key) ?? Infinity,
              });
            }
          }

          const routes = Array.from(groups.values()).sort(
            (a, b) => a.order - b.order,
          );

          const canvasRect = map.getCanvasContainer().getBoundingClientRect();
          setTooltip({
            show: true,
            routes,
            x: e.point.x + canvasRect.left,
            y: e.point.y + canvasRect.top,
          });

          onHoverChange(routes[0]?.keys[0] || null);
          map.getCanvas().style.cursor = "pointer";
        };

        const handlePathMouseLeave = () => {
          setTooltip({ show: false, routes: [], x: 0, y: 0 });
          onHoverChange(null);
          map.getCanvas().style.cursor = "";
        };

        map.on("mousemove", "flight-paths-hover", handlePathMouseMove);
        map.on("mouseleave", "flight-paths-hover", handlePathMouseLeave);
        (map as any)._flightPathHandlers = {
          pathMousemove: handlePathMouseMove,
          pathMouseleave: handlePathMouseLeave,
        };
      } catch (e) {
        console.warn("Error adding flight paths:", e);
      }
    };

    addFlightPaths();
    map.on("style.load", addFlightPaths);

    return () => {
      map.off("style.load", addFlightPaths);
      removeFlightPaths();
      setTooltip({ show: false, routes: [], x: 0, y: 0 });
    };
  }, [map, viewMode, selectedYear, onHoverChange]);

  useEffect(() => {
    if (!isMapStyleReady(map) || viewMode !== "flights") return;
    const keys = [selectedKey, hoveredKey].filter(Boolean) as string[];
    try {
      if (map.getLayer("flight-paths-highlight")) {
        map.setFilter("flight-paths-highlight", [
          "in",
          ["get", "key"],
          ["literal", keys],
        ]);
      }
    } catch (e) {
      console.warn("Error updating flight highlight:", e);
    }
  }, [map, viewMode, selectedYear, hoveredKey, selectedKey]);

  useEffect(() => {
    if (!isMapStyleReady(map) || viewMode !== "flights" || !selectedKey) return;
    const yearFlights = getFlightsForYear(selectedYear);
    const flight = yearFlights.find((f) => flightKey(f) === selectedKey);
    if (!flight) return;

    const sw: [number, number] = [
      Math.min(flight.origin[0], flight.destination[0]),
      Math.min(flight.origin[1], flight.destination[1]),
    ];
    const ne: [number, number] = [
      Math.max(flight.origin[0], flight.destination[0]),
      Math.max(flight.origin[1], flight.destination[1]),
    ];

    try {
      map.fitBounds([sw, ne], {
        padding: { top: 120, bottom: 120, left: 120, right: 360 },
        maxZoom: 5,
        duration: 1400,
      });
    } catch (e) {
      console.warn("Error flying to flight:", e);
    }
  }, [map, viewMode, selectedYear, selectedKey]);

  return (
    <>
      {tooltip.show && tooltip.routes.length > 0 && (
        <div
          className="pointer-events-none fixed z-2000 rounded-md bg-black/80 px-3 py-1.5 text-sm text-white shadow-lg flex flex-col gap-0.5"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y - 10}px`,
            transform: "translateY(-100%)",
          }}
        >
          {tooltip.routes.map((route) => (
            <div
              key={`${route.origin}-${route.destination}`}
              className="flex items-baseline gap-2 uppercase"
              style={{ fontFamily: "var(--font-space-mono), monospace" }}
            >
              <span>
                {route.origin}
                <span className="mx-1.5 text-white/40">→</span>
                {route.destination}
              </span>
              {route.count > 1 && (
                <span className="text-[11px] tracking-[0.08em] text-white/45 normal-case">
                  ×{route.count}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
