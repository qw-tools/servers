import React from "react";
import { Grid } from "@githubocto/flat-ui";
import { useGetMvdsvQuery } from "../services/qws.js";

const ServerGrid = () => {
  const { data = [] } = useGetMvdsvQuery({});

  return (
    <Grid
      data={data}
      defaultStickyColumnName="Address"
      defaultSort={["Hostname", "asc"]}
    />
  );
};

export const App = () => <ServerGrid />;

export default App;
