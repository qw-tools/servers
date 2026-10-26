import mapboxgl from "mapbox-gl";
import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import "mapbox-gl/dist/mapbox-gl.css";
import { HostCard } from "../../common/HostCard.jsx";
import { groupHosts } from "../../common/hosts.js";
import { Flag } from "../../common/UserInterface.jsx";
import {
  clusterHighlightLayers,
  clusterLayers,
  highlightLayers,
  markerLayers,
} from "./mapLayers.js";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// map of hosts with a sidebar (daisyUI drawer) of hosts by location,
// always open on large screens, toggled with a button on small screens.
// selecting a host (sidebar or pin) shows its host card in a popup.
export const ServerMap = (props) => {
  const drawerId = useId();
  const mapRef = useRef(null);
  const [popup, setPopup] = useState(null); // { lngLat, hosts }
  const [hoveredIp, setHoveredIp] = useState(null);

  const selectHost = useCallback((host) => {
    const lngLat = toLngLat(host.geo.coordinates);
    const map = mapRef.current;

    if (!lngLat || !map) {
      return;
    }

    map.easeTo({ center: lngLat, zoom: Math.max(map.getZoom(), 5) });
    setPopup({ lngLat, hosts: [host] });
  }, []);

  const highlightedHosts = useMemo(
    () =>
      [
        // a clicked cluster is highlighted as a whole, not per host
        ...(popup && !popup.isCluster ? popup.hosts : []),
        props.hosts.find((host) => host.ip === hoveredIp),
      ].filter(Boolean),
    [popup, hoveredIp, props.hosts],
  );

  return (
    <div className="drawer lg:drawer-open h-full">
      <input id={drawerId} type="checkbox" className="drawer-toggle" />
      <div className="drawer-content relative h-full min-w-0">
        {MAPBOX_ACCESS_TOKEN ? (
          <WorldMap
            mapRef={mapRef}
            hosts={props.hosts}
            highlightedHosts={highlightedHosts}
            popup={popup}
            onPopup={setPopup}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            Missing VITE_MAPBOX_ACCESS_TOKEN
          </div>
        )}
        <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-2">
          <RegionControls mapRef={mapRef} />
          <ProjectionControls mapRef={mapRef} />
        </div>
        <label
          htmlFor={drawerId}
          className="btn btn-sm absolute top-2 right-2 z-10 lg:hidden"
        >
          Servers
        </label>
      </div>
      <div className="drawer-side h-full">
        <label
          htmlFor={drawerId}
          aria-label="Close sidebar"
          className="drawer-overlay"
        />
        <Sidebar
          hosts={props.hosts}
          isSearching={props.isSearching}
          onSelect={selectHost}
          onHover={setHoveredIp}
        />
      </div>
    </div>
  );
};

// hosts by location: region > country > city > host
const Sidebar = React.memo((props) => (
  <div className="h-full w-88 overflow-y-auto border-r bg-base-100 [scrollbar-gutter:stable] [scrollbar-width:thin]">
    <ul className="menu menu-sm w-full px-2 pt-0">
      <LocationMenu {...props} />
    </ul>
  </div>
));

