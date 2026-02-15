// src/features/filters/filtersSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type SortBy = 'rating-desc' | 'name-asc' | 'price-asc' | 'price-desc';

export type FiltersState = {
  categorySlug: string;

  searchQuery: string;
  sortBy: SortBy;

  // distance (server params)
  location: string;
  range: number | null; // ✅ allow empty

  priceMin: number | null;
  priceMax: number | null;
  ratingMin: number | null; // 1..5 or null
};

const initialState: FiltersState = {
  categorySlug: 'all',
  searchQuery: '',
  sortBy: 'rating-desc',

  // ✅ DEFAULT MUST BE EMPTY (per Figma + UX)
  location: '',
  range: null,

  priceMin: null,
  priceMax: null,
  ratingMin: null,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setCategorySlug(state, action: PayloadAction<string>) {
      state.categorySlug = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setSortBy(state, action: PayloadAction<SortBy>) {
      state.sortBy = action.payload;
    },

    setLocation(state, action: PayloadAction<string>) {
      state.location = action.payload;
    },
    setRange(state, action: PayloadAction<number | null>) {
      state.range = action.payload;
    },

    setPriceMin(state, action: PayloadAction<number | null>) {
      state.priceMin = action.payload;
    },
    setPriceMax(state, action: PayloadAction<number | null>) {
      state.priceMax = action.payload;
    },
    setRatingMin(state, action: PayloadAction<number | null>) {
      state.ratingMin = action.payload;
    },

    resetFilters(state) {
      state.searchQuery = initialState.searchQuery;
      state.sortBy = initialState.sortBy;

      // ✅ reset must be EMPTY
      state.location = initialState.location;
      state.range = initialState.range;

      state.priceMin = initialState.priceMin;
      state.priceMax = initialState.priceMax;
      state.ratingMin = initialState.ratingMin;
    },
  },
});

export const {
  setCategorySlug,
  setSearchQuery,
  setSortBy,
  setLocation,
  setRange,
  setPriceMin,
  setPriceMax,
  setRatingMin,
  resetFilters,
} = filtersSlice.actions;

export const filtersReducer = filtersSlice.reducer;
