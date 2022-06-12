import React from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import store from "./store.js";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import ListIcon from "@mui/icons-material/List";
import PublicIcon from "@mui/icons-material/Public";
import GitHubIcon from "@mui/icons-material/GitHub";
import { qwsSlice } from "../services/qws.js";
import { ServerMapPage } from "../features/ServerMap/ServerMap.jsx";
import { ServerTable } from "../features/ServerTable.jsx";
import "../../styles/index.scss";

export const App = () => {
  const basename =
    "development" === import.meta.env.MODE ? "" : "/qw-server-overview/";

  store.dispatch(qwsSlice.endpoints.getServers.initiate());

  return (
    <BrowserRouter basename={basename}>
      <div className="app-container">
        <AppHeader />
        <div className="app-body">
          <Routes>
            <Route path="/" element={<ServerTable />} />
            <Route path="map" element={<ServerMapPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;

const AppHeader = () => {
  const headerItems = [
    {
      label: "View as List",
      icon: <ListIcon />,
      url: "/",
    },
    {
      label: "View on Map",
      icon: <PublicIcon />,
      url: "/map",
    },
  ];

  return (
    <div className="app-header">
      <Tabs value={location.pathname}>
        {headerItems.map((item) => (
          <Tab
            key={item.url}
            label={item.label}
            icon={item.icon}
            iconPosition="start"
            component={Link}
            to={item.url}
            value={item.url}
            onClick={() => history.push(item.url)}
          />
        ))}
      </Tabs>
      <Button
        startIcon={<GitHubIcon />}
        href="https://github.com/vikpe/qw-server-overview"
      >
        Source
      </Button>
    </div>
  );
};
