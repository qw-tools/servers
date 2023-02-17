import { configureStore } from "@reduxjs/toolkit";
import { hubSlice } from "../services/hub.js";
import { filtersSlice } from "./filtersSlice.js";

export const store = configureStore({
  reducer: {
    [filtersSlice.name]: filtersSlice.reducer,
    [hubSlice.reducerPath]: hubSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(hubSlice.middleware),
});
export default store;
