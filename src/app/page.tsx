"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import MapProvider from "@/lib/mapbox/provider";
import LocationMarkers from "@/components/location-markers";
import FlightPaths from "@/components/flight-paths";
import ScratchMapLayer from "@/components/scratch-map-layer";
import ScratchMapCounter from "@/components/scratch-map-counter";
import FlightList from "@/components/flight-list";
import FlightStatsPanel from "@/components/flight-stats";
import type { FlightPanel } from "@/components/flight-panel-switch";
import MapLabels from "@/components/map-labels";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plane, Map, Images, Gamepad2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ALL_YEARS, FLIGHT_YEARS } from "@/lib/flights-by-year";

type ViewMode = "gallery" | "scratch-map" | "flights";

function parseView(value: string | null): ViewMode {
  if (value === "flights" || value === "scratch-map" || value === "gallery") {
    return value;
  }
  return "gallery";
}

function parseYear(value: string | null): string {
  if (value && FLIGHT_YEARS.includes(value)) return value;
  return ALL_YEARS;
}

function parsePanel(value: string | null): FlightPanel {
  return value === "stats" ? "stats" : "list";
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <TravelMap />
    </Suspense>
  );
}

function TravelMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewMode = parseView(searchParams.get("view"));
  const selectedYear = parseYear(searchParams.get("year"));
  const flightPanel = parsePanel(searchParams.get("panel"));
  const flightQuery = searchParams.get("q") ?? "";
  const [hoveredFlightKey, setHoveredFlightKey] = useState<string | null>(null);
  const [selectedFlightKey, setSelectedFlightKey] = useState<string | null>(
    null,
  );

  const writeUrl = (
    view: ViewMode,
    year: string,
    panel: FlightPanel,
    query: string,
  ) => {
    const params = new URLSearchParams();
    if (view !== "gallery") params.set("view", view);
    if (year !== ALL_YEARS) params.set("year", year);
    if (panel === "stats") params.set("panel", panel);
    if (query.trim()) params.set("q", query);
    const next = params.toString();
    router.replace(next ? `/?${next}` : "/", { scroll: false });
  };

  const handleTabChange = (value: string) => {
    if (value === "game") {
      router.push("/game");
    } else {
      writeUrl(value as ViewMode, selectedYear, flightPanel, flightQuery);
    }
  };

  // Clear flight selection when leaving the flights tab or switching year
  useEffect(() => {
    setHoveredFlightKey(null);
    setSelectedFlightKey(null);
  }, [selectedYear, viewMode, flightQuery]);

  return (
    <div className="relative h-dvh w-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
        <div className="flex flex-wrap items-start justify-between gap-2 p-3 md:p-6">
          <div className="pointer-events-auto flex flex-wrap items-center gap-2">
            <Tabs
              value={viewMode}
              onValueChange={handleTabChange}
              className="w-auto"
            >
              <TabsList className="bg-black/40 backdrop-blur-sm border border-white/20">
                <TabsTrigger
                  value="gallery"
                  className="text-white/80 hover:text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
                >
                  <Images className=" h-4 w-4" />
                  <span className="sr-only md:not-sr-only">Gallery</span>
                </TabsTrigger>
                <TabsTrigger
                  value="scratch-map"
                  className="text-white/80 hover:text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
                >
                  <Map className="h-4 w-4" />
                  <span className="sr-only md:not-sr-only">Scratch Map</span>
                </TabsTrigger>
                <TabsTrigger
                  value="flights"
                  className="text-white/80 hover:text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
                >
                  <Plane className="h-4 w-4" />
                  <span className="sr-only md:not-sr-only">Flights</span>
                </TabsTrigger>
                <TabsTrigger
                  value="game"
                  className="text-white/80 hover:text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
                >
                  <Gamepad2 className="h-4 w-4" />
                  <span className="sr-only md:not-sr-only">Game</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {viewMode === "flights" && (
              <Select
                value={selectedYear}
                onValueChange={(year) =>
                  writeUrl(viewMode, year, flightPanel, flightQuery)
                }
              >
                <SelectTrigger className="h-9! w-[7.5rem] bg-black/40! backdrop-blur-sm border-white/20! text-white/80 hover:text-white data-placeholder:text-white/80 px-2 py-1 [&_svg]:text-white/80 md:w-[130px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="bg-black/40 backdrop-blur-sm border border-white/20">
                  <SelectItem
                    value={ALL_YEARS}
                    className="text-white/80 hover:text-white hover:bg-white/20 focus:bg-white/20"
                  >
                    All years
                  </SelectItem>
                  {FLIGHT_YEARS.map((year) => (
                    <SelectItem
                      key={year}
                      value={year}
                      className="text-white/80 hover:text-white hover:bg-white/20 focus:bg-white/20"
                    >
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <ScratchMapCounter active={viewMode === "scratch-map"} />
        </div>
      </div>

      <FlightList
        active={viewMode === "flights" && flightPanel === "list"}
        panel={flightPanel}
        onPanelChange={(panel) =>
          writeUrl(viewMode, selectedYear, panel, flightQuery)
        }
        selectedYear={selectedYear}
        query={flightQuery}
        onQueryChange={(query) =>
          writeUrl(viewMode, selectedYear, flightPanel, query)
        }
        hoveredKey={hoveredFlightKey}
        selectedKey={selectedFlightKey}
        onHover={setHoveredFlightKey}
        onSelect={(key) =>
          setSelectedFlightKey((prev) => (prev === key ? null : key))
        }
      />

      <FlightStatsPanel
        active={viewMode === "flights" && flightPanel === "stats"}
        panel={flightPanel}
        onPanelChange={(panel) =>
          writeUrl(viewMode, selectedYear, panel, flightQuery)
        }
        selectedYear={selectedYear}
        query={flightQuery}
      />

      {/* Globe map - full screen container, globe positioned lower */}
      <div
        id="map-container"
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full"
      />
      <MapProvider
        mapContainerRef={mapContainerRef}
        initialViewState={{
          longitude: 4,
          latitude: 60,
          zoom: 3.2,
          pitch: 45,
        }}
      >
        <MapLabels
          viewMode={viewMode}
          selectedYear={selectedYear}
          query={flightQuery}
        />
        <LocationMarkers viewMode={viewMode} />
        <FlightPaths
          viewMode={viewMode}
          selectedYear={selectedYear}
          query={flightQuery}
          hoveredKey={hoveredFlightKey}
          selectedKey={selectedFlightKey}
          onHoverChange={setHoveredFlightKey}
        />
        <ScratchMapLayer viewMode={viewMode} />
      </MapProvider>
    </div>
  );
}
