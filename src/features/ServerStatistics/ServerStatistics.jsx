import { Fragment, useEffect, useMemo, useState } from "react";
import _keyBy from "lodash.keyby";
import { Chart } from "react-charts";
import { Flag } from "../../common/UserInterface.jsx";
import { getServerDetails, getServerUsage } from "../../common/util.js";

const CHART_OPTIONS = {
  dataType: "ordinal",
  initialWidth: Math.round(window.innerWidth * (9 / 12)),
  initialHeight: 32,
  tooltip: false,
};

function getDateRange(data) {
  const range = [
    ...new Set(data.map((s) => Object.keys(s.player_count)).flat(1)),
  ];
  range.sort();
  return range;
}

function unixToIsoDay(unix) {
  return new Date(parseInt(unix) * 1000).toISOString().substring(0, 10); // YYYY-MM-DD
}

function getDataPoints(dateRange, serverUsage) {
  // convert player count per 15 min
  // to percentage of per day with at least 2 players
  const scorePerDay = {};

  for (let i = 0; i < dateRange.length; i++) {
    const day = unixToIsoDay(dateRange[i]);

    if (!scorePerDay.hasOwnProperty(day)) {
      scorePerDay[day] = 0;
    }

    if (serverUsage.hasOwnProperty(dateRange[i])) {
      const playerCount = serverUsage[dateRange[i]];

      if (playerCount >= 2) {
        scorePerDay[day] += 1;
      }
    }
  }

  // format for chart
  const dataPoints = [];
  const maxScore = 24 * 4;

  for (const [key, score] of Object.entries(scorePerDay)) {
    const percentage = Math.round(100 * (score / maxScore));

    dataPoints.push({ x: key, y: percentage });
  }

  return dataPoints;
}

export const ServerStatsPage = () => {
  const [usage, setUsage] = useState({});
  const [details, setDetails] = useState([]);

  useEffect(() => {
    async function run() {
      setUsage(await getServerUsage());
    }

    run().catch(console.error);
  }, []);

  useEffect(() => {
    async function run() {
      const servers = (await getServerDetails()).filter((s) =>
        s.version.toLowerCase().includes("mvdsv")
      );
      setDetails(servers);
    }

    run().catch(console.error);
  }, []);

  const usageByHp = Object.keys(usage);

  if (0 === usageByHp.length || 0 === details.length) {
    return <div className="p-4">loading...</div>;
  }

  const dateRange = getDateRange(Object.values(usage));
  const serverDetailsByHp = _keyBy(details, "settings.hostname_parsed");

  return (
    <div className="divide-y">
      <div className="p-2 bg-sky-50">
        🛈{" "}
        <small>
          Each bar represents the percentage of time the server has at least 2
          players, per day.
        </small>
      </div>

      {Object.entries(serverDetailsByHp).map(([hp, details], index) => (
        <div
          key={index}
          className={"px-2 py-1 hover:bg-yellow-50 md:flex md:items-center"}
        >
          <div className="text-sm md:w-80">
            <Flag cc={details.geo.cc} /> {details.settings.hostname}
          </div>
          {usageByHp.includes(hp) && (
            <div className="bg-sky-50 mt-1 md:grow max-w-[600px]">
              <ServerChart
                points={getDataPoints(dateRange, usage[hp].player_count)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ServerChart = (props) => {
  const { points } = props;

  const data = useMemo(
    () => [
      {
        label: "Player count",
        data: points,
      },
    ],
    []
  );

  const primaryAxis = useMemo(
    () => ({
      getValue: (d) => d.x,
      show: false,
    }),
    []
  );

  const secondaryAxes = useMemo(
    () => [
      {
        getValue: (d) => d.y,
        min: 0,
        max: 100,
        show: false,
      },
    ],
    []
  );

  if (0 === points.length) {
    return <Fragment />;
  }

  const hasValues = points.map((p) => p.y).some((v) => v > 0);

  if (!hasValues) {
    return <Fragment />;
  }

  const options = {
    ...CHART_OPTIONS,
    data,
    primaryAxis,
    secondaryAxes,
  };

  return (
    <div style={{ height: CHART_OPTIONS.initialHeight }}>
      <Chart options={options} />
    </div>
  );
};
