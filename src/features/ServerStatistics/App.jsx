import React from "react";
import store from "../../common/store.js";
import { hubSlice } from "../../services/hub.js";
import { ServerStatsPage } from "./ServerStatistics.jsx";
import { SiteHeader } from "../../Site/SiteHeader.jsx";
import "./styles.scss";

export const App = () => {
  store.dispatch(hubSlice.endpoints.getServers.initiate());

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
