import React from "react";
import { SiteHeader } from "../../Site/SiteHeader.jsx";
import { ServerTable } from "./ServerTable.jsx";
import { LatestSoftware } from "./LatestSoftware.jsx";
import "./styles.scss";

export const App = () => {
  return (
    <div className="flex flex-col h-[100vh]">
      <SiteHeader selectedPageIndex={0} />
      <h1 className="font-bold text-xl bg-white shadow py-4 px-2">
        Server Details
      </h1>
      <div className="grow">
        <ServerTable />
      </div>
      <LatestSoftware />
    </div>
  );
};

export default App;
