"use client";

import { useEffect } from "react";
import { useMap } from "@/context/map-context";
import {
  getFlightCityLabels,
  isCountryLabelLayer,
} from "@/lib/mapbox/flight-city-labels";
import { isMapStyleReady } from "@/lib/mapbox/style-ready";

const CITY_SOURCE_ID = "flight-city-labels";
const CITY_LAYER_ID = "flight-city-labels";

export default function MapLabels() {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;

    const declutterStyleLabels = () => {
      if (!isMapStyleReady(map)) return;
      const style = map.getStyle();
      if (!style?.layers) return;

      for (const layer of style.layers) {
        if (layer.type !== "symbol") continue;

        if (isCountryLabelLayer(layer.id)) {
          // Prefer English names on custom styles that ignore map.language
          try {
            map.setLayoutProperty(layer.id, "text-field", [
              "coalesce",
              ["get", "name_en"],
              ["get", "name:en"],
              ["get", "name"],
            ]);
          } catch {
            // Layer may not support text-field overrides
          }
          continue;
        }

        try {
          map.setLayoutProperty(layer.id, "visibility", "none");
        } catch {
          // Layer may not support layout changes
        }
      }
    };

    const addFlightCityLabels = () => {
      if (!isMapStyleReady(map)) return;
      try {
        if (map.getLayer(CITY_LAYER_ID)) {
          map.removeLayer(CITY_LAYER_ID);
        }
        if (map.getSource(CITY_SOURCE_ID)) {
          map.removeSource(CITY_SOURCE_ID);
        }

        const labels = getFlightCityLabels();
        map.addSource(CITY_SOURCE_ID, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: labels.map((label) => ({
              type: "Feature",
              properties: { name: label.name },
              geometry: {
                type: "Point",
                coordinates: label.coordinates,
              },
            })),
          },
        });

        map.addLayer({
          id: CITY_LAYER_ID,
          type: "symbol",
          source: CITY_SOURCE_ID,
          layout: {
            "text-field": ["get", "name"],
            "text-size": 12,
            "text-offset": [0, 1.1],
            "text-anchor": "top",
            "text-allow-overlap": false,
            "text-optional": true,
          },
          paint: {
            "text-color": "#f5f5f5",
            "text-halo-color": "rgba(0,0,0,0.75)",
            "text-halo-width": 1.25,
          },
          minzoom: 2,
        });
      } catch (e) {
        console.warn("Error adding flight city labels:", e);
      }
    };

    const apply = () => {
      if (!isMapStyleReady(map)) return;
      declutterStyleLabels();
      addFlightCityLabels();
    };

    apply();
    map.on("style.load", apply);

    return () => {
      map.off("style.load", apply);
      if (!isMapStyleReady(map)) return;
      try {
        if (map.getLayer(CITY_LAYER_ID)) {
          map.removeLayer(CITY_LAYER_ID);
        }
        if (map.getSource(CITY_SOURCE_ID)) {
          map.removeSource(CITY_SOURCE_ID);
        }
      } catch {
        // Map may already be removed
      }
    };
  }, [map]);

  return null;
}
