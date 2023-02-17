import { useEffect, useMemo, useState } from "react";
import _keyBy from "lodash.keyby";
import _sortBy from "lodash.sortby";
import { Chart } from "react-charts";
import { Flag } from "../../common/UserInterface.jsx";

const SERVERS_DETAILS_URL = "https://hubapi.quakeworld.nu/v2/servers";
const SERVERS_USAGE_URL =
  "https://raw.githubusercontent.com/vikpe/qw-data/main/hubapi/server_usage.json";

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

function getDataPoints(dateRange, serverUsage) {
  const dataPoints = [];

  for (let i = 0; i < dateRange.length; i++) {
    const x = new Date(parseInt(dateRange[i]) * 1000).toISOString();
    let y = 0;

    if (serverUsage.hasOwnProperty(dateRange[i])) {
      y = serverUsage[dateRange[i]];
    }

    dataPoints.push({ x, y });
  }

  return dataPoints;
}

export const ServerStatsPage = () => {
  const [usage, setUsage] = useState({});
  const [details, setDetails] = useState([]);

  useEffect(() => {
    fetch(SERVERS_USAGE_URL)
      .then((data) => data.json())
      .then((usage) => setUsage(usage));
  }, []);

  useEffect(() => {
    fetch(SERVERS_DETAILS_URL)
      .then((data) => data.json())
      .then((details) => details.filter((s) => s.version.toLowerCase().includes("mvdsv")))
      .then((mvdsvDetails) => setDetails(_sortBy(mvdsvDetails, (s) => s.settings.hostname.toLowerCase())))
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
          Each bar represents the number of players at 15 minute intervals.
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
            <div className="bg-sky-50 mt-1 md:grow">
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
        max: 8, // todo: perhaps remove
        show: false,
      },
    ],
    []
  );

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
