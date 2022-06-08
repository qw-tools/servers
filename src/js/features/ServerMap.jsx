import React from "react";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { Marker } from "react-leaflet/Marker";
import { Popup } from "react-leaflet/Popup";
import { useGetServersQuery } from "../services/qws.js";

export const ServerMap = () => {
  const { data = [] } = useGetServersQuery({});

  return (
    <MapContainer style={{height: "100%"}} center={[0, 0]} zoom={2}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {data.map((server, index) => (
        <MarkerMemo
          key={index}
          coordinates={server.Coordinates}
          hostname={server.Hostname}
        />
      ))}
    </MapContainer>
  );
};

const MarkerMemo = React.memo((props) => (
  <Marker position={props.coordinates}>
    <Popup>{props.hostname.replaceAll("&#46;", ".")}</Popup>
  </Marker>
));
