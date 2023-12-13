import { Timeline } from "./Waves";

const scale = 35;
const offset = 3;
const strokeWidth = 2;

function valueHeight(v: string | null) {
  return 1 - (v === null ? 0 : v === "0" ? 0 : v === "1" ? 1 : 0.5);
}
function valueColor(v: string | null) {
  return v?.match(/(b|r|)z/) ? "black" : v?.match(/(b|r|)x/) ? "red" : "green";
}
function formatValue(format: number, v: string | null, maxLength: number) {
  if (typeof v !== "string") {
    return v;
  }

  var match = v.match(/b([01]+|x)/);
  if (match) {
    let prefix =
      format === 2
        ? "0b"
        : format === 8
        ? "0o"
        : format === 10
        ? "0d"
        : format === 16
        ? "0x"
        : "";

    const parsedValue = parseInt(match[1], 2);
    const value = Number.isNaN(parsedValue)
      ? match[1].toUpperCase()
      : prefix + parsedValue.toString(format);
    return value.length > maxLength
      ? value.slice(0, maxLength - 3) + "..."
      : value;
  }

  match = v.match(/^r(\d+|\d+\.\d*|\d*\.\d+|x)$/);
  if (match) {
    const value = match[1];
    return value.length > maxLength
      ? value.slice(0, maxLength - 3) + "..."
      : value;
  }
}

function Graph({
  index,
  timeline,
  lastTimestamp,
  format,
  identifer,
}: {
  identifer: string;
  index: number;
  timeline: Timeline;
  lastTimestamp: number;
  format: number;
}) {
  let lastValue: string | null = null;
  let svg: JSX.Element[] = [];
  const verticalOffset = index * (scale + 2 * offset) + offset;

  // Creates a sorted array containing the timestamps of each value change.
  const timestamps = Object.keys(timeline)
    .map((s) => parseInt(s, 10))
    .sort((a, b) => a - b)
    .map((n) => n.toString());

  timestamps.forEach((t, i) => {
    let currentValue = timeline[t];
    let currentTime = parseInt(t, 10);
    let nextTime =
      i + 1 < timestamps.length
        ? parseInt(timestamps[i + 1], 10)
        : lastTimestamp;

    if (currentValue.match(/^[xz01]$/)) {
      svg.push(
        <path
          key={`${identifer}_${currentTime}_path`}
          strokeWidth={strokeWidth}
          stroke={valueColor(currentValue)}
          d={`M${currentTime * scale + offset} ${
            valueHeight(lastValue) * scale + verticalOffset
          }
                  L${currentTime * scale + offset} ${
            valueHeight(currentValue) * scale + verticalOffset
          }
                  L${nextTime * scale + offset} ${
            valueHeight(currentValue) * scale + verticalOffset
          } `}
        />,
        <text
          key={`${identifer}_${currentTime}_text`}
          stroke={valueColor(currentValue)}
          fill={valueColor(currentValue)}
          x={currentTime * scale + 2 * offset}
          y={scale + verticalOffset - 3}
          width={(nextTime - currentTime) * scale}
        >
          {currentValue}
        </text>
      );
    } else {
      const path = `
            M${currentTime * scale + offset} ${0.5 * scale + verticalOffset}
            L${(currentTime + 0.3) * scale + offset} ${
        1 * scale + verticalOffset
      }
            L${(nextTime - 0.3) * scale + offset} ${1 * scale + verticalOffset}
            L${nextTime * scale + offset} ${0.5 * scale + verticalOffset}
            L${(nextTime - 0.3) * scale + offset} ${verticalOffset}
            L${(currentTime + 0.3) * scale + offset} ${
        0 * scale + verticalOffset
      }
            Z
          `;

      const maxLength = (nextTime - currentTime) * 3;
      const formattedValue = formatValue(format, currentValue, maxLength);
      svg.push(
        <path
          key={`${identifer}_${currentTime}_path`}
          stroke={valueColor(currentValue)}
          strokeWidth={strokeWidth}
          d={path}
        />,
        <text
          key={`${identifer}_${currentTime}_text`}
          stroke={valueColor(currentValue)}
          fill={valueColor(currentValue)}
          x={currentTime * scale + 3 * offset}
          y={0.65 * scale + verticalOffset}
        >
          {formattedValue}
        </text>
      );
    }

    lastValue = currentValue;
  });

  return svg;
}

export default function WaveGraph({
  timelines,
  order,
  lastTimestamp,
}: {
  timelines: { [key: string]: { values: Timeline; format?: number } };
  order: string[];
  lastTimestamp: number;
}) {
  let svg: JSX.Element[] = [];

  order.forEach((identifier, index) => {
    const format = timelines[identifier].format || 16;
    const graph = (
      <Graph
        key={`${identifier}.${format}`}
        identifer={identifier}
        index={index}
        timeline={timelines[identifier].values}
        lastTimestamp={lastTimestamp}
        format={format}
      />
    );
    svg.push(graph);
  });

  return (
    <div className="shrink-1">
      <svg
        height={WaveGraph.height(timelines)}
        width={`${lastTimestamp * scale + 2 * offset}`}
        fill="none"
      >
        {svg}
      </svg>
    </div>
  );
}

WaveGraph.entryHeight = scale + 2 * offset;
WaveGraph.height = (timelines: { [key: string]: any }) => {
  return Object.keys(timelines).length * WaveGraph.entryHeight;
};
