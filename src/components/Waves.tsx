import { useState } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import WaveGraph from "./WaveGraph";
import { DotFilledIcon } from "@radix-ui/react-icons";

export interface VCDFile {
  variables: VariableScope;
  timescale: [number, string];
  version: string;
  date: string;
  timeline: { [key: string]: Timeline };
}

export type Timeline = { [key: string]: string };

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
  format,
  setFormat,
}: {
  variable: Variable;
  parents: VariableScope[];
  format: number;
  setFormat: (id: string, format: number) => void;
}) {
  function MenuEntry(props: { value: string; label: string }) {
    return (
      <ContextMenu.RadioItem value={props.value}>
        <ContextMenu.ItemIndicator>
          <DotFilledIcon />
        </ContextMenu.ItemIndicator>
        {props.label}
      </ContextMenu.RadioItem>
    );
  }

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div>
          <p>
            {parents
              .map((s) => s.name)
              .filter((v) => v !== null)
              .join(".") +
              "." +
              variable.reference}
          </p>
        </div>
      </ContextMenu.Trigger>

      <ContextMenu.Content>
        <ContextMenu.Label>Format</ContextMenu.Label>
        <ContextMenu.RadioGroup
          value={(format || 16).toString()}
          onValueChange={(v) => setFormat(variable.identifier, parseInt(v))}
        >
          <MenuEntry label="Binary" value="2" />
          <MenuEntry label="Decimal" value="10" />
          <MenuEntry label="Hexadecimal" value="16" />
        </ContextMenu.RadioGroup>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

function flattenVariables(
  scope: VariableScope,
  parents: VariableScope[],
  format: { [key: string]: number },
  setFormat: (id: string, format: number) => void
) {
  let res: { [key: string]: JSX.Element } = {};
  const currentScope = [...parents, scope];
  scope.variables.forEach((variable) => {
    res[variable.identifier] = (
      <VariableComponent
        key={`${variable.identifier}`}
        format={format[variable.identifier]}
        parents={currentScope}
        setFormat={setFormat}
        variable={variable}
      />
    );
  });

  scope.scopes.forEach((scope) => {
    res = {
      ...res,
      ...flattenVariables(scope, currentScope, format, setFormat),
    };
  });

  return res;
}

export default function Waves({ vcd }: { vcd: VCDFile }) {
  const [format, setFormat] = useState({} as { [key: string]: number });

  const maxTime =
    Math.max(
      ...Object.values(vcd.timeline).flatMap((t) =>
        Object.keys(t).map(parseFloat)
      )
    ) + 3;

  const order = Object.keys(vcd.timeline);
  const variables = flattenVariables(vcd.variables, [], format, (id, format) =>
    setFormat((v) => ({ ...v, [id]: format }))
  );

  return (
    <div id="waves">
      <div style={{ height: WaveGraph.height(vcd.timeline) }}>
        {order.map((key) => variables[key])}
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
        order={order}
        lastTimestamp={maxTime}
      />
    </div>
  );
}
