import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { selectFilters } from "../app/filtersSlice.js";

const serversAdapter = createEntityAdapter({
  selectId: (server) => server.address,
  sortComparer: (a, b) =>
    a.settings["hostname"].localeCompare(b.settings["hostname"]),
});
const initialState = serversAdapter.getInitialState();

export const hubSlice = createApi({
  reducerPath: "hub",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://hubapi.quakeworld.nu/v2/",
  }),
  endpoints: (builder) => ({
    getServers: builder.query({
      query: () => "servers",
      transformResponse: (responseData) => {
        for (let i = 0; i < responseData.length; i++) {
          let server = responseData[i]["settings"];
          if (!("hostname" in server)) {
            server["hostname"] = responseData[i]["address"];
            server["hostname_parsed"] = responseData[i]["address"];
          }
        }
        return serversAdapter.setAll(initialState, responseData);
      }
    }),
  }),
});

//export const { useGetServersQuery } = hubSlice;

export const selectServersResult =
  hubSlice.endpoints.getServers.select(undefined);

export const selectServersData = createSelector(
  [selectServersResult],
  (result) => result.data
);

export const { selectAll: selectAllServers, selectById: selectServerById } =
  serversAdapter.getSelectors(
    (state) => selectServersData(state) ?? initialState
  );

export const selectFilteredServers = createSelector(
  [selectAllServers, selectFilters],
  (servers, filters) =>
    "" === filters.query ? servers : filterServers(servers, filters.query)
);

const filterServers = (servers, query) =>
  servers.filter((s) =>
    s.settings["hostname"].toLowerCase().includes(query.toLowerCase())
  );