// region > country (collapsible, expanded when searching) > city > host
const LocationMenu = (props) => {
  const regions = useMemo(
    () => groupHosts(props.hosts, "region"),
    [props.hosts],
  );

  return regions.map((region) => (
    <li key={region.name}>
      <div className="menu-title pt-4 pb-0">{region.name}</div>
      {region.subgroups.map((country) => (
        <details key={country.name} open={props.isSearching}>
          <summary className="after:text-gray-400">
            {country.cc && <Flag cc={country.cc} />}
            <span>{country.name}</span>
            <span className="text-gray-600">{country.hosts.length}</span>
          </summary>
          <ul>
            {groupByCity(country.hosts).map(([city, hosts]) => (
              <li key={city} className="my-1">
                <div className="menu-title py-0 text-xs">{city}</div>
                <ul>
                  {hosts.map((host) => (
                    <HostMenuItem
                      key={host.ip}
                      host={host}
                      onSelect={props.onSelect}
                      onHover={props.onHover}
                    />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </li>
  ));
};

const UNKNOWN_CITY = "Unknown";

// cities a-z, unknown last
const groupByCity = (hosts) =>
  [...Map.groupBy(hosts, (host) => host.geo.city || UNKNOWN_CITY)].sort(
    ([a], [b]) =>
      (a === UNKNOWN_CITY) - (b === UNKNOWN_CITY) ||
      a.localeCompare(b, "en", { sensitivity: "base" }),
  );

const HostMenuItem = React.memo((props) => {
  const { host } = props;

  return (
    <li
      onMouseEnter={() => props.onHover(host.ip)}
      onMouseLeave={() => props.onHover(null)}
      onFocus={() => props.onHover(host.ip)}
      onBlur={() => props.onHover(null)}
    >
      <button
        type="button"
        title={host.title ?? host.ip}
        onClick={() => props.onSelect(host)}
      >
        <span className="truncate">{host.title ?? host.ip}</span>
      </button>
    </li>
  );
});

const regions = [
  { label: "North America", center: [-95.17, 36.211], zoom: 3 },
  { label: "South America", center: [-55.674, -17.837], zoom: 2.2 },
  { label: "Europe", center: [17.514, 54.5], zoom: 2.8 },
  { label: "Africa", center: [17.6874, 1.6508], zoom: 2.2 },
  { label: "Asia", center: [100.6197, 34.0479], zoom: 2.2 },
  { label: "Oceania", center: [134.491, -25.274], zoom: 2.5 },
];

const RegionControls = (props) => (
  <div className="join shadow">
    {regions.map(({ label, center, zoom }) => (
      <button
        key={label}
        type="button"
        className="join-item btn btn-xs"
        onClick={() => props.mapRef.current?.flyTo({ center, zoom })}
      >
        {label}
      </button>
    ))}
  </div>
);

const ProjectionControls = (props) => (
  <div className="join shadow">
    {[
      { label: "Flat", name: "mercator" },
      { label: "Globe", name: "globe" },
    ].map(({ label, name }) => (
      <button
        key={name}
        type="button"
        className="join-item btn btn-xs"
        onClick={() => props.mapRef.current?.setProjection({ name })}
      >
        {label}
      </button>
    ))}
  </div>
);

// our coordinates are [lat, lng], mapbox uses [lng, lat]
const toLngLat = (coordinates) =>
  coordinates && !coordinates.some(Number.isNaN)
    ? [coordinates[1], coordinates[0]]
    : null;

const toFeatureCollection = (hosts) => ({
  type: "FeatureCollection",
  features: hosts
    .filter((host) => toLngLat(host.geo.coordinates))
    .map((host) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: toLngLat(host.geo.coordinates) },
      properties: { id: host.ip, label: host.title ?? host.ip },
    })),
});

const WorldMap = (props) => {
  const { mapRef, onPopup } = props;
  const containerRef = useRef(null);
  // latest hosts for the map event handlers, which are only bound once
  const hostsRef = useRef(props.hosts);
  useEffect(() => {
    hostsRef.current = props.hosts;
  }, [props.hosts]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [popupNode] = useState(() => document.createElement("div"));
  const popupRef = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      center: [15.2551, 54.526],
      zoom: 3,
      minZoom: 1.5,
      maxZoom: 12,
      dragRotate: false,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));
    mapRef.current = map;

    const hostsByIps = (ips) =>
      hostsRef.current.filter((host) => ips.includes(host.ip));

    map.on("load", () => {
      map.addSource("hosts", {
        type: "geojson",
        data: toFeatureCollection([]),
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 24,
      });
      map.addSource("cluster-highlight", {
        type: "geojson",
        data: toFeatureCollection([]),
      });
      map.addSource("highlight", {
        type: "geojson",
        data: toFeatureCollection([]),
      });
      for (const layer of [
        ...clusterLayers,
        ...markerLayers,
        ...clusterHighlightLayers,
        ...highlightLayers,
      ]) {
        map.addLayer(layer);
      }
      setIsLoaded(true);
    });

    // pin: show the host(s) at that location
    map.on("click", "markers", (e) => {
      const ips = e.features.map((f) => f.properties.id);
      onPopup({
        lngLat: e.features[0].geometry.coordinates,
        hosts: hostsByIps(ips),
      });
    });

    // cluster: show all its hosts
    map.on("click", "clusters", (e) => {
      const feature = e.features[0];
      const center = feature.geometry.coordinates;

      map
        .getSource("hosts")
        .getClusterLeaves(
          feature.properties.cluster_id,
          Infinity,
          0,
          (err, leaves) => {
            if (!err) {
              const ips = leaves.map((f) => f.properties.id);
              onPopup({
                lngLat: center,
                hosts: hostsByIps(ips),
                isCluster: true,
              });
            }
          },
        );
    });

    for (const layer of ["markers", "clusters"]) {
      map.on("mouseenter", layer, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", layer, () => {
        map.getCanvas().style.cursor = "";
      });
    }

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [mapRef, onPopup]);

  useEffect(() => {
    if (isLoaded) {
      mapRef.current
        .getSource("hosts")
        .setData(toFeatureCollection(props.hosts));
    }
  }, [isLoaded, mapRef, props.hosts]);

  useEffect(() => {
    if (isLoaded) {
      mapRef.current
        .getSource("highlight")
        .setData(toFeatureCollection(props.highlightedHosts));
    }
  }, [isLoaded, mapRef, props.highlightedHosts]);

  // the clicked cluster
  useEffect(() => {
    if (isLoaded) {
      const popup = props.popup;
      mapRef.current.getSource("cluster-highlight").setData({
        type: "FeatureCollection",
        features: popup?.isCluster
          ? [
              {
                type: "Feature",
                geometry: { type: "Point", coordinates: popup.lngLat },
                properties: { point_count: popup.hosts.length },
              },
            ]
          : [],
      });
    }
  }, [isLoaded, mapRef, props.popup]);

  // a single mapbox popup, its content is rendered by react (portal)
  useEffect(() => {
    const map = mapRef.current;

    if (!props.popup || !map) {
      popupRef.current?.remove();
      return;
    }

    if (!popupRef.current) {
      popupRef.current = new mapboxgl.Popup({ maxWidth: "none" })
        .setDOMContent(popupNode)
        .on("close", () => onPopup(null));
    }

    popupRef.current.setLngLat(props.popup.lngLat);

    // addTo() on an open popup closes it first, which would reset the selection
    if (!popupRef.current.isOpen()) {
      popupRef.current.addTo(map);
    }
  }, [mapRef, onPopup, popupNode, props.popup]);

  return (
    <>
      <div ref={containerRef} className="h-full w-full" />
      {props.popup &&
        createPortal(
          <div className="p-2">
            {props.popup.hosts.map((host) => (
              <HostCard key={host.ip} host={host} />
            ))}
          </div>,
          popupNode,
        )}
    </>
  );
};
