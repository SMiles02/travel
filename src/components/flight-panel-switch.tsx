"use client";

const monoFont = { fontFamily: "var(--font-space-mono), monospace" } as const;

export type FlightPanel = "list" | "stats";

export default function FlightPanelSwitch({
  panel,
  onChange,
}: {
  panel: FlightPanel;
  onChange: (panel: FlightPanel) => void;
}) {
  return (
    <div className="flex h-7 items-center rounded-md bg-black/30 p-0.5">
      {(
        [
          ["list", "List"],
          ["stats", "Stats"],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`h-full rounded px-2.5 text-[10px] uppercase tracking-[0.14em] ${
            panel === value
              ? "bg-white/20 text-white"
              : "text-white/55 hover:text-white"
          }`}
          style={monoFont}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
