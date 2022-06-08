import React from "react";
import { useGetServersQuery } from "../services/qws.js";
import { Grid } from "@githubocto/flat-ui";

export const ServerTable = () => {
  const { data = [] } = useGetServersQuery({});

  return (
    <Grid
      data={data}
      defaultStickyColumnName="Address"
      defaultSort={["Hostname", "asc"]}
    />
  );
};
