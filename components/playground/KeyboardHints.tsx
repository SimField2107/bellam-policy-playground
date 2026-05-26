"use client";

import { Panel } from "@/components/ui/Panel";

const SHORTCUTS = [
  { key: "Space", action: "Play / Pause" },
  { key: "N", action: "Step Episode" },
  { key: "S", action: "Step Action" },
  { key: "R", action: "Reset" },
];

export function KeyboardHints() {
  return (
    <Panel title="Keyboard">
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {SHORTCUTS.map(({ key, action }) => (
          <div key={key} className="contents">
            <kbd className="font-mono text-text-muted bg-bg-secondary px-1.5 py-0.5 rounded border border-border-subtle text-center">
              {key}
            </kbd>
            <span className="text-text-secondary">{action}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
