"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MapProvider from "@/lib/mapbox/provider";
import { useMap } from "@/context/map-context";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isFuzzyMatch } from "@/lib/fuzzy-match";
import { useRaiseMapLogo } from "@/lib/mapbox/raise-map-logo";
import { withWorldviewFilter } from "@/lib/mapbox/worldview";

export default function GamePage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const answerRef = useRef<HTMLDivElement | null>(null);
  useRaiseMapLogo(true, answerRef);
  const router = useRouter();
  const [currentCountry, setCurrentCountry] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [guessedCountries, setGuessedCountries] = useState<Set<string>>(
    new Set(),
  );
  const [wrongGuessedCountries, setWrongGuessedCountries] = useState<
    Set<string>
  >(new Set());
  const [askedCountries, setAskedCountries] = useState<Set<string>>(new Set());
  const [gameMode, setGameMode] = useState<"countries" | "capitals">(
    "countries",
  );
  const [selectedContinent, setSelectedContinent] = useState<string>("all");
  const [countryData, setCountryData] = useState<{
    coordinates: Record<string, [number, number]>;
    names: Record<string, string>;
    capitals: Record<string, string>;
    continents: Record<string, string>;
    codes: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const continentNames: Record<string, string> = {
    all: "All Continents",
    AF: "Africa",
    AS: "Asia",
    EU: "Europe",
    NA: "North America",
    SA: "South America",
    OC: "Oceania",
    AN: "Antarctica",
  };

  // Load country data on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("/api/countries");
        const data = await response.json();

        if (response.ok) {
          if (data.error) {
            setError(data.error);
            console.error("API returned error:", data.error);
          } else if (data.codes && data.codes.length > 0) {
            setCountryData(data);
            setError(null);
            console.log(`Loaded ${data.codes.length} countries`);
          } else {
            setError("No countries returned from API");
            console.error("No countries returned from API. Data:", data);
          }
        } else {
          setError(
            data.error || `Failed to fetch countries: ${response.status}`,
          );
          console.error("Failed to fetch countries:", response.status, data);
        }
      } catch (error) {
        setError("Error fetching countries. Please try refreshing the page.");
        console.error("Error fetching countries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const selectRandomCountry = () => {
    if (!countryData || countryData.codes.length === 0) return;

    // Filter countries based on mode and continent
    let availableCodes = countryData.codes;

    // Filter by capitals if in capitals mode
    if (gameMode === "capitals") {
      availableCodes = availableCodes.filter(
        (code) => countryData.capitals[code],
      );
    }

    // Filter by continent if not "all"
    if (selectedContinent !== "all") {
      availableCodes = availableCodes.filter(
        (code) => countryData.continents[code] === selectedContinent,
      );
    }

    // Filter out already asked countries
    availableCodes = availableCodes.filter((code) => !askedCountries.has(code));

    // If no countries left, reset the game
    if (availableCodes.length === 0) {
      setAskedCountries(new Set());
      setScore(0);
      setRound(0);
      setGuessedCountries(new Set());
      setWrongGuessedCountries(new Set());

      // Re-filter to get all available countries again
      availableCodes = countryData.codes;
      if (gameMode === "capitals") {
        availableCodes = availableCodes.filter(
          (code) => countryData.capitals[code],
        );
      }
      if (selectedContinent !== "all") {
        availableCodes = availableCodes.filter(
          (code) => countryData.continents[code] === selectedContinent,
        );
      }
    }

    if (availableCodes.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availableCodes.length);
    const countryCode = availableCodes[randomIndex];
    setCurrentCountry(countryCode);
    setAskedCountries((prev) => new Set(prev).add(countryCode));
    setUserAnswer("");
    setIsCorrect(null);
    setRound((prev) => prev + 1);
  };

  useEffect(() => {
    if (
      countryData &&
      !loading &&
      countryData.codes &&
      countryData.codes.length > 0 &&
      !currentCountry
    ) {
      selectRandomCountry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryData, loading]);

  // Reset and select new country when game mode changes
  useEffect(() => {
    if (countryData && !loading) {
      setAskedCountries(new Set());
      setCurrentCountry(null);
      setIsCorrect(null);
      setUserAnswer("");
      selectRandomCountry();
      // Focus the input after a brief delay
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameMode]);

  // Restart game (reset score/round) when continent changes
  useEffect(() => {
    if (countryData && !loading && selectedContinent) {
      setScore(0);
      setRound(0);
      setAskedCountries(new Set());
      setGuessedCountries(new Set());
      setWrongGuessedCountries(new Set());
      setCurrentCountry(null);
      setIsCorrect(null);
      setUserAnswer("");
      selectRandomCountry();
      // Focus the input after a brief delay
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContinent]);

  // Auto-focus input when currentCountry changes (new question)
  useEffect(() => {
    if (currentCountry && isCorrect === null) {
      // Small delay to ensure input is enabled
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [currentCountry, isCorrect]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCountry || !countryData) return;

    let correctAnswer: string;
    if (gameMode === "capitals") {
      correctAnswer = countryData.capitals[currentCountry] || "";
    } else {
      correctAnswer = countryData.names[currentCountry];
    }

    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectName = correctAnswer.toLowerCase();

    // Use fuzzy matching (allows 1-2 character differences)
    const correct = isFuzzyMatch(
      normalizedUserAnswer,
      normalizedCorrectName,
      2,
    );
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
      setGuessedCountries((prev) => new Set(prev).add(currentCountry));
      setTimeout(() => {
        setUserAnswer("");
        selectRandomCountry();
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }, 300);
    } else {
      setWrongGuessedCountries((prev) => new Set(prev).add(currentCountry));
      setTimeout(() => {
        setUserAnswer("");
        selectRandomCountry();
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }, 2000);
    }
  };

  return (
    <div className="relative h-dvh w-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
        <div className="flex flex-wrap items-center gap-2 p-3 md:gap-4 md:p-6">
          <button
            onClick={() => router.push("/")}
            className="pointer-events-auto flex h-9 items-center gap-1.5 rounded-md border border-white/20 bg-black/40 px-2 py-1 text-sm font-medium text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
          <Tabs
            value={gameMode}
            onValueChange={(value) => {
              setGameMode(value as "countries" | "capitals");
            }}
            className="pointer-events-auto w-auto"
          >
            <TabsList className="bg-black/40 backdrop-blur-sm border border-white/20">
              <TabsTrigger
                value="countries"
                className="text-white/80 hover:text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                Countries
              </TabsTrigger>
              <TabsTrigger
                value="capitals"
                className="text-white/80 hover:text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                Capitals
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Select
            value={selectedContinent}
            onValueChange={setSelectedContinent}
          >
            <SelectTrigger className="pointer-events-auto h-9! w-[9.5rem] bg-black/40! backdrop-blur-sm border-white/20! text-white/80 hover:text-white data-placeholder:text-white/80 px-2 py-1 [&_svg]:text-white/80 md:w-[180px]">
              <SelectValue placeholder="Select continent" />
            </SelectTrigger>
            <SelectContent className="bg-black/40 backdrop-blur-sm border border-white/20">
              <SelectItem
                value="all"
                className="text-white/80 hover:text-white hover:bg-white/20 focus:bg-white/20"
              >
                All Continents
              </SelectItem>
              <SelectItem
                value="AF"
                className="text-white/80 hover:text-white hover:bg-white/20 focus:bg-white/20"
              >
                Africa
              </SelectItem>
              <SelectItem
                value="AS"
                className="text-white/80 hover:text-white hover:bg-white/20 focus:bg-white/20"
              >
                Asia
              </SelectItem>
              <SelectItem
                value="EU"
                className="text-white/80 hover:text-white hover:bg-white/20 focus:bg-white/20"
              >
                Europe
              </SelectItem>
              <SelectItem
                value="NA"
                className="text-white/80 hover:text-white hover:bg-white/20 focus:bg-white/20"
              >
                North America
              </SelectItem>
              <SelectItem
                value="SA"
                className="text-white/80 hover:text-white hover:bg-white/20 focus:bg-white/20"
              >
                South America
              </SelectItem>
              <SelectItem
                value="OC"
                className="text-white/80 hover:text-white hover:bg-white/20 focus:bg-white/20"
              >
                Oceania
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-white/80">
            Score: {score} | Round: {round}
          </div>
        </div>
      </div>

      <div
        id="map-container"
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full"
      />
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-1000">
          <div className="text-lg font-medium text-white">
            Loading countries...
          </div>
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-1000">
          <div className="text-center">
            <div className="text-lg font-medium text-red-400 mb-2">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      ) : (
        <MapProvider
          mapContainerRef={mapContainerRef}
          initialViewState={{
            longitude: 4,
            latitude: 60,
            zoom: 3.3,
            pitch: 45,
          }}
        >
          <GameMap
            currentCountry={currentCountry}
            countryCoordinates={countryData?.coordinates || null}
            guessedCountries={guessedCountries}
            wrongGuessedCountries={wrongGuessedCountries}
          />
        </MapProvider>
      )}

      {/* Feedback card */}
      <div
        className={`pointer-events-none absolute bottom-36 left-1/2 z-30 w-[min(calc(100%-2rem),24rem)] -translate-x-1/2 text-center transition-all duration-300 ${
          isCorrect !== null
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div
          className={`bg-black/40 backdrop-blur-sm border rounded-lg px-6 py-4 ${
            isCorrect === true
              ? "border-green-400/50"
              : isCorrect === false
                ? "border-red-400/50"
                : "border-white/20"
          }`}
        >
          {isCorrect === true && (
            <div className="text-green-400 font-semibold text-lg text-center">
              Correct!
            </div>
          )}
          {isCorrect === false && (
            <div className="text-red-400 font-semibold text-lg text-center">
              Wrong! The answer is{" "}
              {currentCountry && countryData
                ? gameMode === "capitals"
                  ? countryData.capitals[currentCountry]
                  : countryData.names[currentCountry]
                : ""}
            </div>
          )}
        </div>
      </div>

      {/* Input form */}
      <div
        ref={answerRef}
        className="pointer-events-auto absolute bottom-3 left-1/2 z-30 w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 md:bottom-6"
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-lg border border-white/20 bg-black/40 p-4 backdrop-blur-sm"
        >
          {gameMode === "capitals" && currentCountry && countryData && (
            <div
              className="text-white/80 text-xl uppercase text-center font-semibold"
              style={{ fontFamily: "var(--font-space-mono), monospace" }}
            >
              {countryData.names[currentCountry]}
            </div>
          )}
          <div className="flex items-center gap-2 md:gap-4">
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={
                gameMode === "capitals"
                  ? "Enter capital city..."
                  : "Enter country name..."
              }
              className="min-w-0 flex-1 rounded-md border border-white/20 bg-transparent px-4 py-2 text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none md:min-w-[300px]"
              disabled={isCorrect === true}
              autoFocus
            />
            <button
              type="submit"
              disabled={!userAnswer || isCorrect === true}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GameMap({
  currentCountry,
  countryCoordinates,
  guessedCountries,
  wrongGuessedCountries,
}: {
  currentCountry: string | null;
  countryCoordinates: Record<string, [number, number]> | null;
  guessedCountries: Set<string>;
  wrongGuessedCountries: Set<string>;
}) {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;

    const hideLabels = () => {
      if (!map.isStyleLoaded()) return;

      // Mapbox Standard keeps country and city names behind basemap config.
      // Layout visibility alone is reset when that style reloads.
      for (const key of [
        "showPlaceLabels",
        "showPointOfInterestLabels",
        "showRoadLabels",
        "showTransitLabels",
        "showLandmarkIconLabels",
        "showIndoorLabels",
      ]) {
        try {
          if (map.getConfigProperty("basemap", key) !== false) {
            map.setConfigProperty("basemap", key, false);
          }
        } catch {
          // Custom styles have no basemap config
        }
      }

      try {
        const style = map.getStyle();
        if (!style?.layers) return;

        for (const layer of style.layers) {
          if (layer.type !== "symbol" || !layer.id) continue;
          const id = layer.id.toLowerCase();
          const hidesAnswer =
            id.includes("country-label") ||
            id.includes("country_label") ||
            id.includes("continent") ||
            id.includes("state-label") ||
            id.includes("settlement") ||
            id.includes("place-label") ||
            id.includes("place_label") ||
            id.includes("airport-label") ||
            id.includes("poi-label");
          if (!hidesAnswer) continue;
          try {
            map.setLayoutProperty(layer.id, "visibility", "none");
          } catch {
            // Layer may not support visibility changes
          }
        }
      } catch (e) {
        console.warn("Error hiding labels:", e);
      }
    };

    hideLabels();
    map.on("load", hideLabels);
    map.on("style.load", hideLabels);

    return () => {
      map.off("load", hideLabels);
      map.off("style.load", hideLabels);
    };
  }, [map]);

  // Setup guessed countries fill layer
  useEffect(() => {
    if (!map) return;

    const setupGuessedCountries = () => {
      try {
        // Remove existing guessed countries layers
        if (map.getLayer("game-guessed-countries-fill")) {
          map.removeLayer("game-guessed-countries-fill");
        }
        if (map.getLayer("game-guessed-countries-border")) {
          map.removeLayer("game-guessed-countries-border");
        }

        if (guessedCountries.size === 0) return;

        // Add source if not exists
        if (!map.getSource("game-guessed-countries")) {
          map.addSource("game-guessed-countries", {
            type: "vector",
            url: "mapbox://mapbox.country-boundaries-v1",
          });
        }

        const guessedArray = Array.from(guessedCountries);
        const filter = withWorldviewFilter(guessedArray);

        // Add fill layer for guessed countries
        map.addLayer({
          id: "game-guessed-countries-fill",
          type: "fill",
          source: "game-guessed-countries",
          "source-layer": "country_boundaries",
          filter: filter,
          paint: {
            "fill-color": "#10b981", // Green
            "fill-opacity": 0.6,
          },
        });

        // Add border layer for guessed countries
        map.addLayer({
          id: "game-guessed-countries-border",
          type: "line",
          source: "game-guessed-countries",
          "source-layer": "country_boundaries",
          filter: filter,
          paint: {
            "line-color": "#10b981",
            "line-width": 1,
            "line-opacity": 0.8,
          },
        });
      } catch (e) {
        console.warn("Error setting up guessed countries:", e);
      }
    };

    if (!map.isStyleLoaded()) {
      map.once("load", () => {
        setupGuessedCountries();
      });
    } else {
      setupGuessedCountries();
    }

    return () => {
      try {
        if (map.getLayer("game-guessed-countries-fill")) {
          map.removeLayer("game-guessed-countries-fill");
        }
        if (map.getLayer("game-guessed-countries-border")) {
          map.removeLayer("game-guessed-countries-border");
        }
      } catch (e) {
        console.warn("Error cleaning up guessed countries layers:", e);
      }
    };
  }, [map, guessedCountries]);

  // Setup wrong guessed countries fill layer
  useEffect(() => {
    if (!map) return;

    const setupWrongGuessedCountries = () => {
      try {
        // Remove existing wrong guessed countries layers
        if (map.getLayer("game-wrong-countries-fill")) {
          map.removeLayer("game-wrong-countries-fill");
        }
        if (map.getLayer("game-wrong-countries-border")) {
          map.removeLayer("game-wrong-countries-border");
        }

        if (wrongGuessedCountries.size === 0) return;

        // Add source if not exists
        if (!map.getSource("game-wrong-countries")) {
          map.addSource("game-wrong-countries", {
            type: "vector",
            url: "mapbox://mapbox.country-boundaries-v1",
          });
        }

        const wrongArray = Array.from(wrongGuessedCountries);
        const filter = withWorldviewFilter(wrongArray);

        // Add fill layer for wrong guessed countries
        map.addLayer({
          id: "game-wrong-countries-fill",
          type: "fill",
          source: "game-wrong-countries",
          "source-layer": "country_boundaries",
          filter: filter,
          paint: {
            "fill-color": "#ef4444", // Red
            "fill-opacity": 0.6,
          },
        });

        // Add border layer for wrong guessed countries
        map.addLayer({
          id: "game-wrong-countries-border",
          type: "line",
          source: "game-wrong-countries",
          "source-layer": "country_boundaries",
          filter: filter,
          paint: {
            "line-color": "#ef4444",
            "line-width": 1,
            "line-opacity": 0.8,
          },
        });
      } catch (e) {
        console.warn("Error setting up wrong guessed countries:", e);
      }
    };

    if (!map.isStyleLoaded()) {
      map.once("load", () => {
        setupWrongGuessedCountries();
      });
    } else {
      setupWrongGuessedCountries();
    }

    return () => {
      try {
        if (map.getLayer("game-wrong-countries-fill")) {
          map.removeLayer("game-wrong-countries-fill");
        }
        if (map.getLayer("game-wrong-countries-border")) {
          map.removeLayer("game-wrong-countries-border");
        }
      } catch (e) {
        console.warn("Error cleaning up wrong guessed countries layers:", e);
      }
    };
  }, [map, wrongGuessedCountries]);

  useEffect(() => {
    if (!map || !currentCountry) return;

    const setupCountryHighlight = () => {
      try {
        // Remove existing layers
        if (map.getLayer("game-country-border")) {
          map.removeLayer("game-country-border");
        }
        if (map.getLayer("game-country-highlight")) {
          map.removeLayer("game-country-highlight");
        }
        if (map.getSource("game-countries")) {
          map.removeSource("game-countries");
        }

        // Add source
        map.addSource("game-countries", {
          type: "vector",
          url: "mapbox://mapbox.country-boundaries-v1",
        });

        const filter = withWorldviewFilter(currentCountry);

        // Add border layer
        map.addLayer({
          id: "game-country-border",
          type: "line",
          source: "game-countries",
          "source-layer": "country_boundaries",
          filter: filter,
          paint: {
            "line-color": "#f59e0b",
            "line-width": 1.5,
            "line-opacity": 1,
          },
        });
      } catch (e) {
        console.warn("Error setting up country highlight:", e);
      }
    };

    const focusOnCountry = () => {
      if (!countryCoordinates) return;
      const coords = countryCoordinates[currentCountry];
      if (!coords) return;

      map.flyTo({
        center: coords,
        zoom: 4,
        duration: 2000,
      });
    };

    if (!map.isStyleLoaded()) {
      map.once("load", () => {
        setupCountryHighlight();
        focusOnCountry();
      });
      return;
    }

    setupCountryHighlight();
    focusOnCountry();

    return () => {
      try {
        if (map.getLayer("game-country-border")) {
          map.removeLayer("game-country-border");
        }
        if (map.getSource("game-countries")) {
          map.removeSource("game-countries");
        }
      } catch (e) {
        console.warn("Error cleaning up game layers:", e);
      }
    };
  }, [map, currentCountry]);

  return null;
}
