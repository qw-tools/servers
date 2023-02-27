import React, { useEffect, useState } from "react";
import _debounce from "lodash.debounce";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { Marker } from "react-leaflet/Marker";
import { Popup } from "react-leaflet/Popup";
import { Tooltip } from "react-leaflet/Tooltip";
import copyToClipboard from "copy-text-to-clipboard";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { getServerDetails } from "../../common/util.js";

const MIN_QUERY_LENGTH = 2;

const QueryInput = (props) => {
  const { onChange } = props;

  const handleChange = (e) => {
    const query = e.target.value;

    if (query.length >= MIN_QUERY_LENGTH) {
      onChange(query);
    } else {
      onChange("");
    }
  };

  const _handleChange = _debounce(handleChange, 250);

  return (
    <input
      className="border p-2 w-full"
      type="search"
      placeholder="Search"
      onChange={_handleChange}
    />
  );
};

function filterServers(servers, query) {
  if (query.length <= MIN_QUERY_LENGTH) {
    return servers;
  }

  return servers.filter((s) => {
    const haystack = [s.settings.hostname, s.settings.address]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query.toLowerCase());
  });
}

export const ServerMapPage = () => {
  const [servers, setServers] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function run() {
      setServers(await getServerDetails());
    }

    run().catch(console.error);
  }, []);

  const onQueryChange = (query) => setQuery(query);

  const filteredServers = filterServers(servers, query);

  return (
    <div className="flex h-[100%]">
      <div className="grow">
        <ServerMap servers={filteredServers} />
      </div>
      <div className="w-80 border-l-2">
        <div className="p-2 border-b shadow">
          <QueryInput onChange={onQueryChange} />
        </div>
        <div className="overflow-auto max-h-[80vh] divide-y">
          <ServerList servers={filteredServers} />
        </div>
      </div>
    </div>
  );
};

const ServerList = (props) => {
  const { servers } = props;

  return (
    <div className="divide-y">
      {servers.map((server) => (
        <ServerListItem
          key={server.address}
          hostname={server.settings["hostname"]}
          hostname_parsed={server.settings["hostname_parsed"]}
        />
      ))}
    </div>
  );
};

const ServerListItem = (props) => {
  const { hostname, hostname_parsed } = props;
  return (
    <div className="px-3 py-2 text-sm hover:bg-yellow-50">
      <div>{hostname}</div>
      <span className="font-mono text-gray-600 text-xs">
        {hostname_parsed}
      </span>{" "}
      <CopyIpButton ip={hostname_parsed} />
    </div>
  );
};

const CopyIpButton = (props) => (
  <IconButton
    onClick={() => copyToClipboard(props.ip)}
    title="Copy IP to clipboard"
    size="small"
  >
    <ContentCopyIcon fontSize="xs" />
  </IconButton>
);

export const ServerMap = (props) => {
  const { servers } = props;
  const markerGroups = createMarkerGroups(servers);

  return (
    <MapContainer
      className={"h-[100%] w-[100%]"}
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
    let coordinates = servers[i]["geo"]["coordinates"];
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
      servers[i]["settings"]["hostname"].replaceAll("&#46;", ".") +
        " - " +
        servers[i]["settings"]["hostname_parsed"]
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
