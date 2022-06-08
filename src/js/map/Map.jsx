import React from "react";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { Marker } from "react-leaflet/Marker";
import { Popup } from "react-leaflet/Popup";
import { useGetServersQuery } from "../services/qws.js";

export const Map = () => {
  const { data = [] } = useGetServersQuery({});

  return (
    <div id="map">
      <MapContainer
        className="markercluster-map"
        center={[0, 0]}
        zoom={2}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.map((server, index) => (
          <MarkerMemo key={index} coordinates={server.Coordinates} />
        ))}
      </MapContainer>
    </div>
  );
};

const MarkerMemo = React.memo((props) => (
  <Marker position={props.coordinates}>
    <Popup>ye!!!</Popup>
  </Marker>
));
