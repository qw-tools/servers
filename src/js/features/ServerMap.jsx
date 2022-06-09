import React from "react";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { Marker } from "react-leaflet/Marker";
import { Popup } from "react-leaflet/Popup";
import { Tooltip } from "react-leaflet/Tooltip";
import { useGetServersQuery } from "../services/qws.js";

const approxCoordinates = (coordinates) => {
  return [
    coordinates.reduce((partialSum, c) => partialSum + c[0], 0) /
      coordinates.length,
    coordinates.reduce((partialSum, c) => partialSum + c[1], 0) /
      coordinates.length,
  ];
};

const createMarkerGroups = (servers) => {
  let markerGroups = {};

  for (let i = 0; i < servers.length; i++) {
    let approxCoordinates = servers[i].Coordinates.map(Math.round);
    let key = approxCoordinates.join(" ");

    if (!(key in markerGroups)) {
      markerGroups[key] = {
        approxCoordinates: [],
        coordinates: [],
        hostnames: [],
      };
    }

    markerGroups[key]["coordinates"].push(servers[i]["Coordinates"]);
    markerGroups[key]["hostnames"].push(
      servers[i]["Hostname"].replaceAll("&#46;", ".")
    );
  }

  markerGroups = Object.values(markerGroups);

  for (let i = 0; i < markerGroups.length; i++) {
    markerGroups[i]["hostnames"].sort();
    markerGroups[i]["approxCoordinates"] = approxCoordinates(
      markerGroups[i]["coordinates"]
    );
  }

  return markerGroups;
};

export const ServerMap = () => {
  const { data = [] } = useGetServersQuery({});
  const markerGroups = createMarkerGroups(data);

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
          hostnames={group["hostnames"]}
        />
      ))}
    </MapContainer>
  );
};

const MarkerMemo = React.memo((props) => (
  <Marker position={props.coordinates}>
    <Popup>
      <ul>
        {props.hostnames.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
    </Popup>
    <Tooltip>{props.hostnames.length} servers</Tooltip>
  </Marker>
));
