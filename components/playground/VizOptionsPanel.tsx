"use client";

import { Panel } from "@/components/ui/Panel";
import { Toggle } from "@/components/ui/Toggle";
import { usePlaygroundStore } from "@/lib/store/playgroundStore";

export function VizOptionsPanel() {
  const { vizOptions, setVizOptions } = usePlaygroundStore();

  return (
    <Panel title="Visualization">
      <div className="space-y-3">
        <Toggle
          label="Value Heatmap"
          checked={vizOptions.showHeatmap}
          onChange={(checked) => setVizOptions({ showHeatmap: checked })}
        />
        <Toggle
          label="Policy Arrows"
          checked={vizOptions.showArrows}
          onChange={(checked) => setVizOptions({ showArrows: checked })}
        />
        <Toggle
          label="Agent Trail"
          checked={vizOptions.showTrail}
          onChange={(checked) => setVizOptions({ showTrail: checked })}
        />
        <Toggle
          label="Value Numbers"
          checked={vizOptions.showValues}
          onChange={(checked) => setVizOptions({ showValues: checked })}
        />
      </div>
    </Panel>
  );
}
