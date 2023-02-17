import { createSlice } from "@reduxjs/toolkit";

const getDefaultState = () => ({
  query: "",
});

const getInitialState = () => Object.assign({}, getDefaultState());

export const filtersSlice = createSlice({
  name: "filters",
  initialState: getInitialState(),
  reducers: {
    updateFilters: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
});

export const selectFilters = (state) => state.filters;

export const { updateFilters } = filtersSlice.actions;
