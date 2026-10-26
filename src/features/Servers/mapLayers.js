// mapbox layers for host pins (circles, no style icons needed)

export const clusterLayers = [
  {
    id: "clusters",
    type: "circle",
    source: "hosts",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": "#0ea5e9",
      "circle-radius": ["step", ["get", "point_count"], 12, 10, 16, 50, 20],
      "circle-stroke-color": "#fff",
      "circle-stroke-width": 2,
    },
  },
  {
    id: "cluster-count",
    type: "symbol",
    source: "hosts",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-size": 12,
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": "#fff",
    },
  },
];

export const markerLayers = [
  {
    id: "markers",
    type: "circle",
    source: "hosts",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#14b8a6",
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 5, 9, 8],
      "circle-stroke-color": "#fff",
      "circle-stroke-width": 1.5,
    },
  },
  {
    id: "marker-labels",
    type: "symbol",
    source: "hosts",
    filter: ["!", ["has", "point_count"]],
    layout: {
      "text-field": ["get", "label"],
      "text-anchor": "bottom",
      "text-offset": [0, -0.7],
      "text-size": ["interpolate", ["linear"], ["zoom"], 3, 11, 9, 16],
    },
    paint: {
      "text-color": "#0f766e",
      "text-halo-color": "#fff",
      "text-halo-width": 1.5,
    },
  },
];

export const highlightLayers = [
  {
    id: "marker-highlight",
    type: "circle",
    source: "highlight",
    paint: {
      "circle-color": "#facc15",
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 8, 9, 12],
      "circle-stroke-color": "#000",
      "circle-stroke-width": 2,
    },
  },
  {
    id: "marker-highlight-label",
    type: "symbol",
    source: "highlight",
    layout: {
      "text-field": ["get", "label"],
      "text-anchor": "bottom",
      "text-offset": [0, -1],
      "text-size": ["interpolate", ["linear"], ["zoom"], 3, 13, 9, 20],
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: {
      "text-color": "#000",
      "text-halo-color": "#facc15",
      "text-halo-width": 2,
    },
  },
];

// the clicked cluster, drawn over it
export const clusterHighlightLayers = [
  {
    id: "cluster-highlight",
    type: "circle",
    source: "cluster-highlight",
    paint: {
      "circle-color": "#facc15",
      "circle-radius": ["step", ["get", "point_count"], 12, 10, 16, 50, 20],
      "circle-stroke-color": "#000",
      "circle-stroke-width": 2,
    },
  },
  {
    id: "cluster-highlight-count",
    type: "symbol",
    source: "cluster-highlight",
    layout: {
      "text-field": ["to-string", ["get", "point_count"]],
      "text-size": 12,
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": "#000",
    },
  },
];
