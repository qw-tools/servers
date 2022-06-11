import React from "react";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { Marker } from "react-leaflet/Marker";
import { Popup } from "react-leaflet/Popup";
import { Tooltip } from "react-leaflet/Tooltip";
import { selectFilteredServers } from "../../services/qws.js";
import { connect, useSelector } from "react-redux";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import { updateFilters } from "../../app/filtersSlice.js";
import copyToClipboard from "copy-text-to-clipboard";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import _debounce from "lodash.debounce";

const QueryInput = (props) => {
  const { query, updateFilters } = props;

  const handleChange = (e) => {
    const minQueryLength = 3;
    const queryValue = e.target.value;
    const query = queryValue.length >= minQueryLength ? queryValue : "";
    updateFilters({ query });
  };

  const _handleChange = _debounce(handleChange, 250);

  return (
    <TextField
      fullWidth
      type="search"
      label="Search"
      defaultValue={query}
      onChange={_handleChange}
    />
  );
};

const QueryInputComponent = connect((state) => state.filters, {
  updateFilters,
})(QueryInput);

export const ServerMapPage = () => (
  <Grid container>
    <Grid item xs={10}>
      <ServerMap />
    </Grid>
    <Grid
      item
      xs={2}
      style={{ boxShadow: "-4px 3px 4px rgb(0,0,0,13%)", zIndex: 5555 }}
    >
      <List dense style={{ paddingBottom: 0 }}>
        <ListItem>
          <QueryInputComponent />
        </ListItem>
      </List>
      <ServerList />
    </Grid>
  </Grid>
);

const ServerList = () => {
  const servers = useSelector(selectFilteredServers);

  return (
    <List className="app-server-list" dense>
      {servers.map((server) => (
        <ServerListItem
          key={server.Address}
          hostname={server.Settings["hostname"]}
          hostname_parsed={server.Settings["hostname_parsed"]}
        />
      ))}
    </List>
  );
};

const ServerListItem = (props) => {
  const { hostname, hostname_parsed } = props;
  return (
    <React.Fragment>
      <Divider component="li" />
      <ListItem>
        <ListItemText
          primary={hostname}
          secondary={
            <React.Fragment>
              {hostname_parsed}
              <CopyIpButton ip={hostname_parsed} />
            </React.Fragment>
          }
        />
      </ListItem>
    </React.Fragment>
  );
};

const CopyIpButton = (props) => (
  <IconButton
    onClick={() => copyToClipboard(props.ip)}
    title="Copy IP to clipboard"
  >
    <ContentCopyIcon fontSize="small" />
  </IconButton>
);

export const ServerMap = () => {
  const servers = useSelector(selectFilteredServers);
  const markerGroups = createMarkerGroups(servers);

  return (
    <MapContainer
      className="app-map-container"
      center={[30, 0]}
      zoom={3}
      minZoom={3}
      maxZoom={7}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markerGroups.map((group, index) => (
        <MarkerMemo
          key={index}
          coordinates={group["approxCoordinates"]}
          info={group["info"]}
        />
      ))}
    </MapContainer>
  );
};

const MarkerMemo = React.memo((props) => (
  <Marker position={props.coordinates}>
    <Popup>
      <ul>
        {props.info.map((info, index) => (
          <li key={index}>
            {info} <CopyIpButton ip={info.split(" - ")[1]} />
          </li>
        ))}
      </ul>
    </Popup>
    <Tooltip>{props.info.length} servers/ports</Tooltip>
  </Marker>
));

function roundToStep(value, step) {
  step || (step = 1.0);
  const inv = 1.0 / step;
  return Math.round(value * inv) / inv;
}

const createMarkerGroups = (servers) => {
  let markerGroups = {};

  for (let i = 0; i < servers.length; i++) {
    let coordinates = servers[i]["Geo"]["Coordinates"];
    let approxCoordinates = coordinates.map((c) => roundToStep(c, 0.5));
    let key = approxCoordinates.join(" ");

    if (!(key in markerGroups)) {
      markerGroups[key] = {
        approxCoordinates: [],
        coordinates: [],
        info: [],
      };
    }

    markerGroups[key]["key"] = key;
    markerGroups[key]["coordinates"].push(coordinates);
    markerGroups[key]["info"].push(
      servers[i]["Settings"]["hostname"].replaceAll("&#46;", ".") +
        " - " +
        servers[i]["Settings"]["hostname_parsed"]
    );
  }

  markerGroups = Object.values(markerGroups);

  for (let i = 0; i < markerGroups.length; i++) {
    markerGroups[i]["approxCoordinates"] = calcAverageCoordinates(
      markerGroups[i]["coordinates"]
    );
    delete markerGroups[i]["coordinates"];
  }

  return markerGroups;
};

const arraySum = (arr) => arr.reduce((partialSum, a) => partialSum + a, 0);
const arrayAverage = (arr) => arraySum(arr) / arr.length;

const calcAverageCoordinates = (coordinates) => {
  const lats = coordinates.map((c) => c[0]);
  const longs = coordinates.map((c) => c[1]);
  return [lats, longs].map(arrayAverage);
};
