import React from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { ServerMap } from "../features/ServerMap.jsx";
import { ServerTable } from "../features/ServerTable.jsx";
import "../../styles/index.scss";

export const App = () => (
  <BrowserRouter>
    Display as: <Link to="/">List</Link> | <Link to="map">Map</Link>
    <hr />
    <Routes>
      <Route path="/" element={<ServerTable />} />
      <Route path="map" element={<ServerMap />} />
    </Routes>
  </BrowserRouter>
);

export default App;
