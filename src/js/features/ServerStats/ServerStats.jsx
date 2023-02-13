import { useEffect, useMemo, useState } from "react";
import _sortBy from "lodash.sortby";
import _keyBy from "lodash.keyby";
import { Chart } from "react-charts";
import Grid from "@mui/material/Grid";
import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import { selectAllServers } from "../../services/hub.js";
import { Flag, Debug } from "../../components/Common.jsx";

const USAGE_URL =
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
  const serverDetailsArr = useSelector(selectAllServers).filter((s) => {
    return s.version.toLowerCase().includes("mvdsv");
  });
  const [usage, setUsage] = useState({});

  useEffect(() => {
    fetch(USAGE_URL)
      .then((data) => data.json())
      .then((usage) => setUsage(usage));
  }, []);

  const usageByHp = Object.keys(usage);

  if (0 === usageByHp.length || 0 === serverDetailsArr.length) {
    return <Box p={2}>loading...</Box>;
  }

  const dateRange = getDateRange(Object.values(usage));
  const serverDetailsByHp = _keyBy(
    serverDetailsArr,
    "settings.hostname_parsed"
  );

  return (
    <div>
      <Box sx={{ px: 2, py: 1, backgroundColor: "#ffe" }}>
        🛈{" "}
        <small>
          Each bar represents the number of players at 15 minute intervals.
        </small>
      </Box>

      {Object.entries(serverDetailsByHp).map(([hp, details], index) => (
        <Grid
          key={index}
          container
          alignItems="center"
          px={2}
          py={0.5}
          borderTop={"1px solid #ddd"}
          className={"app-server-usage-grid"}
        >
          <Grid item xs={0} md={4} xl={3}>
            <span style={{ fontSize: ".8rem" }}>
              <Flag cc={details.geo.cc} /> {details.settings.hostname}
            </span>
          </Grid>
          {usageByHp.includes(hp) && (
            <Grid
              item
              xs={12}
              md={8}
              xl={9}
              style={{ backgroundColor: "#f0f7fa" }}
            >
              <ServerChart
                points={getDataPoints(dateRange, usage[hp].player_count)}
              />
            </Grid>
          )}
        </Grid>
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
        //max: 10,
        show: false,
        //showDatumElements: false,
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
