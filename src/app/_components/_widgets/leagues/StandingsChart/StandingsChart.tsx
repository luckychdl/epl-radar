"use client";

import { useState } from "react";
import { TeamPositionHistory } from "@/app/_libs/_utils/standings";
import styles from "./StandingsChart.module.scss";

/** 라인 4개까지는 직접 라벨을 붙일 수 있어 색만으로 구분하지 않아도 된다. */
const SERIES_LIMIT = 4;
/** 라운드가 많아지면 마커가 선을 가린다. */
const MARKER_MAX_MATCHDAYS = 15;

const VIEW = {
  width: 720,
  height: 260,
  left: 34,
  right: 104,
  top: 16,
  bottom: 28,
};

interface Props {
  history: TeamPositionHistory[];
}

export default function StandingsChart({ history }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  const series = history.slice(0, SERIES_LIMIT);
  const matchdays = [
    ...new Set(series.flatMap((team) => team.history.map((p) => p.matchday))),
  ].sort((a, b) => a - b);
  const lastPosition = history.length;

  if (series.length === 0 || matchdays.length < 2 || lastPosition < 2) {
    return (
      <section className={styles.standingsChart}>
        <header>
          <h3>라운드별 순위 변동</h3>
        </header>
        <p className={styles.empty}>
          경기 결과가 두 라운드 이상 쌓이면 순위 변동을 계산해 보여줍니다.
        </p>
      </section>
    );
  }

  const plotWidth = VIEW.width - VIEW.left - VIEW.right;
  const plotHeight = VIEW.height - VIEW.top - VIEW.bottom;

  const toX = (matchday: number) =>
    VIEW.left +
    (matchdays.indexOf(matchday) / (matchdays.length - 1)) * plotWidth;
  const toY = (position: number) =>
    VIEW.top + ((position - 1) / (lastPosition - 1)) * plotHeight;

  const gridPositions = [1, Math.ceil(lastPosition / 2), lastPosition];
  const showMarkers = matchdays.length <= MARKER_MAX_MATCHDAYS;
  const hoveredMatchday = hovered === null ? null : matchdays[hovered];

  return (
    <section className={styles.standingsChart}>
      <header>
        <h3>라운드별 순위 변동</h3>
        <p>전체 경기 결과로 직접 계산한 상위 {series.length}팀 추이</p>
      </header>

      <ul className={styles.legend}>
        {series.map((team, index) => (
          <li key={team.team.id}>
            <span data-series={index + 1} />
            {team.team.shortName}
          </li>
        ))}
      </ul>

      <svg
        className={styles.plot}
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        aria-label={`라운드별 순위 변동. ${series
          .map((team) => team.team.shortName)
          .join(", ")}`}
      >
        {gridPositions.map((position) => (
          <g key={position}>
            <line
              className={styles.grid}
              x1={VIEW.left}
              x2={VIEW.left + plotWidth}
              y1={toY(position)}
              y2={toY(position)}
            />
            <text
              className={styles.axisLabel}
              x={VIEW.left - 8}
              y={toY(position)}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {position}
            </text>
          </g>
        ))}

        <text
          className={styles.axisLabel}
          x={VIEW.left}
          y={VIEW.height - 8}
          textAnchor="start"
        >
          R{matchdays[0]}
        </text>
        <text
          className={styles.axisLabel}
          x={VIEW.left + plotWidth}
          y={VIEW.height - 8}
          textAnchor="end"
        >
          R{matchdays[matchdays.length - 1]}
        </text>

        {hoveredMatchday !== null && (
          <line
            className={styles.crosshair}
            x1={toX(hoveredMatchday)}
            x2={toX(hoveredMatchday)}
            y1={VIEW.top}
            y2={VIEW.top + plotHeight}
          />
        )}

        {series.map((team, index) => {
          const points = team.history
            .map((point) => `${toX(point.matchday)},${toY(point.position)}`)
            .join(" ");
          const last = team.history[team.history.length - 1];

          return (
            <g key={team.team.id} data-series={index + 1}>
              <polyline className={styles.line} points={points} />
              {showMarkers &&
                team.history.map((point) => (
                  <circle
                    key={point.matchday}
                    className={styles.marker}
                    cx={toX(point.matchday)}
                    cy={toY(point.position)}
                    r={4}
                  />
                ))}
              {last && (
                <text
                  className={styles.directLabel}
                  x={toX(last.matchday) + 8}
                  y={toY(last.position)}
                  dominantBaseline="middle"
                >
                  {team.team.shortName}
                </text>
              )}
            </g>
          );
        })}

        {matchdays.map((matchday, index) => (
          <rect
            key={matchday}
            className={styles.hitArea}
            x={
              toX(matchday) -
              plotWidth / Math.max(matchdays.length - 1, 1) / 2
            }
            y={VIEW.top}
            width={plotWidth / Math.max(matchdays.length - 1, 1)}
            height={plotHeight}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </svg>

      {hoveredMatchday !== null && (
        <div className={styles.tooltip} role="status">
          <strong>Round {hoveredMatchday}</strong>
          {series.map((team, index) => {
            const point = team.history.find(
              (item) => item.matchday === hoveredMatchday,
            );

            return (
              <span key={team.team.id}>
                <i data-series={index + 1} />
                {team.team.shortName}
                <em>
                  {point ? `${point.position}위 · ${point.points}점` : "-"}
                </em>
              </span>
            );
          })}
        </div>
      )}
    </section>
  );
}
