import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";

const serversAdapter = createEntityAdapter({
  selectId: (server) => server.Address,
  sortComparer: (a, b) => a.Address.localeCompare(b.Address),
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

export const { useGetServersQuery } = qwsSlice;

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
