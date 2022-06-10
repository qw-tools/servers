import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { selectFilters } from "../app/filtersSlice.js";

const serversAdapter = createEntityAdapter({
  selectId: (server) => server.Address,
  sortComparer: (a, b) =>
    a.Settings["hostname"].localeCompare(b.Settings["hostname"]),
});
const initialState = serversAdapter.getInitialState();

export const qwsSlice = createApi({
  reducerPath: "qws",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://metaqtv.quake.se/v2/",
  }),
  endpoints: (builder) => ({
    getServers: builder.query({
      query: () => "servers",
      transformResponse: (responseData) =>
        serversAdapter.setAll(initialState, responseData),
    }),
  }),
});

//export const { useGetServersQuery } = qwsSlice;

export const selectServersResult =
  qwsSlice.endpoints.getServers.select(undefined);

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
    s.Settings["hostname"].toLowerCase().includes(query.toLowerCase())
  );
