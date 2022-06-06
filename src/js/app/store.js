import { configureStore } from "@reduxjs/toolkit";
import { qwsSlice } from "../services/qws.js";

export const store = configureStore({
  reducer: {
    [qwsSlice.reducerPath]: qwsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(qwsSlice.middleware),
});
export default store;
