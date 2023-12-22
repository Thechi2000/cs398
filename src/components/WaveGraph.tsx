import { Timeline } from "./Waves";

const valuePrefixes: { [key: number]: string } = {
  2: "0b",
  8: "0o",
  10: "0d",
  16: "0x",
};
const scale = 25;

function valueHeight(value: string) {
  return value === "1" ? 0 : value === "0" ? 1 : 0.5;
}

function Value({
  value,
  lastValue,
  format,
  length,
  transform,
}: {
  value: string;
  lastValue: string | null;
  format: number;
  length: number;
  transform?: string;
}) {
  const height = valueHeight(value);
  let path = null;

  if (value.match(/^[01xz]$/) !== null) {
    path = (
      <path
        d={`${lastValue !== null ? `M 0,${valueHeight(lastValue)}` : `M 0,1`} 
            L 0,${height} 
            L ${length},${height}
        `}
      />
    );
  } else {
    path = (
      <path
        d={`${lastValue !== null ? `M 0,${valueHeight(lastValue)}` : "M 0,0.5"} 
            L 0,0.5 
            L 0.3,0 
            L ${length - 0.3},0 
            L ${length},0.5 
            L ${length - 0.3},1 
            L 0.3,1 
            L 0,0.5 
        `}
      />
    );
  }

  let displayedValue = null;
  if (value.match(/^[br][xz]$/)) {
    displayedValue = value[1];
  } else if (value[0] === "b") {
    displayedValue =
      (valuePrefixes[format] || "") +
      parseInt(value.slice(1), 2).toString(format);
  } else if (value[0] === "r") {
    displayedValue = value.slice(1);
  } else {
    displayedValue = value;
  }
  if (displayedValue.length - 1 > 2 * length) {
    displayedValue = displayedValue.slice(0, 2 * length - 3);
    displayedValue += "...";
  }

  let color = value.match(/x$/) ? "red" : value.match(/z$/) ? "black" : "green";

  return (
    <g transform={transform} stroke={color} color={color}>
      {path}
      <text fontSize={0.75} fontWeight={1} transform="translate(0.3 0.75)">
        {displayedValue}
      </text>
    </g>
  );
}

function VariableGraph({
  transform,
  timeline,
  format,
  lastTimestamp,
}: {
  transform: string;
  timeline: Timeline;
  format: number;
  lastTimestamp: number;
}) {
  // Creates a sorted array containing the timestamps of each value change.
  const timestamps = Object.keys(timeline).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  return (
    <g transform={transform}>
      {timestamps.map((t, i) => {
        let lastValue = i > 0 ? timeline[timestamps[i - 1]] : null;
        let currentValue = timeline[t];
        let currentTime = parseInt(t);
        let nextTime =
          i + 1 < timestamps.length
            ? parseInt(timestamps[i + 1], 10)
            : lastTimestamp;

        return (
          <Value
            format={format}
            lastValue={lastValue}
            length={nextTime - currentTime}
            value={currentValue}
            transform={`translate(${currentTime})`}
            key={i}
          />
        );
      })}
    </g>
  );
}

export default function WaveGraph(props: {
  variables: { [key: string]: { timeline: Timeline; format?: number } };
  order: string[];
  lastTimestamp: number;
}) {
  let axisElements = [];
  for (var i = 0; i < props.lastTimestamp; i += 1) {
    axisElements.push(
      <path d={`M0 0 L1 0 L1 -0.2`} transform={`translate(${i} 0)`} />
    );

    if (i % 5 == 0) {
      axisElements.push(
        <text
          strokeWidth={0.1}
          fontSize={0.75}
          fontWeight={1}
          transform={`translate(${i - 0.2} 0.7)`}
        >
          {i}
        </text>
      );
    }
  }

  return (
    <div>
      <svg
        width={scale * (props.lastTimestamp + 1)}
        height={WaveGraph.height(props.order.length + 1)}
      >
        <g
          transform={`scale(${scale})`}
          stroke="black"
          strokeWidth={0.1}
          fill="none"
        >
          {props.order.map((v, i) => (
            <VariableGraph
              timeline={props.variables[v].timeline}
              format={props.variables[v].format || 16}
              lastTimestamp={props.lastTimestamp}
              transform={`translate(0.25 ${i * 1.5 + 0.25})`}
            />
          ))}
          <g transform={`translate(0.25 ${props.order.length * 1.5 + 0.25})`}>
            {axisElements}
          </g>
        </g>
      </svg>
    </div>
  );
}

WaveGraph.entryHeight = 1.5 * scale;
WaveGraph.height = (count: number) => {
  return count * WaveGraph.entryHeight;
};
