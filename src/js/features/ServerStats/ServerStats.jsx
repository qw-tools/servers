import { Fragment, useEffect, useMemo, useState } from "react";
import _sortBy from "lodash.sortby";
import { Chart } from "react-charts";
import Grid from "@mui/material/Grid";
import { Box } from "@mui/material";

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
  const [usage, setUsage] = useState({});

  useEffect(() => {
    fetch(USAGE_URL)
      .then((data) => data.json())
      .then((usage) => setUsage(usage));
  }, []);

  const serverUsage = _sortBy(Object.values(usage), (o) =>
    o.hostname.toLowerCase()
  );

  if (0 === serverUsage.length) {
    return <Fragment />;
  }

  const dateRange = getDateRange(serverUsage);

  return (
    <div>
      <Box sx={{ px: 2, py: 1, backgroundColor: "#ffe" }}>
        🛈{" "}
        <small>
          Each bar represents the number of players at 15 minute intervals.
        </small>
      </Box>

      {serverUsage.map((u) => (
        <ServerStats
          key={u.hostname}
          hostname={u.hostname}
          server_usage={u.player_count}
          dateRange={dateRange}
        />
      ))}
    </div>
  );
};

const ServerStats = (props) => {
  const { hostname, server_usage, dateRange } = props;

  const data = useMemo(
    () => [
      {
        label: "Player count",
        data: getDataPoints(dateRange, server_usage),
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
    <Grid
      container
      alignItems="center"
      px={2}
      py={0.5}
      borderTop={"1px solid #ddd"}
      className={"app-server-usage-grid"}
    >
      <Grid item xs={0} md={4} xl={3}>
        <span style={{ fontSize: ".8rem" }}>{hostname}</span>
      </Grid>
      <Grid item xs={12} md={8} xl={9}>
        <div style={{ height: CHART_OPTIONS.initialHeight }}>
          <Chart options={options} />
        </div>
      </Grid>
    </Grid>
  );
};
