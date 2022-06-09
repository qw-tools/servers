import React from "react";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { Marker } from "react-leaflet/Marker";
import { Popup } from "react-leaflet/Popup";
import { Tooltip } from "react-leaflet/Tooltip";
import { selectAllServers } from "../services/qws.js";
import { useSelector } from "react-redux";

export const ServerMap = () => {
  const servers = useSelector(selectAllServers);
  const markerGroups = createMarkerGroups(servers);

  return (
    <MapContainer
      style={{ height: "100%" }}
      center={[30, 0]}
      zoom={3}
      minZoom={3}
      maxZoom={6}
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
          <li key={index}>{info}</li>
        ))}
      </ul>
    </Popup>
    <Tooltip>{props.info.length} servers</Tooltip>
  </Marker>
));

const createMarkerGroups = (servers) => {
  let markerGroups = {};

  for (let i = 0; i < servers.length; i++) {
    let coordinates = servers[i]["ExtraInfo"]["Geo"]["Coordinates"];
    let approxCoordinates = coordinates.map(Math.round);
    let key = approxCoordinates.join(" ");

    if (!(key in markerGroups)) {
      markerGroups[key] = {
        approxCoordinates: [],
        coordinates: [],
        info: [],
      };
    }

    markerGroups[key]["coordinates"].push(coordinates);
    markerGroups[key]["info"].push(
      servers[i]["Settings"]["hostname"].replaceAll("&#46;", ".") +
        " - " +
        servers[i]["Settings"]["hostname_parsed"]
    );
  }

  markerGroups = Object.values(markerGroups);

  for (let i = 0; i < markerGroups.length; i++) {
    markerGroups[i]["info"].sort();
    markerGroups[i]["approxCoordinates"] = approxCoordinates(
      markerGroups[i]["coordinates"]
    );
  }

  return markerGroups;
};

const approxCoordinates = (coordinates) => {
  return [
    coordinates.reduce((partialSum, c) => partialSum + c[0], 0) /
      coordinates.length,
    coordinates.reduce((partialSum, c) => partialSum + c[1], 0) /
      coordinates.length,
  ];
};
