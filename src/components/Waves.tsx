import { useState } from "react";
import WaveGraph from "./WaveGraph";

export interface VCDFile {
  variables: VariableScope;
  timescale: [number, string];
  version: string;
  date: string;
  timeline: { [key: string]: Timeline };
}

export type Timeline = { [key: number]: string };

export interface VariableScope {
  name: string | null;
  ty: string | null;
  variables: Variable[];
  scopes: VariableScope[];
}

export interface Variable {
  ty: string;
  size: number;
  identifier: string;
  reference: string;
}

function VariableComponent({
  variable,
  parents,
  setFormat,
}: {
  variable: Variable;
  parents: VariableScope[];
  setFormat: (id: string, format: number) => void;
}) {
  return (
    <p>
      {parents
        .map((s) => s.name)
        .filter((v) => v !== null)
        .join(".") +
        "." +
        variable.reference}
    </p>
  );
}

function VariableScopeComponent({
  scope,
  parents,
  setFormat,
}: {
  scope: VariableScope;
  parents: VariableScope[];
  setFormat: (id: string, format: number) => void;
}) {
  let currentScope = parents.concat([scope]);
  return (
    <>
      {scope.variables.map((v) => (
        <VariableComponent
          variable={v}
          parents={currentScope}
          setFormat={setFormat}
        />
      ))}
      {scope.scopes.map((s) => (
        <VariableScopeComponent
          scope={s}
          parents={currentScope}
          setFormat={setFormat}
        />
      ))}
    </>
  );
}

export default function Waves({ vcd }: { vcd: VCDFile }) {
  const [format, setFormat] = useState({} as { [key: string]: number });

  const maxTime =
    Math.max(
      ...Object.values(vcd.timeline).flatMap((t) =>
        Object.keys(t).map(parseFloat)
      )
    ) + 1;

  return (
    <div className="flex overflow-scroll w-full h-full bg-inherit justify-left">
      <div
        style={{ height: WaveGraph.height(vcd.timeline) }}
        className="flex flex-col justify-around sticky top-0 left-0 bg-white"
      >
        <VariableScopeComponent
          scope={vcd.variables}
          parents={[]}
          timeline={vcd.timeline}
          lastTimestamp={maxTime}
          setFormat={(id, format) => setFormat((v) => ({ [id]: format, ...v }))}
        />
      </div>
      <WaveGraph
        timelines={Object.entries(vcd.timeline)
          .map(([k, v]) => [
            k,
            {
              values: v,
              format: format[k],
            },
          ])
          .reduce((p, c) => ({ [c[0] as string]: c[1], ...p }), {})}
        order={Object.keys(vcd.timeline)}
        lastTimestamp={maxTime}
      />
    </div>
  );
}
