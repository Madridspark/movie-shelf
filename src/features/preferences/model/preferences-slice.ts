import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type PreferencesState = {
  includeAdult: boolean;
  language: string;
  movieSearchSortMode: MovieSearchSortMode;
  region: string;
};

export type MovieSearchSortMode =
  | 'relevance'
  | 'rating'
  | 'releaseDate'
  | 'releaseDateAsc'
  | 'title'
  | 'titleDesc';

const initialState: PreferencesState = {
  includeAdult: false,
  language: 'zh-TW',
  movieSearchSortMode: 'relevance',
  region: ''
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
    setRegion(state, action: PayloadAction<string>) {
      state.region = action.payload;
    },
    setIncludeAdult(state, action: PayloadAction<boolean>) {
      state.includeAdult = action.payload;
    },
    setMovieSearchSortMode(state, action: PayloadAction<MovieSearchSortMode>) {
      state.movieSearchSortMode = action.payload;
    }
  }
});

export const { setIncludeAdult, setLanguage, setMovieSearchSortMode, setRegion } = preferencesSlice.actions;
export const preferencesReducer = preferencesSlice.reducer;
