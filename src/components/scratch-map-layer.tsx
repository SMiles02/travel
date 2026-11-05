"use client";

import { useEffect } from "react";
import { useMap } from "@/context/map-context";
import visitedCountries from "@/data/visited-countries.json";
import { withWorldviewFilter } from "@/lib/mapbox/worldview";
import { isMapStyleReady } from "@/lib/mapbox/style-ready";

type ViewMode = "gallery" | "scratch-map" | "flights";

type ScratchMapLayerProps = {
  viewMode: ViewMode;
};

export default function ScratchMapLayer({ viewMode }: ScratchMapLayerProps) {
  const { map } = useMap();

  useEffect(() => {
    if (!map || viewMode !== "scratch-map") {
      if (isMapStyleReady(map)) {
        try {
          if (map.getLayer("country-highlight-border")) {
            map.removeLayer("country-highlight-border");
          }
          if (map.getLayer("country-highlight")) {
            map.removeLayer("country-highlight");
          }
          if (map.getSource("countries")) {
            map.removeSource("countries");
          }
        } catch (e) {
          console.warn("Error removing country highlight layer:", e);
        }
      }
      return;
    }

    const removeCountryLayer = () => {
      if (!isMapStyleReady(map)) return;
      try {
        if (map.getLayer("country-highlight-border")) {
          map.removeLayer("country-highlight-border");
        }
        if (map.getLayer("country-highlight")) {
          map.removeLayer("country-highlight");
        }
        if (map.getSource("countries")) {
          map.removeSource("countries");
        }
      } catch (e) {
        console.warn("Error removing country highlight layer:", e);
      }
    };

    const addCountryLayer = () => {
      if (!isMapStyleReady(map)) return;
      try {
        removeCountryLayer();

        map.addSource("countries", {
          type: "vector",
          url: "mapbox://mapbox.country-boundaries-v1",
        });

        const filter = withWorldviewFilter(visitedCountries);

        map.addLayer({
          id: "country-highlight",
          type: "fill",
          source: "countries",
          "source-layer": "country_boundaries",
          filter: filter,
          paint: {
            "fill-color": "#3b82f6",
            "fill-opacity": 0.45,
          },
        });

        map.addLayer({
          id: "country-highlight-border",
          type: "line",
          source: "countries",
          "source-layer": "country_boundaries",
          filter: filter,
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.2,
            "line-opacity": 0.85,
          },
        });
      } catch (e) {
        console.warn("Error adding country highlight layer:", e);
      }
    };

    addCountryLayer();
    map.on("style.load", addCountryLayer);

    return () => {
      map.off("style.load", addCountryLayer);
      removeCountryLayer();
    };
  }, [map, viewMode]);

  return null;
}
