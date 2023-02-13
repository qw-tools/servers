import React from "react";
import { ServerTable } from "./ServerTable";
import { LatestSoftware } from "./LatestSoftware";

export const ServerDetailsPage = () => {
  return (
    <>
      <ServerTable />
      <LatestSoftware />
    </>
  );
};
