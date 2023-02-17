const baseUrl = import.meta.env.DEV ? "http://localhost:5173/" : import.meta.env.BASE_URL;

export const pages = [
  {
    title: "Details",
    url: `${baseUrl}`,
  },
  {
    title: "World Map",
    url: `${baseUrl}map.html`,
  },
  {
    title: "Statistics",
    url: `${baseUrl}statistics.html`,
  },
];
