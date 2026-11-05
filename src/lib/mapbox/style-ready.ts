import type { Map as MapboxMap } from "mapbox-gl";

/** True when the map style can safely be queried or mutated. */
export function isMapStyleReady(
  map: MapboxMap | null | undefined,
): map is MapboxMap {
  return Boolean(map && map.isStyleLoaded());
}
