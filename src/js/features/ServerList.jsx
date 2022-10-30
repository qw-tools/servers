import React from "react";
import { ServerTable } from "./ServerTable";
import { LatestSoftware } from "./LatestSoftware";

export const ServerList = () => {
  return (
    <>
      <LatestSoftware />
      <ServerTable />
    </>
  )
};
