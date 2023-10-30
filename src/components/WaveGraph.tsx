import { useState } from "react";
import { Timeline, VCDFile } from "./Waves";

const scale = 35;
const offset = 3;
const strokeWidth = 2;

function valueHeight(v: string | null) {
  return 1 - (v === null ? 0 : v === "0" ? 0 : v === "1" ? 1 : 0.5);
}
function valueColor(v: string | null) {
  return v === "z" ? "black" : v === "x" ? "red" : "green";
}
function formatValue(format: number, v: string | null, maxLength: number) {
  if (v === null) {
    return v;
  }

  const match = v.match(/b([01]+)/);

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

    const value = prefix + parseInt(match[1], 2).toString(format);
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
}: {
  index: number;
  timeline: Timeline;
  lastTimestamp: number;
  format: number;
}) {
  let lastValue: string | null = null;
  let svg: JSX.Element[] = [];
  const verticalOffset = index * (scale + 2 * offset) + offset;

  const timestamps = Object.keys(timeline)
    .map((s) => parseInt(s, 10))
    .sort();

  timestamps.forEach((time, i) => {
    let value = timeline[time];
    let next = i + 1 < timestamps.length ? timestamps[i + 1] : lastTimestamp;

    if (value.match(/^[xz01]$/)) {
      svg.push(
        <path
          strokeWidth={strokeWidth}
          stroke={valueColor(value)}
          d={`M${time * scale + offset} ${
            valueHeight(lastValue) * scale + verticalOffset
          }
                  L${time * scale + offset} ${
            valueHeight(value) * scale + verticalOffset
          }
                  L${next * scale + offset} ${
            valueHeight(value) * scale + verticalOffset
          } `}
        />,
        <text
          stroke={valueColor(value)}
          fill={valueColor(value)}
          x={time * scale + 2 * offset}
          y={scale + verticalOffset - 3}
          width={(next - time) * scale}
        >
          {value}
        </text>
      );
    } else {
      const path = `
            M${time * scale + offset} ${0.5 * scale + verticalOffset}
            L${(time + 0.3) * scale + offset} ${1 * scale + verticalOffset}
            L${(next - 0.3) * scale + offset} ${1 * scale + verticalOffset}
            L${next * scale + offset} ${0.5 * scale + verticalOffset}
            L${(next - 0.3) * scale + offset} ${verticalOffset}
            L${(time + 0.3) * scale + offset} ${0 * scale + verticalOffset}
            Z
          `;

      const maxLength = (next - time) * 3;
      const formattedValue = formatValue(format, value, maxLength);
      svg.push(
        <path stroke={valueColor(value)} strokeWidth={strokeWidth} d={path} />,
        <text
          stroke={valueColor(value)}
          fill={valueColor(value)}
          x={time * scale + 3 * offset}
          y={0.65 * scale + verticalOffset}
        >
          {formattedValue}
        </text>
      );
    }

    lastValue = value;
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

  order.forEach((identifier, index) =>
    svg.push(
      <Graph
        key={identifier}
        index={index}
        timeline={timelines[identifier].values}
        lastTimestamp={lastTimestamp}
        format={timelines[identifier].format || 16}
      />
    )
  );

  return (
    <div className="shrink-1">
      <svg
        height={WaveGraph.height(timelines)}
        width={`${lastTimestamp * scale + 2 * offset}`}
        fill="none"
        className="select-none"
      >
        {svg}
      </svg>
    </div>
  );
}

WaveGraph.entryHeight = scale + 2 * offset;
WaveGraph.height = (timelines: { [key: string]: Timeline }) => {
  return Object.keys(timelines).length * WaveGraph.entryHeight;
};
