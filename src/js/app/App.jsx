import React from "react";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { ServerMap } from "../features/ServerMap.jsx";
import { ServerTable } from "../features/ServerTable.jsx";
import "../../styles/index.scss";

export const App = () => (
  <BrowserRouter basename="/qw-server-overview/">
    <div className="AppContainer">
      <div className="AppHeader">
        <div>
          Display as:{" "}
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "selected" : undefined)}
          >
            List
          </NavLink>{" "}
          |{" "}
          <NavLink
            to="map"
            className={({ isActive }) => (isActive ? "selected" : undefined)}
          >
            Map
          </NavLink>
        </div>
        <div>
          source:{" "}
          <a href="https://github.com/vikpe/qw-server-overview">
            github.com/vikpe/qw-server-overview
          </a>
        </div>
      </div>
      <div className="AppBody">
        <Routes>
          <Route path="/" element={<ServerTable />} />
          <Route path="map" element={<ServerMap />} />
        </Routes>
      </div>
    </div>
  </BrowserRouter>
);

export default App;
