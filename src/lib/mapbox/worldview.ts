import type { FilterSpecification } from "mapbox-gl";

/** India worldview: Kashmir and Arunachal Pradesh render as part of India. */
export const MAP_WORLDVIEW = "IN" as const;

/**
 * Country-boundary filter for the India worldview.
 * Uses expression syntax throughout — mixing legacy filters with
 * expressions causes Mapbox to match nothing.
 */
export function withWorldviewFilter(
  countryCodes: string | readonly string[],
): FilterSpecification {
  const codes = Array.isArray(countryCodes) ? [...countryCodes] : [countryCodes];

  return [
    "all",
    ["in", ["get", "iso_3166_1"], ["literal", codes]],
    ["==", ["get", "disputed"], "false"],
    [
      "any",
      ["==", ["get", "worldview"], "all"],
      ["in", MAP_WORLDVIEW, ["get", "worldview"]],
    ],
  ];
}
