"use client";

import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { ALL_YEARS, getFlightsForYear } from "@/lib/flights-by-year";
import { getFlightStats, type AirlineStat, type YearStat } from "@/lib/flight-stats";
import FlightPanelSwitch, {
  type FlightPanel,
} from "@/components/flight-panel-switch";

type FlightStatsPanelProps = {
  active: boolean;
  panel: FlightPanel;
  onPanelChange: (panel: FlightPanel) => void;
  selectedYear: string;
};

const monoFont = { fontFamily: "var(--font-space-mono), monospace" } as const;

function formatKm(km: number) {
  return `${Math.round(km).toLocaleString()} km`;
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div
      className="px-5 pt-4 pb-2 text-[10px] uppercase tracking-[0.18em] text-white/45"
      style={monoFont}
    >
      {children}
    </div>
  );
}

function StatRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 py-1.5">
      <span className="shrink-0 text-sm text-white" style={monoFont}>
        {label}
      </span>
      <span
        className="max-w-[62%] text-right text-xs leading-snug text-white/80"
        style={monoFont}
      >
        <span className="block">{value}</span>
        {detail ? (
          <span className="block tabular-nums text-white/45">{detail}</span>
        ) : null}
      </span>
    </div>
  );
}

function BarRow({
  label,
  value,
  width,
  emphasized,
}: {
  label: string;
  value: string;
  width: number;
  emphasized?: boolean;
}) {
  return (
    <div className="px-5 py-1.5">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span
          className={`min-w-0 leading-snug text-xs uppercase tracking-[0.04em] ${emphasized ? "text-white" : "text-white/75"}`}
          style={monoFont}
        >
          {label}
        </span>
        <span className="text-[11px] tabular-nums text-white/50" style={monoFont}>
          {value}
        </span>
      </div>
      <div className="h-1 w-full rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${emphasized ? "bg-white/80" : "bg-white/35"}`}
          style={{ width: `${Math.max(width, 4)}%` }}
        />
      </div>
    </div>
  );
}

function yearLabel(
  year: YearStat,
  maxFlights: number,
  maxKm: number,
  comparable: boolean,
) {
  if (!comparable) return year.year;
  const marks: string[] = [];
  if (year.flights === maxFlights) marks.push("most flights");
  if (year.km === maxKm) marks.push("most distance");
  return marks.length === 0 ? year.year : `${year.year} · ${marks.join(" · ")}`;
}

function airlineLabel(airline: AirlineStat, leader: string | null) {
  return airline.name === leader ? `${airline.name} · furthest` : airline.name;
}

export default function FlightStatsPanel({
  active,
  panel,
  onPanelChange,
  selectedYear,
}: FlightStatsPanelProps) {
  const flights = useMemo(
    () => getFlightsForYear(selectedYear),
    [selectedYear],
  );
  const stats = useMemo(() => getFlightStats(flights), [flights]);
  const maxYearFlights = Math.max(0, ...stats.byYear.map((year) => year.flights));
  const maxYearKm = Math.max(1, ...stats.byYear.map((year) => year.km));
  const maxAirlineKm = Math.max(1, ...stats.airlines.map((airline) => airline.km));
  const yearsComparable = stats.byYear.length > 1;
  const busiestYears = stats.byYear.filter((year) => year.flights === maxYearFlights);
  const scope = selectedYear === ALL_YEARS ? "All years" : selectedYear;

  if (!active) return null;

  return (
    <div className="pointer-events-auto absolute z-20 w-auto max-h-[55dvh] overflow-y-auto overscroll-contain inset-x-3 bottom-3 md:inset-x-auto md:bottom-auto md:top-6 md:right-6 md:max-h-[calc(100dvh-3rem)] md:w-[340px]">
      <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between gap-6 px-5 pt-4 pb-3">
          <div className="flex flex-col gap-2">
            <FlightPanelSwitch panel={panel} onChange={onPanelChange} />
            <div
              className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/60"
              style={monoFont}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Stats {scope}
            </div>
          </div>
          <span
            className="text-xs tracking-[0.12em] text-white/45 tabular-nums"
            style={monoFont}
          >
            {stats.flights}
          </span>
        </div>

        <div className="relative">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white/15" />
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white/15" />
          <div className="border-t border-dashed border-white/20" />
        </div>

        {stats.flights === 0 ? (
          <div
            className="px-5 py-6 text-center text-xs uppercase tracking-[0.16em] text-white/40"
            style={monoFont}
          >
            No flights logged
          </div>
        ) : (
          <div className="pb-4">
            <SectionTitle>Distance</SectionTitle>
            <StatRow label="Total" value={formatKm(stats.totalKm)} />
            <StatRow label="Average leg" value={formatKm(stats.averageKm)} />
            {stats.longest && (
              <StatRow
                label="Longest leg"
                value={`${stats.longest.from} → ${stats.longest.to}`}
                detail={formatKm(stats.longest.km)}
              />
            )}

            <SectionTitle>Distance by year</SectionTitle>
            {stats.byYear.map((year) => {
              const label = yearLabel(year, maxYearFlights, maxYearKm, yearsComparable);
              return (
                <BarRow
                  key={year.year}
                  label={label}
                  value={`${year.flights} · ${formatKm(year.km)}`}
                  width={(year.km / maxYearKm) * 100}
                  emphasized={label !== year.year}
                />
              );
            })}

            <SectionTitle>Places</SectionTitle>
            <div className="grid grid-cols-3 gap-2 px-5 py-1">
              {[
                ["Cities", stats.cities],
                ["Airports", stats.airports],
                ["Countries", stats.countries],
              ].map(([label, value]) => (
                <div key={label} className="text-center">
                  <div className="text-2xl tabular-nums text-white" style={monoFont}>
                    {value}
                  </div>
                  <div
                    className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/45"
                    style={monoFont}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
            {stats.busiestCity && (
              <StatRow
                label="Busiest city"
                value={stats.busiestCity.name}
                detail={`${stats.busiestCity.count} stops`}
              />
            )}
            {stats.busiestAirport && (
              <StatRow
                label="Busiest airport"
                value={stats.busiestAirport.name}
                detail={`${stats.busiestAirport.count} stops`}
              />
            )}

            <SectionTitle>Repetition</SectionTitle>
            {stats.topRoute && (
              <StatRow
                label="Most flown"
                value={`${stats.topRoute.from} — ${stats.topRoute.to}`}
                detail={`×${stats.topRoute.count}`}
              />
            )}
            {yearsComparable && busiestYears.length > 0 && (
              <StatRow
                label="Most flying"
                value={busiestYears.map((year) => year.year).join(", ")}
                detail={`${maxYearFlights} flights`}
              />
            )}

            <SectionTitle>Airlines</SectionTitle>
            {stats.topAirlineByDistance && (
              <StatRow
                label={`${stats.airlineCount} used`}
                value={stats.topAirlineByDistance.name}
                detail="furthest"
              />
            )}
            {stats.airlines.map((airline) => (
              <BarRow
                key={airline.name}
                label={airlineLabel(airline, stats.topAirlineByDistance?.name ?? null)}
                value={`${airline.legs} · ${formatKm(airline.km)}`}
                width={(airline.km / maxAirlineKm) * 100}
                emphasized={airline.name === stats.topAirlineByDistance?.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
