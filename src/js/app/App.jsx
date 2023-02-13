import React from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import store from "./store.js";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import ListIcon from "@mui/icons-material/List";
import PublicIcon from "@mui/icons-material/Public";
import GitHubIcon from "@mui/icons-material/GitHub";
import TimelineIcon from "@mui/icons-material/Timeline";
import { Box } from "@mui/material";
import { hubSlice } from "../services/hub.js";
import { ServerDetailsPage } from "../features/ServerDetails/ServerDetails.jsx";
import { ServerMapPage } from "../features/ServerMap/ServerMap.jsx";
import { ServerStatsPage } from "../features/ServerStats/ServerStats.jsx";
import "../../styles/index.scss";

const productionBasename = "/qw-server-overview";
const getBasename = () =>
  "development" === import.meta.env.MODE ? "" : productionBasename;

export const App = () => {
  store.dispatch(hubSlice.endpoints.getServers.initiate());

  return (
    <BrowserRouter basename={getBasename()}>
      <div className="app-container">
        <AppHeader />
        <div className="app-body">
          <Routes>
            <Route path="/" element={<ServerDetailsPage />} />
            <Route path="/map" element={<ServerMapPage />} />
            <Route path="/statistics" element={<ServerStatsPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;

const AppHeader = () => {
  return (
    <div className="app-header">
      <NavTabs />
      <Button
        startIcon={<GitHubIcon />}
        href="https://github.com/vikpe/qw-server-overview"
      >
        <Box sx={{ display: { xs: "none", sm: "block" } }}>Source</Box>
      </Button>
    </div>
  );
};

const NavTabs = () => {
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleChange = (_, newIndex) => {
    setTabIndex(newIndex);
  };

  const headerItems = [
    {
      label: "Server Details",
      icon: <ListIcon />,
      url: "/",
    },
    {
      label: "Server Map",
      icon: <PublicIcon />,
      url: "/map",
    },
    {
      label: "Server Statistics",
      icon: <TimelineIcon />,
      url: "/statistics",
    },
  ];

  return (
    <Tabs value={tabIndex} onChange={handleChange}>
      {headerItems.map((item, index) => (
        <Tab
          key={item.url}
          label={item.label}
          icon={item.icon}
          iconPosition="start"
          component={Link}
          to={item.url}
          value={index}
        />
      ))}
    </Tabs>
  );
};
