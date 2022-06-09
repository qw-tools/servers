import { configureStore } from "@reduxjs/toolkit";
import { qwsSlice } from "../services/qws.js";
import { filtersSlice } from "./filtersSlice.js";

export const store = configureStore({
  reducer: {
    [filtersSlice.name]: filtersSlice.reducer,
    [qwsSlice.reducerPath]: qwsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(qwsSlice.middleware),
});
export default store;
