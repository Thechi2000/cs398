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
  timeline,
  lastTimestamp,
}: {
  variable: Variable;
  parents: VariableScope[];
  timeline: { [key: string]: Timeline };
  lastTimestamp: number;
}) {
  return (
    <div>
      {parents
        .map((s) => s.name)
        .filter((v) => v !== null)
        .join(".") +
        "." +
        variable.reference}
    </div>
  );
}

function VariableScopeComponent({
  scope,
  parents,
  timeline,
  lastTimestamp,
}: {
  scope: VariableScope;
  parents: VariableScope[];
  timeline: { [key: string]: Timeline };
  lastTimestamp: number;
}) {
  let currentScope = parents.concat([scope]);
  return (
    <>
      {scope.variables.map((v) => (
        <VariableComponent
          variable={v}
          parents={currentScope}
          timeline={timeline}
          lastTimestamp={lastTimestamp}
        />
      ))}
      {scope.scopes.map((s) => (
        <VariableScopeComponent
          scope={s}
          parents={currentScope}
          timeline={timeline}
          lastTimestamp={lastTimestamp}
        />
      ))}
    </>
  );
}

export default function Waves({ vcd }: { vcd: VCDFile }) {
  const maxTime =
    Math.max(
      ...Object.values(vcd.timeline).flatMap((t) =>
        Object.keys(t).map(parseFloat)
      )
    ) + 1;
  return (
    <div className="flex overflow-scroll w-full h-full">
      <div
        style={{ height: WaveGraph.height(vcd.timeline) }}
        className="flex flex-col justify-around grow sticky top-0 left-0 bg-white"
      >
        <VariableScopeComponent
          scope={vcd.variables}
          parents={[]}
          timeline={vcd.timeline}
          lastTimestamp={maxTime}
        />
      </div>
      <WaveGraph
        timelines={vcd.timeline}
        order={Object.keys(vcd.timeline)}
        lastTimestamp={maxTime}
      />
    </div>
  );
}
