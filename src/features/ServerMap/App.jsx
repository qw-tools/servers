import React from "react";
import store from "../../common/store.js";
import { hubSlice } from "../../services/hub.js";
import { ServerMapPage } from "./ServerMap.jsx";
import { SiteHeader } from "../../Site/SiteHeader.jsx";
import "./styles.scss";

export const App = () => {
  store.dispatch(hubSlice.endpoints.getServers.initiate());

  return (
    <div className="flex flex-col h-[100vh]">
      <SiteHeader selectedPageIndex={1} />
      <div className="font-bold text-xl bg-white shadow py-4 px-2">
        Server World Map
      </div>
      <div className="grow">
        <ServerMapPage />
      </div>
    </div>
  );
};

export default App;
