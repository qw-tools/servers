import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import flatten from "flat";
import _pick from "lodash.pick";

export const qwsSlice = createApi({
  reducerPath: "qws",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://metaqtv.quake.se/v2/",
  }),
  endpoints: (builder) => ({
    getServers: builder.query({
      query: () => "servers",
      transformResponse: (r) => transformServers(r),
    }),
  }),
});

export const { useGetServersQuery } = qwsSlice;

const transformServers = (servers) => {
  const result = [];
  const includedSettings = [
    "*admin",
    "*gamedir",
    "ktxver",
    "sv_antilag",
    "maxclients",
    "maxspectators",
  ];

  for (let i = 0; i < servers.length; i++) {
    const { Address, Version, Settings = {}, ExtraInfo } = servers[i];
    result.push({
      Hostname: Settings["hostname"].replaceAll(".", "&#46;"),
      Address,
      ...flatten(versionToObject(Version)),
      ...flatten(_pick(Settings, includedSettings)),
      ...flatten(_pick(ExtraInfo["Geo"], ["Region", "Country"])),
    });
  }

  return result;
};

const versionToObject = (version) => {
  let type;
  let build = "";

  if (version.includes(" ")) {
    const versionParts = version.split(" ");
    type = versionParts[0];
    build = version;
  } else {
    type = version;
  }

  return {
    Version: {
      type,
      build,
    },
  };
};
