import type { Map as MapboxMap } from "mapbox-gl";

/** True when the map style can safely be queried or mutated. */
export function isMapStyleReady(
  map: MapboxMap | null | undefined,
): map is MapboxMap {
  return Boolean(map && map.isStyleLoaded());
}

/**
 * Run work once the style can take new layers. Adding a layer marks the style
 * busy, so a later caller in the same turn waits for the next idle frame.
 * Also re-runs after a full style reload.
 */
export function whenMapStyleReady(map: MapboxMap, fn: () => void) {
  const run = () => {
    if (!map.isStyleLoaded()) {
      map.once("idle", run);
      return;
    }
    fn();
  };

  run();
  map.on("style.load", run);
  return () => {
    map.off("idle", run);
    map.off("style.load", run);
  };
}
