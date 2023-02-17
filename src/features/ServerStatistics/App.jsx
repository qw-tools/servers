import React from "react";
import { ServerStatsPage } from "./ServerStatistics.jsx";
import { SiteHeader } from "../../Site/SiteHeader.jsx";
import "./styles.scss";

export const App = () => {
  return (
    <div>
      <SiteHeader selectedPageIndex={2} />
      <div className="font-bold text-xl bg-white shadow py-4 px-2 border-b">
        Server Statistics
      </div>
      <ServerStatsPage />
    </div>
  );
};

export default App;
