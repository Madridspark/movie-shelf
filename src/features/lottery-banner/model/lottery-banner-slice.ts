import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type LotteryBannerState = {
  enabled: boolean;
  candidateMovieIds: number[];
};

const initialState: LotteryBannerState = {
  enabled: true,
  candidateMovieIds: []
};

const lotteryBannerSlice = createSlice({
  name: 'lotteryBanner',
  initialState,
  reducers: {
    toggleLotteryBanner(state) {
      state.enabled = !state.enabled;
    },
    setLotteryCandidates(state, action: PayloadAction<number[]>) {
      state.candidateMovieIds = action.payload;
    }
  }
});

export const { setLotteryCandidates, toggleLotteryBanner } = lotteryBannerSlice.actions;
export const lotteryBannerReducer = lotteryBannerSlice.reducer;

