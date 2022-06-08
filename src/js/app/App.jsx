import React from "react";
import { Grid } from "@githubocto/flat-ui";
import { useGetServersQuery } from "../services/qws.js";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { Map } from "../map/Map.jsx";
import "../../styles/index.scss";

const ServerGrid = () => {
  const { data = [] } = useGetServersQuery({});

  return (
    <Grid
      data={data}
      defaultStickyColumnName="Address"
      defaultSort={["Hostname", "asc"]}
    />
  );
};

export const App = () => (
  <BrowserRouter>
    Display as: <Link to="/">List</Link> | <Link to="map">Map</Link>
    <hr />
    <Routes>
      <Route path="/" element={<ServerGrid />} />
      <Route path="map" element={<Map />} />
    </Routes>
  </BrowserRouter>
);

export default App;
